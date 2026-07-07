"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import {
  Play, Pause, RotateCcw, Wind, Droplets, Gauge, Timer, Thermometer,
  Info, CheckCircle2, AlertTriangle, ArrowRight, Wand2,
} from "lucide-react";
import Room from "./scene/Room";
import Equipment from "./scene/Equipment";
import {
  createInitialState, stepSim, recommendEquipment, ASSUMPTIONS,
  DRY_GOAL_PCT, MAX_SIM_HOURS,
  type SimConfig, type SimState, type WaterClass,
} from "./lib/dryingModel";
import { EQUIPMENT_CATALOG, DEFAULT_DEHU_PINTS_PER_DAY } from "./lib/equipment";

const DEFAULT_CONFIG: SimConfig = {
  room: { lengthM: 6, widthM: 4, heightM: 2.7, affectedFraction: 0.75, waterClass: 3 },
  equipment: { airMovers: 4, dehumidifiers: 1, dehuPintsPerDay: DEFAULT_DEHU_PINTS_PER_DAY, injectionDrying: false },
  env: { tempC: 21, startRH: 85 },
};

const SPEEDS = [2, 6, 24] as const; // simulated hours per real second

function r(n: number, d = 0): string {
  return n.toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function Stat({ icon, label, value, unit, tone = "default" }: {
  icon: React.ReactNode; label: string; value: string; unit?: string;
  tone?: "default" | "good" | "warn";
}) {
  const color = tone === "good" ? "text-emerald-400" : tone === "warn" ? "text-amber-400" : "text-white";
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-black/45 px-3 py-2 backdrop-blur-sm">
      <span className="text-slate-400">{icon}</span>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
        <div className={`font-mono text-sm font-semibold ${color}`}>
          {value}{unit && <span className="ml-0.5 text-[11px] text-slate-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

export default function DryingSimulator() {
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(SPEEDS[1]);
  // Client-only flag (false during SSR) without setState-in-effect.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const simRef = useRef<SimState>(createInitialState(DEFAULT_CONFIG));
  const [hud, setHud] = useState<SimState>(() => createInitialState(DEFAULT_CONFIG));

  const playingRef = useRef(playing);
  const speedRef = useRef(speed);
  const configRef = useRef(config);

  // Mirror latest values into refs (outside render) so the single RAF loop below
  // always reads current state without re-subscribing.
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { configRef.current = config; }, [config]);

  const reset = useCallback((cfg: SimConfig) => {
    simRef.current = createInitialState(cfg);
    setHud(simRef.current);
    setPlaying(false);
  }, []);

  // Re-seed the simulation whenever the configuration changes.
  useEffect(() => { reset(config); }, [config, reset]);

  // Single animation loop: integrates the model in fixed sub-steps and pushes a
  // throttled snapshot to the HUD. The 3D scene reads simRef directly per frame.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudLast = 0;
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const s = simRef.current;
      if (playingRef.current && !s.goalReached && s.elapsedH < MAX_SIM_HOURS) {
        let remaining = dt * speedRef.current;
        const sub = 0.25;
        while (remaining > 0) {
          const stepH = Math.min(sub, remaining);
          simRef.current = stepSim(simRef.current, configRef.current, stepH);
          remaining -= stepH;
          if (simRef.current.goalReached) break;
        }
        if (simRef.current.goalReached || simRef.current.elapsedH >= MAX_SIM_HOURS) {
          setPlaying(false);
        }
      }
      if (t - hudLast > 120) { hudLast = t; setHud(simRef.current); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard: space = play/pause, R = reset.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); setPlaying((p) => !p); }
      if (e.key.toLowerCase() === "r") reset(configRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  const rec = useMemo(() => recommendEquipment(config.room), [config.room]);
  const stalled = hud.roomRH > 92 && !hud.goalReached && hud.elapsedH > 4;
  const days = Math.floor(hud.elapsedH / 24);
  const hrs = Math.round(hud.elapsedH % 24);
  const elapsedLabel = days > 0 ? `${days}d ${hrs}h` : `${r(hud.elapsedH, 1)}h`;

  const setRoom = (patch: Partial<SimConfig["room"]>) =>
    setConfig((c) => ({ ...c, room: { ...c.room, ...patch } }));
  const setEquip = (patch: Partial<SimConfig["equipment"]>) =>
    setConfig((c) => ({ ...c, equipment: { ...c.equipment, ...patch } }));
  const setEnv = (patch: Partial<SimConfig["env"]>) =>
    setConfig((c) => ({ ...c, env: { ...c.env, ...patch } }));

  const applyRecommendation = () =>
    setEquip({ airMovers: rec.airMovers, dehumidifiers: rec.dehumidifiers });

  const mailto = useMemo(() => {
    const { room, equipment } = config;
    const subject = "DryForge — structural drying plan review";
    const body = [
      "I modelled a drying scenario on the DryForge simulator:",
      `Room: ${room.lengthM}m x ${room.widthM}m x ${room.heightM}m, ${Math.round(room.affectedFraction * 100)}% affected, Class ${room.waterClass}`,
      `Setup: ${equipment.airMovers} air movers, ${equipment.dehumidifiers} LGR dehumidifier(s)${equipment.injectionDrying ? ", injection drying" : ""}`,
      hud.goalReached ? `Modelled time to dry standard: ${elapsedLabel}` : "",
      "",
      "I'd like to talk about applying this to a real loss.",
    ].filter(Boolean).join("\n");
    return `mailto:pilot@dryforge.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [config, hud.goalReached, elapsedLabel]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* ---------------- 3D stage ---------------- */}
        <div className="relative">
          <div
            className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-[#0b1220] to-[#0F172A] aspect-[4/3] lg:aspect-auto lg:h-[560px]"
            aria-label="3D structural-drying simulation. A water-damaged room with air movers and a dehumidifier; the floor and walls lighten as moisture is removed."
            role="img"
          >
            {mounted ? (
              <Canvas shadows camera={{ position: [6.5, 4.5, 6.5], fov: 42 }} dpr={[1, 1.75]}>
                <color attach="background" args={["#0b1220"]} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[6, 9, 4]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
                <pointLight position={[-4, 3, -3]} intensity={18} color="#fca86b" distance={14} />
                <Room room={config.room} simRef={simRef} />
                <Equipment room={config.room} equipment={config.equipment} running={playing} />
                <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={16} blur={2.4} far={4} />
                <OrbitControls enableDamping minDistance={3} maxDistance={16} maxPolarAngle={Math.PI / 2.05} target={[0, 0.6, 0]} />
              </Canvas>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">Loading 3D scene…</div>
            )}

            {/* Metrics HUD */}
            <div className="pointer-events-none absolute left-3 top-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat icon={<Timer className="h-4 w-4" />} label="Elapsed" value={elapsedLabel} />
              <Stat icon={<Droplets className="h-4 w-4" />} label="Moisture" value={r(hud.materialMoisturePct)} unit="%"
                tone={hud.goalReached ? "good" : hud.materialMoisturePct > 60 ? "warn" : "default"} />
              <Stat icon={<Gauge className="h-4 w-4" />} label="Room RH" value={r(hud.roomRH)} unit="%"
                tone={stalled ? "warn" : "default"} />
              <Stat icon={<Wind className="h-4 w-4" />} label="GPP" value={r(hud.gpp)} />
              <Stat icon={<Droplets className="h-4 w-4" />} label="Removed" value={r(hud.removedWaterL, 1)} unit="L" tone="good" />
              <Stat icon={<Droplets className="h-4 w-4" />} label="Remaining" value={r(hud.materialWaterL, 1)} unit="L" />
            </div>

            {/* Status banners */}
            {stalled && (
              <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md bg-amber-500/90 px-3 py-2 text-xs font-semibold text-amber-950">
                <AlertTriangle className="h-4 w-4" /> RH saturated — add dehumidification capacity
              </div>
            )}
            {hud.goalReached && (
              <div className="absolute right-3 top-3 flex items-center gap-2 rounded-md bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-emerald-950">
                <CheckCircle2 className="h-4 w-4" /> Dry standard reached in {elapsedLabel}
              </div>
            )}

            {/* Playback controls */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="inline-flex items-center gap-2 rounded-md bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#EA580C] transition-colors"
                  aria-label={playing ? "Pause simulation" : "Play simulation"}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? "Pause" : hud.elapsedH > 0 ? "Resume" : "Start drying"}
                </button>
                <button
                  onClick={() => reset(config)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
                  aria-label="Reset simulation"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
              <div className="flex items-center gap-1 rounded-md bg-black/50 p-1" role="group" aria-label="Simulation speed">
                {SPEEDS.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSpeed(sp)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${speed === sp ? "bg-[#F97316] text-white" : "text-slate-300 hover:text-white"}`}
                  >
                    {sp}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Honest framing + assumptions */}
          <p className="mt-3 text-xs text-slate-500">
            Planning simulation using IICRC S500-style psychrometrics — not a live job or a guarantee. Drag to orbit; space bar plays/pauses.
          </p>
          <details className="mt-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-medium text-slate-800 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#F97316]" /> Model assumptions &amp; limitations
            </summary>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              {ASSUMPTIONS.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </details>

          {/* Live region for screen readers */}
          <div className="sr-only" aria-live="polite">
            {hud.goalReached
              ? `Dry standard reached after ${elapsedLabel}.`
              : `Stage ${hud.stage}. Material moisture ${r(hud.materialMoisturePct)} percent. Room humidity ${r(hud.roomRH)} percent.`}
          </div>
        </div>

        {/* ---------------- Controls ---------------- */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Scenario</h3>
              <button
                onClick={applyRecommendation}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-[#EA580C] hover:bg-orange-50 transition-colors"
                title={rec.note}
              >
                <Wand2 className="h-3.5 w-3.5" /> Auto-size ({rec.airMovers} AM · {rec.dehumidifiers} DH)
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <Range label="Room length" value={config.room.lengthM} min={2} max={14} step={0.5} unit="m"
                onChange={(v) => setRoom({ lengthM: v })} />
              <Range label="Room width" value={config.room.widthM} min={2} max={10} step={0.5} unit="m"
                onChange={(v) => setRoom({ widthM: v })} />
              <Range label="Ceiling height" value={config.room.heightM} min={2.2} max={4} step={0.1} unit="m"
                onChange={(v) => setRoom({ heightM: v })} />
              <Range label="Area affected" value={Math.round(config.room.affectedFraction * 100)} min={10} max={100} step={5} unit="%"
                onChange={(v) => setRoom({ affectedFraction: v / 100 })} />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Water class (IICRC)</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((c) => (
                    <button
                      key={c}
                      onClick={() => setRoom({ waterClass: c as WaterClass })}
                      className={`rounded-md border py-1.5 text-sm font-semibold transition-colors ${config.room.waterClass === c ? "border-[#F97316] bg-orange-50 text-[#EA580C]" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Equipment</h3>
            <div className="mt-4 space-y-4">
              <Stepper label="Axial air movers" value={config.equipment.airMovers} min={0} max={12}
                onChange={(v) => setEquip({ airMovers: v })} />
              <Stepper label="LGR dehumidifiers" value={config.equipment.dehumidifiers} min={0} max={6}
                onChange={(v) => setEquip({ dehumidifiers: v })} />
              <Range label="Dehu rating" value={config.equipment.dehuPintsPerDay} min={50} max={240} step={10} unit="ppd"
                onChange={(v) => setEquip({ dehuPintsPerDay: v })} />
              <label className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-medium text-slate-700">Injection / cavity drying</span>
                <input
                  type="checkbox"
                  checked={config.equipment.injectionDrying}
                  onChange={(e) => setEquip({ injectionDrying: e.target.checked })}
                  className="h-4 w-4 accent-[#F97316]"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-[#F97316]" /> Conditions
            </h3>
            <div className="mt-4 space-y-4">
              <Range label="Air temperature" value={config.env.tempC} min={5} max={35} step={1} unit="°C"
                onChange={(v) => setEnv({ tempC: v })} />
              <Range label="Starting humidity" value={config.env.startRH} min={40} max={100} step={1} unit="%"
                onChange={(v) => setEnv({ startRH: v })} />
            </div>
          </div>

          {/* Conversion — honest email handoff, no fake CRM */}
          <div className={`rounded-xl border p-4 transition-colors ${hud.goalReached ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
            <p className="text-sm font-semibold text-slate-900">
              {hud.goalReached ? "Nice — this plan hits the dry standard." : "Modelling a real loss?"}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              This is a planning tool. The next step for a real job is a conversation — send your scenario to the DryForge pilot team.
            </p>
            <a href={mailto} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#EA580C] transition-colors">
              Send this scenario <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>

      {/* Equipment legend — real categories, honest framing */}
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {EQUIPMENT_CATALOG.map((e) => (
          <div key={e.kind} className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="text-sm font-semibold text-slate-900">{e.name}</h4>
            <p className="mt-1.5 text-sm text-slate-600">{e.role}</p>
            <dl className="mt-3 space-y-1">
              {e.specs.map((s) => (
                <div key={s.label} className="flex justify-between text-xs">
                  <dt className="text-slate-500">{s.label}</dt>
                  <dd className="font-mono font-medium text-slate-800">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] italic text-slate-400">{e.categoryExamples}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Dry standard target: material at or below {DRY_GOAL_PCT}% of its starting moisture load. Equipment shown is standard,
        technician-placed restoration gear — not autonomous. DryForge&apos;s autonomous-placement and remote-monitoring layer is a
        roadmap concept, not a shipping product.
      </p>
    </section>
  );
}

/* --------------------------- small control widgets --------------------------- */

function Range({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <span className="font-mono text-xs font-semibold text-slate-800">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#F97316]"
        aria-label={label}
      />
    </div>
  );
}

function Stepper({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label={`Decrease ${label}`}
        >−</button>
        <span className="w-6 text-center font-mono text-sm font-semibold text-slate-900">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
    </div>
  );
}
