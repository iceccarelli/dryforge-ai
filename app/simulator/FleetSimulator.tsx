"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import {
  Play, Pause, RotateCcw, Printer, Zap, AlertTriangle, Users, Clock, Gauge,
  DollarSign, Layers, CheckCircle2, Info,
} from "lucide-react";
import RobotModel from "../components/robots3d/DrywallRobots";
import { Lights, Floor } from "../components/robots3d/Env";
import {
  ROBOTS, PHASE_ORDER, computePlan, money, num, MODEL_ASSUMPTIONS,
  type JobConfig, DEFAULT_JOB, type Complexity, type FinishLevel, type Phase,
} from "../lib/fleet";

const PHASE_OFFSET: Record<Phase, number> = { material: 0, cutting: 0.12, hanging: 0.24, finishing: 0.36, qa: 0.48 };
const PHASE_SPAN = 0.52;
const STAGE_COLOR = ["#334155", "#0369a1", "#6d28d9", "#b45309", "#c2410c", "#047857"];
const STAGE_LABEL = ["Raw", "Delivered", "Cut", "Hung", "Finished", "QA-verified"];
const SPEEDS = [2, 8, 24] as const;
const WALL_W = 10;
const WALL_Z = -2.2;
const COLS = 12;
const ROWS = 2;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function frontier(progress: number, phase: Phase) { return Math.min(Math.max((progress - PHASE_OFFSET[phase]) / PHASE_SPAN, 0), 1); }

interface Snap { progress: number; elapsedH: number; etaH: number }

/* -------------------- 3D job-site scene -------------------- */
function FleetScene({ fr, playing }: { fr: Record<Phase, number>; playing: boolean }) {
  const panels = [];
  for (let k = 0; k < COLS * ROWS; k++) {
    const col = k % COLS;
    const row = Math.floor(k / COLS);
    const workPos = col / (COLS - 1);
    let stage = 0;
    for (const p of PHASE_ORDER) if (fr[p] > workPos) stage++;
    const x = lerp(-WALL_W / 2, WALL_W / 2, col / (COLS - 1));
    const y = 0.62 + row * 1.16;
    panels.push(
      <mesh key={k} position={[x, y, WALL_Z]} castShadow receiveShadow>
        <boxGeometry args={[WALL_W / COLS - 0.05, 1.1, 0.06]} />
        <meshStandardMaterial color={STAGE_COLOR[stage]} roughness={stage >= 4 ? 0.4 : 0.9} metalness={0.05} />
      </mesh>
    );
  }
  return (
    <group>
      <Lights accent="#F97316" />
      <Floor size={18} />
      {/* framing / plate */}
      <mesh position={[0, 0.05, WALL_Z + 0.1]}><boxGeometry args={[WALL_W + 0.4, 0.1, 0.12]} /><meshStandardMaterial color="#475569" /></mesh>
      {panels}
      {/* five robots along the wall at their phase frontier */}
      {ROBOTS.map((r) => {
        const f = fr[r.phase];
        const x = lerp(-WALL_W / 2 + 0.7, WALL_W / 2 - 0.7, f);
        const dim = f <= 0.001 || f >= 0.999;
        return (
          <group key={r.id} position={[x, 0, WALL_Z + 1.15]} rotation={[0, Math.PI, 0]} scale={0.6}>
            <group visible>
              <RobotModel id={r.id} running={playing && !dim} accent={r.accent} />
            </group>
          </group>
        );
      })}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={18} blur={2.5} far={6} />
      <OrbitControls enableDamping minDistance={4} maxDistance={20} maxPolarAngle={Math.PI / 2.05} target={[0, 1.2, WALL_Z]} />
    </group>
  );
}

export default function FleetSimulator() {
  const [cfg, setCfg] = useState<JobConfig>({ ...DEFAULT_JOB });
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(SPEEDS[1]);
  const [log, setLog] = useState<string[]>([]);
  const [replanning, setReplanning] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const plan = useMemo(() => computePlan(cfg), [cfg]);

  const elapsedRef = useRef(0);
  const etaRef = useRef(plan.robotDays * 8);
  const [snap, setSnap] = useState<Snap>(() => ({ progress: 0, elapsedH: 0, etaH: computePlan(DEFAULT_JOB).robotDays * 8 }));

  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const resetSim = useCallback((nextCfg: JobConfig) => {
    const p = computePlan(nextCfg);
    elapsedRef.current = 0;
    etaRef.current = p.robotDays * 8;
    setSnap({ progress: 0, elapsedH: 0, etaH: p.robotDays * 8 });
    setPlaying(false);
    setLog([]);
    setReplanning(false);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudLast = 0;
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      if (playingRef.current) {
        elapsedRef.current += dt * speedRef.current;
        if (elapsedRef.current >= etaRef.current) { elapsedRef.current = etaRef.current; setPlaying(false); }
      }
      if (t - hudLast > 50) {
        hudLast = t;
        setSnap({ progress: Math.min(elapsedRef.current / etaRef.current, 1), elapsedH: elapsedRef.current, etaH: etaRef.current });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const inject = (kind: "tight" | "delay" | "crew") => {
    if (kind === "tight") { etaRef.current *= 1.18; setLog((l) => ["Tight-space constraint — finishing paths re-planned (+18% ETA)", ...l]); }
    if (kind === "delay") { etaRef.current += 6; setLog((l) => ["Material delivery delay injected — planner absorbed +6 h", ...l]); }
    if (kind === "crew") { etaRef.current *= 0.88; setLog((l) => ["Added supervised unit — ETA pulled in 12%", ...l]); }
    setReplanning(true);
    window.setTimeout(() => setReplanning(false), 900);
  };

  const set = (patch: Partial<JobConfig>) => { const next = { ...cfg, ...patch }; setCfg(next); resetSim(next); };

  const progress = snap.progress;
  const fr = useMemo(() => Object.fromEntries(PHASE_ORDER.map((p) => [p, frontier(progress, p)])) as Record<Phase, number>, [progress]);
  const done = progress >= 1;

  const sqftDone = fr.qa * cfg.sqft;
  const qualityTarget = cfg.finish === "L5" ? 99.2 : 98.5;
  const quality = fr.qa > 0 ? qualityTarget * (0.94 + 0.06 * fr.qa) : 0;
  const laborSaved = plan.laborHoursSaved * progress;
  const raasSoFar = plan.raasCost * progress;
  const manualSoFar = plan.manualCost * progress;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4 print:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Project</h3>
            <div className="mt-4 space-y-4">
              <Slider label="Square footage" value={cfg.sqft} min={2000} max={120000} step={1000} display={num(cfg.sqft)} onChange={(v) => set({ sqft: v })} />
              <Slider label="Ceiling share" value={cfg.ceilingPct} min={0} max={60} step={5} display={`${cfg.ceilingPct}%`} onChange={(v) => set({ ceilingPct: v })} />
              <Choice label="Complexity" value={cfg.complexity} options={[["simple", "Simple"], ["standard", "Standard"], ["complex", "Complex"]]} onChange={(v) => set({ complexity: v as Complexity })} />
              <Choice label="Finish level" value={cfg.finish} options={[["L4", "Level 4"], ["L5", "Level 5"]]} onChange={(v) => set({ finish: v as FinishLevel })} />
              <Slider label="Supervision (robots/op)" value={cfg.supervisionRatio} min={1} max={6} step={1} display={`${cfg.supervisionRatio}:1`} onChange={(v) => set({ supervisionRatio: v })} />
              <Slider label="Loaded labour rate" value={cfg.laborRate} min={30} max={95} step={1} display={money(cfg.laborRate)} onChange={(v) => set({ laborRate: v })} />
              <Slider label="RaaS rate ($/sqft)" value={cfg.raasRate} min={0.6} max={2.5} step={0.05} display={money(cfg.raasRate)} onChange={(v) => set({ raasRate: v })} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-900">Inject real-world variables</h3>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <button onClick={() => inject("tight")} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><AlertTriangle className="h-4 w-4 text-amber-500" /> Tight-space constraint</button>
              <button onClick={() => inject("delay")} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Clock className="h-4 w-4 text-sky-500" /> Material delivery delay</button>
              <button onClick={() => inject("crew")} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Users className="h-4 w-4 text-emerald-500" /> Add supervised unit</button>
            </div>
            {log.length > 0 && (
              <ul className="mt-3 max-h-28 space-y-1 overflow-auto text-[11px] text-slate-500">
                {log.map((l, i) => <li key={i} className="border-l-2 border-slate-200 pl-2">{l}</li>)}
              </ul>
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220]">
            <div className="flex items-center justify-between px-4 pt-3 print:hidden">
              <div className="flex items-center gap-2 text-white">
                <Layers className="h-4 w-4 text-[#F97316]" />
                <span className="text-sm font-semibold">Job-site digital twin</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">3D • simulated</span>
              </div>
              {replanning && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 rounded-md bg-amber-500/90 px-2.5 py-1 text-[11px] font-semibold text-amber-950"><Zap className="h-3.5 w-3.5" /> Replanning…</motion.span>
              )}
            </div>

            <div className="h-[420px] w-full">
              {mounted ? (
                <Canvas shadows camera={{ position: [0, 4.2, 8.5], fov: 42 }} dpr={[1, 1.75]}>
                  <color attach="background" args={["#0b1220"]} />
                  <FleetScene fr={fr} playing={playing} />
                </Canvas>
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-500">Loading 3D job-site…</div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 px-4 pb-2 print:hidden">
              {STAGE_LABEL.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-300"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: STAGE_COLOR[i] }} /> {label}</div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <button onClick={() => setPlaying((p) => !p)} disabled={done} className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#EA580C] disabled:opacity-40">
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? "Pause" : snap.elapsedH > 0 ? "Resume" : "Run job"}
                </button>
                <button onClick={() => resetSim(cfg)} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Reset</button>
              </div>
              <div className="flex items-center gap-1 rounded-md bg-black/40 p-1">
                {SPEEDS.map((sp) => (<button key={sp} onClick={() => setSpeed(sp)} className={`rounded px-2.5 py-1 text-xs font-semibold ${speed === sp ? "bg-[#F97316] text-white" : "text-slate-300 hover:text-white"}`}>{sp}×</button>))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Metric icon={<Layers className="h-4 w-4" />} label="Sqft verified" value={num(sqftDone)} sub={`of ${num(cfg.sqft)}`} />
            <Metric icon={<Gauge className="h-4 w-4" />} label="Quality (modelled)" value={quality > 0 ? `${num(quality, 1)}%` : "—"} tone="good" />
            <Metric icon={<Clock className="h-4 w-4" />} label="Elapsed / ETA" value={`${num(snap.elapsedH / 8, 1)}d`} sub={`ETA ${num(snap.etaH / 8, 1)}d`} />
            <Metric icon={<Users className="h-4 w-4" />} label="Labour hrs saved" value={num(laborSaved)} tone="good" />
            <Metric icon={<DollarSign className="h-4 w-4" />} label="RaaS vs manual" value={money(raasSoFar)} sub={`vs ${money(manualSoFar)} manual`} />
            <Metric icon={<Zap className="h-4 w-4" />} label="Progress" value={`${num(progress * 100)}%`} />
          </div>

          {done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><h3 className="text-lg font-bold text-slate-900">Projected job summary</h3></div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E293B] print:hidden"><Printer className="h-4 w-4" /> Print / save summary</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Report label="Schedule" value={`${num(plan.robotDays, 1)} days`} sub={`vs ${num(plan.manualDays, 1)} manual`} />
                <Report label="Labour hours saved" value={num(plan.laborHoursSaved)} />
                <Report label="Modelled savings" value={money(plan.costSaved)} />
                <Report label="Finish target" value={cfg.finish === "L5" ? "Level 5" : "Level 4"} sub={`~${num(qualityTarget, 1)}% modelled`} />
              </div>
              <div className="mt-5 rounded-xl bg-white p-4 text-sm">
                <p className="font-semibold text-slate-900">Recommended RaaS package</p>
                <p className="mt-1 text-slate-600">Finishing-first deployment at {money(cfg.raasRate)}/sqft ({money(plan.raasCost)} for this job), {plan.operatorsNeeded} operator{plan.operatorsNeeded > 1 ? "s" : ""} at {cfg.supervisionRatio}:1 supervision, with AMR and QA modules staged as they reach pilot readiness.</p>
                <p className="mt-2 text-slate-600"><span className="font-semibold text-slate-900">SaaS integration:</span> live quality dashboard, per-sqft ROI export, and Procore/Autodesk sync (planned).</p>
                <p className="mt-3 text-[11px] italic text-slate-400">Modelled planning figures with disclosed assumptions — not measured results or a quote. DryForge is pre-launch and recruiting GTA pilots.</p>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row print:hidden">
                <a href="mailto:pilot@dryforge.ai?subject=Founding%20pilot%20%E2%80%94%20fleet%20simulator" className="flex-1 rounded-lg bg-[#F97316] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#EA580C]">Apply for a GTA pilot</a>
                <a href="mailto:pilot@dryforge.ai?subject=DryForge%20AI%20platform%20access" className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50">Request SaaS platform access</a>
              </div>
            </motion.div>
          )}

          <details className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 print:hidden">
            <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-800"><Info className="h-4 w-4 text-[#F97316]" /> Model assumptions</summary>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">{MODEL_ASSUMPTIONS.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </details>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, label, value, sub, tone = "default" }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone?: "default" | "good" }) {
  const color = tone === "good" ? "text-emerald-600" : "text-slate-900";
  return (<div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-400">{icon}{label}</div><div className={`mt-1 font-mono text-lg font-bold ${color}`}>{value}</div>{sub && <div className="text-[11px] text-slate-400">{sub}</div>}</div>);
}
function Report({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (<div><div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-lg font-bold text-slate-900">{value}</div>{sub && <div className="text-[11px] text-slate-500">{sub}</div>}</div>);
}
function Slider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void }) {
  return (<div><div className="mb-1 flex items-center justify-between"><label className="text-xs font-medium text-slate-500">{label}</label><span className="font-mono text-xs font-semibold text-slate-900">{display}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[#F97316]" aria-label={label} /></div>);
}
function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (<div><label className="mb-1 block text-xs font-medium text-slate-500">{label}</label><div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>{options.map(([val, lbl]) => (<button key={val} onClick={() => onChange(val)} className={`rounded-md border py-1.5 text-xs font-semibold transition-colors ${value === val ? "border-[#F97316] bg-orange-50 text-[#EA580C]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{lbl}</button>))}</div></div>);
}
