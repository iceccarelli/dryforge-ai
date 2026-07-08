"use client";

/**
 * RobotInternals — engineering-grade concept inspection, one distinct machine
 * per DryForge phase. Each robot BOTH runs its task AND explodes / cuts away to
 * reveal internals (battery, compute, motors, gearboxes, actuators).
 *
 * PRODUCT-HONESTY: concept / design-intent models. No hardware is built, so
 * geometry, dimensions and RPM are illustrative, NOT measured. The "Concept"
 * badge in inspect/page.tsx must stay.
 *
 *   amr       mobile cart, drives a payload      · drive motors + battery core
 *   cutter    gantry over a table, routing head  · spindle motor + X servo
 *   hanger    tracked base + 3-DOF arm + vacuum   · shoulder/elbow/wrist servos + pump
 *   finisher  base + lift mast + arm + sander     · BLDC head + mast servo + dust
 *   qa        base + sensor mast + vision head    · lidar motor + vision compute
 */

import { useMemo, useRef, type ReactNode, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { RobotId } from "../../lib/fleet";

export interface InternalsProps {
  robot: RobotId;
  accent: string;
  explode: number;
  cutaway: boolean;
  clipZ: number;
  labels: boolean;
  running: boolean;
  speed: number;
}

const TAU = Math.PI * 2;
const pingpong = (x: number) => { const f = x - Math.floor(x); return f < 0.5 ? f * 2 : 2 - f * 2; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const M = {
  panel: { color: "#c9d2dd", metalness: 0.45, roughness: 0.38 },
  dark: { color: "#28303c", metalness: 0.55, roughness: 0.4 },
  steel: { color: "#aeb6c2", metalness: 0.92, roughness: 0.25 },
  copper: { color: "#b56a41", metalness: 0.95, roughness: 0.35 },
  rubber: { color: "#14181f", metalness: 0.0, roughness: 0.9 },
  brass: { color: "#c8a24a", metalness: 0.95, roughness: 0.3 },
  battery: { color: "#1f6feb", metalness: 0.3, roughness: 0.5 },
  pcb: { color: "#0f5132", metalness: 0.2, roughness: 0.6 },
  glass: { color: "#0b1a2a", metalness: 0.1, roughness: 0.08 },
  board: { color: "#d8d2c4", metalness: 0.05, roughness: 0.85 },
} as const;

type Mat = { color: string; metalness?: number; roughness?: number };
type Ctx = { e: number; clip: THREE.Plane[]; labels: boolean; running: boolean; t: MutableRefObject<number>; accent: string };

/* ------------------------------- helpers --------------------------------- */

function Panel({ args, position, rotation, color, clip, radius = 0.025, metalness = 0.45, roughness = 0.4 }:
  { args: [number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; color: string; clip?: THREE.Plane[]; radius?: number; metalness?: number; roughness?: number }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={4} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} clippingPlanes={clip} />
    </RoundedBox>
  );
}
function Box({ args, position, rotation, mat, clip }:
  { args: [number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; mat: Mat; clip?: THREE.Plane[] }) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow><boxGeometry args={args} /><meshStandardMaterial {...mat} clippingPlanes={clip} /></mesh>;
}
function Cyl({ r, h, position, rotation, mat, clip }:
  { r: number; h: number; position?: [number, number, number]; rotation?: [number, number, number]; mat: Mat; clip?: THREE.Plane[] }) {
  return <mesh position={position} rotation={rotation} castShadow><cylinderGeometry args={[r, r, h, 24]} /><meshStandardMaterial {...mat} clippingPlanes={clip} /></mesh>;
}
function Tag({ position, title, sub }: { position: [number, number, number]; title: string; sub?: string }) {
  return (
    <Html position={position} center distanceFactor={8} zIndexRange={[10, 0]} occlude={false}>
      <div style={{ transform: "translate(14px,-50%)", whiteSpace: "nowrap", fontFamily: "ui-sans-serif, system-ui", fontSize: 11, lineHeight: 1.15, background: "rgba(9,14,22,0.9)", color: "#e6edf5", border: "1px solid rgba(245,158,11,0.5)", borderRadius: 6, padding: "4px 7px", boxShadow: "0 4px 14px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ opacity: 0.7, fontSize: 10 }}>{sub}</div>}
      </div>
    </Html>
  );
}
function Gear({ teeth = 18, radius = 0.07, thickness = 0.028 }: { teeth?: number; radius?: number; thickness?: number }) {
  const arr = useMemo(() => Array.from({ length: teeth }, (_, i) => (i / teeth) * TAU), [teeth]);
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[radius, radius, thickness, teeth * 2]} /><meshStandardMaterial {...M.steel} /></mesh>
      <mesh><cylinderGeometry args={[radius * 0.3, radius * 0.3, thickness * 1.3, 18]} /><meshStandardMaterial {...M.brass} /></mesh>
      {arr.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} rotation={[0, -a, 0]} castShadow>
          <boxGeometry args={[radius * 0.16, thickness, radius * 0.34]} /><meshStandardMaterial {...M.steel} />
        </mesh>
      ))}
    </group>
  );
}
/** Servo: housing + copper windings + spinning output gear (spins when running). */
function Servo({ running, tag, labels, tagPos }: { running: boolean; tag?: string; labels?: boolean; tagPos?: [number, number, number] }) {
  const out = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (out.current && running) out.current.rotation.z += 0.5 * dt; });
  return (
    <group>
      <Cyl r={0.07} h={0.13} rotation={[Math.PI / 2, 0, 0]} mat={M.dark} />
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.054, 0.054, 0.085, 24, 1, true]} /><meshStandardMaterial {...M.copper} side={THREE.DoubleSide} /></mesh>
      <group ref={out} position={[0, 0, 0.085]}><Gear teeth={18} radius={0.055} thickness={0.022} /></group>
      {labels && tag && tagPos && <Tag position={tagPos} title={tag} sub="concept · harmonic drive" />}
    </group>
  );
}
function Spinner({ rpm, axis = "z", running, children }: { rpm: number; axis?: "x" | "y" | "z"; running: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const rate = (rpm * TAU) / 60;
  useFrame((_, dt) => { if (ref.current && running) ref.current.rotation[axis] += rate * dt; });
  return <group ref={ref}>{children}</group>;
}
function Wheel({ position, r = 0.1, w = 0.06, spin }: { position: [number, number, number]; r?: number; w?: number; spin: MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.x = spin.current; });
  return (
    <group position={position} ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[r, r, w, 22]} /><meshStandardMaterial {...M.rubber} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[r * 0.42, r * 0.42, w * 1.1, 16]} /><meshStandardMaterial {...M.steel} /></mesh>
    </group>
  );
}
function EStop({ position, labels }: { position: [number, number, number]; labels: boolean }) {
  return (
    <group position={position}>
      <Cyl r={0.045} h={0.03} mat={{ color: "#f5c518", roughness: 0.6 }} />
      <Cyl r={0.036} h={0.03} position={[0, 0.025, 0]} mat={{ color: "#e11d2e", roughness: 0.5 }} />
      {labels && <Tag position={[0.1, 0, 0]} title="E-stop" sub="safety switch" />}
    </group>
  );
}
/** Shared power/compute core — revealed on explode/cutaway. */
function Core({ clip, labels, extra }: { clip: THREE.Plane[]; labels: boolean; extra?: { pos: [number, number, number]; title: string; sub: string } }) {
  return (
    <group>
      <Box args={[0.4, 0.12, 0.26]} position={[0, 0, 0.1]} mat={M.battery} clip={clip} />
      <Box args={[0.28, 0.1, 0.18]} position={[0, 0, -0.14]} mat={M.dark} clip={clip} />
      <Box args={[0.24, 0.008, 0.14]} position={[0, 0.055, -0.14]} mat={M.pcb} />
      {labels && <Tag position={[0.22, 0.02, 0.1]} title="Battery" sub="concept · LFP hot-swap" />}
      {labels && <Tag position={[-0.2, 0.02, -0.14]} title="Compute" sub="concept · edge AI" />}
      {extra && labels && <Tag position={extra.pos} title={extra.title} sub={extra.sub} />}
    </group>
  );
}

/* ================================ AMR ==================================== */

function AMRUnit({ e, clip, labels, running, t, accent }: Ctx) {
  const root = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame(() => {
    const drive = pingpong(t.current / 4);
    if (root.current) root.current.position.x = (drive - 0.5) * 1.4;
    spin.current = (t.current * 3.4) % TAU;
  });
  return (
    <group ref={root}>
      <Panel args={[0.9, 0.16, 0.66]} position={[0, 0.2, 0]} color={accent} clip={clip} />
      <group position={[0, 0.2 - e * 0.5, 0]}>
        <Core clip={clip} labels={labels} extra={{ pos: [0, -0.13, 0.24], title: "Drive motors", sub: "concept · differential" }} />
        <Cyl r={0.05} h={0.1} position={[-0.28, 0, 0.2]} rotation={[0, 0, Math.PI / 2]} mat={M.dark} clip={clip} />
        <Cyl r={0.05} h={0.1} position={[0.28, 0, 0.2]} rotation={[0, 0, Math.PI / 2]} mat={M.dark} clip={clip} />
      </group>
      {([[-0.42, -0.28], [0.42, -0.28], [-0.42, 0.28], [0.42, 0.28]] as const).map(([x, z], i) => <Wheel key={i} position={[x, 0.1, z]} spin={spin} />)}
      <group position={[0, 0.34 + e * 0.45, 0]}>
        {[0, 1, 2].map((i) => <Box key={i} args={[0.72, 0.02, 0.5]} position={[0, i * 0.025, 0]} mat={M.board} />)}
        {labels && <Tag position={[0.34, 0.05, 0]} title="Payload deck" sub="concept · 10 sheets" />}
      </group>
      <group position={[0.4, 0.32, 0]}>
        <Spinner rpm={600} axis="y" running={running}><Cyl r={0.04} h={0.05} mat={M.dark} /><Box args={[0.02, 0.01, 0.06]} position={[0.03, 0, 0]} mat={M.steel} /></Spinner>
        {labels && <Tag position={[0.12, 0, 0]} title="Nav lidar" sub="concept · 360°" />}
      </group>
      <EStop position={[-0.36, 0.3, 0.24]} labels={labels} />
    </group>
  );
}

/* ================================ CUTTER ================================= */

function CutterUnit({ e, clip, labels, running, t, accent }: Ctx) {
  const carriage = useRef<THREE.Group>(null);
  const cut = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const p = pingpong(t.current / 3);
    if (carriage.current) carriage.current.position.x = (p - 0.5) * 1.0;
    if (cut.current) { const g = Math.min(1, (t.current % 6) / 6); cut.current.scale.z = g; }
  });
  return (
    <group>
      {([[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]] as const).map(([x, z], i) => <Box key={i} args={[0.08, 0.7, 0.08]} position={[x, 0.35, z]} mat={M.steel} />)}
      <Panel args={[1.4, 0.06, 1.0]} position={[0, 0.72, 0]} color="#3a444f" clip={clip} radius={0.02} />
      <Box args={[1.15, 0.02, 0.8]} position={[0, 0.77, 0]} mat={M.board} />
      <mesh ref={cut} position={[0, 0.785, 0]} scale={[1, 1, 0.01]}><boxGeometry args={[0.02, 0.02, 0.5]} /><meshStandardMaterial {...M.dark} /></mesh>
      <group position={[0, e * 0.35, 0]}>
        {[-0.66, 0.66].map((x, i) => <Box key={i} args={[0.08, 0.5, 0.1]} position={[x, 1.05, 0]} mat={{ color: accent, metalness: 0.5, roughness: 0.35 }} />)}
        <Box args={[1.5, 0.1, 0.12]} position={[0, 1.3, 0]} mat={{ color: accent, metalness: 0.5, roughness: 0.35 }} />
        <group ref={carriage} position={[0, 1.24, 0]}>
          <Box args={[0.18, 0.14, 0.18]} mat={M.dark} clip={clip} />
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.1, 24, 1, true]} /><meshStandardMaterial {...M.copper} side={THREE.DoubleSide} /></mesh>
          <Cyl r={0.06} h={0.16} position={[0, -0.16, 0]} mat={M.dark} />
          <mesh position={[0, -0.28, 0]}><cylinderGeometry args={[0.07, 0.07, 0.08, 20, 1, true]} /><meshStandardMaterial {...M.dark} side={THREE.DoubleSide} /></mesh>
          <Spinner rpm={18000} axis="y" running={running}><Cyl r={0.012} h={0.14} position={[0, -0.3, 0]} mat={M.steel} /></Spinner>
          {labels && <Tag position={[0.14, 0, 0]} title="Routing spindle" sub="concept · ~18000 rpm" />}
        </group>
        {labels && <Tag position={[0.78, 0.06, 0]} title="X gantry servo" sub="concept · ballscrew" />}
      </group>
      <Box args={[0.14, 0.24, 0.1]} position={[0.6, 0.35, 0.4]} mat={M.dark} clip={clip} />
      {labels && <Tag position={[0.72, 0.35, 0.4]} title="Motion controller" sub="concept" />}
      <EStop position={[-0.6, 0.78, 0.44]} labels={labels} />
    </group>
  );
}

/* ================================ HANGER ================================= */
/* 3-DOF arm: shoulder + elbow + wrist, lifting a sheet to the studs.          */

function HangerUnit({ e, clip, labels, running, t, accent }: Ctx) {
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = pingpong(t.current / 5);
    if (shoulder.current) shoulder.current.rotation.x = -0.2 - p * 0.7;
    if (elbow.current) elbow.current.rotation.x = 0.5 + p * 0.6;
    if (wrist.current) wrist.current.rotation.x = -0.3 + p * 0.3;
  });
  return (
    <group>
      <Panel args={[0.8, 0.2, 0.62]} position={[0, 0.24, 0]} color={accent} clip={clip} />
      {[-0.44, 0.44].map((x, i) => <Box key={i} args={[0.1, 0.16, 0.66]} position={[x, 0.12, 0]} mat={M.rubber} />)}
      <group position={[0, 0.24 - e * 0.5, 0]}>
        <Core clip={clip} labels={labels} extra={{ pos: [0.3, 0, -0.14], title: "Vacuum pump", sub: "concept · suction" }} />
        <Cyl r={0.05} h={0.12} position={[0.24, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]} mat={M.dark} clip={clip} />
      </group>
      <Box args={[0.16, 0.34, 0.16]} position={[0, 0.5, -0.12]} mat={M.panel} clip={clip} />
      <group position={[0, 0.66, -0.12]}>
        <group ref={shoulder}>
          <Servo running={running} labels={labels} tag="Shoulder" tagPos={[0.14, 0, 0]} />
          <Box args={[0.09, 0.5, 0.09]} position={[0, 0.25, 0.02]} mat={M.panel} />
          <group ref={elbow} position={[0, 0.5, 0.02]}>
            <Servo running={running} labels={labels} tag="Elbow" tagPos={[0.14, 0, 0]} />
            <Box args={[0.08, 0.34, 0.08]} position={[0, 0, 0.17]} rotation={[Math.PI / 2, 0, 0]} mat={M.panel} />
            <group ref={wrist} position={[0, 0, 0.34]}>
              <Servo running={running} />
              <group position={[0, 0, 0.06]}>
                <Box args={[0.32, 0.26, 0.05]} mat={{ color: accent, metalness: 0.4, roughness: 0.45 }} />
                {([[-0.1, -0.08], [0.1, -0.08], [-0.1, 0.08], [0.1, 0.08]] as const).map(([x, y], i) => <Cyl key={i} r={0.04} h={0.05} position={[x, y, 0.05]} rotation={[Math.PI / 2, 0, 0]} mat={M.rubber} />)}
                <Box args={[0.5, 0.7, 0.016]} position={[0, 0, 0.08]} mat={M.board} />
                {labels && <Tag position={[0.28, 0, 0.05]} title="Vacuum gripper" sub="concept · 4× cup" />}
              </group>
            </group>
          </group>
        </group>
      </group>
      <EStop position={[0.32, 0.4, 0.28]} labels={labels} />
    </group>
  );
}

/* ================================ FINISHER =============================== */

function FinisherUnit({ e, clip, labels, running, t, accent }: Ctx) {
  const carriage = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  useFrame(() => {
    if (carriage.current) carriage.current.position.y = 0.5 + pingpong(t.current / 6) * 0.7;
    if (arm.current) arm.current.rotation.y = Math.sin(t.current * 1.4) * 0.5;
    if (wrist.current) wrist.current.rotation.x = Math.sin(t.current * 2.0) * 0.15;
  });
  return (
    <group>
      <Box args={[1.4, 1.6, 0.04]} position={[-0.75, 0.9, 0]} rotation={[0, Math.PI / 2, 0]} mat={M.board} />
      <Panel args={[0.8, 0.2, 0.6]} position={[0, 0.24, 0]} color={accent} clip={clip} />
      {[-0.44, 0.44].map((x, i) => <Box key={i} args={[0.1, 0.16, 0.64]} position={[x, 0.12, 0]} mat={M.rubber} />)}
      <group position={[0, 0.24 - e * 0.5, 0]}>
        <Core clip={clip} labels={labels} extra={{ pos: [0, -0.13, 0.22], title: "Dust capture", sub: "concept · ~99%" }} />
      </group>
      <Box args={[0.14, 1.4, 0.14]} position={[0, 1.0, -0.1]} mat={M.panel} clip={clip} />
      <Cyl r={0.02} h={1.3} position={[0, 1.0, -0.1]} mat={M.steel} />
      {labels && <Tag position={[0.12, 1.5, -0.1]} title="Lift mast" sub="concept · ballscrew" />}
      <group ref={carriage} position={[0, 0.5, -0.02]}>
        <Box args={[0.2, 0.14, 0.14]} mat={M.dark} clip={clip} />
        <group ref={arm}>
          <Servo running={running} labels={labels} tag="Reach servo" tagPos={[0.14, 0, 0]} />
          <Box args={[0.07, 0.07, 0.34]} position={[0, 0, 0.2]} mat={M.panel} />
          <group ref={wrist} position={[0, 0, 0.4]}>
            <Box args={[0.22, 0.18, 0.14]} mat={{ color: accent, metalness: 0.5, roughness: 0.4 }} />
            <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.1, 24, 1, true]} /><meshStandardMaterial {...M.copper} side={THREE.DoubleSide} /></mesh>
            <Spinner rpm={2800} axis="z" running={running}>
              <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.1, 0.1, 0.016, 40]} /><meshStandardMaterial color="#5a4632" roughness={0.98} /></mesh>
            </Spinner>
            {labels && <Tag position={[0.16, 0.04, 0.1]} title="Sanding head" sub="concept · BLDC ~2800 rpm" />}
          </group>
        </group>
      </group>
      <EStop position={[0.34, 0.4, 0.26]} labels={labels} />
    </group>
  );
}

/* ================================== QA =================================== */

function QAUnit({ e, clip, labels, running, t, accent }: Ctx) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame(() => {
    if (root.current) root.current.position.x = (pingpong(t.current / 6) - 0.5) * 1.1;
    if (head.current) head.current.rotation.y = Math.sin(t.current * 1.1) * 0.4;
    spin.current = (t.current * 3) % TAU;
  });
  return (
    <group>
      <Box args={[1.6, 1.5, 0.04]} position={[0, 0.85, -0.7]} mat={M.board} />
      <group ref={root}>
        <Panel args={[0.6, 0.16, 0.5]} position={[0, 0.18, 0]} color={accent} clip={clip} />
        {([[-0.26, -0.2], [0.26, -0.2], [-0.26, 0.2], [0.26, 0.2]] as const).map(([x, z], i) => <Wheel key={i} position={[x, 0.09, z]} r={0.08} spin={spin} />)}
        <group position={[0, 0.18 - e * 0.45, 0]}>
          <Core clip={clip} labels={labels} extra={{ pos: [0.3, 0.02, 0.16], title: "Lidar motor", sub: "concept · scan drive" }} />
        </group>
        <Box args={[0.1, 0.9, 0.1]} position={[0, 0.7, 0]} mat={M.panel} clip={clip} />
        {labels && <Tag position={[0.12, 0.9, 0]} title="Sensor mast" sub="concept · lift" />}
        <group ref={head} position={[0, 1.15 + e * 0.4, 0.02]}>
          <Panel args={[0.24, 0.14, 0.12]} color={accent} radius={0.02} />
          <Cyl r={0.035} h={0.04} position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]} mat={M.glass} />
          <mesh position={[0, 0, 0.06]}><torusGeometry args={[0.06, 0.008, 8, 28]} /><meshStandardMaterial color="#eaf4ff" emissive="#cfe8ff" emissiveIntensity={1.4} toneMapped={false} /></mesh>
          <group position={[0, 0.11, 0]}>
            <Spinner rpm={300} axis="y" running={running}><Cyl r={0.03} h={0.035} mat={M.dark} /><Box args={[0.015, 0.008, 0.05]} position={[0.025, 0, 0]} mat={M.steel} /></Spinner>
          </group>
          {labels && <Tag position={[0.15, 0.02, 0.06]} title="Vision cluster" sub="concept · camera · LED · lidar" />}
        </group>
      </group>
    </group>
  );
}

/* ================================= root ================================== */

export default function RobotInternals({ robot, accent, explode, cutaway, clipZ, labels, running, speed }: InternalsProps) {
  const gl = useThree((s) => s.gl);
  gl.localClippingEnabled = true;
  const clip = useMemo<THREE.Plane[]>(() => (cutaway ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ)] : []), [cutaway, clipZ]);
  const t = useRef(0);
  useFrame((_, dt) => { if (running) t.current += dt * speed; });

  const ctx: Ctx = { e: explode, clip, labels, running, t, accent };
  return (
    <group>
      <Environment preset="warehouse" environmentIntensity={0.75} />
      {robot === "amr" && <AMRUnit {...ctx} />}
      {robot === "cutter" && <CutterUnit {...ctx} />}
      {robot === "hanger" && <HangerUnit {...ctx} />}
      {robot === "finisher" && <FinisherUnit {...ctx} />}
      {robot === "qa" && <QAUnit {...ctx} />}
    </group>
  );
}
