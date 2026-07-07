/**
 * jobs.ts — the "operate the robot" engine for /robots-demo.
 * Each robot exposes concrete JOBS a customer would actually run. Each job has
 * PHASES (so the robot executes a real sequence) and KNOBS (parameters that
 * change how the machine behaves and what it delivers). Outcomes are modelled
 * from the knob values — labelled as projections, per the honesty policy.
 */
import type { RobotId } from "../lib/fleet";

export type KnobKind = "slider" | "segment" | "toggle";
export interface Knob {
  id: string;
  label: string;
  kind: KnobKind;
  min?: number; max?: number; step?: number; unit?: string;
  options?: string[];
  default: number | string | boolean;
}
export interface Phase { id: string; label: string; frac: number }
export interface JobDef {
  id: string;
  label: string;
  target: string; // what workpiece it acts on
  baseSeconds: number;
  phases: Phase[];
  knobs: Knob[];
}
export type KnobValues = Record<string, number | string | boolean>;
export interface Metric { label: string; value: string; tone?: "good" | "warn" | "default" }

/* ------------------------------- job catalog ------------------------------- */
export const JOBS: Record<RobotId, JobDef[]> = {
  finisher: [
    {
      id: "coat", label: "Tape & mud coat", target: "wall", baseSeconds: 9,
      phases: [
        { id: "approach", label: "Approach & map wall", frac: 0.12 },
        { id: "apply", label: "Apply compound (single pass)", frac: 0.7 },
        { id: "retract", label: "Retract & log", frac: 0.18 },
      ],
      knobs: [
        { id: "coatMm", label: "Coat thickness", kind: "slider", min: 0.6, max: 2.0, step: 0.1, unit: " mm", default: 1.1 },
        { id: "arm", label: "Arm mode", kind: "segment", options: ["Precise", "Balanced", "Fast"], default: "Balanced" },
      ],
    },
    {
      id: "finish", label: "Full L4/L5 finish", target: "wall", baseSeconds: 14,
      phases: [
        { id: "coat", label: "Compound coat", frac: 0.4 },
        { id: "dry", label: "Flash-dry cycle", frac: 0.15 },
        { id: "sand", label: "Progressive sanding", frac: 0.35 },
        { id: "verify", label: "Self-check finish", frac: 0.1 },
      ],
      knobs: [
        { id: "level", label: "Finish level", kind: "segment", options: ["L4", "L5"], default: "L5" },
        { id: "grit", label: "Final grit", kind: "segment", options: ["100", "120", "150"], default: "120" },
        { id: "arm", label: "Arm mode", kind: "segment", options: ["Precise", "Balanced", "Fast"], default: "Balanced" },
      ],
    },
  ],
  hanger: [
    {
      id: "wall", label: "Hang wall course", target: "hangWall", baseSeconds: 11,
      phases: [
        { id: "pick", label: "Vacuum-pick sheet", frac: 0.2 },
        { id: "raise", label: "Raise to vertical", frac: 0.2 },
        { id: "align", label: "Align to studs", frac: 0.2 },
        { id: "fasten", label: "Auto-fasten", frac: 0.4 },
      ],
      knobs: [
        { id: "sheet", label: "Sheet size", kind: "segment", options: ["4×8", "4×12"], default: "4×12" },
        { id: "spacing", label: "Fastener spacing", kind: "slider", min: 8, max: 16, step: 1, unit: '"', default: 12 },
      ],
    },
    {
      id: "ceiling", label: "Hang ceiling sheet", target: "hangCeiling", baseSeconds: 13,
      phases: [
        { id: "pick", label: "Vacuum-pick sheet", frac: 0.2 },
        { id: "lift", label: "Overhead lift", frac: 0.3 },
        { id: "hold", label: "Hold to joists", frac: 0.2 },
        { id: "fasten", label: "Auto-fasten", frac: 0.3 },
      ],
      knobs: [
        { id: "sheet", label: "Sheet size", kind: "segment", options: ["4×8", "4×12"], default: "4×8" },
        { id: "grip", label: "Grip vacuum", kind: "slider", min: 60, max: 95, step: 5, unit: " kPa", default: 80 },
      ],
    },
  ],
  cutter: [
    {
      id: "opening", label: "Cut a door opening", target: "cutSheet", baseSeconds: 8,
      phases: [
        { id: "scan", label: "Import BIM cut list", frac: 0.15 },
        { id: "cut", label: "Route opening", frac: 0.7 },
        { id: "label", label: "Label & stage", frac: 0.15 },
      ],
      knobs: [
        { id: "tol", label: "Tolerance", kind: "slider", min: 0.5, max: 3, step: 0.5, unit: " mm", default: 1 },
        { id: "blade", label: "Blade speed", kind: "segment", options: ["Clean", "Fast"], default: "Clean" },
      ],
    },
    {
      id: "nest", label: "Nest & panelize run", target: "cutSheet", baseSeconds: 12,
      phases: [
        { id: "opt", label: "Optimize nesting", frac: 0.25 },
        { id: "cut", label: "Cut panels", frac: 0.6 },
        { id: "label", label: "Label & sequence", frac: 0.15 },
      ],
      knobs: [
        { id: "optimize", label: "Waste optimizer", kind: "toggle", default: true },
        { id: "sheets", label: "Sheets in run", kind: "slider", min: 4, max: 40, step: 2, unit: "", default: 12 },
      ],
    },
  ],
  amr: [
    {
      id: "deliver", label: "Deliver stack to zone", target: "zone", baseSeconds: 10,
      phases: [
        { id: "load", label: "Load at staging", frac: 0.15 },
        { id: "travel", label: "Navigate to zone", frac: 0.45 },
        { id: "place", label: "Lower & place", frac: 0.25 },
        { id: "return", label: "Return", frac: 0.15 },
      ],
      knobs: [
        { id: "payload", label: "Payload", kind: "slider", min: 4, max: 16, step: 2, unit: " sheets", default: 10 },
        { id: "speed", label: "Travel mode", kind: "segment", options: ["Cautious", "Standard"], default: "Standard" },
      ],
    },
    {
      id: "jit", label: "Just-in-time feed", target: "zone", baseSeconds: 12,
      phases: [
        { id: "sync", label: "Sync to hanger queue", frac: 0.2 },
        { id: "shuttle", label: "Shuttle sheets", frac: 0.6 },
        { id: "idle", label: "Stage next", frac: 0.2 },
      ],
      knobs: [
        { id: "cadence", label: "Feed cadence", kind: "slider", min: 2, max: 10, step: 1, unit: "/hr", default: 6 },
      ],
    },
  ],
  qa: [
    {
      id: "scan", label: "Scan a wall", target: "qaWall", baseSeconds: 9,
      phases: [
        { id: "position", label: "Position at wall", frac: 0.15 },
        { id: "sweep", label: "Raking-light sweep", frac: 0.65 },
        { id: "report", label: "Generate heatmap", frac: 0.2 },
      ],
      knobs: [
        { id: "res", label: "Scan resolution", kind: "segment", options: ["Std", "High"], default: "High" },
        { id: "thresh", label: "Defect threshold", kind: "slider", min: 1, max: 5, step: 1, unit: " mm", default: 2 },
      ],
    },
    {
      id: "verify", label: "Full L5 verification", target: "qaWall", baseSeconds: 12,
      phases: [
        { id: "sweep", label: "Multi-angle sweep", frac: 0.55 },
        { id: "score", label: "Score flatness", frac: 0.25 },
        { id: "doc", label: "As-built record", frac: 0.2 },
      ],
      knobs: [
        { id: "level", label: "Rubric", kind: "segment", options: ["L4", "L5"], default: "L5" },
        { id: "angle", label: "Light angle", kind: "slider", min: 10, max: 40, step: 5, unit: "°", default: 20 },
      ],
    },
  ],
};

export function defaultKnobs(job: JobDef): KnobValues {
  const v: KnobValues = {};
  for (const k of job.knobs) v[k.id] = k.default;
  return v;
}

function seg(job: JobDef, values: KnobValues, id: string): string {
  return String(values[id] ?? job.knobs.find((k) => k.id === id)?.default ?? "");
}
function nval(values: KnobValues, id: string, d = 0): number {
  const v = values[id];
  return typeof v === "number" ? v : d;
}

/** Duration in seconds after knob adjustments (used to scale the animation). */
export function jobDuration(job: JobDef, values: KnobValues): number {
  let m = 1;
  const arm = seg(job, values, "arm");
  if (arm === "Precise") m *= 1.35;
  if (arm === "Fast") m *= 0.75;
  if (job.id === "finish" && seg(job, values, "level") === "L5") m *= 1.2;
  if (job.id === "nest") m *= 0.6 + nval(values, "sheets", 12) / 40;
  if (job.id === "deliver") m *= 0.7 + nval(values, "payload", 10) / 20;
  return Math.max(3, job.baseSeconds * m);
}

export function phaseAt(job: JobDef, progress: number): { label: string; index: number } {
  let acc = 0;
  for (let i = 0; i < job.phases.length; i++) {
    acc += job.phases[i].frac;
    if (progress <= acc + 1e-6) return { label: job.phases[i].label, index: i };
  }
  const last = job.phases[job.phases.length - 1];
  return { label: last.label, index: job.phases.length - 1 };
}

/** Modelled live outcome at a given progress (0..1). */
export function outcome(robotId: RobotId, job: JobDef, values: KnobValues, progress: number): { metrics: Metric[]; quality: number; valueLine: string } {
  const p = Math.min(Math.max(progress, 0), 1);
  const good = (v: string): Metric => ({ label: "", value: v, tone: "good" });
  void good;

  if (robotId === "finisher") {
    const area = 72; // sqft of the demo wall
    const coat = nval(values, "coatMm", 1.1);
    const level = job.id === "finish" ? seg(job, values, "level") : "L4";
    const arm = seg(job, values, "arm");
    const q = (level === "L5" ? 99.2 : 98.4) - (arm === "Fast" ? 1.6 : 0) + (arm === "Precise" ? 0.4 : 0);
    return {
      quality: q,
      valueLine: `A ${level} finish crews take 5–7 days to hand-sand, delivered in one supervised pass.`,
      metrics: [
        { label: "Wall finished", value: `${Math.round(area * p)} / ${area} sqft`, tone: "good" },
        { label: "Compound used", value: `${(area * coat * 0.0013 * p).toFixed(1)} gal` },
        { label: "Dust captured", value: "~99%", tone: "good" },
        { label: "Finish quality", value: `${q.toFixed(1)}%`, tone: q > 98.5 ? "good" : "warn" },
      ],
    };
  }
  if (robotId === "hanger") {
    const size = seg(job, values, "sheet");
    const perSheet = size === "4×12" ? 48 : 32;
    const total = job.id === "ceiling" ? 1 : 4;
    const placed = Math.floor(p * total + (p >= 1 ? 0 : 0.0001));
    const spacing = nval(values, "spacing", 12);
    return {
      quality: 99,
      valueLine: "Removes the most injury-prone task on site — no crew straining overhead with 50–100 lb sheets.",
      metrics: [
        { label: "Sheets hung", value: `${placed} / ${total}`, tone: "good" },
        { label: "Coverage", value: `${placed * perSheet} sqft` },
        { label: "Fasteners", value: `${Math.round(placed * (96 / Math.max(spacing, 1)))}` },
        { label: "Alignment", value: "±1.5 mm", tone: "good" },
      ],
    };
  }
  if (robotId === "cutter") {
    const optimize = values["optimize"] !== false && job.id === "nest";
    const wastePct = job.id === "nest" ? (optimize ? 6 : 22) : 9;
    const sheets = job.id === "nest" ? nval(values, "sheets", 12) : 1;
    return {
      quality: 100 - wastePct,
      valueLine: "Turns measure-and-cut error and 10–30% waste into a BIM-driven, labelled, sequenced panel run.",
      metrics: [
        { label: "Cut progress", value: `${Math.round(p * 100)}%`, tone: "good" },
        { label: "Material waste", value: `${wastePct}%`, tone: wastePct < 10 ? "good" : "warn" },
        { label: "Panels", value: `${Math.round(p * sheets)}` },
        { label: "Dust captured", value: "~98%", tone: "good" },
      ],
    };
  }
  if (robotId === "amr") {
    const payload = job.id === "deliver" ? nval(values, "payload", 10) : nval(values, "cadence", 6);
    const moved = Math.round(p * payload);
    return {
      quality: 100,
      valueLine: "Kills the back-and-shoulder injuries and crew idle time of manual sheet hauling and staging.",
      metrics: [
        { label: "Sheets delivered", value: `${moved} / ${payload}`, tone: "good" },
        { label: "Crew idle saved", value: `${Math.round(p * payload * 3)} min`, tone: "good" },
        { label: "Injury exposure", value: "0 lifts", tone: "good" },
        { label: "Route", value: seg(job, values, "speed") || "auto" },
      ],
    };
  }
  // qa
  const level = seg(job, values, "level") || "L5";
  const defects = Math.round(p * 3);
  const flat = (level === "L5" ? 99.3 : 98.6);
  return {
    quality: flat,
    valueLine: "Gives the GC a defensible, documented Level 5 sign-off — no more finish disputes at handover.",
    metrics: [
      { label: "Wall scanned", value: `${Math.round(p * 100)}%`, tone: "good" },
      { label: "Defects flagged", value: `${defects}`, tone: defects > 0 && p > 0.5 ? "warn" : "good" },
      { label: "Flatness score", value: `${flat.toFixed(1)}%`, tone: "good" },
      { label: "As-built record", value: p >= 1 ? "generated" : "…" },
    ],
  };
}
