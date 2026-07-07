"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RobotId } from "../../lib/fleet";

const DARK = "#151b26";
const PANEL = "#243044";
const STEEL = "#9aa6b6";
const RUBBER = "#0e131c";
const GYPSUM = "#EDE9E0";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => t * t * (3 - 2 * t);

export interface RobotProps {
  running: boolean;
  accent: string;
  progressRef?: React.MutableRefObject<number>;
  task?: string;
  idleRate?: number;
}

function useU(progressRef: React.MutableRefObject<number> | undefined, idleRate: number) {
  return (clock: number) => (progressRef ? progressRef.current : (clock * idleRate) % 1);
}

/* ------------------------------- shared parts ------------------------------- */
function Led({ position, color, on = true, size = 0.03 }: { position: [number, number, number]; color: string; on?: boolean; size?: number }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 10, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={on ? 1.4 : 0.05} toneMapped={false} />
    </mesh>
  );
}

function TrackBase({ color, w = 0.78, d = 0.62, running }: { color: string; w?: number; d?: number; running: boolean }) {
  const tracks = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (tracks.current && running) tracks.current.children.forEach((c, i) => { const m = c as THREE.Mesh; m.rotation.x -= dt * 3 * (i % 2 ? 1 : 1); }); });
  return (
    <group>
      {/* chassis */}
      <mesh castShadow position={[0, 0.2, 0]}><boxGeometry args={[w, 0.2, d]} /><meshStandardMaterial color={color} metalness={0.35} roughness={0.45} /></mesh>
      {/* skirt / panel line */}
      <mesh position={[0, 0.1, 0]}><boxGeometry args={[w + 0.02, 0.06, d + 0.02]} /><meshStandardMaterial color={PANEL} metalness={0.4} roughness={0.5} /></mesh>
      {/* rubber tracks */}
      {[-w / 2 - 0.02, w / 2 + 0.02].map((x, i) => (
        <mesh key={i} position={[x, 0.11, 0]}><boxGeometry args={[0.08, 0.16, d + 0.06]} /><meshStandardMaterial color={RUBBER} roughness={0.95} /></mesh>
      ))}
      {/* track lugs (spin illusion) */}
      <group ref={tracks}>
        {[-w / 2 - 0.02, w / 2 + 0.02].map((x, i) => (
          <mesh key={i} position={[x, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.08, 10]} /><meshStandardMaterial color="#05070b" /></mesh>
        ))}
      </group>
    </group>
  );
}

/* effects */
function SprayFan({ active, color }: { active: boolean; color: string }) {
  const drops = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!drops.current) return;
    const t = s.clock.getElapsedTime();
    drops.current.children.forEach((c, i) => {
      const ph = ((t * 1.6 + i * 0.17) % 1);
      c.position.z = ph * 0.28;
      const sc = (1 - ph) * (active ? 1 : 0);
      c.scale.setScalar(0.02 + sc * 0.03);
    });
  });
  return (
    <group>
      <mesh visible={active} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.14]}>
        <coneGeometry args={[0.11, 0.28, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.16 : 0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <group ref={drops}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[(i - 3) * 0.02, 0, 0]}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color={color} transparent opacity={active ? 0.5 : 0} /></mesh>
        ))}
      </group>
    </group>
  );
}
function Dust({ active }: { active: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.getElapsedTime();
    g.current.children.forEach((c, i) => {
      const ph = ((t * 0.9 + i * 0.3) % 1);
      c.position.set(Math.sin(i * 2 + t) * 0.06, ph * 0.18, 0.1);
      c.scale.setScalar((1 - ph) * (active ? 0.06 : 0));
    });
  });
  return (
    <group ref={g}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i}><sphereGeometry args={[1, 6, 6]} /><meshBasicMaterial color="#e5e7eb" transparent opacity={active ? 0.35 : 0} /></mesh>
      ))}
    </group>
  );
}
function Beacon({ running, color }: { running: boolean; color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current && running) g.current.rotation.y += dt * 6; });
  return (
    <group position={[0, 0, 0]}>
      <mesh><cylinderGeometry args={[0.05, 0.05, 0.08, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={running ? 0.8 : 0.1} transparent opacity={0.8} /></mesh>
      <group ref={g}><mesh position={[0, 0, 0.05]}><boxGeometry args={[0.11, 0.02, 0.04]} /><meshBasicMaterial color={color} transparent opacity={running ? 0.5 : 0} /></mesh></group>
    </group>
  );
}
function Lidar({ running }: { running: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current && running) g.current.rotation.y += dt * 10; });
  return (
    <group>
      <mesh><cylinderGeometry args={[0.09, 0.09, 0.06, 20]} /><meshStandardMaterial color={DARK} metalness={0.5} /></mesh>
      <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.08, 0.08, 0.05, 20]} /><meshStandardMaterial color="#0b0f16" /></mesh>
      <group ref={g}><mesh position={[0, 0.05, 0.05]}><boxGeometry args={[0.02, 0.03, 0.06]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} toneMapped={false} /></mesh></group>
    </group>
  );
}

/* =============================== 1. FINISHER =============================== */
function Finisher({ running, accent, progressRef, task, idleRate = 0.1 }: RobotProps) {
  const carriage = useRef<THREE.Group>(null);
  const yawJoint = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const tool = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Mesh>(null);
  const statusMat = useRef<THREE.MeshStandardMaterial>(null);
  const getU = useU(progressRef, idleRate);
  const isSand = useRef(false);
  const spraying = useRef(false);
  useFrame((s) => {
    const u = getU(s.clock.getElapsedTime());
    const bands = 6; const bf = u * bands; const band = Math.min(bands - 1, Math.floor(bf)); const frac = bf - band;
    const dir = band % 2 === 0;
    const yaw = (dir ? -0.6 + frac * 1.2 : 0.6 - frac * 1.2);
    if (carriage.current) carriage.current.position.y = 0.35 + easeInOut(u) * 1.75;
    if (yawJoint.current) yawJoint.current.rotation.y = yaw;
    if (elbow.current) elbow.current.rotation.x = 0.6 + Math.sin(u * Math.PI * 12) * 0.05;
    const sanding = task === "finish" ? u > 0.55 : false;
    isSand.current = sanding; spraying.current = running && !sanding;
    if (disc.current && running) disc.current.rotation.z -= sanding ? 1.0 : 0.4;
    if (statusMat.current) statusMat.current.emissiveIntensity = running ? 0.7 + Math.sin(s.clock.getElapsedTime() * 5) * 0.3 : 0.1;
  });
  return (
    <group>
      <TrackBase color={accent} running={running} />
      {/* compound hopper + pump */}
      <mesh position={[0, 0.5, -0.2]}><cylinderGeometry args={[0.15, 0.15, 0.34, 20]} /><meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.4} /></mesh>
      <mesh position={[0.24, 0.42, -0.2]}><boxGeometry args={[0.14, 0.2, 0.16]} /><meshStandardMaterial color={PANEL} /></mesh>
      {/* status strip */}
      <mesh position={[0, 0.34, 0.32]}><boxGeometry args={[0.4, 0.05, 0.02]} /><meshStandardMaterial ref={statusMat} color={accent} emissive={accent} emissiveIntensity={0.3} toneMapped={false} /></mesh>
      <Led position={[-0.3, 0.34, 0.32]} color="#22c55e" on={running} />
      {/* mast rails */}
      {[-0.1, 0.1].map((x) => (<mesh key={x} position={[x, 1.15, -0.16]}><boxGeometry args={[0.05, 1.9, 0.06]} /><meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.35} /></mesh>))}
      {/* carriage travels vertically */}
      <group ref={carriage} position={[0, 0.35, -0.13]}>
        <mesh><boxGeometry args={[0.3, 0.16, 0.12]} /><meshStandardMaterial color={PANEL} /></mesh>
        {/* yaw joint */}
        <group ref={yawJoint} position={[0, 0, 0.06]}>
          <mesh position={[0, 0, 0.02]}><cylinderGeometry args={[0.06, 0.06, 0.1, 16]} /><meshStandardMaterial color={DARK} /></mesh>
          {/* upper arm */}
          <mesh position={[0, 0, 0.24]}><boxGeometry args={[0.08, 0.08, 0.42]} /><meshStandardMaterial color={STEEL} metalness={0.4} /></mesh>
          <group ref={elbow} position={[0, 0, 0.44]}>
            <mesh><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color={accent} /></mesh>
            {/* forearm */}
            <mesh position={[0, 0, 0.2]}><boxGeometry args={[0.07, 0.07, 0.4]} /><meshStandardMaterial color={STEEL} metalness={0.4} /></mesh>
            <group ref={tool} position={[0, 0, 0.42]}>
              {/* tool turret */}
              <mesh><boxGeometry args={[0.14, 0.14, 0.1]} /><meshStandardMaterial color={DARK} /></mesh>
              {/* sanding disc + shroud */}
              <mesh ref={disc} position={[0, -0.02, 0.09]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.02, 24]} /><meshStandardMaterial color={accent} roughness={0.6} /></mesh>
              <mesh position={[0, -0.02, 0.07]}><torusGeometry args={[0.11, 0.015, 8, 24]} /><meshStandardMaterial color={PANEL} /></mesh>
              {/* spray nozzle */}
              <mesh position={[0.09, 0.02, 0.06]}><boxGeometry args={[0.04, 0.04, 0.1]} /><meshStandardMaterial color={STEEL} /></mesh>
              <group position={[0, 0, 0.06]}>
                <SprayFan active={task !== "finish" && running} color={accent} />
                <Dust active={task === "finish" && running} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* =============================== 2. HANGER =============================== */
function Hanger({ running, accent, progressRef, idleRate = 0.24 }: RobotProps) {
  const turn = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  const sheet = useRef<THREE.Group>(null);
  const gun = useRef<THREE.Group>(null);
  const bit = useRef<THREE.Mesh>(null);
  const getU = useU(progressRef, idleRate);
  useFrame((s) => {
    const u = getU(s.clock.getElapsedTime());
    // pick(0-.2) raise(.2-.4) rotate(.4-.55) press(.55-.65) fasten(.65-1)
    let shPitch = 0.9, elBend = -0.6, wr = -Math.PI / 2, push = 0, fasten = 0;
    if (u < 0.2) { shPitch = 1.1; elBend = -0.9; wr = -Math.PI / 2; }
    else if (u < 0.4) { const k = easeInOut((u - 0.2) / 0.2); shPitch = lerp(1.1, 0.5, k); elBend = lerp(-0.9, -0.5, k); }
    else if (u < 0.55) { const k = easeInOut((u - 0.4) / 0.15); shPitch = 0.5; wr = lerp(-Math.PI / 2, 0, k); }
    else if (u < 0.65) { const k = easeInOut((u - 0.55) / 0.1); wr = 0; push = lerp(0, 0.16, k); }
    else { wr = 0; push = 0.16; fasten = 1; }
    if (turn.current) turn.current.rotation.y = Math.sin(u * Math.PI) * 0.15;
    if (shoulder.current) shoulder.current.rotation.x = shPitch;
    if (elbow.current) elbow.current.rotation.x = elBend;
    if (wrist.current) wrist.current.rotation.x = wr;
    if (sheet.current) sheet.current.position.z = push;
    // screw gun visits 6 points along perimeter
    if (gun.current && fasten) {
      const pts = 6; const idx = Math.floor(((u - 0.65) / 0.35) * pts) % pts;
      const gx = ((idx % 3) - 1) * 0.45; const gy = idx < 3 ? 0.3 : -0.3;
      gun.current.position.x = lerp(gun.current.position.x, gx, 0.3);
      gun.current.position.y = lerp(gun.current.position.y, gy, 0.3);
    }
    if (bit.current && fasten && running) bit.current.rotation.z -= 1.2;
  });
  return (
    <group>
      <TrackBase color={accent} w={0.9} d={0.72} running={running} />
      {/* outriggers */}
      {[[-0.5, 0.4], [0.5, 0.4], [-0.5, -0.4], [0.5, -0.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.08, 0.24, 0.08]} /><meshStandardMaterial color={STEEL} /></mesh>
          <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.09, 0.09, 0.03, 12]} /><meshStandardMaterial color={RUBBER} /></mesh>
        </group>
      ))}
      <group position={[0.28, 1.02, -0.24]}><Beacon running={running} color="#f59e0b" /></group>
      {/* turntable */}
      <group ref={turn} position={[0, 0.42, -0.1]}>
        <mesh><cylinderGeometry args={[0.16, 0.18, 0.12, 20]} /><meshStandardMaterial color={PANEL} metalness={0.4} /></mesh>
        <group ref={shoulder} position={[0, 0.1, 0]}>
          <mesh position={[0, 0.28, 0]}><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color={STEEL} metalness={0.4} /></mesh>
          <group ref={elbow} position={[0, 0.56, 0]}>
            <mesh><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color={accent} /></mesh>
            <mesh position={[0, 0, 0.28]}><boxGeometry args={[0.1, 0.1, 0.56]} /><meshStandardMaterial color={STEEL} metalness={0.4} /></mesh>
            <group ref={wrist} position={[0, 0, 0.56]}>
              {/* vacuum frame + sheet */}
              <mesh><boxGeometry args={[1.0, 0.06, 0.7]} /><meshStandardMaterial color={PANEL} /></mesh>
              {[[-0.35, 0.22], [0, 0.22], [0.35, 0.22], [-0.35, -0.22], [0, -0.22], [0.35, -0.22]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.06, z]}><cylinderGeometry args={[0.07, 0.08, 0.08, 12]} /><meshStandardMaterial color={DARK} /></mesh>
              ))}
              <group ref={sheet} position={[0, -0.13, 0]}>
                <mesh castShadow><boxGeometry args={[1.2, 0.03, 0.82]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} /></mesh>
              </group>
              {/* screw gun on a slide */}
              <group ref={gun} position={[0.4, 0.2, -0.1]}>
                <mesh><boxGeometry args={[0.1, 0.1, 0.18]} /><meshStandardMaterial color={DARK} /></mesh>
                <mesh ref={bit} position={[0, 0, -0.14]}><cylinderGeometry args={[0.02, 0.02, 0.1, 8]} /><meshStandardMaterial color={STEEL} metalness={0.6} /></mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* =============================== 3. CUTTER =============================== */
function Cutter({ running, accent, progressRef, idleRate = 0.25 }: RobotProps) {
  const bridge = useRef<THREE.Group>(null);
  const carriage = useRef<THREE.Group>(null);
  const spindleZ = useRef<THREE.Group>(null);
  const spindle = useRef<THREE.Mesh>(null);
  const getU = useU(progressRef, idleRate);
  useFrame((s) => {
    const u = getU(s.clock.getElapsedTime());
    // trace a door-opening rectangle perimeter
    const per = u; let bx = 0, bz = 0, plunge = 0;
    if (u > 0.15 && u < 0.85) {
      const p = (per - 0.15) / 0.7; plunge = 1;
      if (p < 0.25) { bx = lerp(-0.25, 0.25, p / 0.25); bz = -0.32; }
      else if (p < 0.5) { bx = 0.25; bz = lerp(-0.32, 0.32, (p - 0.25) / 0.25); }
      else if (p < 0.75) { bx = lerp(0.25, -0.25, (p - 0.5) / 0.25); bz = 0.32; }
      else { bx = -0.25; bz = lerp(0.32, -0.32, (p - 0.75) / 0.25); }
    }
    if (bridge.current) bridge.current.position.z = bz;
    if (carriage.current) carriage.current.position.x = bx;
    if (spindleZ.current) spindleZ.current.position.y = -0.28 - plunge * 0.14;
    if (spindle.current && running) spindle.current.rotation.y += 0.6;
  });
  return (
    <group>
      {/* vacuum table with grid */}
      <mesh position={[0, 0.35, 0]}><boxGeometry args={[1.6, 0.1, 1.1]} /><meshStandardMaterial color={PANEL} metalness={0.3} roughness={0.6} /></mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-0.6 + i * 0.3, 0.41, 0]}><boxGeometry args={[0.01, 0.005, 1.0]} /><meshStandardMaterial color="#334155" /></mesh>
      ))}
      <mesh position={[0, 0.42, 0]}><boxGeometry args={[1.4, 0.02, 0.9]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} /></mesh>
      {/* gantry uprights */}
      {[[-0.78, 0.55], [0.78, 0.55], [-0.78, -0.55], [0.78, -0.55]].map(([x, z], i) => (<mesh key={i} position={[x, 0.75, z]}><boxGeometry args={[0.08, 0.75, 0.08]} /><meshStandardMaterial color={STEEL} metalness={0.5} /></mesh>))}
      {/* side rails */}
      {[-0.78, 0.78].map((x) => (<mesh key={x} position={[x, 1.12, 0]}><boxGeometry args={[0.09, 0.09, 1.2]} /><meshStandardMaterial color={STEEL} metalness={0.5} /></mesh>))}
      {/* bridge (moves in Z) */}
      <group ref={bridge} position={[0, 1.12, 0]}>
        <mesh><boxGeometry args={[1.7, 0.1, 0.12]} /><meshStandardMaterial color={accent} metalness={0.3} /></mesh>
        {/* drag chain */}
        <mesh position={[0.4, 0.08, 0]}><boxGeometry args={[0.5, 0.03, 0.04]} /><meshStandardMaterial color={DARK} /></mesh>
        {/* carriage (moves in X) */}
        <group ref={carriage}>
          <mesh position={[0, -0.02, 0]}><boxGeometry args={[0.2, 0.16, 0.2]} /><meshStandardMaterial color={PANEL} /></mesh>
          <group ref={spindleZ} position={[0, -0.28, 0]}>
            <mesh><boxGeometry args={[0.1, 0.4, 0.1]} /><meshStandardMaterial color={DARK} /></mesh>
            <mesh ref={spindle} position={[0, -0.22, 0]}><cylinderGeometry args={[0.05, 0.03, 0.14, 16]} /><meshStandardMaterial color={accent} metalness={0.5} /></mesh>
            {/* dust boot */}
            <mesh position={[0, -0.16, 0]}><cylinderGeometry args={[0.09, 0.09, 0.06, 16, 1, true]} /><meshStandardMaterial color={DARK} transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
            <Dust active={running} />
          </group>
        </group>
      </group>
    </group>
  );
}

/* =============================== 4. AMR =============================== */
function MecanumWheel({ position, running }: { position: [number, number, number]; running: boolean }) {
  const w = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (w.current && running) w.current.rotation.x -= dt * 4; });
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh><cylinderGeometry args={[0.12, 0.12, 0.1, 20]} /><meshStandardMaterial color={DARK} /></mesh>
      <group ref={w}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} rotation={[i / 8 * Math.PI * 2, 0, 0]} position={[0, 0.11, 0]}><boxGeometry args={[0.11, 0.03, 0.05]} /><meshStandardMaterial color={RUBBER} /></mesh>
        ))}
      </group>
    </group>
  );
}
function Amr({ running, accent, progressRef, idleRate = 0.16 }: RobotProps) {
  const body = useRef<THREE.Group>(null);
  const scissor = useRef<THREE.Group>(null);
  const link1 = useRef<THREE.Mesh>(null);
  const link2 = useRef<THREE.Mesh>(null);
  const dome = useRef<THREE.MeshStandardMaterial>(null);
  const getU = useU(progressRef, idleRate);
  useFrame((s) => {
    const u = getU(s.clock.getElapsedTime());
    let x = 0, lift = 0, steer = 0;
    if (progressRef) {
      if (u < 0.5) { x = lerp(-1.5, 1.5, easeInOut(u / 0.5)); steer = 0.1; }
      else if (u < 0.7) { x = 1.5; lift = easeInOut((u - 0.5) / 0.2); }
      else { x = lerp(1.5, -1.5, easeInOut((u - 0.7) / 0.3)); steer = -0.1; }
    } else { x = Math.sin(s.clock.getElapsedTime() * 0.5) * 0.6; lift = (Math.sin(s.clock.getElapsedTime()) * 0.5 + 0.5); }
    if (body.current) { body.current.position.x = x; body.current.rotation.y = steer; }
    // scissor: raise stack
    if (scissor.current) scissor.current.position.y = 0.42 + lift * 0.22;
    const ang = 0.5 + lift * 0.5;
    if (link1.current) link1.current.rotation.z = ang;
    if (link2.current) link2.current.rotation.z = -ang;
    if (dome.current) dome.current.emissiveIntensity = running ? 0.6 + Math.sin(s.clock.getElapsedTime() * 4) * 0.3 : 0.1;
  });
  return (
    <group ref={body}>
      {/* chassis */}
      <mesh castShadow position={[0, 0.24, 0]}><boxGeometry args={[0.95, 0.22, 0.75]} /><meshStandardMaterial color={accent} metalness={0.4} roughness={0.4} /></mesh>
      <mesh position={[0, 0.36, 0.38]}><boxGeometry args={[0.9, 0.05, 0.03]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} toneMapped={false} /></mesh>
      {/* bumpers */}
      {[0.4, -0.4].map((z) => (<mesh key={z} position={[0, 0.16, z]}><boxGeometry args={[0.98, 0.06, 0.04]} /><meshStandardMaterial color={RUBBER} /></mesh>))}
      {/* mecanum wheels */}
      {[[-0.5, 0.3], [0.5, 0.3], [-0.5, -0.3], [0.5, -0.3]].map(([x, z], i) => (<MecanumWheel key={i} position={[x, 0.12, z]} running={running} />))}
      {/* LiDAR + dome */}
      <group position={[0, 0.42, -0.28]}><Lidar running={running} /></group>
      <mesh position={[0.3, 0.4, -0.28]}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial ref={dome} color={accent} emissive={accent} emissiveIntensity={0.3} toneMapped={false} /></mesh>
      {/* scissor lift + rack */}
      <group ref={scissor} position={[0, 0.42, 0.08]}>
        <mesh ref={link1} position={[-0.1, -0.1, 0.2]}><boxGeometry args={[0.04, 0.36, 0.03]} /><meshStandardMaterial color={STEEL} /></mesh>
        <mesh ref={link2} position={[0.1, -0.1, 0.2]}><boxGeometry args={[0.04, 0.36, 0.03]} /><meshStandardMaterial color={STEEL} /></mesh>
        <mesh position={[0, 0, 0.2]}><boxGeometry args={[0.82, 0.04, 0.52]} /><meshStandardMaterial color={PANEL} /></mesh>
        {[0, 1, 2, 3].map((i) => (<mesh key={i} castShadow position={[0, 0.04 + i * 0.05, 0.2]}><boxGeometry args={[0.78, 0.04, 0.48]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} /></mesh>))}
        {/* strap */}
        <mesh position={[0, 0.12, 0.2]}><boxGeometry args={[0.03, 0.24, 0.5]} /><meshStandardMaterial color="#ea580c" /></mesh>
      </group>
    </group>
  );
}

/* =============================== 5. QA =============================== */
function Qa({ running, accent, progressRef, idleRate = 0.2 }: RobotProps) {
  const mast = useRef<THREE.Group>(null);
  const pan = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const barGroup = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  const getU = useU(progressRef, idleRate);
  useFrame((s) => {
    const u = getU(s.clock.getElapsedTime());
    const t = s.clock.getElapsedTime();
    if (mast.current) mast.current.position.y = 0.9 + (running ? 0.1 : 0);
    if (pan.current) pan.current.rotation.y = (progressRef ? lerp(-0.5, 0.5, u) : Math.sin(t * 0.6) * 0.5);
    if (tilt.current) tilt.current.rotation.x = Math.sin(t * 1.2) * 0.12;
    if (barGroup.current) barGroup.current.position.x = progressRef ? lerp(-1.1, 1.1, u) : Math.sin(t) * 0.9;
    if (cone.current) { const m = cone.current.material as THREE.MeshBasicMaterial; m.opacity = running ? 0.12 + Math.sin(t * 8) * 0.05 : 0; }
    if (screen.current) screen.current.emissiveIntensity = running ? 0.7 + Math.sin(t * 10) * 0.2 : 0.2;
  });
  return (
    <group>
      <TrackBase color={STEEL} running={running} />
      <group position={[0.26, 0.42, -0.2]}><Beacon running={running} color={accent} /></group>
      {/* mast */}
      <mesh position={[0, 0.7, -0.16]}><boxGeometry args={[0.1, 0.7, 0.1]} /><meshStandardMaterial color={STEEL} metalness={0.5} /></mesh>
      <group ref={mast} position={[0, 0.9, -0.12]}>
        {/* tablet/screen */}
        <mesh position={[0, 0.1, 0.06]} rotation={[-0.3, 0, 0]}><boxGeometry args={[0.28, 0.2, 0.02]} /><meshStandardMaterial ref={screen} color="#0b1220" emissive={accent} emissiveIntensity={0.4} toneMapped={false} /></mesh>
        {/* pan-tilt head */}
        <group ref={pan} position={[0, 0.42, 0]}>
          <mesh><cylinderGeometry args={[0.06, 0.06, 0.06, 16]} /><meshStandardMaterial color={DARK} /></mesh>
          <group ref={tilt} position={[0, 0.06, 0.02]}>
            <mesh><boxGeometry args={[0.26, 0.12, 0.14]} /><meshStandardMaterial color={accent} /></mesh>
            {/* camera lens */}
            <mesh position={[0.06, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.06, 16]} /><meshStandardMaterial color="#0b0f16" metalness={0.7} roughness={0.15} /></mesh>
            {/* structured-light projector */}
            <mesh position={[-0.06, 0, 0.08]}><boxGeometry args={[0.05, 0.05, 0.04]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} toneMapped={false} /></mesh>
          </group>
        </group>
      </group>
      {/* raking light bar with LED segments + light cone to wall */}
      <group ref={barGroup} position={[0, 1.0, 0.32]}>
        <mesh><boxGeometry args={[0.06, 1.6, 0.06]} /><meshStandardMaterial color={DARK} /></mesh>
        {Array.from({ length: 7 }).map((_, i) => (<Led key={i} position={[0.04, -0.6 + i * 0.2, 0]} color={accent} on={running} size={0.025} />))}
        <mesh ref={cone} position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.25, 0.9, 20, 1, true]} /><meshBasicMaterial color={accent} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      </group>
    </group>
  );
}

export default function RobotModel({ id, running, accent, progressRef, task }: RobotProps & { id: RobotId }) {
  const p = useMemo(() => ({ running, accent, progressRef, task }), [running, accent, progressRef, task]);
  switch (id) {
    case "finisher": return <Finisher {...p} />;
    case "hanger": return <Hanger {...p} />;
    case "cutter": return <Cutter {...p} />;
    case "amr": return <Amr {...p} />;
    case "qa": return <Qa {...p} />;
  }
}
