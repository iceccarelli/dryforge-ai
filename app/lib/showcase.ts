/**
 * showcase.ts — data model for the Autonomous Finishing showcase.
 * -----------------------------------------------------------------------------
 * 80 concept renders = 20 real "scenes" (10 finishing + 10 field), each captured
 * from 4 angles. Every scene maps to a finishing OPERATION (taping, mudding,
 * sanding, …) with a benefit-first line for customers and a short technical
 * specific. Captions describe the operation shown — they are not fabricated
 * per-frame claims.
 *
 * HONESTY POLICY (see README / fleet.ts): concept renders / design targets, not
 * photographs of deployed hardware. Specs are engineering targets.
 */

export type SeriesId = "independent" | "field";

export type OperationId =
  | "taping"
  | "mudding"
  | "sanding"
  | "detailing"
  | "highreach"
  | "inspect"
  | "scan"
  | "supervise"
  | "handling";

export interface Series {
  id: SeriesId;
  name: string;
  tagline: string;
  description: string;
}

export const SERIES: Series[] = [
  {
    id: "independent",
    name: "Independent Operation",
    tagline: "The finishing robot working the wall on its own",
    description:
      "The core DryForge unit — a mobile base and collaborative arm running the finishing sequence under supervision on real interior geometry.",
  },
  {
    id: "field",
    name: "Systems & Field Views",
    tagline: "The platform on an active jobsite",
    description:
      "The wider platform in context: surface scanning, operator supervision and multiple chassis working across corridors, openings and full-height walls.",
  },
];

/** Operation = what the robot is doing, with the customer benefit it drives. */
export interface Operation {
  id: OperationId;
  label: string;
  /** Benefit-first line — leads the caption for customers. */
  benefit: string;
  badge: string; // tailwind classes
}

export const OPERATIONS: Record<OperationId, Operation> = {
  taping: {
    id: "taping",
    label: "Taping",
    benefit: "Takes the slowest, most detail-dependent step off your critical path.",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  mudding: {
    id: "mudding",
    label: "Mudding",
    benefit: "A uniform coat means less sanding and fewer re-coats — your biggest schedule win.",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  sanding: {
    id: "sanding",
    label: "Sanding",
    benefit: "Removes the dustiest, most injury-prone task from your crew.",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
  },
  detailing: {
    id: "detailing",
    label: "Detailing",
    benefit: "Clears the repetitive majority of the wall so finishers spend skill where it counts.",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  highreach: {
    id: "highreach",
    label: "Full-Height",
    benefit: "Finishes tall walls and ceiling lines without a scaffold day or stilts.",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  inspect: {
    id: "inspect",
    label: "QA / Verification",
    benefit: "Documented Level 4/5 quality at handover — evidence, not punch-list arguments.",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
  },
  scan: {
    id: "scan",
    label: "Scanning",
    benefit: "Turns the wall into a plan before a drop of mud is applied.",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  supervise: {
    id: "supervise",
    label: "Supervision",
    benefit: "One operator runs several robots — your finishers become supervisors, not leavers.",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  handling: {
    id: "handling",
    label: "Positioning",
    benefit: "The unit stages and moves itself — no one hauling heavy gear across the floor.",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

/** A scene = one physical setup, captured from 4 angles. */
export interface Scene {
  id: string;
  series: SeriesId;
  operation: OperationId;
  title: string;
  /** Short technical specific — what's happening in this setup. */
  specific: string;
}

export const SCENES: Record<string, Scene> = {
  "ind-1": { id: "ind-1", series: "independent", operation: "taping", title: "Seam & Opening Taping", specific: "Embeds tape along a seam beside a wall opening, indexed off the framing scan." },
  "ind-2": { id: "ind-2", series: "independent", operation: "mudding", title: "Compound Application", specific: "The applicator lays a defined compound profile onto the board." },
  "ind-3": { id: "ind-3", series: "independent", operation: "highreach", title: "Full-Height Reach", specific: "Mast extended toward the ceiling line to finish the top of a tall wall." },
  "ind-4": { id: "ind-4", series: "independent", operation: "sanding", title: "Progressive Sanding", specific: "Steps through grit under force control with dust captured at the head." },
  "ind-5": { id: "ind-5", series: "independent", operation: "detailing", title: "Positioning & Detailing", specific: "The collaborative arm indexes to the wall from its mobile base between passes." },
  "ind-6": { id: "ind-6", series: "independent", operation: "mudding", title: "Broadwall Coat", specific: "Holds a uniform compound profile across a large open span." },
  "ind-7": { id: "ind-7", series: "independent", operation: "mudding", title: "Close Compound Pass", specific: "Blade angle and pressure held constant through the pass for an even coat." },
  "ind-8": { id: "ind-8", series: "independent", operation: "detailing", title: "Finishing Around Openings", specific: "Feathers compound cleanly around an opening and its returns." },
  "ind-9": { id: "ind-9", series: "independent", operation: "inspect", title: "Finish Verification", specific: "Scans the finished surface and logs a Level 4/5 as-built record." },
  "ind-10": { id: "ind-10", series: "independent", operation: "detailing", title: "Occupied-Space Finishing", specific: "Runs speed-limited and collision-aware while other trades work nearby." },

  "fld-1": { id: "fld-1", series: "field", operation: "mudding", title: "Wall Finishing", specific: "A mobile finishing unit works a full sheet from its powered base." },
  "fld-2": { id: "fld-2", series: "field", operation: "mudding", title: "Compound Application", specific: "Macro of the finishing head laying compound onto the board." },
  "fld-3": { id: "fld-3", series: "field", operation: "highreach", title: "High-Reach Finishing", specific: "Reaches the upper wall and ceiling line without stilts or scaffold." },
  "fld-4": { id: "fld-4", series: "field", operation: "sanding", title: "Surface Sanding", specific: "Disc sanding with on-tool dust extraction." },
  "fld-5": { id: "fld-5", series: "field", operation: "scan", title: "Surface Scanning", specific: "A 3D scan maps studs, flatness and openings into the digital twin." },
  "fld-6": { id: "fld-6", series: "field", operation: "mudding", title: "Open-Room Finishing", specific: "The finishing arm covers a broad wall in an open floorplate." },
  "fld-7": { id: "fld-7", series: "field", operation: "supervise", title: "Operator Supervision", specific: "A trained operator supervises from a tablet, ready to stop or re-task the unit." },
  "fld-8": { id: "fld-8", series: "field", operation: "detailing", title: "Detail & Edge Work", specific: "Close finishing against edges and penetrations." },
  "fld-9": { id: "fld-9", series: "field", operation: "detailing", title: "Panel Finishing", specific: "Works methodically across a panelized wall section." },
  "fld-10": { id: "fld-10", series: "field", operation: "handling", title: "Mobile Positioning", specific: "Re-localizes and re-positions to the next station on the plan." },
};

export interface ShowcaseImage {
  src: string;
  series: SeriesId;
  scene: string;
  /** 1-based angle within the scene (4 per scene). */
  variant: number;
}

function build(series: SeriesId, prefix: string): ShowcaseImage[] {
  const out: ShowcaseImage[] = [];
  for (let n = 1; n <= 40; n++) {
    const sceneNum = ((n - 1) % 10) + 1;
    const variant = Math.floor((n - 1) / 10) + 1;
    out.push({
      src: `/showcase/${series}/${String(n).padStart(2, "0")}.png`,
      series,
      scene: `${prefix}-${sceneNum}`,
      variant,
    });
  }
  return out;
}

export const IMAGES: ShowcaseImage[] = [
  ...build("independent", "ind"),
  ...build("field", "fld"),
];
