"use client";

/**
 * RobotInternals — high-visibility inspection view for the DryForge fleet.
 *
 * PRODUCT-HONESTY: concept / design-intent representation. No DryForge hardware
 * is built, so dimensions, part counts and RPM are illustrative engineering
 * targets, NOT measured values. Keep the "Concept" badge (inspect/page.tsx).
 *
 * Design principle for "all robots": the five units share ONE platform
 * (chassis, power, compute, cooling, e-stop) and differ by ARM presence and
 * TOOL HEAD — the parts that genuinely differ by function. We do not invent
 * five distinct internal drivetrains.
 *
 *   amr      mobile lift, NO arm, lift fork          (no spinning tool)
 *   cutter   arm + routing spindle                   (~18000 rpm bit)
 *   hanger   arm + vacuum gripper                     (suction, pump ~1500 rpm)
 *   finisher arm + sanding/taping head                (~2800 rpm disc)
 *   qa       arm + camera/sensor cluster              (no spinning tool)
 */

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import type { RobotId } from "../../lib/fleet";

export interface InternalsProps {
  robot: RobotId;
  accent: string;
  explode: number;   // 0..1
  cutaway: boolean;
  clipZ: number;     // world Z of the cutting plane
  labels: boolean;
  running: boolean;
}

/** Per-robot config. All RPM figures are illustrative concept targets. */
const ROBOT_CFG: Record<RobotId, { hasArm: boolean; tool: string; toolRpm: number | null }> = {
  amr: { hasArm: false, tool: "Smart lift fork", toolRpm: null },
  cutter: { hasArm: true, tool: "Routing spindle", toolRpm: 18000 },
  hanger: { hasArm: true, tool: "Vacuum gripper", toolRpm: 1500 },
  finisher: { hasArm: true, tool: "Sanding head", toolRpm: 2800 },
  qa: { hasArm: true, tool: "Vision sensor cluster", toolRpm: null },
};
const FAN_RPM = 3600;
const JOINT_RPM = 18;

const MAT = {
  housing: { color: "#c9d2dd", metalness: 0.35, roughness: 0.42 },
  darkHousing: { color: "#2a3444", metalness: 0.5, roughness: 0.5 },
  steel: { color: "#aab3c0", metalness: 0.9, roughness: 0.28 },
  brass: { color: "#c8a24a", metalness: 0.95, roughness: 0.32 },
  copper: { color: "#b56a41", metalness: 0.95, roughness: 0.35 },
  rubber: { color: "#12161d", metalness: 0.0, roughness: 0.95 },
  pcb: { color: "#0f5132", metalness: 0.2, roughness: 0.6 },
  battery: { color: "#1f6feb", metalness: 0.3, roughness: 0.5 },
  eStop: { color: "#e11d2e", metalness: 0.2, roughness: 0.5 },
  glass: { color: "#0b1a2a", metalness: 0.1, roughness: 0.08 },
} as const;

/* ------------------------------ helpers ---------------------------------- */

function ClippingSetup() {
  const gl = useThree((s) => s.gl);
  gl.localClippingEnabled = true;
  return null;
}

function useSpin(rpm: number | null, running: boolean, axis: "x" | "y" | "z" = "y") {
  const ref = useRef<THREE.Group>(null);
  const radPerSec = rpm ? (rpm * Math.PI * 2) / 60 : 0;
  useFrame((_, dt) => {
    if (ref.current && running && rpm) ref.current.rotation[axis] += radPerSec * dt;
  });
  return ref;
}

function Gear({ teeth = 16, radius = 0.12, thickness = 0.04 }: { teeth?: number; radius?: number; thickness?: number }) {
  const positions = useMemo(
    () => Array.from({ length: teeth }, (_, i) => {
      const a = (i / teeth) * Math.PI * 2;
      return [Math.cos(a) * radius, 0, Math.sin(a) * radius, a] as const;
    }),
    [teeth, radius],
  );
  return (
    <group>
      <mesh castShadow><cylinderGeometry args={[radius, radius, thickness, teeth * 2]} /><meshStandardMaterial {...MAT.steel} /></mesh>
      <mesh><cylinderGeometry args={[radius * 0.28, radius * 0.28, thickness * 1.4, 20]} /><meshStandardMaterial {...MAT.brass} /></mesh>
      {positions.map(([x, , z, a], i) => (
        <mesh key={i} position={[x, 0, z]} rotation={[0, -a, 0]} castShadow>
          <boxGeometry args={[radius * 0.16, thickness, radius * 0.34]} /><meshStandardMaterial {...MAT.steel} />
        </mesh>
      ))}
    </group>
  );
}

function Tag({ position, title, sub }: { position: [number, number, number]; title: string; sub?: string }) {
  return (
    <Html position={position} center distanceFactor={6} zIndexRange={[10, 0]} occlude={false}>
      <div style={{
        transform: "translate(14px,-50%)", whiteSpace: "nowrap", fontFamily: "ui-sans-serif, system-ui",
        fontSize: 11, lineHeight: 1.15, background: "rgba(9,14,22,0.9)", color: "#e6edf5",
        border: "1px solid rgba(245,158,11,0.5)", borderRadius: 6, padding: "4px 7px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)", pointerEvents: "none",
      }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ opacity: 0.7, fontSize: 10 }}>{sub}</div>}
      </div>
    </Html>
  );
}

/* --------------------------- shared platform ----------------------------- */

function TrackedChassis({ clip }: { clip: THREE.Plane[] }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.22, 0]}><boxGeometry args={[0.9, 0.22, 0.66]} /><meshStandardMaterial {...MAT.housing} clippingPlanes={clip} clipShadows /></mesh>
      {[-0.5, 0.5].map((x, i) => <mesh key={i} castShadow position={[x, 0.12, 0]}><boxGeometry args={[0.09, 0.18, 0.72]} /><meshStandardMaterial {...MAT.rubber} /></mesh>)}
      {[-0.5, 0.5].map((x) => [-0.28, 0.28].map((z, j) => (
        <mesh key={`${x}-${j}`} position={[x, 0.1, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.08, 0.08, 0.1, 18]} /><meshStandardMaterial {...MAT.steel} /></mesh>
      )))}
    </group>
  );
}

function ComputeAndPower({ clip, labels }: { clip: THREE.Plane[]; labels: boolean }) {
  return (
    <group>
      <mesh castShadow position={[0, 0, 0.12]}><boxGeometry args={[0.5, 0.14, 0.3]} /><meshStandardMaterial {...MAT.battery} clippingPlanes={clip} /></mesh>
      <mesh castShadow position={[0, 0, -0.16]}><boxGeometry args={[0.34, 0.12, 0.22]} /><meshStandardMaterial {...MAT.darkHousing} clippingPlanes={clip} /></mesh>
      <mesh position={[0, 0.02, -0.16]}><boxGeometry args={[0.3, 0.01, 0.18]} /><meshStandardMaterial {...MAT.pcb} /></mesh>
      {labels && <Tag position={[0.26, 0.08, 0.12]} title="Battery pack" sub="concept · LFP, hot-swap" />}
      {labels && <Tag position={[-0.24, 0.08, -0.16]} title="Compute / SLAM" sub="concept · edge AI" />}
    </group>
  );
}

function CoolingFan({ running, labels }: { running: boolean; labels: boolean }) {
  const fan = useSpin(FAN_RPM, running);
  return (
    <group position={[0.3, 0, -0.16]}>
      <mesh><torusGeometry args={[0.07, 0.012, 8, 24]} /><meshStandardMaterial {...MAT.darkHousing} /></mesh>
      <group ref={fan}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 0.035, 0, Math.sin(a) * 0.035]} rotation={[0, -a, 0.5]}><boxGeometry args={[0.05, 0.004, 0.022]} /><meshStandardMaterial {...MAT.steel} /></mesh>;
        })}
      </group>
      {labels && <Tag position={[0.3, 0.05, -0.16]} title="Cooling fan" sub={`concept · ~${FAN_RPM} rpm`} />}
    </group>
  );
}

function LiftColumn({ clip }: { clip: THREE.Plane[] }) {
  return (
    <group position={[0, 0.7, -0.1]}>
      <mesh castShadow><boxGeometry args={[0.16, 0.9, 0.16]} /><meshStandardMaterial {...MAT.housing} clippingPlanes={clip} /></mesh>
      <mesh><cylinderGeometry args={[0.022, 0.022, 0.86, 16]} /><meshStandardMaterial {...MAT.steel} /></mesh>
      {[-0.06, 0.06].map((x, i) => <mesh key={i} position={[x, 0, 0.07]}><boxGeometry args={[0.02, 0.86, 0.02]} /><meshStandardMaterial {...MAT.steel} /></mesh>)}
    </group>
  );
}

function ServoJoint({ running, labels, tag }: { running: boolean; labels: boolean; tag: string }) {
  const out = useSpin(JOINT_RPM, running, "z");
  return (
    <group>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.16, 24]} /><meshStandardMaterial {...MAT.darkHousing} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.1, 24, 1, true]} /><meshStandardMaterial {...MAT.copper} side={THREE.DoubleSide} /></mesh>
      <group ref={out} position={[0, 0, 0.11]}><Gear teeth={20} radius={0.08} thickness={0.03} /></group>
      {labels && <Tag position={[0.14, 0.05, 0.11]} title={tag} sub={`concept · harmonic drive · ~${JOINT_RPM} rpm out`} />}
    </group>
  );
}

function EStop({ labels }: { labels: boolean }) {
  return (
    <group position={[0.34, 0.34, 0.2]}>
      <mesh castShadow><cylinderGeometry args={[0.05, 0.05, 0.03, 24]} /><meshStandardMaterial color="#f5c518" roughness={0.6} /></mesh>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.035, 0.04, 0.03, 24]} /><meshStandardMaterial {...MAT.eStop} /></mesh>
      {labels && <Tag position={[0.12, 0.34, 0.2]} title="E-stop" sub="safety switch" />}
    </group>
  );
}

/* ------------------------- per-robot tool heads --------------------------- */

function SanderHead({ running, accent, labels }: { running: boolean; accent: string; labels: boolean }) {
  const disc = useSpin(2800, running, "z");
  return (
    <group>
      <mesh castShadow><boxGeometry args={[0.26, 0.2, 0.16]} /><meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.1, 24]} /><meshStandardMaterial {...MAT.steel} /></mesh>
      <group ref={disc} position={[0, 0, 0.12]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 0.016, 40]} /><meshStandardMaterial color="#5a4632" roughness={0.98} /></mesh>
      </group>
      {labels && <Tag position={[0.16, 0.05, 0.14]} title="Sanding head" sub="concept · BLDC · ~2800 rpm" />}
    </group>
  );
}

function RoutingHead({ running, accent, labels }: { running: boolean; accent: string; labels: boolean }) {
  const bit = useSpin(18000, running, "z");
  return (
    <group>
      <mesh castShadow><boxGeometry args={[0.2, 0.24, 0.16]} /><meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.05]}><cylinderGeometry args={[0.045, 0.045, 0.14, 24]} /><meshStandardMaterial {...MAT.darkHousing} /></mesh>
      <group ref={bit} position={[0, 0, 0.16]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 0.1, 12]} /><meshStandardMaterial {...MAT.steel} /></mesh>
      </group>
      {/* dust shroud */}
      <mesh position={[0, -0.02, 0.16]}><cylinderGeometry args={[0.06, 0.06, 0.06, 20, 1, true]} /><meshStandardMaterial {...MAT.darkHousing} side={THREE.DoubleSide} /></mesh>
      {labels && <Tag position={[0.14, 0.05, 0.16]} title="Routing spindle" sub="concept · ~18000 rpm bit" />}
    </group>
  );
}

function VacuumGripper({ accent, labels }: { accent: string; labels: boolean }) {
  const cups = [-0.09, 0.09].flatMap((x) => [-0.07, 0.07].map((y) => [x, y] as const));
  return (
    <group>
      <mesh castShadow><boxGeometry args={[0.28, 0.24, 0.06]} /><meshStandardMaterial color={accent} metalness={0.4} roughness={0.45} /></mesh>
      {cups.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.05]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.05, 0.05, 20]} /><meshStandardMaterial {...MAT.rubber} /></mesh>
      ))}
      {/* vacuum line */}
      <mesh position={[0.1, 0.08, -0.06]} rotation={[0.3, 0, 0]}><cylinderGeometry args={[0.014, 0.014, 0.3, 12]} /><meshStandardMaterial {...MAT.rubber} /></mesh>
      {labels && <Tag position={[0.18, 0.05, 0.05]} title="Vacuum gripper" sub="concept · 4× suction · pump-fed" />}
    </group>
  );
}

function SensorHead({ accent, labels }: { accent: string; labels: boolean }) {
  return (
    <group>
      <mesh castShadow><boxGeometry args={[0.24, 0.14, 0.12]} /><meshStandardMaterial color={accent} metalness={0.4} roughness={0.45} /></mesh>
      {/* camera lens */}
      <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.04, 24]} /><meshStandardMaterial {...MAT.glass} /></mesh>
      {/* LED ring */}
      <mesh position={[0, 0, 0.06]}><torusGeometry args={[0.06, 0.008, 8, 28]} /><meshStandardMaterial color="#ffffff" emissive="#eaf4ff" emissiveIntensity={1.2} toneMapped={false} /></mesh>
      {/* lidar puck */}
      <mesh position={[0, 0.09, 0]}><cylinderGeometry args={[0.03, 0.03, 0.03, 20]} /><meshStandardMaterial {...MAT.darkHousing} /></mesh>
      {labels && <Tag position={[0.15, 0.05, 0.06]} title="Vision cluster" sub="concept · camera · LED · lidar" />}
    </group>
  );
}

function LiftFork({ accent, labels }: { accent: string; labels: boolean }) {
  return (
    <group position={[0, 0.34, 0.42]}>
      {/* carriage */}
      <mesh castShadow><boxGeometry args={[0.5, 0.1, 0.1]} /><meshStandardMaterial color={accent} metalness={0.4} roughness={0.45} /></mesh>
      {/* fork tines */}
      {[-0.16, 0.16].map((x, i) => <mesh key={i} castShadow position={[x, -0.05, 0.22]}><boxGeometry args={[0.06, 0.03, 0.44]} /><meshStandardMaterial {...MAT.steel} /></mesh>)}
      {labels && <Tag position={[0.28, 0.05, 0]} title="Smart lift fork" sub="concept · payload carriage" />}
    </group>
  );
}

function ToolHead({ robot, accent, running, labels }: { robot: RobotId; accent: string; running: boolean; labels: boolean }) {
  switch (robot) {
    case "cutter": return <RoutingHead running={running} accent={accent} labels={labels} />;
    case "hanger": return <VacuumGripper accent={accent} labels={labels} />;
    case "qa": return <SensorHead accent={accent} labels={labels} />;
    case "finisher":
    default: return <SanderHead running={running} accent={accent} labels={labels} />;
  }
}

/* ------------------------------- root ------------------------------------ */

export default function RobotInternals({ robot, accent, explode, cutaway, clipZ, labels, running }: InternalsProps) {
  const cfg = ROBOT_CFG[robot];
  const clip = useMemo<THREE.Plane[]>(
    () => (cutaway ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ)] : []),
    [cutaway, clipZ],
  );
  const e = explode;

  return (
    <group>
      <ClippingSetup />
      <Environment preset="warehouse" environmentIntensity={0.7} />

      <group position={[0, 0, 0]}><TrackedChassis clip={clip} /></group>

      <group position={[0, 0.24 - e * 0.7, 0]}>
        <ComputeAndPower clip={clip} labels={labels} />
        <CoolingFan running={running} labels={labels} />
      </group>

      <group position={[0, e * 0.5, 0]}><LiftColumn clip={clip} /></group>

      {cfg.hasArm ? (
        <>
          <group position={[0, 1.15 + e * 0.35, -0.1]}><ServoJoint running={running} labels={labels} tag="Shoulder servo" /></group>
          <group position={[0, 1.15, 0.08 + e * 0.45]}><ServoJoint running={running} labels={labels} tag="Elbow servo" /></group>
          <group position={[0, 1.15, 0.34 + e * 1.0]}><ToolHead robot={robot} accent={accent} running={running} labels={labels} /></group>
        </>
      ) : (
        // AMR: no arm — lift fork rides the base
        <group position={[0, e * 0.3, e * 0.5]}><LiftFork accent={accent} labels={labels} /></group>
      )}

      <group position={[e * 0.4, 0, 0]}><EStop labels={labels} /></group>
    </group>
  );
}
