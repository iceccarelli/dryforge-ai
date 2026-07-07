/**
 * fleet.ts — DryForge drywall automation: fleet data + planning model.
 * -----------------------------------------------------------------------------
 * HONESTY POLICY (see README): DryForge is pre-launch with no deployed robots,
 * customers, or certifications. Numbers below are one of two kinds, and each is
 * labelled as such in the UI:
 *   1. INDUSTRY BENCHMARKS — real, third-party, sourced (e.g. Canvas, Fortune
 *      Business Insights). These describe the market, not DryForge.
 *   2. DRYFORGE PROJECTIONS — modelled design targets for a supervised fleet,
 *      derived from those benchmarks. They are planning estimates, not results.
 * The planner/pricing functions are transparent models with disclosed
 * assumptions — the same posture as the existing ROI calculator and dashboard.
 */

export type RobotId = "finisher" | "hanger" | "cutter" | "amr" | "qa";
export type Phase = "material" | "cutting" | "hanging" | "finishing" | "qa";
export type Readiness = "beachhead" | "near" | "roadmap";

export interface RobotSpec {
  id: RobotId;
  phase: Phase;
  order: number;
  name: string;
  shortName: string;
  accent: string;
  readiness: Readiness;
  readinessLabel: string;
  painPoint: string;
  howItWorks: string;
  dryforgeLayer: string;
  specs: { label: string; value: string }[];
  /** Modelled labour reduction vs manual for this phase (design target). */
  laborReductionPct: number;
  benchmarkNote?: string;
}

export const PHASE_ORDER: Phase[] = ["material", "cutting", "hanging", "finishing", "qa"];

export const ROBOTS: RobotSpec[] = [
  {
    id: "amr",
    phase: "material",
    order: 1,
    name: "Material-Handling AMR + Smart Lift",
    shortName: "AMR",
    accent: "#38BDF8",
    readiness: "near",
    readinessLabel: "Supporting system • pilot-adjacent 2026-27",
    painPoint:
      "Moving and staging 50-100 lb sheets across floors is a top source of back and shoulder injuries and crew idle time.",
    howItWorks:
      "High-payload autonomous mobile robot with a drywall rack and a sensor-assisted powered lift that auto-levels and positions sheets for the hanging step. Adapts proven warehouse AMR tech to the jobsite.",
    dryforgeLayer:
      "Just-in-time delivery is sequenced by the DryForge planner against the cut list and hanging queue, so sheets arrive where and when they're needed — tracked live on the fleet map.",
    specs: [
      { label: "Payload", value: "500-2,000 kg" },
      { label: "Lift assist", value: "auto-level, vision-guided" },
      { label: "Navigation", value: "SLAM, dynamic re-route" },
    ],
    laborReductionPct: 35,
  },
  {
    id: "cutter",
    phase: "cutting",
    order: 2,
    name: "AI Cutting & Panelization System",
    shortName: "Cutter",
    accent: "#A78BFA",
    readiness: "roadmap",
    readinessLabel: "Roadmap • target 2027",
    painPoint:
      "Manual measure-and-cut drives 10-30% material waste, dust, and errors that slow the hangers downstream.",
    howItWorks:
      "Gantry or arm-mounted track saw with dust extraction, fed by a BIM/scan-driven nesting optimizer that minimizes joints and cuts, then labels and sequences panels for install.",
    dryforgeLayer:
      "The optimizer links each cut directly to a hanging path and a finishing zone, so panelization is optimized for the whole workflow — not just the cut station — with waste tracked in the ROI dashboard.",
    specs: [
      { label: "Optimizer", value: "joint & waste minimization" },
      { label: "Dust capture", value: "on-tool extraction" },
      { label: "Output", value: "labelled, sequenced panels" },
    ],
    laborReductionPct: 30,
  },
  {
    id: "hanger",
    phase: "hanging",
    order: 3,
    name: "Drywall Hanger / Installer",
    shortName: "Hanger",
    accent: "#F59E0B",
    readiness: "roadmap",
    readinessLabel: "Roadmap • target 2027-28",
    painPoint:
      "Hanging is the most physically punishing task — heavy overhead sheets, precise alignment, high injury rates, and a shrinking labour pool.",
    howItWorks:
      "Heavy-payload cobot on a mobile base (or overhead gantry for ceilings) with vacuum sheet handling, 3D stud/framing detection for auto-alignment, and a force-controlled auto-feed screwdriver. Human-supervised with collision avoidance.",
    dryforgeLayer:
      "The planner sequences hanging against the cut list and framing scan, and every fastened sheet updates the digital twin that the finishing robots then work from — no perfect blueprint required.",
    specs: [
      { label: "Handling", value: "vacuum grip, wall & ceiling" },
      { label: "Alignment", value: "3D vision, stud detection" },
      { label: "Safety", value: "supervised, ISO 13849 target" },
    ],
    laborReductionPct: 45,
  },
  {
    id: "finisher",
    phase: "finishing",
    order: 4,
    name: "Semi-Autonomous Finishing Robot",
    shortName: "Finisher",
    accent: "#F97316",
    readiness: "beachhead",
    readinessLabel: "Beachhead • GTA pilot target 2026",
    painPoint:
      "Taping, mudding and sanding is dusty, skill-dependent, and a schedule killer — and the trade with the sharpest labour shortage.",
    howItWorks:
      "Mobile base + collaborative arm applies a defined compound profile in a single pass, then sands progressively with dust extraction. Multi-sensor perception (vision + force) closes the loop on a Level 4 / Level 5 finish. One operator supervises multiple units.",
    dryforgeLayer:
      "This is DryForge's entry point. The edge is the software: fleet orchestration, predictive maintenance, live quality scoring, and transparent per-sqft ROI — priced as RaaS with zero capex for the contractor.",
    specs: [
      { label: "Finish", value: "Level 4 & Level 5" },
      { label: "Cycle", value: "~2 days vs 5-7 manual" },
      { label: "Dust capture", value: "~99% on sand cycle" },
    ],
    laborReductionPct: 40,
    benchmarkNote:
      "Benchmarked to Canvas (category leader): ~60% schedule and ~40% labour reduction, 5-7 days to ~2 for L4/L5, ~99% dust capture. Source: Universal Robots / Tech Briefs, 2025.",
  },
  {
    id: "qa",
    phase: "qa",
    order: 5,
    name: "Vision QA & Documentation",
    shortName: "QA",
    accent: "#34D399",
    readiness: "roadmap",
    readinessLabel: "Roadmap • target 2027-28",
    painPoint:
      "Level 5 consistency is hard to verify and harder to document — a real liability and rework risk for GCs at handover.",
    howItWorks:
      "Mobile unit with raking-light vision scans finished surfaces, scores flatness and defects against a Level 4/5 rubric, flags touch-up zones, and auto-generates an as-built quality record with photos and metrics.",
    dryforgeLayer:
      "Closes the quality loop across the whole workflow: every scan feeds the DryForge audit trail and the fleet-learning data set, so finishing paths improve job over job.",
    specs: [
      { label: "Inspection", value: "raking-light defect vision" },
      { label: "Scoring", value: "L4/L5 flatness rubric" },
      { label: "Output", value: "as-built QA record + heatmap" },
    ],
    laborReductionPct: 25,
  },
];

export function robotByPhase(phase: Phase): RobotSpec {
  return ROBOTS.find((r) => r.phase === phase)!;
}

/* ---------------------------------------------------------------------------
 * Industry context (real, sourced). Rendered with attribution in the UI.
 * ------------------------------------------------------------------------- */
export const MARKET_FACTS: { stat: string; label: string; source: string }[] = [
  { stat: "$278.5M → $880.2M", label: "Drywall finishing robot market, 2026 → 2034 (15.5% CAGR)", source: "Fortune Business Insights, 2026" },
  { stat: "~60% / ~40%", label: "Schedule / labour reduction achieved by Canvas on drywall finishing", source: "Universal Robots / Tech Briefs, 2025" },
  { stat: "5-7 → ~2 days", label: "Level 4/5 finishing cycle, manual vs robotic (Canvas)", source: "Tech Briefs, 2025" },
  { stat: "1 in 4", label: "Construction workers end their career with a musculoskeletal injury", source: "Canvas / Kevin Albert, 2025" },
];

/* ---------------------------------------------------------------------------
 * Transparent planning + RaaS pricing model. All coefficients are disclosed.
 * ------------------------------------------------------------------------- */
export type Complexity = "simple" | "standard" | "complex";
export type FinishLevel = "L4" | "L5";

export interface JobConfig {
  sqft: number;
  ceilingPct: number; // share of work that is ceiling (harder)
  complexity: Complexity;
  finish: FinishLevel;
  laborRate: number; // $/hour fully loaded
  supervisionRatio: number; // robots per 1 operator
  raasRate: number; // $/finished sqft (planning placeholder)
}

export const DEFAULT_JOB: JobConfig = {
  sqft: 20000,
  ceilingPct: 25,
  complexity: "standard",
  finish: "L5",
  laborRate: 55,
  supervisionRatio: 3,
  raasRate: 1.15,
};

// Disclosed model coefficients.
const MANUAL_SQFT_PER_LABOR_HR = 42; // full workflow, standard L4, illustrative
const COMPLEXITY_FACTOR: Record<Complexity, number> = { simple: 0.85, standard: 1, complex: 1.25 };
const FINISH_FACTOR: Record<FinishLevel, number> = { L4: 1, L5: 1.18 };
const ROBOT_LABOR_REDUCTION = 0.4; // benchmarked to Canvas ~40%
const ROBOT_SCHEDULE_REDUCTION = 0.6; // benchmarked to Canvas ~60%
const CREW_HOURS_PER_DAY = 8;
const MANUAL_CREW = 5;

export interface PlanResult {
  manualLaborHours: number;
  robotLaborHours: number;
  laborHoursSaved: number;
  manualDays: number;
  robotDays: number;
  manualCost: number;
  raasCost: number;
  costSaved: number;
  operatorsNeeded: number;
  co2Note: string;
}

export function computePlan(cfg: JobConfig): PlanResult {
  const difficulty = COMPLEXITY_FACTOR[cfg.complexity] * FINISH_FACTOR[cfg.finish] * (1 + cfg.ceilingPct / 200);
  const effRate = MANUAL_SQFT_PER_LABOR_HR / difficulty;

  const manualLaborHours = cfg.sqft / effRate;
  const robotLaborHours = manualLaborHours * (1 - ROBOT_LABOR_REDUCTION);
  const laborHoursSaved = manualLaborHours - robotLaborHours;

  const manualDays = manualLaborHours / (CREW_HOURS_PER_DAY * MANUAL_CREW);
  const robotDays = manualDays * (1 - ROBOT_SCHEDULE_REDUCTION);

  const manualCost = manualLaborHours * cfg.laborRate;
  const raasCost = cfg.sqft * cfg.raasRate;
  const costSaved = manualCost - raasCost;

  const operatorsNeeded = Math.max(1, Math.ceil(4 / cfg.supervisionRatio));

  return {
    manualLaborHours,
    robotLaborHours,
    laborHoursSaved,
    manualDays,
    robotDays,
    manualCost,
    raasCost,
    costSaved,
    operatorsNeeded,
    co2Note: "Less rework and fewer re-mobilizations reduce waste; exact figures measured per pilot.",
  };
}

export const MODEL_ASSUMPTIONS: string[] = [
  `Manual baseline of ${MANUAL_SQFT_PER_LABOR_HR} finished sqft per labour-hour for a standard Level 4 workflow, adjusted for finish level, ceiling share and complexity.`,
  `Robotic case applies the Canvas-published ~${Math.round(ROBOT_LABOR_REDUCTION * 100)}% labour and ~${Math.round(ROBOT_SCHEDULE_REDUCTION * 100)}% schedule reductions as design targets — not DryForge measurements.`,
  `Manual schedule assumes a ${MANUAL_CREW}-person crew at ${CREW_HOURS_PER_DAY} h/day.`,
  "RaaS price is a per-sqft planning placeholder set by you, not a quote.",
  "This is a planning model. Real numbers come from measured GTA pilots and are published only once they exist.",
];

export function money(n: number): string {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}
export function num(n: number, d = 0): string {
  return n.toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
}
