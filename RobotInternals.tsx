"use client";

/**
 * RobotInternals — high-visibility inspection view for the DryForge "Finisher".
 *
 * IMPORTANT (product-honesty): this is a CONCEPT / design-intent representation.
 * DryForge has no deployed hardware, so dimensions, part counts and RPM figures
 * below are illustrative engineering targets, NOT measured values from a built
 * machine. Keep the on-screen "Concept" badge (see inspect/page.tsx) intact.
 *
 * Features:
 *  - PBR materials + image-based lighting (drei <Environment/>)
 *  - Exploded view: every sub-assembly separates along a signed axis by `explode`
 *  - Cutaway: real world-space clipping plane on the housing shells (`cutaway`,`clipZ`)
 *  - Labels: drei <Html/> callouts per component with concept spec + live RPM
 *  - Animated internals: sander disc, cooling fan, joint gearbox output spin when `running`
 */

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------- config ---------------------------------- */

export interface InternalsProps {
  explode: number;   // 0..1
  cutaway: boolean;
  clipZ: number;     // world Z of the cutting plane
  labels: boolean;
  running: boolean;
}

/** Concept spec targets — illustrative, not measured. Surfaced in labels. */
const RPM = { sander: 2800, fan: 3600, jointOut: 18 } as const;

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
  accent: { color: "#f59e0b", metalness: 0.4, roughness: 0.4 },
} as const;

/* ----------------------------- primitives -------------------------------- */

/** Enable local clipping once. */
function ClippingSetup() {
  const gl = useThree((s) => s.gl);
  gl.localClippingEnabled = true;
  return null;
}

/** A procedural spur gear (illustrative): hub + teeth ring. */
function Gear({
  teeth = 16,
  radius = 0.12,
  thickness = 0.04,
  ...mat
}: { teeth?: number; radius?: number; thickness?: number } & Partial<typeof MAT.steel>) {
  const positions = useMemo(
    () =>
      Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return [Math.cos(a) * radius, 0, Math.sin(a) * radius, a] as const;
      }),
    [teeth, radius],
  );
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, thickness, teeth * 2]} />
        <meshStandardMaterial {...MAT.steel} {...mat} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.28, radius * 0.28, thickness * 1.4, 20]} />
        <meshStandardMaterial {...MAT.brass} />
      </mesh>
      {positions.map(([x, , z, a], i) => (
        <mesh key={i} position={[x, 0, z]} rotation={[0, -a, 0]} castShadow>
          <boxGeometry args={[radius * 0.16, thickness, radius * 0.34]} />
          <meshStandardMaterial {...MAT.steel} {...mat} />
        </mesh>
      ))}
    </group>
  );
}

/** Label callout that only mounts when labels are on. */
function Tag({
  position,
  title,
  sub,
}: { position: [number, number, number]; title: string; sub?: string }) {
  return (
    <Html position={position} center distanceFactor={6} zIndexRange={[10, 0]} occlude={false}>
      <div
        style={{
          transform: "translate(14px,-50%)",
          whiteSpace: "nowrap",
          fontFamily: "ui-sans-serif, system-ui",
          fontSize: 11,
          lineHeight: 1.15,
          background: "rgba(9,14,22,0.9)",
          color: "#e6edf5",
          border: "1px solid rgba(245,158,11,0.5)",
          borderRadius: 6,
          padding: "4px 7px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ opacity: 0.7, fontSize: 10 }}>{sub}</div>}
      </div>
    </Html>
  );
}

/* --------------------------- sub-assemblies ------------------------------ */
/* Each returns a <group>; `off` is the exploded offset applied by the parent. */

function useSpin(rpm: number, running: boolean) {
  const ref = useRef<THREE.Group>(null);
  const radPerSec = (rpm * Math.PI * 2) / 60;
  useFrame((_, dt) => {
    if (ref.current && running) ref.current.rotation.y += radPerSec * dt;
  });
  return ref;
}

function TrackedChassis({ clip }: { clip: THREE.Plane[] }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.9, 0.22, 0.66]} />
        <meshStandardMaterial {...MAT.housing} clippingPlanes={clip} clipShadows />
      </mesh>
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.12, 0]}>
          <boxGeometry args={[0.09, 0.18, 0.72]} />
          <meshStandardMaterial {...MAT.rubber} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((x) =>
        [-0.28, 0.28].map((z, j) => (
          <mesh key={`${x}-${j}`} position={[x, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 18]} />
            <meshStandardMaterial {...MAT.steel} />
          </mesh>
        )),
      )}
    </group>
  );
}

function ComputeAndPower({ clip, labels }: { clip: THREE.Plane[]; labels: boolean }) {
  return (
    <group>
      {/* battery pack */}
      <mesh castShadow position={[0, 0, 0.12]}>
        <boxGeometry args={[0.5, 0.14, 0.3]} />
        <meshStandardMaterial {...MAT.battery} clippingPlanes={clip} />
      </mesh>
      {/* compute box */}
      <mesh castShadow position={[0, 0, -0.16]}>
        <boxGeometry args={[0.34, 0.12, 0.22]} />
        <meshStandardMaterial {...MAT.darkHousing} clippingPlanes={clip} />
      </mesh>
      {/* PCB peeking out */}
      <mesh position={[0, 0.02, -0.16]}>
        <boxGeometry args={[0.3, 0.01, 0.18]} />
        <meshStandardMaterial {...MAT.pcb} />
      </mesh>
      {labels && <Tag position={[0.26, 0.08, 0.12]} title="Battery pack" sub="concept · LFP, hot-swap" />}
      {labels && <Tag position={[-0.24, 0.08, -0.16]} title="Compute / SLAM" sub="concept · edge AI" />}
    </group>
  );
}

function CoolingFan({ running, labels }: { running: boolean; labels: boolean }) {
  const fan = useSpin(RPM.fan, running);
  return (
    <group position={[0.3, 0, -0.16]}>
      <mesh>
        <torusGeometry args={[0.07, 0.012, 8, 24]} />
        <meshStandardMaterial {...MAT.darkHousing} />
      </mesh>
      <group ref={fan}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.035, 0, Math.sin(a) * 0.035]} rotation={[0, -a, 0.5]}>
              <boxGeometry args={[0.05, 0.004, 0.022]} />
              <meshStandardMaterial {...MAT.steel} />
            </mesh>
          );
        })}
      </group>
      {labels && <Tag position={[0.3, 0.05, -0.16]} title="Cooling fan" sub={`concept · ~${RPM.fan} rpm`} />}
    </group>
  );
}

function LiftColumn({ clip }: { clip: THREE.Plane[] }) {
  return (
    <group position={[0, 0.7, -0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.16, 0.9, 0.16]} />
        <meshStandardMaterial {...MAT.housing} clippingPlanes={clip} />
      </mesh>
      {/* ball screw */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.86, 16]} />
        <meshStandardMaterial {...MAT.steel} />
      </mesh>
      {/* linear rails */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.07]}>
          <boxGeometry args={[0.02, 0.86, 0.02]} />
          <meshStandardMaterial {...MAT.steel} />
        </mesh>
      ))}
    </group>
  );
}

/** Servo joint = motor rotor + planetary/spur gear stack. */
function ServoJoint({ running, labels, tag }: { running: boolean; labels: boolean; tag: string }) {
  const out = useSpin(RPM.jointOut, running);
  return (
    <group>
      {/* motor housing */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.16, 24]} />
        <meshStandardMaterial {...MAT.darkHousing} />
      </mesh>
      {/* copper stator windings hint */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 24, 1, true]} />
        <meshStandardMaterial {...MAT.copper} side={THREE.DoubleSide} />
      </mesh>
      {/* gearbox output — spins */}
      <group ref={out} position={[0, 0, 0.11]}>
        <Gear teeth={20} radius={0.08} thickness={0.03} />
      </group>
      {labels && <Tag position={[0.14, 0.05, 0.11]} title={tag} sub={`concept · harmonic drive · ~${RPM.jointOut} rpm out`} />}
    </group>
  );
}

function EndEffector({ running, labels, clip }: { running: boolean; labels: boolean; clip: THREE.Plane[] }) {
  const disc = useSpin(RPM.sander, running);
  return (
    <group position={[0, 0, 0.34]}>
      {/* tool head housing (cutaway-able) */}
      <mesh castShadow>
        <boxGeometry args={[0.26, 0.2, 0.16]} />
        <meshStandardMaterial {...MAT.accent} metalness={0.5} roughness={0.4} clippingPlanes={clip} />
      </mesh>
      {/* BLDC rotor */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 24]} />
        <meshStandardMaterial {...MAT.steel} />
      </mesh>
      {/* sanding disc — spins */}
      <group ref={disc} position={[0, 0, 0.12]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.016, 40]} />
          <meshStandardMaterial color="#5a4632" roughness={0.98} metalness={0} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.06, 0.01, Math.sin(a) * 0.06]}>
              <boxGeometry args={[0.01, 0.004, 0.01]} />
              <meshStandardMaterial color="#3a2d20" />
            </mesh>
          );
        })}
      </group>
      {/* mud/tape feed line */}
      <mesh position={[0.1, 0, -0.1]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 10]} />
        <meshStandardMaterial {...MAT.rubber} />
      </mesh>
      {labels && <Tag position={[0.16, 0.05, 0.14]} title="Sanding head" sub={`concept · BLDC · ~${RPM.sander} rpm`} />}
    </group>
  );
}

function EStop({ labels }: { labels: boolean }) {
  return (
    <group position={[0.34, 0.34, 0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 24]} />
        <meshStandardMaterial color="#f5c518" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.03, 24]} />
        <meshStandardMaterial {...MAT.eStop} />
      </mesh>
      {labels && <Tag position={[0.12, 0.34, 0.2]} title="E-stop" sub="safety switch" />}
    </group>
  );
}

/* ------------------------------- root ------------------------------------ */

export default function RobotInternals({ explode, cutaway, clipZ, labels, running }: InternalsProps) {
  // Cutaway plane: reveal internals along +Z. Normal points -Z so geometry
  // in front of the plane (z > clipZ) is discarded.
  const clip = useMemo<THREE.Plane[]>(
    () => (cutaway ? [new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ)] : []),
    [cutaway, clipZ],
  );

  const e = explode;
  return (
    <group>
      <ClippingSetup />
      <Environment preset="warehouse" environmentIntensity={0.7} />

      {/* Base / chassis — anchored, others explode relative to it */}
      <group position={[0, 0, 0]}>
        <TrackedChassis clip={clip} />
      </group>

      {/* Power + compute drop DOWN out of the chassis */}
      <group position={[0, 0.24 - e * 0.7, 0]}>
        <ComputeAndPower clip={clip} labels={labels} />
        <CoolingFan running={running} labels={labels} />
      </group>

      {/* Lift column rises UP */}
      <group position={[0, e * 0.5, 0]}>
        <LiftColumn clip={clip} />
      </group>

      {/* Shoulder joint pushes +Y */}
      <group position={[0, 1.15 + e * 0.35, -0.1]}>
        <ServoJoint running={running} labels={labels} tag="Shoulder servo" />
      </group>

      {/* Elbow joint pushes forward +Z */}
      <group position={[0, 1.15, 0.08 + e * 0.45]} rotation={[0, 0, 0]}>
        <ServoJoint running={running} labels={labels} tag="Elbow servo" />
      </group>

      {/* End-effector pushes furthest +Z */}
      <group position={[0, 1.15, 0.08 + e * 1.0]}>
        <EndEffector running={running} labels={labels} clip={clip} />
      </group>

      {/* E-stop pops out +X */}
      <group position={[e * 0.4, 0, 0]}>
        <EStop labels={labels} />
      </group>
    </group>
  );
}
