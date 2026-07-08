"use client";

/**
 * LaunchProSimulator — upsell entry point to the high-fidelity Godot 4 sim.
 *
 * Config via env (set in Vercel):
 *   NEXT_PUBLIC_PRO_SIM_URL          -> hosted Godot HTML5 export (index.html)
 *   NEXT_PUBLIC_PRO_SIM_DESKTOP_URL  -> desktop build download (zip / installer)
 *
 * If NEXT_PUBLIC_PRO_SIM_URL is unset, the button renders a truthful
 * "in development" state instead of a broken iframe — no fake capability.
 */

import { useState } from "react";
import { X, Cpu, Download, Sparkles } from "lucide-react";

const WEB_URL = process.env.NEXT_PUBLIC_PRO_SIM_URL ?? "";
const DESKTOP_URL = process.env.NEXT_PUBLIC_PRO_SIM_DESKTOP_URL ?? "";

export default function LaunchProSimulator({
  robot = "finisher",
  compact = false,
}: { robot?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ready = WEB_URL.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            : "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400"
        }
      >
        <Cpu className="h-4 w-4" />
        Launch High-Fidelity Pro Simulator
        <Sparkles className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="relative flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2 text-slate-100">
                <Cpu className="h-4 w-4 text-amber-400" />
                <span className="font-semibold">Pro Simulator</span>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
                  concept build
                </span>
              </div>
              <div className="flex items-center gap-2">
                {DESKTOP_URL && (
                  <a href={DESKTOP_URL} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:border-amber-500">
                    <Download className="h-3.5 w-3.5" /> Desktop build
                  </a>
                )}
                <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-black">
              {ready ? (
                <iframe
                  title="DryForge Pro Simulator"
                  src={`${WEB_URL}${WEB_URL.includes("?") ? "&" : "?"}robot=${encodeURIComponent(robot)}`}
                  className="h-full w-full"
                  allow="cross-origin-isolated; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <Cpu className="h-10 w-10 text-amber-400" />
                  <h3 className="text-lg font-semibold text-slate-100">Pro Simulator is in active development</h3>
                  <p className="max-w-md text-sm text-slate-400">
                    The engineering-grade Godot build (full mechanical internals, physics-based
                    task paths, exportable inspection sessions) isn&apos;t wired up yet. The web
                    inspection view on this page is the live preview.
                  </p>
                  <a href="/pricing" className="mt-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400">
                    Get notified / request pilot access
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
