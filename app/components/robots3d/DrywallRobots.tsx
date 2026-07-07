"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RobotId } from "../../lib/fleet";

const DARK = "#1E293B";
const STEEL = "#94A3B8";
const GYPSUM = "#EDE9E0";

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01(t: number) { return Math.min(1, Math.max(0, t)); }

/* ---- shared wheeled base ---- */
function Wheels({ running, w = 0.6, d = 0.44, y = 0.09 }: { running: boolean; w?: number; d?: number; y?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current && running) g.current.children.forEach((c) => (c.rotation.x -= dt * 6)); });
  const xs = [-w / 2, w / 2];
  const zs = [-d / 2, d / 2];
  return (
    <group ref={g}>
      {xs.flatMap((x) => zs.map((z) => (
        <mesh key={`${x}${z}`} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} />
          <meshStandardMaterial color={DARK} roughness={0.7} />
        </mesh>
      )))}
    </group>
  );
}

function Base({ color, w = 0.7, h = 0.24, d = 0.55 }: { color: string; w?: number; h?: number; d?: number }) {
  return (
    <mesh castShadow position={[0, 0.22, 0]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />
    </mesh>
  );
}

/* ============================ 1. FINISHER ============================ */
function Finisher({ running, accent }: { running: boolean; accent: string }) {
  const shoulder = useRef<THREE.Group>(null);
  const forearm = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = running ? s.clock.getElapsedTime() : 0;
    const sweep = Math.sin(t * 1.1); // up/down pass
    if (shoulder.current) shoulder.current.rotation.x = lerp(-0.15, -0.95, (sweep + 1) / 2);
    if (forearm.current) forearm.current.rotation.x = lerp(0.5, 1.2, (sweep + 1) / 2);
    if (disc.current && running) disc.current.rotation.z -= 0.6;
  });
  return (
    <group>
      <Base color={accent} />
      <Wheels running={running} />
      {/* vertical mast */}
      <mesh position={[0, 1.05, -0.18]}><boxGeometry args={[0.14, 1.7, 0.14]} /><meshStandardMaterial color={STEEL} metalness={0.3} roughness={0.4} /></mesh>
      {/* arm assembly on mast */}
      <group ref={shoulder} position={[0, 1.55, -0.12]}>
        <mesh position={[0, 0, 0.28]}><boxGeometry args={[0.1, 0.1, 0.6]} /><meshStandardMaterial color={DARK} /></mesh>
        <group ref={forearm} position={[0, 0, 0.56]}>
          <mesh position={[0, 0, 0.22]}><boxGeometry args={[0.08, 0.08, 0.46]} /><meshStandardMaterial color={DARK} /></mesh>
          {/* end effector: sanding disc + spray nozzle */}
          <group position={[0, 0, 0.46]}>
            <mesh ref={disc} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.03, 24]} /><meshStandardMaterial color={accent} roughness={0.6} /></mesh>
            <mesh position={[0.14, 0, 0]}><boxGeometry args={[0.05, 0.05, 0.12]} /><meshStandardMaterial color={STEEL} /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ============================ 2. HANGER ============================ */
function Hanger({ running, accent }: { running: boolean; accent: string }) {
  const arm = useRef<THREE.Group>(null);
  const sheet = useRef<THREE.Group>(null);
  const driver = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = running ? (s.clock.getElapsedTime() * 0.28) % 1 : 0;
    // 0-0.35 raise flat->vertical, 0.35-0.55 push to wall, 0.55-0.85 fasten, 0.85-1 reset
    let pitch = -Math.PI / 2, push = 0, spin = 0;
    if (t < 0.35) pitch = lerp(-Math.PI / 2, 0, clamp01(t / 0.35));
    else if (t < 0.55) { pitch = 0; push = lerp(0, 0.18, clamp01((t - 0.35) / 0.2)); }
    else if (t < 0.85) { pitch = 0; push = 0.18; spin = 1; }
    else { pitch = lerp(0, -Math.PI / 2, clamp01((t - 0.85) / 0.15)); }
    if (arm.current) arm.current.rotation.x = pitch;
    if (sheet.current) sheet.current.position.z = 0.5 + push;
    if (driver.current && spin) driver.current.rotation.z -= 0.8;
  });
  return (
    <group>
      <Base color={accent} w={0.8} d={0.62} />
      <Wheels running={running} w={0.72} d={0.5} />
      <mesh position={[0, 0.7, -0.2]}><boxGeometry args={[0.18, 0.9, 0.18]} /><meshStandardMaterial color={STEEL} metalness={0.3} /></mesh>
      <group ref={arm} position={[0, 1.05, -0.12]}>
        {/* holds sheet */}
        <group ref={sheet} position={[0, 0, 0.5]}>
          <mesh castShadow><boxGeometry args={[1.15, 0.02, 0.78]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} /></mesh>
          {/* vacuum grippers */}
          {[[-0.35, 0.2], [0.35, 0.2], [-0.35, -0.2], [0.35, -0.2]].map(([x, z], i) => (
            <mesh key={i} position={[x, -0.06, z]}><cylinderGeometry args={[0.06, 0.06, 0.1, 12]} /><meshStandardMaterial color={DARK} /></mesh>
          ))}
          {/* fastener driver */}
          <mesh ref={driver} position={[0.5, 0.08, 0.3]}><cylinderGeometry args={[0.03, 0.03, 0.14, 10]} /><meshStandardMaterial color={accent} /></mesh>
        </group>
      </group>
    </group>
  );
}

/* ============================ 3. CUTTER (gantry) ============================ */
function Cutter({ running, accent }: { running: boolean; accent: string }) {
  const carriage = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const cut = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = running ? (s.clock.getElapsedTime() * 0.3) % 1 : 0;
    if (carriage.current) carriage.current.position.x = lerp(-0.55, 0.55, t);
    if (head.current && running) head.current.rotation.y += 0.4;
    if (cut.current) { cut.current.scale.x = Math.max(0.001, t); cut.current.position.x = lerp(-0.55, 0, t); }
  });
  return (
    <group>
      {/* table + sheet */}
      <mesh position={[0, 0.35, 0]}><boxGeometry args={[1.5, 0.08, 1.0]} /><meshStandardMaterial color={DARK} roughness={0.8} /></mesh>
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.35, 0.02, 0.85]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} /></mesh>
      {/* cut line */}
      <mesh ref={cut} position={[0, 0.42, 0]}><boxGeometry args={[1.1, 0.008, 0.015]} /><meshStandardMaterial color="#334155" /></mesh>
      {/* gantry legs + rail */}
      {[[-0.7, 0.5], [0.7, 0.5], [-0.7, -0.5], [0.7, -0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.7, z]}><boxGeometry args={[0.06, 0.7, 0.06]} /><meshStandardMaterial color={STEEL} /></mesh>
      ))}
      <mesh position={[0, 1.03, 0.5]}><boxGeometry args={[1.5, 0.06, 0.06]} /><meshStandardMaterial color={STEEL} /></mesh>
      <mesh position={[0, 1.03, -0.5]}><boxGeometry args={[1.5, 0.06, 0.06]} /><meshStandardMaterial color={STEEL} /></mesh>
      {/* carriage travels X, holds a cutting head that reaches down */}
      <group ref={carriage} position={[0, 1.03, 0]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.12, 0.1, 1.0]} /><meshStandardMaterial color={accent} /></mesh>
        <mesh position={[0, -0.32, 0]}><boxGeometry args={[0.08, 0.55, 0.08]} /><meshStandardMaterial color={DARK} /></mesh>
        <mesh ref={head} position={[0, -0.6, 0]}><cylinderGeometry args={[0.07, 0.05, 0.12, 16]} /><meshStandardMaterial color={accent} metalness={0.4} /></mesh>
      </group>
    </group>
  );
}

/* ============================ 4. AMR + lift ============================ */
function Amr({ running, accent }: { running: boolean; accent: string }) {
  const body = useRef<THREE.Group>(null);
  const lift = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    if (body.current && running) body.current.position.x = Math.sin(t * 0.5) * 0.5;
    if (lift.current) lift.current.position.y = 0.5 + (running ? (Math.sin(t * 1.2) * 0.5 + 0.5) * 0.25 : 0);
  });
  return (
    <group ref={body}>
      <Base color={accent} w={0.9} h={0.2} d={0.7} />
      <Wheels running={running} w={0.82} d={0.6} />
      {/* mast */}
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, 0.75, -0.28]}><boxGeometry args={[0.06, 1.0, 0.06]} /><meshStandardMaterial color={STEEL} /></mesh>
      ))}
      {/* fork lift carrying a stack of sheets */}
      <group ref={lift} position={[0, 0.5, 0.05]}>
        <mesh position={[0, -0.03, 0.2]}><boxGeometry args={[0.8, 0.04, 0.5]} /><meshStandardMaterial color={DARK} /></mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} castShadow position={[0, 0.03 + i * 0.05, 0.2]}><boxGeometry args={[0.75, 0.04, 0.46]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} /></mesh>
        ))}
      </group>
    </group>
  );
}

/* ============================ 5. QA scanner ============================ */
function Qa({ running, accent }: { running: boolean; accent: string }) {
  const barY = useRef<THREE.Group>(null);
  const bar = useRef<THREE.MeshStandardMaterial>(null);
  const cam = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    if (barY.current) barY.current.position.y = 1.0 + (running ? Math.sin(t * 1.4) * 0.55 : 0);
    if (bar.current) bar.current.emissiveIntensity = running ? 0.6 + Math.sin(t * 6) * 0.3 : 0.05;
    if (cam.current) cam.current.rotation.y = running ? Math.sin(t * 0.8) * 0.25 : 0;
  });
  return (
    <group>
      <Base color={STEEL} />
      <Wheels running={running} />
      <mesh position={[0, 0.9, -0.15]}><boxGeometry args={[0.1, 1.4, 0.1]} /><meshStandardMaterial color={DARK} /></mesh>
      {/* camera head */}
      <group ref={cam} position={[0, 1.6, -0.1]}>
        <mesh><boxGeometry args={[0.24, 0.14, 0.16]} /><meshStandardMaterial color={accent} /></mesh>
        <mesh position={[0, 0, 0.1]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#0b1220" metalness={0.6} roughness={0.2} /></mesh>
      </group>
      {/* raking-light bar reaching toward wall, sweeps vertically */}
      <group ref={barY} position={[0, 1.0, 0.35]}>
        <mesh><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial ref={bar} color={accent} emissive={accent} emissiveIntensity={0.4} /></mesh>
      </group>
    </group>
  );
}

export default function RobotModel({ id, running, accent }: { id: RobotId; running: boolean; accent: string }) {
  switch (id) {
    case "finisher": return <Finisher running={running} accent={accent} />;
    case "hanger": return <Hanger running={running} accent={accent} />;
    case "cutter": return <Cutter running={running} accent={accent} />;
    case "amr": return <Amr running={running} accent={accent} />;
    case "qa": return <Qa running={running} accent={accent} />;
  }
}
