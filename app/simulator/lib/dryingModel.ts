/**
 * dryingModel.ts
 * -----------------------------------------------------------------------------
 * A simplified structural-drying model grounded in real psychrometrics and
 * IICRC S500 rules of thumb. It is a PLANNING MODEL, not a measurement: it shows
 * how airflow (air movers) drives evaporation, how dehumidifier capacity caps the
 * rate at which that vapor is pulled back out of the air, and how an undersized
 * setup causes relative humidity to climb and drying to stall.
 *
 * Nothing here is a claim about a specific job. See ASSUMPTIONS for the
 * disclosed simplifications.
 */

export type WaterClass = 1 | 2 | 3 | 4;

export interface RoomSpec {
  lengthM: number;
  widthM: number;
  heightM: number;
  /** Fraction of the floor + lower walls that were wetted (0..1). */
  affectedFraction: number;
  /** IICRC-style class of water intrusion (1 = least, 4 = deeply bound). */
  waterClass: WaterClass;
}

export interface EquipmentSpec {
  /** Count of axial air movers directing airflow across wet surfaces. */
  airMovers: number;
  /** Count of LGR (low-grain-refrigerant) dehumidifiers. */
  dehumidifiers: number;
  /** Per-unit AHAM-style rating in US pints/day (water pulled from the air). */
  dehuPintsPerDay: number;
  /** Interstitial / injection drying for wall cavities and under flooring. */
  injectionDrying: boolean;
}

export interface EnvSpec {
  /** Ambient air temperature (deg C). */
  tempC: number;
  /** Starting relative humidity of the room (%). */
  startRH: number;
}

export interface SimConfig {
  room: RoomSpec;
  equipment: EquipmentSpec;
  env: EnvSpec;
}

export type DryingStage =
  | "extraction"
  | "evaporation"
  | "dehumidification"
  | "dry-standard";

export interface SimState {
  elapsedH: number;
  /** Water still bound in materials (litres). */
  materialWaterL: number;
  /** Water currently airborne as vapour in the room (litres, above dry baseline). */
  airborneWaterL: number;
  /** Cumulative water removed by dehumidifiers (litres). */
  removedWaterL: number;
  /** Peak of materialWaterL at t=0, used for the % readout. */
  initialMaterialWaterL: number;
  roomRH: number;
  /** Grains of moisture per pound of dry air (restoration's working unit). */
  gpp: number;
  /** 100 = fully wet at t0; drops toward the dry standard. */
  materialMoisturePct: number;
  /** 0..1 visual wetness that drives the floor/wall shading. */
  wetness: number;
  stage: DryingStage;
  goalReached: boolean;
}

const PATM_KPA = 101.325;
const AIR_DENSITY = 1.2; // kg/m^3
const PINT_TO_L = 0.473176;
/** Bound water at t0 per m^2 of affected area, by water class (litres/m^2). */
const CLASS_WATER_PER_M2: Record<WaterClass, number> = { 1: 2, 2: 6, 3: 12, 4: 18 };
/** Return-to-dry target: material considered dry at/below this % of its t0 load. */
export const DRY_GOAL_PCT = 12;
export const MAX_SIM_HOURS = 168; // one week horizon

/** Saturation vapour pressure (kPa) via the Magnus formula. */
function satVaporPressureKpa(tempC: number): number {
  return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/** Humidity ratio (kg water / kg dry air) at a given temperature and RH. */
function humidityRatio(tempC: number, rhPct: number): number {
  const pw = (rhPct / 100) * satVaporPressureKpa(tempC);
  return (0.62198 * pw) / (PATM_KPA - pw);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Dry-air mass in the room (kg). */
function dryAirMassKg(room: RoomSpec): number {
  return room.lengthM * room.widthM * room.heightM * AIR_DENSITY;
}

/** Airborne water (litres ~= kg) at a given RH for this room and temperature. */
function airborneWaterAtRH(config: SimConfig, rhPct: number): number {
  return humidityRatio(config.env.tempC, rhPct) * dryAirMassKg(config.room);
}

export interface EquipmentRecommendation {
  airMovers: number;
  dehumidifiers: number;
  note: string;
}

/**
 * IICRC-style rule-of-thumb sizing, surfaced so the operator can see how far
 * a given setup is from the textbook recommendation. Deliberately approximate.
 */
export function recommendEquipment(room: RoomSpec): EquipmentRecommendation {
  const floorArea = room.lengthM * room.widthM;
  const affected = Math.max(floorArea * room.affectedFraction, 1);
  // ~1 air mover per 5 m^2 of affected area, class-weighted.
  const classFactor = 1 + (room.waterClass - 1) * 0.15;
  const airMovers = Math.max(1, Math.round((affected / 5) * classFactor));
  // Dehu sized to the room volume and class; each ~90 pint LGR covers ~55 m^3.
  const volume = floorArea * room.heightM;
  const dehumidifiers = Math.max(1, Math.round((volume / 55) * classFactor));
  return {
    airMovers,
    dehumidifiers,
    note: "Rule-of-thumb only (IICRC S500 style). A real drying plan is set on-site with moisture meters and a psychrometric log.",
  };
}

export function createInitialState(config: SimConfig): SimState {
  const { room, env } = config;
  const floorArea = room.lengthM * room.widthM;
  const affectedArea = Math.max(floorArea * room.affectedFraction, 0);
  const materialWaterL = affectedArea * CLASS_WATER_PER_M2[room.waterClass];
  const airborneWaterL = airborneWaterAtRH(config, env.startRH);
  const gpp = humidityRatio(env.tempC, env.startRH) * 7000; // grains/lb dry air

  return {
    elapsedH: 0,
    materialWaterL,
    airborneWaterL,
    removedWaterL: 0,
    initialMaterialWaterL: Math.max(materialWaterL, 0.0001),
    roomRH: env.startRH,
    gpp,
    materialMoisturePct: 100,
    wetness: 1,
    stage: "extraction",
    goalReached: false,
  };
}

/** Advance the simulation by dtHours. Pure: returns a new state object. */
export function stepSim(prev: SimState, config: SimConfig, dtHours: number): SimState {
  if (prev.goalReached) return prev;

  const { room, equipment, env } = config;
  const floorArea = room.lengthM * room.widthM;
  const affectedArea = Math.max(floorArea * room.affectedFraction, 0.1);

  // --- Current air state -----------------------------------------------------
  const saturatedWaterL = airborneWaterAtRH(config, 100);
  const roomRH = clamp((prev.airborneWaterL / saturatedWaterL) * 100, 0, 100);

  // --- Evaporation (material -> air) ----------------------------------------
  // Airflow effectiveness saturates as air movers approach the recommendation.
  const rec = recommendEquipment(room);
  const airflow = 1 - Math.exp(-equipment.airMovers / Math.max(1, rec.airMovers));
  // Warmer air evaporates faster; cold, damp rooms crawl.
  const tempFactor = clamp((env.tempC - 4) / 22, 0.15, 1.3);
  // Evaporation stalls as the air approaches saturation (the key teaching point).
  const vpDeficit = clamp(1 - roomRH / 100, 0, 1);
  const cavityBoost = equipment.injectionDrying ? 1.25 : room.waterClass >= 3 ? 0.7 : 1;
  const kEvap = 0.11; // litres per m^2 per hour at ideal conditions
  let evap = kEvap * affectedArea * airflow * tempFactor * vpDeficit * cavityBoost * dtHours;
  evap = Math.min(evap, prev.materialWaterL);

  // --- Dehumidification (air -> collected) -----------------------------------
  // LGR output derates at low grain depth; here we scale gently with RH.
  const dehuConditionFactor = clamp(0.45 + roomRH / 140, 0.45, 1);
  const dehuCapacityLperH =
    (equipment.dehumidifiers * equipment.dehuPintsPerDay * PINT_TO_L) / 24;
  const removable = prev.airborneWaterL + evap - airborneWaterAtRH(config, 35); // don't dry below ~35% RH
  const remove = clamp(dehuCapacityLperH * dehuConditionFactor * dtHours, 0, Math.max(removable, 0));

  // --- Integrate -------------------------------------------------------------
  const materialWaterL = Math.max(prev.materialWaterL - evap, 0);
  const airborneWaterL = Math.max(prev.airborneWaterL + evap - remove, 0);
  const removedWaterL = prev.removedWaterL + remove;
  const elapsedH = prev.elapsedH + dtHours;

  const newRH = clamp((airborneWaterL / saturatedWaterL) * 100, 0, 100);
  const gpp = (humidityRatio(env.tempC, newRH)) * 7000;
  const materialMoisturePct = (materialWaterL / prev.initialMaterialWaterL) * 100;
  const wetness = clamp(materialMoisturePct / 100, 0, 1);
  const goalReached = materialMoisturePct <= DRY_GOAL_PCT;

  let stage: DryingStage = "dehumidification";
  if (goalReached) stage = "dry-standard";
  else if (elapsedH < 1.5) stage = "extraction";
  else if (airflow < 0.5) stage = "evaporation";

  return {
    elapsedH,
    materialWaterL,
    airborneWaterL,
    removedWaterL,
    initialMaterialWaterL: prev.initialMaterialWaterL,
    roomRH: newRH,
    gpp,
    materialMoisturePct,
    wetness,
    stage,
    goalReached,
  };
}

export const ASSUMPTIONS: string[] = [
  "Single well-mixed room; no coupling to adjacent spaces or outdoor air.",
  "Bound water at t0 is estimated from affected area x an illustrative litres/m^2 per water class, not measured.",
  "Evaporation uses a lumped coefficient scaled by airflow, temperature and vapour-pressure deficit; it is not a CFD surface model.",
  "Dehumidifier output uses the per-unit pint/day rating with a mild RH derate; real LGR performance varies with grain depth and coil temperature.",
  "Drying is capped so the room is not dried below ~35% RH; the 'dry standard' is a % of the t0 load, not a moisture-meter reading against unaffected material.",
  "This is a planning visualisation. A real job is scoped on-site with penetrating/non-penetrating meters and a daily psychrometric log per IICRC S500.",
];
