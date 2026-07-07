/**
 * equipment.ts
 * -----------------------------------------------------------------------------
 * The equipment in the simulator maps to REAL categories of restoration gear
 * that crews actually deploy — axial air movers, LGR dehumidifiers, and
 * interstitial/injection drying systems. The spec ranges below are
 * representative of those product categories (e.g. Dri-Eaz / Phoenix / B-Air /
 * Injectidry class hardware); they are illustrative, not a quote or endorsement
 * of any brand.
 *
 * IMPORTANT (honesty policy, see README): none of this equipment is autonomous
 * today. It is positioned and monitored by a technician. DryForge's
 * autonomous-placement + remote-monitoring layer is a concept on the roadmap,
 * labelled as such — it is not a shipping product.
 */

export type EquipmentKind = "airMover" | "dehumidifier" | "injection";

export interface EquipmentCategory {
  kind: EquipmentKind;
  name: string;
  /** What it does and the manual task it reduces. */
  role: string;
  /** Visualisable, representative spec range for the category. */
  specs: { label: string; value: string }[];
  categoryExamples: string;
}

export const EQUIPMENT_CATALOG: EquipmentCategory[] = [
  {
    kind: "airMover",
    name: "Axial air mover",
    role: "Drives high-volume airflow across wet surfaces to accelerate evaporation. Replaces manually shuffling fans to chase damp spots.",
    specs: [
      { label: "Airflow", value: "1,000-3,500 CFM" },
      { label: "Draw", value: "1.0-2.5 A" },
      { label: "Placement", value: "~1 per 5 m of wet wall" },
    ],
    categoryExamples: "Category comparable to Dri-Eaz Velo / B-Air VP-25 class units.",
  },
  {
    kind: "dehumidifier",
    name: "LGR dehumidifier",
    role: "Pulls evaporated moisture back out of the air so RH does not climb and stall drying. This is the rate ceiling of the whole system.",
    specs: [
      { label: "Extraction (AHAM)", value: "70-150 pints/day" },
      { label: "Process air", value: "180-400 CFM" },
      { label: "Coverage", value: "~40-70 m3 per unit" },
    ],
    categoryExamples: "Category comparable to Dri-Eaz LGR 7000XLi / Phoenix R250 class units.",
  },
  {
    kind: "injection",
    name: "Interstitial / injection drying",
    role: "Forces dry air into wall cavities and under hardwood/subfloor through small ports, drying spaces air movers can't reach.",
    specs: [
      { label: "Outputs", value: "up to ~19 hoses" },
      { label: "Airflow", value: "~130-320 CFM total" },
      { label: "Use", value: "cavities, under flooring" },
    ],
    categoryExamples: "Category comparable to Injectidry HP60 / Dri-Eaz TrapTight class systems.",
  },
];

/** Default per-unit dehumidifier rating used by the model (US pints/day, AHAM-style). */
export const DEFAULT_DEHU_PINTS_PER_DAY = 100;
