"use client";

const GYPSUM = "#EDE9E0";
const MUD = "#d9c9a8";
const SMOOTH = "#ffffff";

function clamp01(t: number) { return Math.min(1, Math.max(0, t)); }

/** Finishing target: strips turn from raw → mud → sanded-smooth as the job runs. */
export function FinishWall({ progress, task }: { progress: number; task: string }) {
  const strips = 6;
  return (
    <group position={[0, 1.2, 1.2]}>
      {/* studs */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((sx) => (
        <mesh key={sx} position={[sx, 0, -0.05]}><boxGeometry args={[0.09, 2.3, 0.09]} /><meshStandardMaterial color="#7c8496" /></mesh>
      ))}
      {Array.from({ length: strips }).map((_, i) => {
        const pos = i / strips;
        let color = GYPSUM, rough = 0.95;
        if (task === "finish") {
          const mud = clamp01(progress / 0.4);
          const sand = clamp01((progress - 0.55) / 0.35);
          if (sand > pos) { color = SMOOTH; rough = 0.3; }
          else if (mud > pos) { color = MUD; rough = 0.8; }
        } else {
          if (progress > pos) { color = MUD; rough = 0.8; }
        }
        return (
          <mesh key={i} position={[0, -1.15 + (i + 0.5) * (2.3 / strips), 0]} castShadow>
            <boxGeometry args={[2.9, 2.3 / strips - 0.02, 0.03]} />
            <meshStandardMaterial color={color} roughness={rough} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Hanging target: bare studs that fill with gypsum sheets as they are hung. */
export function HangWall({ progress, task }: { progress: number; task: string }) {
  const ceiling = task === "ceiling";
  const total = ceiling ? 2 : 4;
  const placed = Math.floor(progress * total + 0.0001);
  const cols = 2;
  return (
    <group position={ceiling ? [0, 2.35, 0.4] : [0, 1.2, 1.2]} rotation={ceiling ? [Math.PI / 2, 0, 0] : [0, 0, 0]}>
      {[-1.2, -0.4, 0.4, 1.2].map((sx) => (
        <mesh key={sx} position={[sx, 0, -0.05]}><boxGeometry args={[0.09, 2.3, 0.09]} /><meshStandardMaterial color="#7c8496" /></mesh>
      ))}
      {Array.from({ length: total }).map((_, i) => {
        if (i >= placed) return null;
        const c = i % cols, r = Math.floor(i / cols);
        return (
          <mesh key={i} castShadow position={[-0.72 + c * 1.44, ceiling ? -0.55 + r * 1.1 : -0.55 + r * 1.1, 0]}>
            <boxGeometry args={[1.4, 1.06, 0.03]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Cutting target: a door opening is routed into the panel as the job runs. */
export function CutOpening({ progress }: { progress: number }) {
  const open = clamp01((progress - 0.15) / 0.7);
  return (
    <group position={[0.2, 0.42, 0]}>
      <mesh position={[0, 0.001, 0]} scale={[open, 1, open]}>
        <boxGeometry args={[0.5, 0.02, 0.7]} /><meshStandardMaterial color="#0b1220" />
      </mesh>
    </group>
  );
}

/** Delivery zone: a marked floor target that stacks sheets as the AMR drops them. */
export function DeliveryZone({ progress }: { progress: number }) {
  const stack = Math.floor(clamp01((progress - 0.55) / 0.45) * 6);
  return (
    <group position={[1.4, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[1.1, 0.9]} /><meshStandardMaterial color="#F97316" transparent opacity={0.25} />
      </mesh>
      {Array.from({ length: stack }).map((_, i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.05, 0]}><boxGeometry args={[0.9, 0.04, 0.6]} /><meshStandardMaterial color={GYPSUM} roughness={0.95} /></mesh>
      ))}
    </group>
  );
}

/** QA target: a heatmap reveals left→right as the scanner sweeps; a couple of defects flag amber. */
export function QAWall({ progress }: { progress: number }) {
  const cols = 8, rows = 4;
  const defects = new Set([10, 21]);
  return (
    <group position={[0, 1.2, 1.2]}>
      <mesh position={[0, 0, -0.02]}><boxGeometry args={[2.9, 2.3, 0.03]} /><meshStandardMaterial color={SMOOTH} roughness={0.3} /></mesh>
      {Array.from({ length: cols * rows }).map((_, k) => {
        const c = k % cols, r = Math.floor(k / cols);
        if (c / cols > progress) return null;
        const bad = defects.has(k);
        return (
          <mesh key={k} position={[-1.27 + c * 0.36, -0.86 + r * 0.57, 0.02]}>
            <boxGeometry args={[0.32, 0.5, 0.01]} />
            <meshStandardMaterial color={bad ? "#f59e0b" : "#34d399"} emissive={bad ? "#f59e0b" : "#065f46"} emissiveIntensity={0.35} transparent opacity={0.75} />
          </mesh>
        );
      })}
    </group>
  );
}
