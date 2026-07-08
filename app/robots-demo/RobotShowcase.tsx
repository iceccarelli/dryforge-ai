"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Cpu, ShieldCheck, Activity, Wrench, Boxes, Info, Play, Pause, RotateCcw,
  CheckCircle2, Sparkles, SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import RobotModel from "../components/robots3d/DrywallRobots";
import { Lights, Floor } from "../components/robots3d/Env";
import LaunchProSimulator from "../components/LaunchProSimulator";
import { FinishWall, HangWall, CutOpening, DeliveryZone, QAWall } from "./scene/Workpieces";
import {
  JOBS, defaultKnobs, jobDuration, phaseAt, outcome,
  type JobDef, type KnobValues,
} from "./jobs";
import {
  ROBOTS, MARKET_FACTS, computePlan, money, num,
  type RobotId, type JobConfig, DEFAULT_JOB,
} from "../lib/fleet";

const READINESS_STYLE: Record<string, string> = {
  beachhead: "bg-orange-100 text-orange-800 border-orange-200",
  near: "bg-sky-100 text-sky-800 border-sky-200",
  roadmap: "bg-slate-100 text-slate-600 border-slate-200",
};
const SPEEDS = [1, 2, 4] as const;

function Workpiece({ id, jobId, progress }: { id: RobotId; jobId: string; progress: number }) {
  if (id === "finisher") return <FinishWall progress={progress} task={jobId} />;
  if (id === "hanger") return <HangWall progress={progress} task={jobId} />;
  if (id === "cutter") return <CutOpening progress={progress} />;
  if (id === "amr") return <DeliveryZone progress={progress} />;
  return <QAWall progress={progress} />;
}

function Stage({ id, accent, running, progressRef, task, progress }: {
  id: RobotId; accent: string; running: boolean; progressRef: React.MutableRefObject<number>; task: string; progress: number;
}) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return <div className="grid h-full place-items-center text-sm text-slate-500">Loading 3D…</div>;
  return (
    <Canvas shadows camera={{ position: [3.6, 2.7, 4.2], fov: 42 }} dpr={[1, 1.75]}>
      <color attach="background" args={["#0b1220"]} />
      <Lights accent={accent} />
      <Floor size={14} />
      <Workpiece id={id} jobId={task} progress={progress} />
      <RobotModel id={id} running={running} accent={accent} progressRef={progressRef} task={task} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={12} blur={2.4} far={5} />
      <OrbitControls enableDamping minDistance={2.6} maxDistance={10} maxPolarAngle={Math.PI / 2.05} target={[0, 1.1, 0.6]} />
    </Canvas>
  );
}

export default function RobotWorkstation() {
  const [activeId, setActiveId] = useState<RobotId>("finisher");
  const active = ROBOTS.find((r) => r.id === activeId)!;
  const jobs = JOBS[activeId];

  const [jobId, setJobId] = useState<string>(jobs[0].id);
  const job: JobDef = jobs.find((j) => j.id === jobId) ?? jobs[0];
  const [knobs, setKnobs] = useState<KnobValues>(() => defaultKnobs(jobs[0]));

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [speed, setSpeed] = useState<number>(SPEEDS[0]);

  const progressRef = useRef(0);
  const [hud, setHud] = useState<{ p: number }>({ p: 0 });

  const durSec = useMemo(() => jobDuration(job, knobs), [job, knobs]);
  const runningRef = useRef(running);
  const speedRef = useRef(speed);
  const durRef = useRef(durSec);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { durRef.current = durSec; }, [durSec]);

  const resetRun = useCallback(() => { progressRef.current = 0; setHud({ p: 0 }); setRunning(false); setDone(false); }, []);

  useEffect(() => {
    let raf = 0; let last = performance.now(); let hudLast = 0;
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05); last = t;
      if (runningRef.current) {
        progressRef.current += (dt * speedRef.current) / durRef.current;
        if (progressRef.current >= 1) { progressRef.current = 1; setRunning(false); setDone(true); }
      }
      if (t - hudLast > 45) { hudLast = t; setHud({ p: progressRef.current }); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const selectRobot = (id: RobotId) => { setActiveId(id); const j = JOBS[id][0]; setJobId(j.id); setKnobs(defaultKnobs(j)); resetRun(); };
  const selectJob = (jid: string) => { const j = jobs.find((x) => x.id === jid)!; setJobId(jid); setKnobs(defaultKnobs(j)); resetRun(); };
  const setKnob = (kid: string, v: number | string | boolean) => { setKnobs((k) => ({ ...k, [kid]: v })); resetRun(); };
  const runJob = () => { if (done) { progressRef.current = 0; setDone(false); } setRunning(true); };

  const phase = phaseAt(job, hud.p);
  const result = outcome(activeId, job, knobs, hud.p);

  // fleet console (kept)
  const [cfg] = useState<JobConfig>({ ...DEFAULT_JOB });
  const plan = useMemo(() => computePlan(cfg), [cfg]);

  const mailtoPilot = `mailto:pilot@dryforge.ai?subject=${encodeURIComponent(`Founding pilot — ${active.name}`)}&body=${encodeURIComponent(`I ran the ${job.label} demo on the ${active.name}. Let's talk about a GTA job.`)}`;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {MARKET_FACTS.map((f) => (
          <div key={f.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-lg font-bold tracking-tight text-slate-900">{f.stat}</div>
            <div className="mt-1 text-xs leading-snug text-slate-600">{f.label}</div>
            <div className="mt-2 text-[10px] italic text-slate-400">Source: {f.source}</div>
          </div>
        ))}
      </div>

      {/* selector */}
      <div className="mt-10 flex gap-2 overflow-x-auto pb-1">
        {ROBOTS.map((r) => (
          <button key={r.id} onClick={() => selectRobot(r.id)}
            className={`flex-shrink-0 rounded-lg border px-4 py-2.5 text-left transition-colors ${activeId === r.id ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
            style={activeId === r.id ? { backgroundColor: r.accent } : undefined}>
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{r.order}. {r.phase}</div>
            <div className="whitespace-nowrap text-sm font-semibold">{r.shortName}</div>
          </button>
        ))}
      </div>

      {/* ---- inspection + Pro Simulator CTA ---- */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="text-sm text-slate-600">
          Want to see inside the machine? Inspect every gear, motor and switch —
          <span className="ml-1 text-slate-400">concept model</span>.
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/robots-demo/inspect?robot=${activeId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400">
            <Boxes className="h-4 w-4" /> Open mechanical inspection
          </Link>
          <LaunchProSimulator robot={activeId} compact />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* ---- 3D workstation ---- */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220] aspect-[4/3] lg:aspect-auto lg:h-[560px]"
          role="img" aria-label={`3D workstation: ${active.name} running ${job.label}`}>
          <Stage id={activeId} accent={active.accent} running={running} progressRef={progressRef} task={jobId} progress={hud.p} />

          {/* task HUD */}
          <div className="pointer-events-none absolute left-3 top-3 max-w-[62%] rounded-lg bg-black/55 px-3 py-2 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">{done ? "Complete" : running ? "Running" : "Ready"} · {job.label}</div>
            <div className="mt-0.5 text-sm font-semibold text-white">{phase.label}</div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${hud.p * 100}%`, backgroundColor: active.accent }} />
            </div>
          </div>

          {/* live metrics */}
          <div className="pointer-events-none absolute right-3 top-3 grid grid-cols-2 gap-1.5">
            {result.metrics.map((m) => (
              <div key={m.label} className="rounded-md bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
                <div className="text-[9px] uppercase tracking-wide text-slate-400">{m.label}</div>
                <div className={`font-mono text-xs font-bold ${m.tone === "good" ? "text-emerald-400" : m.tone === "warn" ? "text-amber-400" : "text-white"}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* transport controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={running ? () => setRunning(false) : runJob}
                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: active.accent }}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? "Pause" : done ? "Run again" : "Run job"}
              </button>
              <button onClick={resetRun} className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-black/50 p-1">
              {SPEEDS.map((sp) => (<button key={sp} onClick={() => setSpeed(sp)} className={`rounded px-2.5 py-1 text-xs font-semibold ${speed === sp ? "text-white" : "text-slate-300 hover:text-white"}`} style={speed === sp ? { backgroundColor: active.accent } : undefined}>{sp}×</button>))}
            </div>
          </div>
        </div>

        {/* ---- control panel ---- */}
        <div className="space-y-4">
          {/* job buttons */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#F97316]" /><h3 className="text-sm font-semibold text-slate-900">Pick a job to run</h3></div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {jobs.map((j) => (
                <button key={j.id} onClick={() => selectJob(j.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors ${jobId === j.id ? "border-transparent text-white" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
                  style={jobId === j.id ? { backgroundColor: active.accent } : undefined}>
                  {j.label}
                  {jobId === j.id && <CheckCircle2 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* knobs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-[#F97316]" /><h3 className="text-sm font-semibold text-slate-900">Tune the machine</h3></div>
            <div className="mt-4 space-y-4">
              {job.knobs.map((k) => {
                if (k.kind === "slider") {
                  const v = Number(knobs[k.id]);
                  return (
                    <div key={k.id}>
                      <div className="mb-1 flex items-center justify-between"><label className="text-xs font-medium text-slate-500">{k.label}</label><span className="font-mono text-xs font-semibold text-slate-900">{v}{k.unit}</span></div>
                      <input type="range" min={k.min} max={k.max} step={k.step} value={v} onChange={(e) => setKnob(k.id, parseFloat(e.target.value))} className="w-full accent-[#F97316]" aria-label={k.label} />
                    </div>
                  );
                }
                if (k.kind === "segment") {
                  return (
                    <div key={k.id}>
                      <label className="mb-1 block text-xs font-medium text-slate-500">{k.label}</label>
                      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${k.options!.length}, minmax(0,1fr))` }}>
                        {k.options!.map((opt) => (
                          <button key={opt} onClick={() => setKnob(k.id, opt)} className={`rounded-md border py-1.5 text-xs font-semibold transition-colors ${String(knobs[k.id]) === opt ? "border-[#F97316] bg-orange-50 text-[#EA580C]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <label key={k.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2.5 text-sm">
                    <span className="font-medium text-slate-700">{k.label}</span>
                    <input type="checkbox" checked={knobs[k.id] !== false} onChange={(e) => setKnob(k.id, e.target.checked)} className="h-4 w-4 accent-[#F97316]" />
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] italic text-slate-400">Nominal run time {num(durSec, 0)}s at 1× · outcomes are modelled projections.</p>
          </div>

          {/* result / value */}
          <AnimatePresence>
            {done && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><h3 className="text-sm font-bold text-slate-900">Job complete — {result.quality.toFixed(1)}% quality</h3></div>
                <p className="mt-2 text-sm text-slate-700">{result.valueLine}</p>
                <a href={mailtoPilot} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: active.accent }}>Run this on my job site <ArrowRight className="h-4 w-4" /></a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* robot detail */}
      <AnimatePresence mode="wait">
        <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ backgroundColor: active.accent }}><Boxes className="h-4 w-4" /></span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{active.name}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${READINESS_STYLE[active.readiness]}`}>{active.readinessLabel}</span>
            </div>
            <div className="mt-4 space-y-3">
              <Block icon={<Activity className="h-4 w-4" />} title="The pain it removes" body={active.painPoint} />
              <Block icon={<Wrench className="h-4 w-4" />} title="How it works" body={active.howItWorks} />
              <Block icon={<Cpu className="h-4 w-4" />} title="DryForge software layer" body={active.dryforgeLayer} accent={active.accent} />
            </div>
            {active.benchmarkNote && <p className="mt-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />{active.benchmarkNote}</p>}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <dl className="space-y-2">
              {active.specs.map((s) => (<div key={s.label} className="flex justify-between border-b border-slate-100 pb-2 text-sm last:border-0"><dt className="text-slate-500">{s.label}</dt><dd className="font-mono font-semibold text-slate-900">{s.value}</dd></div>))}
            </dl>
            <div className="mt-3 rounded-lg p-3 text-white" style={{ backgroundColor: active.accent }}>
              <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">Modelled labour reduction (design target)</div>
              <div className="text-2xl font-bold">{active.laborReductionPct}%</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* fleet console */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#F97316]" /><h3 className="text-lg font-bold text-slate-900">Fleet economics</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Planning model</span></div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Mini label="Labour hrs saved" value={num(plan.laborHoursSaved)} />
          <Mini label="Schedule" value={`${num(plan.robotDays, 1)}d vs ${num(plan.manualDays, 1)}d`} />
          <Mini label="Modelled savings" value={money(plan.costSaved)} />
          <Mini label="RaaS cost" value={money(plan.raasCost)} />
        </div>
        <a href="/simulator" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#EA580C] hover:underline">See all five run a full job in the simulator <ArrowRight className="h-4 w-4" /></a>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-[#0F172A] p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
        <div><h3 className="text-xl font-bold">Put a robot on your next job</h3><p className="mt-1 text-sm text-slate-300">Founding GTA pilots now. Zero capex — priced per finished square foot.</p></div>
        <a href="mailto:pilot@dryforge.ai?subject=Founding%20pilot%20interest" className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-3 text-sm font-semibold hover:bg-[#EA580C]">Apply for a pilot <ArrowRight className="h-4 w-4" /></a>
      </div>
    </section>
  );
}

function Block({ icon, title, body, accent }: { icon: React.ReactNode; title: string; body: string; accent?: string }) {
  return (<div><div className="flex items-center gap-2 text-sm font-semibold" style={accent ? { color: accent } : { color: "#0F172A" }}>{icon} {title}</div><p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p></div>);
}
function Mini({ label, value }: { label: string; value: string }) {
  return (<div className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 font-mono text-sm font-bold text-slate-900">{value}</div></div>);
}
