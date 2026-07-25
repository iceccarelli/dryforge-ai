/**
 * showcase.ts — data model for the Autonomous Finishing showcase.
 * -----------------------------------------------------------------------------
 * 80 concept renders = 20 real "scenes" (10 finishing + 10 field), each captured
 * from 4 angles. Every scene maps to a finishing OPERATION with a benefit line,
 * a technical specific, and a live HUD status string.
 *
 * HONESTY POLICY (see README / fleet.ts): concept renders / design targets, not
 * photographs of deployed hardware. Specs are engineering targets.
 */

export type SeriesId = "independent" | "field";

export type OperationId =
  | "taping" | "mudding" | "sanding" | "detailing"
  | "highreach" | "inspect" | "scan" | "supervise" | "handling";

export interface Series { id: SeriesId; name: string; tagline: string; description: string; }

export const SERIES: Series[] = [
  { id: "independent", name: "Independent Operation", tagline: "The finishing robot working the wall on its own",
    description: "The core DryForge unit — a mobile base and collaborative arm running the finishing sequence under supervision on real interior geometry." },
  { id: "field", name: "Systems & Field Views", tagline: "The platform on an active jobsite",
    description: "The wider platform in context: surface scanning, operator supervision and multiple chassis working across corridors, openings and full-height walls." },
];

export interface Operation { id: OperationId; label: string; benefit: string; }

export const OPERATIONS: Record<OperationId, Operation> = {
  taping:    { id: "taping",    label: "Taping",          benefit: "Takes the slowest, most detail-dependent step off your critical path." },
  mudding:   { id: "mudding",   label: "Mudding",         benefit: "A uniform coat means less sanding and fewer re-coats — your biggest schedule win." },
  sanding:   { id: "sanding",   label: "Sanding",         benefit: "Removes the dustiest, most injury-prone task from your crew." },
  detailing: { id: "detailing", label: "Detailing",       benefit: "Clears the repetitive majority of the wall so finishers spend skill where it counts." },
  highreach: { id: "highreach", label: "Full-Height",     benefit: "Finishes tall walls and ceiling lines without a scaffold day or stilts." },
  inspect:   { id: "inspect",   label: "QA / Verification", benefit: "Documented Level 4/5 quality at handover — evidence, not punch-list arguments." },
  scan:      { id: "scan",      label: "Scanning",        benefit: "Turns the wall into a plan before a drop of mud is applied." },
  supervise: { id: "supervise", label: "Supervision",     benefit: "One operator runs several robots — your finishers become supervisors, not leavers." },
  handling:  { id: "handling",  label: "Positioning",     benefit: "The unit stages and moves itself — no one hauling heavy gear across the floor." },
};

/** A scene = one physical setup, captured from 4 angles. */
export interface Scene {
  id: string; series: SeriesId; operation: OperationId;
  title: string; specific: string; state: string; // state = live HUD badge
}

export const SCENES: Record<string, Scene> = {
  "ind-1":  { id: "ind-1",  series: "independent", operation: "taping",    title: "Seam & Opening Taping",     state: "TAPING · seam 1 of 3",   specific: "Embeds tape along a seam beside a wall opening, indexed off the framing scan." },
  "ind-2":  { id: "ind-2",  series: "independent", operation: "mudding",   title: "Compound Application",       state: "MUDDING · coat 1",       specific: "The applicator lays a defined compound profile onto the board." },
  "ind-3":  { id: "ind-3",  series: "independent", operation: "highreach", title: "Full-Height Reach",          state: "REACHING · 3.4 m",       specific: "Mast extended toward the ceiling line to finish the top of a tall wall." },
  "ind-4":  { id: "ind-4",  series: "independent", operation: "sanding",   title: "Progressive Sanding",        state: "SANDING · grit 120",     specific: "Steps through grit under force control with dust captured at the head." },
  "ind-5":  { id: "ind-5",  series: "independent", operation: "detailing", title: "Positioning & Detailing",    state: "POSITIONING · indexed",  specific: "The collaborative arm indexes to the wall from its mobile base between passes." },
  "ind-6":  { id: "ind-6",  series: "independent", operation: "mudding",   title: "Broadwall Coat",             state: "MUDDING · span 4.2 m",   specific: "Holds a uniform compound profile across a large open span." },
  "ind-7":  { id: "ind-7",  series: "independent", operation: "mudding",   title: "Close Compound Pass",        state: "MUDDING · pass steady",  specific: "Blade angle and pressure held constant through the pass for an even coat." },
  "ind-8":  { id: "ind-8",  series: "independent", operation: "detailing", title: "Finishing Around Openings",  state: "DETAILING · opening",    specific: "Feathers compound cleanly around an opening and its returns." },
  "ind-9":  { id: "ind-9",  series: "independent", operation: "inspect",   title: "Finish Verification",        state: "VERIFYING · L4 pass",    specific: "Scans the finished surface and logs a Level 4/5 as-built record." },
  "ind-10": { id: "ind-10", series: "independent", operation: "detailing", title: "Occupied-Space Finishing",   state: "FINISHING · supervised", specific: "Runs speed-limited and collision-aware while other trades work nearby." },

  "fld-1":  { id: "fld-1",  series: "field", operation: "mudding",   title: "Wall Finishing",        state: "FINISHING · sheet 1",    specific: "A mobile finishing unit works a full sheet from its powered base." },
  "fld-2":  { id: "fld-2",  series: "field", operation: "mudding",   title: "Compound Application",  state: "MUDDING · coat 1",       specific: "Macro of the finishing head laying compound onto the board." },
  "fld-3":  { id: "fld-3",  series: "field", operation: "highreach", title: "High-Reach Finishing",  state: "REACHING · ceiling",     specific: "Reaches the upper wall and ceiling line without stilts or scaffold." },
  "fld-4":  { id: "fld-4",  series: "field", operation: "sanding",   title: "Surface Sanding",       state: "SANDING · extract on",   specific: "Disc sanding with on-tool dust extraction." },
  "fld-5":  { id: "fld-5",  series: "field", operation: "scan",      title: "Surface Scanning",      state: "SCANNING · wall mapped", specific: "A 3D scan maps studs, flatness and openings into the digital twin." },
  "fld-6":  { id: "fld-6",  series: "field", operation: "mudding",   title: "Open-Room Finishing",   state: "FINISHING · open span",  specific: "The finishing arm covers a broad wall in an open floorplate." },
  "fld-7":  { id: "fld-7",  series: "field", operation: "supervise", title: "Operator Supervision",  state: "SUPERVISED · operator",  specific: "A trained operator supervises from a tablet, ready to stop or re-task the unit." },
  "fld-8":  { id: "fld-8",  series: "field", operation: "detailing", title: "Detail & Edge Work",    state: "DETAILING · edge",       specific: "Close finishing against edges and penetrations." },
  "fld-9":  { id: "fld-9",  series: "field", operation: "detailing", title: "Panel Finishing",       state: "FINISHING · panel",      specific: "Works methodically across a panelized wall section." },
  "fld-10": { id: "fld-10", series: "field", operation: "handling",  title: "Mobile Positioning",    state: "NAV · re-localizing",    specific: "Re-localizes and re-positions to the next station on the plan." },
};

export interface ShowcaseImage {
  src: string; series: SeriesId; scene: string; variant: number;
}

function build(series: SeriesId, prefix: string): ShowcaseImage[] {
  const out: ShowcaseImage[] = [];
  for (let n = 1; n <= 40; n++) {
    const sceneNum = ((n - 1) % 10) + 1;
    const variant = Math.floor((n - 1) / 10) + 1;
    out.push({ src: `/showcase/${series}/${String(n).padStart(2, "0")}.png`, series, scene: `${prefix}-${sceneNum}`, variant });
  }
  return out;
}

export const IMAGES: ShowcaseImage[] = [...build("independent", "ind"), ...build("field", "fld")];
export const INDEPENDENT_IMAGES = IMAGES.filter((i) => i.series === "independent");
export const FIELD_IMAGES = IMAGES.filter((i) => i.series === "field");
