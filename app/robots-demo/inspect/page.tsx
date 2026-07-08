"use client";

import { useRef, useState, type ComponentRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import RobotInternals from "../scene/RobotInternals";
import LaunchProSimulator from "../../components/LaunchProSimulator";

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

type Preset = { name: string; pos: [number, number, number]; target: [number, number, number] };
const PRESETS: Preset[] = [
  { name: "3/4 view", pos: [2.8, 1.9, 3.0], target: [0, 0.9, 0.2] },
  { name: "Side", pos: [4.0, 1.1, 0.0], target: [0, 1.0, 0.2] },
  { name: "Top", pos: [0.01, 4.2, 0.6], target: [0, 0.9, 0.2] },
  { name: "Tool head", pos: [0.9, 1.2, 1.9], target: [0, 1.15, 0.5] },
];

export default function InspectPage() {
  const controls = useRef<OrbitControlsRef | null>(null);
  const [explode, setExplode] = useState(0);
  const [cutaway, setCutaway] = useState(false);
  const [clipZ, setClipZ] = useState(0.1);
  const [labels, setLabels] = useState(true);
  const [running, setRunning] = useState(true);

  function applyPreset(p: Preset) {
    const c = controls.current;
    if (!c) return;
    c.object.position.set(...p.pos);
    c.target.set(...p.target);
    c.update();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Finisher — Mechanical Inspection</h1>
            <p className="text-sm text-slate-400">
              Explore the internals: explode, cut away, and spin the drivetrain.
            </p>
          </div>
          <span
            title="Illustrative design-intent model. Not a measured digital twin of built hardware."
            className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
          >
            Concept model · illustrative specs
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Viewport */}
          <div className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220]">
            <Canvas shadows camera={{ position: [2.8, 1.9, 3.0], fov: 42 }} dpr={[1, 1.9]}>
              <ambientLight intensity={0.25} />
              <directionalLight position={[4, 6, 3]} intensity={1.6} castShadow shadow-mapSize={[2048, 2048]} />
              <RobotInternals
                explode={explode}
                cutaway={cutaway}
                clipZ={clipZ}
                labels={labels}
                running={running}
              />
              <Grid args={[16, 16]} position={[0, 0, 0]} cellColor="#1e293b" sectionColor="#334155" fadeDistance={22} infiniteGrid />
              <ContactShadows position={[0, 0.005, 0]} opacity={0.55} scale={10} blur={2.4} far={4} />
              <OrbitControls ref={controls} enableDamping minDistance={1.4} maxDistance={9} target={[0, 0.9, 0.2]} />
            </Canvas>

            <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="pointer-events-auto rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div>
              <label className="flex items-center justify-between text-sm font-medium">
                Exploded view <span className="text-slate-400">{Math.round(explode * 100)}%</span>
              </label>
              <input type="range" min={0} max={1} step={0.01} value={explode}
                onChange={(e) => setExplode(parseFloat(e.target.value))} className="mt-2 w-full accent-amber-500" />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-medium">
                <span>Cutaway</span>
                <input type="checkbox" checked={cutaway} onChange={(e) => setCutaway(e.target.checked)} className="accent-amber-500" />
              </label>
              <input type="range" min={-0.4} max={0.6} step={0.01} value={clipZ} disabled={!cutaway}
                onChange={(e) => setClipZ(parseFloat(e.target.value))}
                className="mt-2 w-full accent-amber-500 disabled:opacity-40" />
              <p className="mt-1 text-xs text-slate-500">Slide the section plane through the tool head.</p>
            </div>

            <label className="flex items-center justify-between text-sm font-medium">
              <span>Component labels</span>
              <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} className="accent-amber-500" />
            </label>

            <label className="flex items-center justify-between text-sm font-medium">
              <span>Run drivetrain</span>
              <input type="checkbox" checked={running} onChange={(e) => setRunning(e.target.checked)} className="accent-amber-500" />
            </label>

            <div className="mt-2 border-t border-slate-800 pt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Want engineering-grade fidelity?</p>
              <LaunchProSimulator robot="finisher" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
