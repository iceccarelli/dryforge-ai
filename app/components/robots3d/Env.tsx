"use client";

const GYPSUM = "#EDE9E0";

export function Lights({ accent = "#F97316" }: { accent?: string }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 3, 3]} intensity={14} color={accent} distance={16} />
    </>
  );
}

export function Floor({ size = 12 }: { size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#0e1626" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

/** A framed drywall wall section with studs behind, and an optional finished sweep. */
export function WallSection({ x = 1.35, finished = 0 }: { x?: number; finished?: number }) {
  const strips = 6;
  return (
    <group position={[0, 1.2, x]} rotation={[0, Math.PI, 0]}>
      {/* studs */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((sx) => (
        <mesh key={sx} position={[sx, 0, 0.04]}>
          <boxGeometry args={[0.09, 2.3, 0.09]} />
          <meshStandardMaterial color="#7c8496" />
        </mesh>
      ))}
      {/* gypsum board strips that turn "finished" as `finished` grows bottom->top */}
      {Array.from({ length: strips }).map((_, i) => {
        const done = finished > i / strips;
        return (
          <mesh key={i} position={[0, -1.15 + (i + 0.5) * (2.3 / strips), 0]} castShadow receiveShadow>
            <boxGeometry args={[2.9, 2.3 / strips - 0.01, 0.03]} />
            <meshStandardMaterial color={done ? "#ffffff" : GYPSUM} roughness={done ? 0.35 : 0.95} />
          </mesh>
        );
      })}
    </group>
  );
}
