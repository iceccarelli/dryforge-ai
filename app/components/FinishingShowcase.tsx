"use client";

/**
 * FinishingShowcase — Autonomous Drywall Finishing Systems.
 * -----------------------------------------------------------------------------
 * AWS-product-page-style gallery, three views over the image library, one shared
 * lightbox:
 *   • Featured  — 10 curated "cells" with rich specs + technical write-ups (carousel)
 *   • All views — every concept render (load-more grid)
 *   • Field     — the systems / field set (load-more grid)
 * Dark navy stage, orange accent, emerald live HUD badges. Plain <img> with
 * lazy loading (no next/image dependency) → reliable on any host, zero layout
 * shift (every image sits in a fixed aspect-ratio well).
 *
 * HONESTY: concept renders / design targets, not deployed hardware. Specs are
 * disclosed engineering targets; captions describe the operation shown.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, ChevronRight, X,
  Ruler, Gauge, Layers, Wind, ShieldCheck, Timer, Repeat, ScanLine, Move3d,
} from "lucide-react";
import {
  INDEPENDENT_IMAGES, FIELD_IMAGES, IMAGES, SCENES, OPERATIONS,
} from "@/app/lib/showcase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Spec = { icon: React.ComponentType<{ className?: string }>; label: string; value: string };

type Item = {
  src: string;
  title: string;
  tagline?: string;
  state?: string;
  summary?: string;
  detail?: string;
  op?: string;      // operation id, for "similar" grouping
  specs?: Spec[];
};

const REFERENCE_SPECS: Spec[] = [
  { icon: Ruler, label: "Vertical reach", value: "up to 3.4 m" },
  { icon: Gauge, label: "Coverage rate", value: "~120 sq.ft/hr" },
  { icon: Layers, label: "Finish target", value: "Level 4 / 5" },
  { icon: Wind, label: "Dust capture", value: "~99% at head" },
  { icon: Timer, label: "Cycle", value: "~2 days vs 5–7" },
  { icon: ShieldCheck, label: "Operation", value: "Human-supervised" },
];

/* ------------------------------------------------------------------ */
/*  Featured cells (curated, hand-authored)                            */
/* ------------------------------------------------------------------ */
const FEATURED: Item[] = [
  {
    src: "/showcase/independent/01.png", title: "Seam & Opening Taping", tagline: "Automated taping",
    state: "TAPING · seam 1 of 3", op: "taping",
    summary: "Embedding tape along a window return, indexed off the framing scan.",
    detail: "The arm runs tape into the tight geometry around openings and returns — the fiddly, slow work that eats a finisher's day. Vision closes the loop on embed depth so the joint under the compound is right the first time, and the whole pass is supervised by an operator who can stop it instantly.",
    specs: [
      { icon: Ruler, label: "Vertical reach", value: "3.1 m" }, { icon: Gauge, label: "Coverage rate", value: "~55 lin.ft/hr" },
      { icon: Layers, label: "Finish target", value: "Level 4 / 5" }, { icon: ScanLine, label: "Embed check", value: "Vision-verified" },
      { icon: Timer, label: "Cycle", value: "~2 days vs 5–7" }, { icon: ShieldCheck, label: "Operation", value: "Human-supervised" },
    ],
  },
  {
    src: "/showcase/independent/02.png", title: "Compound Application", tagline: "Mudding",
    state: "MUDDING · coat 1", op: "mudding",
    summary: "The applicator laying a defined compound profile onto the board.",
    detail: "A close view of the mudding head laying a controlled compound profile. Holding blade angle and pressure across the whole run is what removes the downstream sanding load — the flatter the mud goes on, the less there is to take back off.",
    specs: [
      { icon: Gauge, label: "Coverage rate", value: "~140 sq.ft/hr" }, { icon: Repeat, label: "Coat consistency", value: "±0.5 mm target" },
      { icon: Layers, label: "Finish target", value: "Level 4 / 5" }, { icon: Ruler, label: "Working width", value: "up to 1.2 m/pass" },
      { icon: Timer, label: "Cycle", value: "~2 days vs 5–7" }, { icon: ShieldCheck, label: "Operation", value: "Human-supervised" },
    ],
  },
  {
    src: "/showcase/independent/03.png", title: "Full-Height Reach", tagline: "Tall walls, no scaffold",
    state: "REACHING · 3.4 m", op: "highreach",
    summary: "Mast extended toward the ceiling line on a tall, sheeted wall.",
    detail: "Tall lobby and atrium walls force manual crews onto stilts and lifts. The mast extends to full height and holds the same compound profile from base to ceiling line, so the top of the wall matches the bottom without a scaffold day.",
    specs: [
      { icon: Ruler, label: "Vertical reach", value: "up to 3.4 m" }, { icon: Gauge, label: "Coverage rate", value: "~135 sq.ft/hr" },
      { icon: Layers, label: "Finish target", value: "Level 4 / 5" }, { icon: Move3d, label: "Access", value: "No scaffold / stilts" },
      { icon: Timer, label: "Cycle", value: "~2 days vs 5–7" }, { icon: ShieldCheck, label: "Operation", value: "Human-supervised" },
    ],
  },
  {
    src: "/showcase/independent/04.png", title: "Progressive Sanding", tagline: "Dust-controlled finishing",
    state: "SANDING · grit 120", op: "sanding",
    summary: "Stepping through grit under force control, dust captured at the head.",
    detail: "Sanding is the dustiest, most thankless step. The head steps through progressively finer grit under closed force control while an integrated shroud captures the dust at source — keeping the surface, and the air on site, clean.",
    specs: [
      { icon: Gauge, label: "Coverage rate", value: "~110 sq.ft/hr" }, { icon: Wind, label: "Dust capture", value: "~99% at head" },
      { icon: Layers, label: "Finish target", value: "Level 4 / 5" }, { icon: Repeat, label: "Control", value: "Force + vision loop" },
      { icon: Timer, label: "Cycle", value: "~2 days vs 5–7" }, { icon: ShieldCheck, label: "Operation", value: "Human-supervised" },
    ],
  },
  {
    src: "/showcase/independent/05.png", title: "Positioning & Detailing", tagline: "Self-indexing base",
    state: "POSITIONING · indexed", op: "detailing",
    summary: "The arm indexing to the wall from its mobile base between passes.",
    detail: "Between passes the unit indexes itself to the next section against the digital twin — no re-teaching. It clears the repetitive majority of the wall so your finishers spend their skill only on the complex corners that still need a human.",
    specs: REFERENCE_SPECS,
  },
  {
    src: "/showcase/independent/06.png", title: "Broadwall Coat", tagline: "Large open spans",
    state: "MUDDING · span 4.2 m", op: "mudding",
    summary: "Holding a uniform compound profile across a large open span.",
    detail: "On big, flat commercial walls the robot applies a consistent compound profile in a controlled pass, holding blade angle and pressure the whole run. Consistency here is the single biggest schedule saver on the job.",
    specs: [
      { icon: Gauge, label: "Coverage rate", value: "~140 sq.ft/hr" }, { icon: Ruler, label: "Span", value: "4+ m continuous" },
      { icon: Layers, label: "Finish target", value: "Level 4 / 5" }, { icon: Repeat, label: "Coat consistency", value: "±0.5 mm target" },
      { icon: Timer, label: "Cycle", value: "~2 days vs 5–7" }, { icon: ShieldCheck, label: "Operation", value: "Human-supervised" },
    ],
  },
  {
    src: "/showcase/independent/07.png", title: "Close Compound Pass", tagline: "Even coat weight",
    state: "MUDDING · pass steady", op: "mudding",
    summary: "Blade angle and pressure held constant through the pass.",
    detail: "Compound behaves differently as it sits and as the room warms. The delivery compensates for viscosity in real time so the coat weight stays uniform across the wall and across the shift — the variable that most often forces a manual re-coat.",
    specs: REFERENCE_SPECS,
  },
  {
    src: "/showcase/independent/08.png", title: "Finishing Around Openings", tagline: "Feathered edges",
    state: "DETAILING · opening", op: "detailing",
    summary: "Feathering compound cleanly around an opening and its returns.",
    detail: "Around glazing and trim the robot switches to a detailing profile, feathering the compound cleanly up to the hard edge instead of flooding it. Humans still own the most complex corners — the robot clears the repetitive 80% around them.",
    specs: REFERENCE_SPECS,
  },
  {
    src: "/showcase/independent/09.png", title: "Finish Verification", tagline: "Documented quality",
    state: "VERIFYING · L4 pass", op: "inspect",
    summary: "Scanning the finished surface and logging an as-built record.",
    detail: "Raking-light vision scans the finished surface, scores flatness against the Level 4/5 rubric and logs an as-built record. That's documented quality at handover — evidence for the GC, not an argument at the punch-list walk.",
    specs: [
      { icon: ScanLine, label: "Method", value: "Raking-light scan" }, { icon: Layers, label: "Finish target", value: "Level 4 / 5" },
      { icon: Repeat, label: "Record", value: "Per-wall as-built" }, { icon: Gauge, label: "Flatness", value: "Scored to rubric" },
      { icon: Timer, label: "Cycle", value: "~2 days vs 5–7" }, { icon: ShieldCheck, label: "Operation", value: "Human-supervised" },
    ],
  },
  {
    src: "/showcase/independent/10.png", title: "Occupied-Space Finishing", tagline: "Live fit-out",
    state: "FINISHING · supervised", op: "detailing",
    summary: "Working a live fit-out room, speed-limited and collision-aware.",
    detail: "In an active fit-out the robot runs speed-limited and collision-aware, supervised by an operator who can be minding several units. It finishes the wall while the rest of the trade keeps moving around it — the realistic jobsite, not a clean-room demo.",
    specs: REFERENCE_SPECS,
  },
];

/* Manifest → Item[] for the other two tabs. */
function toItem(img: { src: string; scene: string }): Item {
  const sc = SCENES[img.scene];
  const op = OPERATIONS[sc.operation];
  return {
    src: img.src, title: sc.title, tagline: op.label, state: sc.state, op: sc.operation,
    summary: sc.specific, detail: `${op.benefit} ${sc.specific}`, specs: REFERENCE_SPECS,
  };
}
const ALL_VIEWS: Item[] = IMAGES.map(toItem);
const FIELD_VIEWS: Item[] = FIELD_IMAGES.map(toItem);
void INDEPENDENT_IMAGES;

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */
function SpecItem({ spec }: { spec: Spec }) {
  const Icon = spec.icon;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[2px] text-white/45">{spec.label}</div>
        <div className="font-mono text-sm text-white/90">{spec.value}</div>
      </div>
    </div>
  );
}

function Hud({ state }: { state: string }) {
  return (
    <div className="pointer-events-none rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] tracking-wide text-emerald-300 backdrop-blur">
      <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 align-middle" />
      {state}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lightbox                                                           */
/* ------------------------------------------------------------------ */
function Lightbox({
  items, activeIndex, onClose, onSelect,
}: {
  items: Item[]; activeIndex: number; onClose: () => void; onSelect: (i: number) => void;
}) {
  const item = items[activeIndex];
  const specs = item.specs ?? REFERENCE_SPECS;

  const go = useCallback(
    (dir: 1 | -1) => onSelect((activeIndex + dir + items.length) % items.length),
    [activeIndex, items.length, onSelect]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [go, onClose]);

  // Similar = same operation first, then anything else in the list.
  const similar = useMemo(() => {
    const same = items.map((it, i) => ({ it, i })).filter(({ it, i }) => i !== activeIndex && it.op === item.op);
    const rest = items.map((it, i) => ({ it, i })).filter(({ it, i }) => i !== activeIndex && it.op !== item.op);
    return [...same, ...rest].slice(0, 12);
  }, [items, activeIndex, item.op]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      role="dialog" aria-modal="true" aria-label={`${item.title} — details`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <motion.div
        className="relative z-10 flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120]/95"
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <button onClick={onClose} aria-label="Close"
          className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
          {/* Image side */}
          <div className="relative flex items-center justify-center bg-[#060a13] p-4 sm:p-6">
            <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border border-white/10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={item.src} src={item.src} alt={`${item.title} — DryForge concept render`}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} decoding="async"
                />
              </AnimatePresence>
              {item.state && <div className="absolute left-3 top-3"><Hud state={item.state} /></div>}
            </div>
            <button onClick={() => go(-1)} aria-label="Previous view"
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white sm:inline-flex">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => go(1)} aria-label="Next view"
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white sm:inline-flex">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Detail side */}
          <div className="df-rail min-h-0 overflow-y-auto p-6 sm:p-8">
            {item.tagline && <div className="text-xs uppercase tracking-[3px] text-[#F97316]">{item.tagline}</div>}
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{item.title}</h3>
            {(item.detail || item.summary) && <p className="mt-3 leading-relaxed text-white/70">{item.detail ?? item.summary}</p>}

            <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[2px] text-white/45">
              <Ruler className="h-4 w-4 text-[#F97316]" /> Design-target specifications
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {specs.map((s) => <SpecItem key={s.label} spec={s} />)}
            </div>

            <div className="mt-7 text-xs uppercase tracking-[2px] text-white/45">Similar views</div>
            <div className="df-rail mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
              {similar.map(({ it, i }) => (
                <button key={it.src} onClick={() => onSelect(i)} aria-label={`View ${it.title}`}
                  className="group relative aspect-[3/4] w-24 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 transition hover:border-[#F97316]/60">
                  <img src={it.src} alt={it.title} loading="lazy" decoding="async"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pb-1.5 pt-4 text-left text-[10px] leading-tight text-white/85">
                    {it.title}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-7 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/40">
              Concept render. Specifications are disclosed engineering design targets — not captured performance or a photo of deployed hardware.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured carousel                                                  */
/* ------------------------------------------------------------------ */
function Carousel({ items, onOpen }: { items: Item[]; onOpen: (i: number) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current; if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current; if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => { el.removeEventListener("scroll", updateArrows); window.removeEventListener("resize", updateArrows); };
  }, [updateArrows]);

  const nudge = (dir: 1 | -1) => {
    const el = scrollerRef.current; if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#020617] to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#020617] to-transparent sm:w-16" />
      <button onClick={() => nudge(-1)} disabled={!canLeft} aria-label="Scroll left"
        className="absolute -left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-0 md:inline-flex">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button onClick={() => nudge(1)} disabled={!canRight} aria-label="Scroll right"
        className="absolute -right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-0 md:inline-flex">
        <ChevronRight className="h-6 w-6" />
      </button>

      <div ref={scrollerRef}
        className="df-rail flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4">
        {items.map((r, i) => (
          <button key={r.src} data-card onClick={() => onOpen(i)} aria-label={`Open ${r.title}`}
            className="group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left transition duration-300 hover:-translate-y-1 hover:border-[#F97316]/50 hover:shadow-xl hover:shadow-[#F97316]/10 focus:outline-none focus-visible:border-[#F97316]/70 sm:w-[340px]">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <img src={r.src} alt={`${r.title} — DryForge concept render`}
                loading={i < 3 ? "eager" : "lazy"} decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              {r.state && <div className="absolute left-3 top-3"><Hud state={r.state} /></div>}
              <div className="absolute inset-x-0 bottom-0 p-5">
                {r.tagline && <div className="text-[11px] uppercase tracking-[2px] text-[#F97316]">{r.tagline}</div>}
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">{r.title}</h3>
                {r.summary && <p className="mt-1 line-clamp-2 text-sm text-white/70">{r.summary}</p>}
                <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 opacity-0 transition group-hover:opacity-100">
                  View details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Masonry grid with load-more                                        */
/* ------------------------------------------------------------------ */
function Grid({ items, onOpen, step = 20 }: { items: Item[]; onOpen: (i: number) => void; step?: number }) {
  const [visible, setVisible] = useState(step);
  const shown = items.slice(0, visible);
  return (
    <>
      <div className="[column-fill:_balance] columns-2 gap-4 sm:columns-3 lg:columns-4">
        {shown.map((it, i) => (
          <button key={it.src} onClick={() => onOpen(i)} aria-label={`Open ${it.title}`}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition hover:-translate-y-0.5 hover:border-[#F97316]/50">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <img src={it.src} alt={it.title} loading="lazy" decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              {it.state && <div className="absolute left-2.5 top-2.5 scale-90 opacity-0 transition group-hover:opacity-100"><Hud state={it.state} /></div>}
              <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                {it.title}
              </span>
            </div>
          </button>
        ))}
      </div>
      {visible < items.length && (
        <div className="mt-8 text-center">
          <button onClick={() => setVisible((v) => v + step)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
            Load more · {items.length - visible} remaining
          </button>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */
type Tab = "featured" | "all" | "field";

export default function FinishingShowcase() {
  const [tab, setTab] = useState<Tab>("featured");
  const [open, setOpen] = useState<number | null>(null);

  const lists = useMemo<Record<Tab, Item[]>>(
    () => ({ featured: FEATURED, all: ALL_VIEWS, field: FIELD_VIEWS }), []
  );
  const items = lists[tab];

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "featured", label: "Featured finishes", count: FEATURED.length },
    { id: "all", label: "All views", count: ALL_VIEWS.length },
    { id: "field", label: "Field & systems", count: FIELD_VIEWS.length },
  ];

  const switchTab = (t: Tab) => { setOpen(null); setTab(t); };

  return (
    <section id="autonomous-systems" className="border-y border-white/10 bg-[#020617] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="text-xs font-bold uppercase tracking-[3px] text-[#F97316]">Autonomous Drywall Finishing Systems</div>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">See it run — independently.</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/60">
            A full library of the DryForge finishing platform working on its own. Start with ten curated
            finishes, browse every view, or jump to the field &amp; systems set — click any image for the
            measurements and the technical breakdown.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => switchTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "border-[#F97316]/60 bg-[#F97316]/15 text-white"
                  : "border-white/15 text-white/70 hover:bg-white/5 hover:text-white"
              }`}>
              {t.label}
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white/70">{t.count}</span>
            </button>
          ))}
        </div>

        {tab === "featured" && <Carousel items={items} onOpen={setOpen} />}
        {tab === "all" && <Grid items={items} onOpen={setOpen} step={20} />}
        {tab === "field" && <Grid items={items} onOpen={setOpen} step={20} />}

        <p className="mt-6 text-center text-xs tracking-widest text-white/40">
          {tab === "featured"
            ? "SWIPE OR DRAG · CLICK ANY FINISH FOR MEASUREMENTS & TECHNICAL DETAIL"
            : "CLICK ANY IMAGE TO OPEN THE FULL-RESOLUTION VIEW"}
        </p>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-white/35">
          Concept renders illustrating DryForge&apos;s design targets — not photographs of deployed hardware.
          Specs are engineering targets we will validate openly with founding pilot partners.
        </p>
      </div>

      <AnimatePresence>
        {open !== null && items[open] && (
          <Lightbox items={items} activeIndex={open} onClose={() => setOpen(null)} onSelect={setOpen} />
        )}
      </AnimatePresence>
    </section>
  );
}
