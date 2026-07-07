"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Cpu, ShieldCheck, Activity, Wrench, Boxes, Info, Play, Pause, Loader2, CheckCircle2,
} from "lucide-react";
import RobotModel from "../components/robots3d/DrywallRobots";
import { Lights, Floor, WallSection } from "../components/robots3d/Env";
import {
  ROBOTS, MARKET_FACTS, computePlan, money, num,
  type RobotId, type JobConfig, DEFAULT_JOB,
} from "../lib/fleet";

const READINESS_STYLE: Record<string, string> = {
  beachhead: "bg-orange-100 text-orange-800 border-orange-200",
  near: "bg-sky-100 text-sky-800 border-sky-200",
  roadmap: "bg-slate-100 text-slate-600 border-slate-200",
};

function RobotStage({ id, accent, running }: { id: RobotId; accent: string; running: boolean }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  if (!mounted) return <div className="grid h-full place-items-center text-sm text-slate-500">Loading 3D…</div>;
  const showWall = id === "finisher" || id === "hanger" || id === "qa";
  return (
    <Canvas shadows camera={{ position: [3.2, 2.4, 3.6], fov: 42 }} dpr={[1, 1.75]}>
      <color attach="background" args={["#0b1220"]} />
      <Lights accent={accent} />
      <Floor />
      {showWall && <WallSection finished={id === "finisher" ? 0.6 : id === "qa" ? 1 : 0.15} />}
      <group position={[0, 0, id === "cutter" || id === "amr" ? 0 : -0.4]}>
        <RobotModel id={id} running={running} accent={accent} />
      </group>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={10} blur={2.4} far={5} />
      <OrbitControls enableDamping minDistance={2.2} maxDistance={9} maxPolarAngle={Math.PI / 2.05} target={[0, 1, 0]} />
    </Canvas>
  );
}

export default function RobotShowcase() {
  const [activeId, setActiveId] = useState<RobotId>("finisher");
  const active = ROBOTS.find((r) => r.id === activeId)!;
  const [running, setRunning] = useState(true);

  const [cfg, setCfg] = useState<JobConfig>({ ...DEFAULT_JOB });
  const [simState, setSimState] = useState<"idle" | "running" | "done">("idle");
  const timer = useRef<number | null>(null);
  const plan = useMemo(() => computePlan(cfg), [cfg]);

  const runSim = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setSimState("running");
    timer.current = window.setTimeout(() => setSimState("done"), 1400);
  };
  const set = (patch: Partial<JobConfig>) => { setCfg((c) => ({ ...c, ...patch })); if (simState === "done") setSimState("idle"); };

  const mailtoPilot = `mailto:pilot@dryforge.ai?subject=${encodeURIComponent(`Founding pilot interest — ${active.name}`)}&body=${encodeURIComponent(`I'm interested in the ${active.name} for a GTA project. Let's talk.`)}`;

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

      <div className="mt-10 flex gap-2 overflow-x-auto pb-1">
        {ROBOTS.map((r) => (
          <button key={r.id} onClick={() => setActiveId(r.id)}
            className={`flex-shrink-0 rounded-lg border px-4 py-2.5 text-left transition-colors ${activeId === r.id ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
            style={activeId === r.id ? { backgroundColor: r.accent } : undefined}>
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{r.order}. {r.phase}</div>
            <div className="whitespace-nowrap text-sm font-semibold">{r.shortName}</div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
          className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1220] aspect-[4/3] lg:aspect-auto lg:h-[520px]"
            role="img" aria-label={`3D animation of the ${active.name}. ${active.howItWorks}`}>
            <RobotStage id={active.id} accent={active.accent} running={running} />
            <div className="pointer-events-none absolute right-3 top-3 rounded-md px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: active.accent }}>{active.phase}</div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
              <button onClick={() => setRunning((r) => !r)} className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: active.accent }} aria-label={running ? "Pause" : "Play"}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? "Pause" : "Play"}
              </button>
              <span className="text-[11px] text-slate-300">Drag to orbit</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ backgroundColor: active.accent }}><Boxes className="h-4 w-4" /></span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{active.name}</h2>
              </div>
              <span className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${READINESS_STYLE[active.readiness]}`}>{active.readinessLabel}</span>
              <div className="mt-4 space-y-3">
                <Block icon={<Activity className="h-4 w-4" />} title="The pain it removes" body={active.painPoint} />
                <Block icon={<Wrench className="h-4 w-4" />} title="How it works" body={active.howItWorks} />
                <Block icon={<Cpu className="h-4 w-4" />} title="DryForge software layer" body={active.dryforgeLayer} accent={active.accent} />
              </div>
              {active.benchmarkNote && (
                <p className="mt-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />{active.benchmarkNote}</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <dl className="space-y-2">
                {active.specs.map((s) => (
                  <div key={s.label} className="flex justify-between border-b border-slate-100 pb-2 text-sm last:border-0"><dt className="text-slate-500">{s.label}</dt><dd className="font-mono font-semibold text-slate-900">{s.value}</dd></div>
                ))}
              </dl>
              <div className="mt-3 rounded-lg p-3 text-white" style={{ backgroundColor: active.accent }}>
                <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">Modelled labour reduction (design target)</div>
                <div className="text-2xl font-bold">{active.laborReductionPct}%</div>
              </div>
            </div>
            <a href={mailtoPilot} className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: active.accent }}>Apply to pilot this robot <ArrowRight className="h-4 w-4" /></a>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#F97316]" /><h3 className="text-lg font-bold text-slate-900">Fleet console</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Planning model</span></div>
        <p className="mt-1 text-sm text-slate-600">Set the deployment and see the modelled economics update live.</p>
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Slider label="Job size" value={cfg.sqft} min={2000} max={120000} step={1000} display={`${num(cfg.sqft)} sqft`} onChange={(v) => set({ sqft: v })} />
            <Slider label="Supervision (robots per operator)" value={cfg.supervisionRatio} min={1} max={6} step={1} display={`${cfg.supervisionRatio}:1`} onChange={(v) => set({ supervisionRatio: v })} />
            <Slider label="RaaS rate ($/sqft)" value={cfg.raasRate} min={0.6} max={2.5} step={0.05} display={money(cfg.raasRate)} onChange={(v) => set({ raasRate: v })} />
            <Slider label="Loaded labour rate" value={cfg.laborRate} min={30} max={95} step={1} display={`${money(cfg.laborRate)}/hr`} onChange={(v) => set({ laborRate: v })} />
            <button onClick={runSim} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1E293B]">
              {simState === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : simState === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Play className="h-4 w-4" />}
              {simState === "running" ? "Simulating…" : simState === "done" ? "Deployment simulated" : "Simulate deployment"}
            </button>
          </div>
          <motion.div animate={{ opacity: simState === "running" ? 0.5 : 1 }} className="grid grid-cols-2 gap-3 self-start">
            <Metric label="Labour hours saved" value={num(plan.laborHoursSaved)} tone="good" />
            <Metric label="Schedule" value={`${num(plan.robotDays, 1)}d`} sub={`vs ${num(plan.manualDays, 1)}d manual`} />
            <Metric label="RaaS cost" value={money(plan.raasCost)} />
            <Metric label="Modelled savings" value={money(plan.costSaved)} tone={plan.costSaved > 0 ? "good" : "warn"} />
            <Metric label="Operators needed" value={`${plan.operatorsNeeded}`} sub={`at ${cfg.supervisionRatio}:1`} />
            <Metric label="Manual labour cost" value={money(plan.manualCost)} />
          </motion.div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl bg-[#0F172A] p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
        <div><h3 className="text-xl font-bold">See the fleet run a full job in 3D</h3><p className="mt-1 text-sm text-slate-300">Configure a project and watch all five robots work the site end to end.</p></div>
        <a href="/simulator" className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-3 text-sm font-semibold hover:bg-[#EA580C]">Open the fleet simulator <ArrowRight className="h-4 w-4" /></a>
      </div>
    </section>
  );
}

function Block({ icon, title, body, accent }: { icon: React.ReactNode; title: string; body: string; accent?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold" style={accent ? { color: accent } : { color: "#0F172A" }}>{icon} {title}</div>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
function Metric({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "good" | "warn" }) {
  const color = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-slate-900";
  return (<div className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div><div className={`mt-1 font-mono text-lg font-bold ${color}`}>{value}</div>{sub && <div className="text-[11px] text-slate-400">{sub}</div>}</div>);
}
function Slider({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between"><label className="text-xs font-medium text-slate-500">{label}</label><span className="font-mono text-xs font-semibold text-slate-900">{display}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[#F97316]" aria-label={label} />
    </div>
  );
}
