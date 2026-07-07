"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Play, Pause, RotateCcw, ArrowRight, ChevronRight } from "lucide-react";
import RobotScene from "./scene/RobotScene";
import { ROBOTS, type RoomDims } from "./robots";

const ROOM: RoomDims = { L: 7, W: 5, H: 2.7 };
const SPEEDS = [1, 2, 4] as const;

export default function RobotGallery() {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState<number>(SPEEDS[1]);
  const [coverage, setCoverage] = useState(0);

  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const progressRef = useRef(0);
  const robot = ROBOTS[index];

  // Reset progress when switching robots (the interval below syncs the readout).
  useEffect(() => { progressRef.current = 0; }, [index]);

  // Throttled coverage readout from the scene's progress.
  useEffect(() => {
    const id = window.setInterval(() => setCoverage(Math.round(progressRef.current * 100)), 120);
    return () => window.clearInterval(id);
  }, []);

  const mailto = useMemo(() => {
    const subject = `DryForge — interested in the ${robot.name}`;
    const body = `I watched the ${robot.name} demo (${robot.tagline}) and want to talk about deploying it on real jobs.`;
    return `mailto:pilot@dryforge.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [robot]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Robot selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {ROBOTS.map((rb, i) => (
          <button
            key={rb.id}
            onClick={() => setIndex(i)}
            className={`flex-shrink-0 rounded-lg border px-4 py-2.5 text-left transition-colors ${i === index ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
            style={i === index ? { backgroundColor: rb.accent } : undefined}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">Robot {i + 1}</div>
            <div className="text-sm font-semibold whitespace-nowrap">{rb.name}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Stage */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220] aspect-[4/3] lg:aspect-auto lg:h-[560px]"
          role="img"
          aria-label={`3D demo of the ${robot.name}. ${robot.task}`}>
          {mounted ? (
            <Canvas shadows camera={{ position: [7, 5, 7], fov: 42 }} dpr={[1, 1.75]}>
              <color attach="background" args={["#0b1220"]} />
              <RobotScene robot={robot} room={ROOM} running={running} speed={speed} progressRef={progressRef} />
              <OrbitControls enableDamping minDistance={3.5} maxDistance={18} maxPolarAngle={Math.PI / 2.05} target={[0, 0.6, 0]} />
            </Canvas>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">Loading 3D scene…</div>
          )}

          {/* HUD */}
          <div className="pointer-events-none absolute left-3 top-3 space-y-2">
            <div className="rounded-md bg-black/50 px-3 py-2 backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Coverage</div>
              <div className="font-mono text-lg font-semibold text-white">{coverage}%</div>
            </div>
          </div>
          <div className="pointer-events-none absolute right-3 top-3 rounded-md px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: robot.accent }}>
            {robot.tagline}
          </div>

          {/* Controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRunning((r) => !r)}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: robot.accent }}
                aria-label={running ? "Pause demo" : "Play demo"}
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => { progressRef.current = 0; setCoverage(0); }}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                aria-label="Restart demo"
              >
                <RotateCcw className="h-4 w-4" /> Restart
              </button>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-black/50 p-1" role="group" aria-label="Demo speed">
              {SPEEDS.map((sp) => (
                <button key={sp} onClick={() => setSpeed(sp)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${speed === sp ? "text-white" : "text-slate-300 hover:text-white"}`}
                  style={speed === sp ? { backgroundColor: robot.accent } : undefined}>
                  {sp}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{robot.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{robot.task}</p>
            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {robot.stats.map((s) => (
                <div key={s.label} className="flex justify-between text-sm">
                  <dt className="text-slate-500">{s.label}</dt>
                  <dd className="font-mono font-semibold text-slate-900">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-[11px] italic text-slate-500">{robot.basis}</p>
          </div>

          <a href={mailto} className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: robot.accent }}>
            Deploy this on my job site <ArrowRight className="h-4 w-4" />
          </a>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full workflow</p>
            <ol className="mt-2 space-y-1">
              {ROBOTS.map((rb, i) => (
                <li key={rb.id}>
                  <button onClick={() => setIndex(i)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${i === index ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}>
                    <span className="flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: rb.accent }}>{i + 1}</span>
                      {rb.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        Each demo shows the real equipment category driving an autonomous coverage path. The self-navigation layer is DryForge&apos;s
        engineering roadmap; the underlying drying hardware is proven, in-field gear. Drag to orbit the scene.
      </p>
    </section>
  );
}
