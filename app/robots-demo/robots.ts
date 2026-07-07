/**
 * robots.ts
 * -----------------------------------------------------------------------------
 * The five drying/restoration systems featured in the demo gallery. Each maps to
 * a real category of equipment used on water-damage jobs today; the DryForge
 * angle is the autonomous-placement + self-navigation layer on top of that gear.
 * Specs are representative of the category, not a quote for a specific SKU.
 */

export type MotionType = "floor-sweep" | "perimeter" | "flight-grid" | "deploy";
export type RobotId = "extractor" | "airmover" | "dehumidifier" | "drone" | "injector";

export interface RobotSpec {
  id: RobotId;
  name: string;
  tagline: string;
  task: string;
  basis: string;
  accent: string;
  motion: MotionType;
  stats: { label: string; value: string }[];
}

export const ROBOTS: RobotSpec[] = [
  {
    id: "extractor",
    name: "Autonomous Extraction Rover",
    tagline: "Drives the floor, pulls the standing water",
    task: "Self-navigates a flooded floor in overlapping passes, vacuuming standing water and mapping the wet footprint as it goes.",
    basis: "Built on portable/truck-mount extraction (Dri-Eaz / Sapphire Scientific class) with an autonomous drive base.",
    accent: "#F97316",
    motion: "floor-sweep",
    stats: [
      { label: "Extraction", value: "up to 12 L/min" },
      { label: "Lift", value: "150+ in. water" },
      { label: "Coverage", value: "boustrophedon, 45 cm swath" },
    ],
  },
  {
    id: "airmover",
    name: "Repositioning Air-Mover Array",
    tagline: "Chases the damp, dials in the airflow",
    task: "Repositions itself along wet walls and adjusts fan speed to the surface moisture it reads — no crew shuffling fans every hour.",
    basis: "Axial air movers (Dri-Eaz Velo / B-Air VP-25 class) on a mobile, sensor-driven base.",
    accent: "#38BDF8",
    motion: "perimeter",
    stats: [
      { label: "Airflow", value: "1,000-3,500 CFM" },
      { label: "Draw", value: "1.0-2.5 A" },
      { label: "Placement", value: "~1 per 5 m of wet wall" },
    ],
  },
  {
    id: "dehumidifier",
    name: "Self-Navigating LGR Dehumidifier",
    tagline: "Moves room to room, holds the grain depth",
    task: "Relocates between affected rooms on its own, logging temperature, RH and grains so the drying chamber never stalls.",
    basis: "LGR dehumidifier (Dri-Eaz LGR 7000XLi / Phoenix R250 class) on a self-driving cart.",
    accent: "#A78BFA",
    motion: "floor-sweep",
    stats: [
      { label: "Extraction (AHAM)", value: "70-150 pints/day" },
      { label: "Process air", value: "180-400 CFM" },
      { label: "Coverage", value: "~40-70 m3 per unit" },
    ],
  },
  {
    id: "drone",
    name: "Thermal Inspection Drone",
    tagline: "Flies the room, maps the hidden water",
    task: "Flies an indoor grid and builds a thermal moisture map, flagging cold, damp pockets behind walls and under floors for targeted drying.",
    basis: "Radiometric thermal imaging (FLIR-class sensor) on a compact indoor UAV.",
    accent: "#F43F5E",
    motion: "flight-grid",
    stats: [
      { label: "Sensor", value: "radiometric thermal" },
      { label: "Pattern", value: "serpentine grid scan" },
      { label: "Output", value: "moisture heat-map" },
    ],
  },
  {
    id: "injector",
    name: "Cavity Injection System",
    tagline: "Reaches where airflow can't",
    task: "Positions at the wall and deploys injection ports, forcing dry air into cavities and under flooring that air movers never reach.",
    basis: "Interstitial/injection drying (Injectidry HP60 / Dri-Eaz TrapTight class) with automated port routing.",
    accent: "#34D399",
    motion: "deploy",
    stats: [
      { label: "Outputs", value: "up to ~19 hoses" },
      { label: "Airflow", value: "~130-320 CFM total" },
      { label: "Use", value: "cavities, under flooring" },
    ],
  },
];

export interface RoomDims {
  L: number;
  W: number;
  H: number;
}

export interface PathSample {
  pos: [number, number, number];
  heading: number;
}

/**
 * Returns position + heading for a robot's motion pattern at parameter t (0..1).
 * Pure and deterministic so the same t always yields the same pose.
 */
export function pathPoint(motion: MotionType, t: number, room: RoomDims): PathSample {
  const mx = room.L / 2 - 0.7;
  const mz = room.W / 2 - 0.7;
  const tc = Math.min(Math.max(t, 0), 1);

  if (motion === "floor-sweep") {
    const lanes = 5;
    const laneF = tc * lanes;
    const lane = Math.min(Math.floor(laneF), lanes - 1);
    const frac = laneF - lane;
    const z = -mz + (lane / (lanes - 1)) * (2 * mz);
    const dir = lane % 2 === 0 ? 1 : -1;
    const x = dir === 1 ? -mx + frac * 2 * mx : mx - frac * 2 * mx;
    return { pos: [x, 0, z], heading: dir === 1 ? Math.PI / 2 : -Math.PI / 2 };
  }

  if (motion === "flight-grid") {
    const lanes = 4;
    const laneF = tc * lanes;
    const lane = Math.min(Math.floor(laneF), lanes - 1);
    const frac = laneF - lane;
    const z = -mz + (lane / (lanes - 1)) * (2 * mz);
    const dir = lane % 2 === 0 ? 1 : -1;
    const x = dir === 1 ? -mx + frac * 2 * mx : mx - frac * 2 * mx;
    const y = 1.7 + Math.sin(tc * Math.PI * 8) * 0.06;
    return { pos: [x, y, z], heading: dir === 1 ? Math.PI / 2 : -Math.PI / 2 };
  }

  if (motion === "perimeter") {
    const per = tc * (4 * (mx + mz));
    const seg1 = 2 * mx;
    const seg2 = seg1 + 2 * mz;
    const seg3 = seg2 + 2 * mx;
    if (per < seg1) return { pos: [-mx + per, 0, -mz], heading: 0 };
    if (per < seg2) return { pos: [mx, 0, -mz + (per - seg1)], heading: -Math.PI / 2 };
    if (per < seg3) return { pos: [mx - (per - seg2), 0, mz], heading: Math.PI };
    return { pos: [-mx, 0, mz - (per - seg3)], heading: Math.PI / 2 };
  }

  // deploy: parks at the back wall
  return { pos: [-mx + 0.4, 0, -mz + 0.3], heading: 0 };
}

/** Sample the whole path for drawing the coverage line. */
export function samplePath(motion: MotionType, room: RoomDims, n = 120): [number, number, number][] {
  if (motion === "deploy") return [];
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) pts.push(pathPoint(motion, i / n, room).pos);
  return pts;
}
