"use client";

/**
 * FinishingShowcase.tsx — "Autonomous Drywall Finishing Systems" showcase.
 * -----------------------------------------------------------------------------
 * AWS product-page pattern at library scale: filter tabs (series + operation) →
 * lazy-loaded masonry of all 80 concept renders → full-screen lightbox that
 * leads with the customer benefit, then the technical specific, the four angles
 * of that setup, and the design-target specs.
 *
 * HONESTY POLICY: concept renders / design targets, not deployed hardware. The
 * UI says so; captions describe the operation shown, never fabricated per frame.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Info,
  ShieldCheck,
  Layers,
  Wind,
  Sparkles,
} from "lucide-react";
import {
  SERIES,
  IMAGES,
  SCENES,
  OPERATIONS,
  type SeriesId,
  type OperationId,
  type ShowcaseImage,
} from "@/app/lib/showcase";

type Filter = { kind: "all" } | { kind: "series"; id: SeriesId } | { kind: "op"; id: OperationId };

const SPEC_ROWS: { icon: typeof Layers; label: string; value: string }[] = [
  { icon: Layers, label: "Finish target", value: "Level 4 / 5" },
  { icon: Wind, label: "Dust capture", value: "~99% at head (target)" },
  { icon: ShieldCheck, label: "Operation", value: "Human-supervised, always" },
];

const GRID_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

// Operations present, in a sensible reading order, for the filter row.
const OP_ORDER: OperationId[] = [
  "taping", "mudding", "sanding", "detailing", "highreach", "inspect", "scan", "supervise", "handling",
];

function matches(img: ShowcaseImage, f: Filter): boolean {
  if (f.kind === "all") return true;
  if (f.kind === "series") return img.series === f.id;
  return SCENES[img.scene].operation === f.id;
}

/* ---------------------------------------------------------------------------
 * Lightbox
 * ------------------------------------------------------------------------- */
function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: ShowcaseImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const img = items[index];
  const scene = SCENES[img.scene];
  const op = OPERATIONS[scene.operation];
  const series = SERIES.find((s) => s.id === img.series)!;

  const go = useCallback(
    (dir: number) => onIndex((index + dir + items.length) % items.length),
    [index, items.length, onIndex]
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [go, onClose]);

  // The four angles of this same setup (across the full library), for the
  // "More angles of this setup" row.
  const siblings = useMemo(
    () =>
      IMAGES.map((it, i) => ({ it, i }))
        .filter(({ it }) => it.scene === img.scene)
        .sort((a, b) => a.it.variant - b.it.variant),
    [img.scene]
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/85 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.2 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${scene.title} — ${op.label}`}
    >
      <motion.div
        className="relative flex h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-2xl lg:flex-row"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: reduce ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image stage */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-slate-950 lg:w-3/5">
          <div className="relative h-[42vh] w-full sm:h-[54vh] lg:h-[90vh] lg:max-h-[90vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={img.src}
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.22 }}
              >
                <Image
                  src={img.src}
                  alt={`${scene.title} — ${op.label} — DryForge concept render`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {index + 1} / {items.length}
            </span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8 lg:w-2/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold tracking-wide ${op.badge}`}>
              {op.label}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs font-medium text-slate-500">
              {series.name}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {scene.title}
          </h3>

          {/* Benefit leads */}
          <p className="mt-3 flex gap-2 text-[15px] font-medium leading-relaxed text-slate-900">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
            {op.benefit}
          </p>
          {/* Technical specific follows */}
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{scene.specific}</p>

          {/* Specs */}
          <div className="mt-6">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-slate-500">
              Design-target specifications
            </div>
            <dl className="grid grid-cols-1 gap-2.5">
              {SPEC_ROWS.map((m) => (
                <div key={m.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#F97316] ring-1 ring-slate-200">
                    <m.icon className="h-4 w-4" />
                  </span>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{m.label}</dt>
                    <dd className="text-sm font-semibold text-slate-900">{m.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Sibling angles */}
          {siblings.length > 1 && (
            <div className="mt-7">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-slate-500">
                More angles of this setup
              </div>
              <div className="flex gap-3 df-rail overflow-x-auto pb-1">
                {siblings.map(({ it, i }) => {
                  const active = it.src === img.src;
                  return (
                    <button
                      key={it.src}
                      type="button"
                      onClick={() => onIndex(items.findIndex((x) => x.src === it.src) >= 0 ? items.findIndex((x) => x.src === it.src) : index)}
                      aria-label={`Angle ${it.variant}`}
                      aria-current={active}
                      className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg border bg-slate-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] ${
                        active ? "border-[#F97316] ring-2 ring-[#F97316]" : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Image src={it.src} alt={`${scene.title} angle ${it.variant}`} fill sizes="64px" className="object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="mt-7 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Concept render. Specifications are disclosed engineering design targets —
            not captured performance or a photo of deployed hardware.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------------
 * Tile
 * ------------------------------------------------------------------------- */
function Tile({ item, onOpen }: { item: ShowcaseImage; onOpen: () => void }) {
  const scene = SCENES[item.scene];
  const op = OPERATIONS[scene.operation];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${scene.title} — ${op.label}`}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_24px_-8px_rgb(0_0_0/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={item.src}
          alt={`${scene.title} — ${op.label} — DryForge concept render`}
          fill
          sizes={GRID_SIZES}
          loading="lazy"
          className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
        />
      </div>
      {/* gradient + caption on hover */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <span className={`pointer-events-none absolute left-2.5 top-2.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${op.badge}`}>
        {op.label}
      </span>
      <span className="pointer-events-none absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-slate-700 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        <Maximize2 className="h-4 w-4" />
      </span>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="text-[13px] font-semibold leading-tight text-white">{scene.title}</div>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * Section
 * ------------------------------------------------------------------------- */
export default function FinishingShowcase() {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const items = useMemo(() => IMAGES.filter((i) => matches(i, filter)), [filter]);

  const opsPresent = useMemo(() => {
    const set = new Set(IMAGES.map((i) => SCENES[i.scene].operation));
    return OP_ORDER.filter((o) => set.has(o));
  }, []);

  const isActive = (f: Filter) =>
    (filter.kind === f.kind) &&
    (f.kind === "all" || ("id" in f && "id" in filter && f.id === (filter as { id: string }).id));

  const countFor = useCallback((f: Filter) => IMAGES.filter((i) => matches(i, f)).length, []);

  const chip = (f: Filter, label: string) => {
    const active = isActive(f);
    return (
      <button
        key={label}
        type="button"
        onClick={() => setFilter(f)}
        aria-pressed={active}
        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] ${
          active
            ? "border-[#0F172A] bg-[#0F172A] text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
        }`}
      >
        {label}
        <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
          {countFor(f)}
        </span>
      </button>
    );
  };

  return (
    <section id="autonomous-systems" className="section bg-white border-y border-slate-200">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[2px] text-[#F97316]">
            Autonomous Drywall Finishing Systems
          </div>
          <h2 className="h2 mt-3 tracking-tight">See the finishing robot work the wall on its own.</h2>
          <p className="mt-4 text-lg leading-snug text-slate-600">
            A full library of concept renders of the DryForge platform, organised by the
            finishing operation each one shows — taping, mudding, sanding and more. Filter
            the gallery, then open any frame for the customer payoff, the technical detail,
            and every angle of that setup.
          </p>
        </div>

        {/* Filter row 1 — series */}
        <div className="df-rail mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by series">
          {chip({ kind: "all" }, "All views")}
          {SERIES.map((s) => chip({ kind: "series", id: s.id }, s.name))}
        </div>

        {/* Filter row 2 — operation */}
        <div className="df-rail mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by operation">
          {opsPresent.map((o) => chip({ kind: "op", id: o }, OPERATIONS[o].label))}
        </div>

        {/* Masonry grid — all lazy-loaded */}
        <div className="mt-6 [column-fill:_balance] columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.map((item, i) => (
            <Tile key={item.src} item={item} onOpen={() => setOpen(i)} />
          ))}
        </div>

        {/* Honesty note */}
        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          Concept renders illustrating DryForge&apos;s design targets. They are not
          photographs of deployed hardware, and the specs are engineering targets we
          will validate openly with founding pilot partners — never fabricated metrics.
        </p>
      </div>

      {/* Lightbox portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open !== null && items[open] && (
              <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={(i) => setOpen(i)} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
