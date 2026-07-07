"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RoomSpec, SimState } from "../lib/dryingModel";

interface RoomProps {
  room: RoomSpec;
  simRef: React.MutableRefObject<SimState>;
}

const DRY_FLOOR = new THREE.Color("#c9bfa9"); // dry subfloor / screed
const WET_FLOOR = new THREE.Color("#4f4636"); // saturated, dark
const DRY_WALL = new THREE.Color("#eef1f4");
const STAIN = new THREE.Color("#a98a5f");

/** Deterministic PRNG (mulberry32) — keeps texture generation pure across renders. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Procedural speckled floor texture so the surface reads as a real material. */
function useFloorTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 256;
    const rand = mulberry32(1337);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 5200; i++) {
      const g = 200 + Math.floor(rand() * 55);
      ctx.fillStyle = `rgba(${g},${g},${g},0.5)`;
      ctx.fillRect(rand() * size, rand() * size, 1.4, 1.4);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

export default function Room({ room, simRef }: RoomProps) {
  const L = room.lengthM;
  const W = room.widthM;
  const H = room.heightM;

  const floorMat = useRef<THREE.MeshStandardMaterial>(null);
  const filmMat = useRef<THREE.MeshStandardMaterial>(null);
  const stainRefs = useRef<THREE.Mesh[]>([]);
  const floorTex = useFloorTexture();

  useMemo(() => {
    floorTex.repeat.set(Math.max(1, L / 1.5), Math.max(1, W / 1.5));
  }, [floorTex, L, W]);

  useFrame(() => {
    const wet = simRef.current.wetness;
    if (floorMat.current) {
      floorMat.current.color.copy(DRY_FLOOR).lerp(WET_FLOOR, wet);
      floorMat.current.roughness = THREE.MathUtils.lerp(0.92, 0.2, wet);
      floorMat.current.metalness = THREE.MathUtils.lerp(0.0, 0.15, wet);
    }
    if (filmMat.current) {
      filmMat.current.opacity = wet * 0.55;
    }
    const stainH = 0.35 + wet * 0.9; // wicking height recedes as it dries
    for (const m of stainRefs.current) {
      if (!m) continue;
      m.scale.y = stainH;
      m.position.y = stainH / 2 + 0.02;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.15 + wet * 0.6;
    }
  });

  const walls: { pos: [number, number, number]; rot: [number, number, number]; w: number }[] = [
    { pos: [0, H / 2, -W / 2], rot: [0, 0, 0], w: L },
    { pos: [-L / 2, H / 2, 0], rot: [0, Math.PI / 2, 0], w: W },
    { pos: [L / 2, H / 2, 0], rot: [0, -Math.PI / 2, 0], w: W },
  ];

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[L, W]} />
        <meshStandardMaterial ref={floorMat} map={floorTex} color={WET_FLOOR} roughness={0.2} />
      </mesh>
      {/* Water film (sheen that fades as it dries) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[L * 0.98, W * 0.98]} />
        <meshStandardMaterial
          ref={filmMat}
          color="#2b3a4a"
          roughness={0.05}
          metalness={0.4}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Walls + wicking stain */}
      {walls.map((wall, i) => (
        <group key={i} position={wall.pos} rotation={wall.rot}>
          <mesh receiveShadow>
            <planeGeometry args={[wall.w, H]} />
            <meshStandardMaterial color={DRY_WALL} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          {/* moisture stain rising from the baseboard */}
          <mesh
            ref={(el) => {
              if (el) stainRefs.current[i] = el;
            }}
            position={[0, 0.6, 0.01]}
          >
            <planeGeometry args={[wall.w, 1]} />
            <meshStandardMaterial color={STAIN} transparent opacity={0.5} roughness={0.9} />
          </mesh>
          {/* baseboard */}
          <mesh position={[0, 0.05 - H / 2, 0.02]}>
            <boxGeometry args={[wall.w, 0.1, 0.03]} />
            <meshStandardMaterial color="#d7d2c8" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
