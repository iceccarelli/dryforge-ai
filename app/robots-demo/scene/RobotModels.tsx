"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RobotId } from "../robots";

const DARK = "#1E293B";
const STEEL = "#94A3B8";

function Wheels({ y = 0.09, x = 0.28, z = 0.34, running }: { y?: number; x?: number; z?: number; running: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (g.current && running) g.current.children.forEach((c) => (c.rotation.x -= d * 8));
  });
  return (
    <group ref={g}>
      {[[-x, y, -z], [x, y, -z], [-x, y, z], [x, y, z]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
          <meshStandardMaterial color={DARK} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Extractor({ running, accent }: { running: boolean; accent: string }) {
  const brush = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (brush.current && running) brush.current.rotation.x -= d * 14;
  });
  return (
    <group>
      <mesh castShadow position={[0, 0.24, -0.05]}>
        <boxGeometry args={[0.6, 0.28, 0.7]} />
        <meshStandardMaterial color={accent} roughness={0.45} metalness={0.15} />
      </mesh>
      {/* recovery tank */}
      <mesh position={[0, 0.46, -0.15]}>
        <cylinderGeometry args={[0.16, 0.16, 0.28, 20]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.75} roughness={0.2} />
      </mesh>
      {/* suction head */}
      <mesh position={[0, 0.12, 0.42]}>
        <boxGeometry args={[0.62, 0.14, 0.16]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh ref={brush} position={[0, 0.06, 0.44]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.56, 12]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>
      <Wheels running={running} />
    </group>
  );
}

function AirMover({ running, accent }: { running: boolean; accent: string }) {
  const fan = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (fan.current && running) fan.current.rotation.z -= d * 24;
  });
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.5]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.34, 0]} rotation={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.28, 0.24, 24]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      <group ref={fan} position={[0, 0.4, 0.12]} rotation={[-0.5, 0, 0]}>
        <mesh><cylinderGeometry args={[0.045, 0.045, 0.06, 12]} /><meshStandardMaterial color={DARK} /></mesh>
        {[0, 1, 2, 3, 4].map((b) => (
          <mesh key={b} rotation={[0, 0, (b / 5) * Math.PI * 2]} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.022, 0.19, 0.01]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        ))}
      </group>
      <Wheels running={running} x={0.2} z={0.2} />
    </group>
  );
}

function Dehumidifier({ running, accent }: { running: boolean; accent: string }) {
  const strip = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((s) => {
    if (strip.current) strip.current.emissiveIntensity = running ? 0.4 + Math.sin(s.clock.elapsedTime * 4) * 0.3 : 0;
  });
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.62, 0.08, 0.56]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.55, 0.7, 0.5]} />
        <meshStandardMaterial color={STEEL} roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, 0.26]}>
        <boxGeometry args={[0.42, 0.28, 0.02]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[0, 0.74, 0.26]}>
        <boxGeometry args={[0.42, 0.05, 0.02]} />
        <meshStandardMaterial ref={strip} color={accent} emissive={accent} emissiveIntensity={0} />
      </mesh>
      <Wheels running={running} x={0.24} z={0.22} />
    </group>
  );
}

function Drone({ running, accent }: { running: boolean; accent: string }) {
  const rotors = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  useFrame((s, d) => {
    if (rotors.current && running) rotors.current.children.forEach((c) => (c.rotation.y -= d * 60));
    if (cone.current) {
      const m = cone.current.material as THREE.MeshBasicMaterial;
      m.opacity = running ? 0.12 + Math.sin(s.clock.elapsedTime * 3) * 0.05 : 0.05;
    }
  });
  const arms: [number, number][] = [[0.26, 0.26], [-0.26, 0.26], [0.26, -0.26], [-0.26, -0.26]];
  return (
    <group>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.26, 0.09, 0.26]} />
        <meshStandardMaterial color={DARK} roughness={0.5} />
      </mesh>
      {/* thermal gimbal */}
      <mesh position={[0, -0.08, 0.08]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>
      <group ref={rotors}>
        {arms.map(([x, z], i) => (
          <group key={i} position={[x, 0.04, z]}>
            <mesh position={[-x * 0.4, -0.02, -z * 0.4]} rotation={[0, Math.atan2(z, x), 0]}>
              <boxGeometry args={[0.28, 0.02, 0.03]} />
              <meshStandardMaterial color={STEEL} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.16, 0.16, 0.012, 20]} />
              <meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      {/* scan cone downward */}
      <mesh ref={cone} position={[0, -0.9, 0.08]}>
        <coneGeometry args={[0.55, 1.7, 24, 1, true]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Injector({ running, accent }: { running: boolean; accent: string }) {
  const hoses = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!hoses.current) return;
    const ext = running ? 0.5 + Math.sin(s.clock.elapsedTime * 1.5) * 0.5 : 0;
    hoses.current.children.forEach((c, i) => {
      const target = 0.3 + i * 0.25;
      c.scale.z = 0.1 + ext * target * 4;
    });
  });
  return (
    <group>
      <mesh castShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.36]} />
        <meshStandardMaterial color={DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.42, 0.19]}>
        <boxGeometry args={[0.4, 0.06, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={running ? 0.4 : 0} />
      </mesh>
      {/* mast */}
      <mesh position={[0, 0.6, -0.1]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 12]} />
        <meshStandardMaterial color={STEEL} />
      </mesh>
      <group ref={hoses}>
        {[-0.15, 0, 0.15].map((x, i) => (
          <mesh key={i} position={[x, 0.12, 0.2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.1, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        ))}
      </group>
      <Wheels running={running} x={0.2} z={0.14} />
    </group>
  );
}

export default function RobotModel({ id, running, accent }: { id: RobotId; running: boolean; accent: string }) {
  switch (id) {
    case "extractor": return <Extractor running={running} accent={accent} />;
    case "airmover": return <AirMover running={running} accent={accent} />;
    case "dehumidifier": return <Dehumidifier running={running} accent={accent} />;
    case "drone": return <Drone running={running} accent={accent} />;
    case "injector": return <Injector running={running} accent={accent} />;
  }
}
