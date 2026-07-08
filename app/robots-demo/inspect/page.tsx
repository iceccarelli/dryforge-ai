"use client";

import { useEffect, useRef, useState, type ComponentRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import RobotModel from "../../components/robots3d/DrywallRobots";
import { Lights, Floor } from "../../components/robots3d/Env";
import { FinishWall, HangWall, CutOpening, DeliveryZone, QAWall } from "../scene/Workpieces";
import LaunchProSimulator from "../../components/LaunchProSimulator";
import { ROBOTS, type RobotId } from "../../lib/fleet";

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;
const VALID = new Set<RobotId>(["finisher", "hanger", "cutter", "amr", "qa"]);
const SPEEDS = [0.5, 1, 2] as const;
const LOOP_SECONDS = 10; // one full task pass at 1×

type Preset = { name: string; pos: [number, number, number]; target: [number, number, number] };
const PRESETS: Preset[] = [
  { name: "3/4 view", pos: [3.6, 2.7, 4.2], target: [0, 1.1, 0.6] },
  { name: "Side", pos: [5.2, 1.4, 0.2], target: [0, 1.1, 0.4] },
  { name: "Top", pos: [0.02, 5.6, 1.0], target: [0, 0.9, 0.4] },
  { name: "Close", pos: [1.6, 1.6, 2.4], target: [0.3, 1.2, 0.6] },
];

/** Working parts each canonical model actually animates — described, not faked. */
const PARTS: Record<RobotId, string[]> = {
  amr: ["Mecanum drive wheels — omnidirectional travel to the drop zone", "Smart-lift deck — raises and releases the sheet stack", "Nav lidar — 360° obstacle scan", "E-stop — safety cut-off"],
  cutter: ["Gantry carriage — positions the head across the panel", "Routing spindle — high-rpm cut along the BIM path", "Vacuum bed — holds the sheet flat", "Dust shroud — capture at the cut"],
  hanger: ["Shoulder + elbow servos — reach and place the sheet", "Vacuum plate — picks and holds the drywall", "Fastening head — drives screws on the stud line", "Tracked base — repositions between courses"],
  finisher: ["Lift mast — steps the head up row by row", "Reach arm — presses the tool to the wall", "Coating / sanding head — tapes, muds, sands", "Dust capture — ~99% at the head"],
  qa: ["Sensor mast — raises the scanner over the wall", "Vision cluster — camera, LED ring, lidar", "Pan head — sweeps across the surface", "Mobile base — travels the scan course"],
};

function Workpiece({ id, task, progress }: { id: RobotId; task: string; progress: number }) {
  if (id === "finisher") return <FinishWall progress={progress} task={task} />;
  if (id === "hanger") return <HangWall progress={progress} task={task} />;
  if (id === "cutter") return <CutOpening progress={progress} />;
  if (id === "amr") return <DeliveryZone progress={progress} />;
  return <QAWall progress={progress} />;
}

/** Advances the shared progress ref inside the render loop when running. */
function Runner({ progressRef, running, speed }: { progressRef: MutableRefObject<number>; running: boolean; speed: number }) {
  useFrame((_, dt) => {
    if (running) progressRef.current = (progressRef.current + (dt * speed) / LOOP_SECONDS) % 1;
  });
  return null;
}

export default function InspectPage() {
  const controls = useRef<OrbitControlsRef | null>(null);
  const progressRef = useRef(0);
  const [robot, setRobot] = useState<RobotId>("finisher");
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [progress, setProgress] = useState(0); // throttled mirror for workpiece

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("robot");
    if (q && VALID.has(q as RobotId)) setRobot(q as RobotId);
  }, []);

  // mirror ref → state ~15fps so the workpiece animates without per-frame re-render
  useEffect(() => {
    const t = setInterval(() => setProgress(progressRef.current), 66);
    return () => clearInterval(t);
  }, []);

  const active = ROBOTS.find((r) => r.id === robot) ?? ROBOTS.find((r) => r.id === "finisher")!;

  function selectRobot(id: RobotId) {
    setRobot(id);
    progressRef.current = 0;
    const url = new URL(window.location.href);
    url.searchParams.set("robot", id);
    window.history.replaceState(null, "", url.toString());
  }

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
            <h1 className="text-xl font-semibold">{active.shortName} — Mechanical Inspection</h1>
            <p className="text-sm text-slate-400">{active.name} · the same machine as the demo, studied up close while it runs its task.</p>
          </div>
          <span
            title="Illustrative design-intent model. Not a measured digital twin of built hardware."
            className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300"
          >
            Concept model · illustrative specs
          </span>
        </div>

        {/* Robot switcher */}
        <div className="mb-4 flex flex-wrap gap-2">
          {ROBOTS.map((r) => (
            <button
              key={r.id}
              onClick={() => selectRobot(r.id)}
              className="rounded-lg border px-3 py-2 text-sm font-semibold transition-colors"
              style={robot === r.id
                ? { backgroundColor: r.accent, borderColor: "transparent", color: "#0b1220" }
                : { borderColor: "#334155", color: "#cbd5e1" }}
            >
              {r.shortName}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="relative h-[62vh] min-h-[440px] overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220]">
            <Canvas shadows camera={{ position: [3.6, 2.7, 4.2], fov: 42 }} dpr={[1, 1.85]}>
              <color attach="background" args={["#0b1220"]} />
              <Lights accent={active.accent} />
              <Floor size={14} />
              <Workpiece id={robot} task="" progress={progress} />
              <RobotModel id={robot} running={running} accent={active.accent} progressRef={progressRef} task="" />
              <Runner progressRef={progressRef} running={running} speed={speed} />
              <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.4} far={5} />
              <OrbitControls ref={controls} enableDamping minDistance={2.2} maxDistance={11} maxPolarAngle={Math.PI / 2.05} target={[0, 1.1, 0.6]} />
            </Canvas>

            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="pointer-events-auto rounded-md border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-200 hover:border-amber-500">
                  {p.name}
                </button>
              ))}
            </div>

            {/* speed */}
            <div className="absolute bottom-3 right-3 flex overflow-hidden rounded-md border border-slate-700">
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 text-xs ${speed === s ? "bg-amber-500 text-slate-950" : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"}`}>
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <label className="flex items-center justify-between text-sm font-medium">
              <span>Run task</span>
              <input type="checkbox" checked={running} onChange={(e) => setRunning(e.target.checked)} className="accent-amber-500" />
            </label>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Working parts</p>
              <ul className="space-y-2">
                {PARTS[robot].map((line, i) => {
                  const [head, ...rest] = line.split(" — ");
                  return (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-slate-100">{head}</span>
                      {rest.length > 0 && <span className="text-slate-400"> — {rest.join(" — ")}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-2 border-t border-slate-800 pt-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Want engineering-grade fidelity?</p>
              <LaunchProSimulator robot={robot} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
