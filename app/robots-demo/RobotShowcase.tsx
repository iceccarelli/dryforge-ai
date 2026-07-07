"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Cpu, ShieldCheck, Activity, Wrench, Boxes, Info, Play, Loader2, CheckCircle2,
} from "lucide-react";
import {
  ROBOTS, MARKET_FACTS, computePlan, money, num,
  type RobotId, type JobConfig, DEFAULT_JOB,
} from "../lib/fleet";

const READINESS_STYLE: Record<string, string> = {
  beachhead: "bg-orange-100 text-orange-800 border-orange-200",
  near: "bg-sky-100 text-sky-800 border-sky-200",
  roadmap: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function RobotShowcase() {
  const [activeId, setActiveId] = useState<RobotId>("finisher");
  const active = ROBOTS.find((r) => r.id === activeId)!;

  // Fleet console state
  const [cfg, setCfg] = useState<JobConfig>({ ...DEFAULT_JOB });
  const [simState, setSimState] = useState<"idle" | "running" | "done">("idle");
  const timer = useRef<number | null>(null);

  const plan = useMemo(() => computePlan(cfg), [cfg]);

  const runSim = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setSimState("running");
    timer.current = window.setTimeout(() => setSimState("done"), 1400);
  };

  const set = (patch: Partial<JobConfig>) => {
    setCfg((c) => ({ ...c, ...patch }));
    if (simState === "done") setSimState("idle");
  };

  const mailtoPilot = `mailto:pilot@dryforge.ai?subject=${encodeURIComponent(
    `Founding pilot interest — ${active.name}`
  )}&body=${encodeURIComponent(`I'm interested in the ${active.name} for a GTA project. Let's talk.`)}`;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Market facts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {MARKET_FACTS.map((f) => (
          <div key={f.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-lg font-bold tracking-tight text-slate-900">{f.stat}</div>
            <div className="mt-1 text-xs leading-snug text-slate-600">{f.label}</div>
            <div className="mt-2 text-[10px] italic text-slate-400">Source: {f.source}</div>
          </div>
        ))}
      </div>

      {/* Robot selector */}
      <div className="mt-10 flex gap-2 overflow-x-auto pb-1">
        {ROBOTS.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveId(r.id)}
            className={`flex-shrink-0 rounded-lg border px-4 py-2.5 text-left transition-colors ${
              activeId === r.id ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
            style={activeId === r.id ? { backgroundColor: r.accent } : undefined}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
              {r.order}. {r.phase}
            </div>
            <div className="whitespace-nowrap text-sm font-semibold">{r.shortName}</div>
          </button>
        ))}
      </div>

      {/* Selected robot detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={{ backgroundColor: active.accent }}>
                <Boxes className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{active.name}</h2>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${READINESS_STYLE[active.readiness]}`}>
                {active.readinessLabel}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <Block icon={<Activity className="h-4 w-4" />} title="The pain it removes" body={active.painPoint} />
              <Block icon={<Wrench className="h-4 w-4" />} title="How it works" body={active.howItWorks} />
              <Block icon={<Cpu className="h-4 w-4" />} title="The DryForge software layer" body={active.dryforgeLayer} accent={active.accent} />
            </div>

            {active.benchmarkNote && (
              <p className="mt-4 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                {active.benchmarkNote}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Specifications</h3>
              <dl className="mt-3 space-y-2">
                {active.specs.map((s) => (
                  <div key={s.label} className="flex justify-between border-b border-slate-100 pb-2 text-sm last:border-0">
                    <dt className="text-slate-500">{s.label}</dt>
                    <dd className="font-mono font-semibold text-slate-900">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-lg p-3 text-white" style={{ backgroundColor: active.accent }}>
                <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">Modelled labour reduction (design target)</div>
                <div className="text-2xl font-bold">{active.laborReductionPct}%</div>
              </div>
            </div>

            <a href={mailtoPilot} className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: active.accent }}>
              Apply to pilot this robot <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Fleet console */}
      <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#F97316]" />
          <h3 className="text-lg font-bold text-slate-900">Fleet console</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Planning model</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">Set the deployment and see the modelled economics update live. Assumptions are disclosed in the simulator.</p>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <Slider label="Job size" value={cfg.sqft} min={2000} max={120000} step={1000} unit=" sqft" onChange={(v) => set({ sqft: v })} display={num(cfg.sqft)} />
            <Slider label="Supervision ratio (robots per operator)" value={cfg.supervisionRatio} min={1} max={6} step={1} unit=":1" onChange={(v) => set({ supervisionRatio: v })} display={`${cfg.supervisionRatio}:1`} />
            <Slider label="RaaS rate" value={cfg.raasRate} min={0.6} max={2.5} step={0.05} unit=" /sqft" onChange={(v) => set({ raasRate: v })} display={money(cfg.raasRate).replace("$", "$")} />
            <Slider label="Loaded labour rate" value={cfg.laborRate} min={30} max={95} step={1} unit=" /hr" onChange={(v) => set({ laborRate: v })} display={money(cfg.laborRate)} />

            <button onClick={runSim} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1E293B]">
              {simState === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : simState === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Play className="h-4 w-4" />}
              {simState === "running" ? "Simulating deployment…" : simState === "done" ? "Deployment simulated" : "Simulate deployment"}
            </button>
          </div>

          <motion.div
            animate={{ opacity: simState === "running" ? 0.5 : 1 }}
            className="grid grid-cols-2 gap-3 self-start"
          >
            <Metric label="Labour hours saved" value={num(plan.laborHoursSaved)} tone="good" />
            <Metric label="Schedule" value={`${num(plan.robotDays, 1)}d`} sub={`vs ${num(plan.manualDays, 1)}d manual`} />
            <Metric label="RaaS cost" value={money(plan.raasCost)} />
            <Metric label="Modelled savings" value={money(plan.costSaved)} tone={plan.costSaved > 0 ? "good" : "warn"} />
            <Metric label="Operators needed" value={`${plan.operatorsNeeded}`} sub={`at ${cfg.supervisionRatio}:1`} />
            <Metric label="Manual labour cost" value={money(plan.manualCost)} />
          </motion.div>
        </div>
      </div>

      {/* Data flowback */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-bold text-slate-900">Every robot feeds the DryForge brain</h3>
        <p className="mt-1 text-sm text-slate-600">Telemetry from each phase flows into one orchestration layer — the moat is the software and the data, not any single machine.</p>
        <div className="mt-6 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROBOTS.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.accent }} />
                <span className="font-medium text-slate-700">{r.shortName}</span>
              </div>
            ))}
          </div>
          <ArrowRight className="mx-auto hidden h-6 w-6 text-slate-300 md:block" />
          <div className="rounded-xl bg-[#0F172A] p-5 text-white">
            <div className="text-sm font-bold">DryForge AI Orchestration</div>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              <li>• Fleet scheduling & adaptive replanning</li>
              <li>• Live quality scoring & heatmaps</li>
              <li>• Predictive maintenance</li>
              <li>• Per-sqft ROI & audit trail</li>
              <li>• Procore / Autodesk hooks (planned)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl bg-[#0F172A] p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="text-xl font-bold">See the fleet run a full job</h3>
          <p className="mt-1 text-sm text-slate-300">Configure a project and watch the DryForge planner orchestrate all five robots end to end.</p>
        </div>
        <a href="/simulator" className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-6 py-3 text-sm font-semibold hover:bg-[#EA580C]">
          Open the fleet simulator <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function Block({ icon, title, body, accent }: { icon: React.ReactNode; title: string; body: string; accent?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold" style={accent ? { color: accent } : { color: "#0F172A" }}>
        {icon} {title}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function Metric({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "good" | "warn" }) {
  const color = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 font-mono text-lg font-bold ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; display: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <span className="font-mono text-xs font-semibold text-slate-900">{display}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[#F97316]" aria-label={label} />
    </div>
  );
}
