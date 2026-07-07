"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EquipmentSpec, RoomSpec } from "../lib/dryingModel";

const ORANGE = "#F97316";
const DARK = "#1E293B";
const STEEL = "#94A3B8";

function AirMover({ position, running }: { position: [number, number, number]; running: boolean }) {
  const fan = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fan.current && running) fan.current.rotation.z -= delta * 22;
  });
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      {/* housing, tilted up like a real snail-style air mover */}
      <mesh castShadow position={[0, 0.16, 0]} rotation={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.2, 24]} />
        <meshStandardMaterial color={ORANGE} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* fan hub + blades */}
      <group ref={fan} position={[0, 0.2, 0.11]} rotation={[-0.5, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
        {[0, 1, 2, 3, 4].map((b) => (
          <mesh key={b} rotation={[0, 0, (b / 5) * Math.PI * 2]} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.02, 0.17, 0.01]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        ))}
      </group>
      {/* feet */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.4, 0.04, 0.34]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Dehumidifier({ position, running }: { position: [number, number, number]; running: boolean }) {
  const duct = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (duct.current && running) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.04;
      duct.current.scale.set(1, s, 1);
    }
  });
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.55, 0.7, 0.5]} />
        <meshStandardMaterial color={STEEL} roughness={0.55} metalness={0.2} />
      </mesh>
      {/* grille */}
      <mesh position={[0, 0.42, 0.26]}>
        <boxGeometry args={[0.42, 0.28, 0.02]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      {/* orange status strip */}
      <mesh position={[0, 0.66, 0.26]}>
        <boxGeometry args={[0.42, 0.05, 0.02]} />
        <meshStandardMaterial color={ORANGE} emissive={running ? ORANGE : "#000000"} emissiveIntensity={running ? 0.6 : 0} />
      </mesh>
      {/* flexible outlet duct */}
      <mesh ref={duct} position={[0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.4, 12]} />
        <meshStandardMaterial color={ORANGE} roughness={0.7} />
      </mesh>
      {/* casters */}
      {[[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.03, z]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
      ))}
    </group>
  );
}

function InjectionSystem({ position, wallZ }: { position: [number, number, number]; wallZ: number }) {
  const hoses = [-0.3, -0.1, 0.1, 0.3];
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.5, 0.34, 0.3]} />
        <meshStandardMaterial color={DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.34, 0.16]}>
        <boxGeometry args={[0.4, 0.06, 0.02]} />
        <meshStandardMaterial color={ORANGE} />
      </mesh>
      {hoses.map((x, i) => {
        const len = Math.abs(wallZ - position[2]);
        return (
          <mesh key={i} position={[x, 0.12, wallZ / 2 - position[2] / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, len, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        );
      })}
    </group>
  );
}

interface EquipmentProps {
  room: RoomSpec;
  equipment: EquipmentSpec;
  running: boolean;
}

export default function Equipment({ room, equipment, running }: EquipmentProps) {
  const L = room.lengthM;
  const W = room.widthM;

  // Distribute air movers evenly around an inner ring facing the walls.
  const movers: [number, number, number][] = [];
  const n = Math.max(0, Math.min(equipment.airMovers, 12));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const ex = L / 2 - 0.5;
    const ez = W / 2 - 0.5;
    const perim = t * 2 * (ex + ez);
    let x: number, z: number;
    if (perim < 2 * ex) {
      x = -ex + perim;
      z = -ez;
    } else {
      x = ex;
      z = -ez + (perim - 2 * ex);
    }
    movers.push([x, 0, z]);
  }

  const dehus: [number, number, number][] = [];
  const dn = Math.max(0, Math.min(equipment.dehumidifiers, 6));
  for (let i = 0; i < dn; i++) {
    const spread = dn > 1 ? (i / (dn - 1) - 0.5) * (L - 1.4) : 0;
    dehus.push([spread, 0, W / 2 - 0.55]);
  }

  return (
    <group>
      {movers.map((p, i) => (
        <AirMover key={`m${i}`} position={p} running={running} />
      ))}
      {dehus.map((p, i) => (
        <Dehumidifier key={`d${i}`} position={p} running={running} />
      ))}
      {equipment.injectionDrying && (
        <InjectionSystem position={[-L / 2 + 0.6, 0, 0]} wallZ={-W / 2} />
      )}
    </group>
  );
}
