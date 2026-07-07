"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Grid, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import RobotModel from "./RobotModels";
import { pathPoint, samplePath, type RobotSpec, type RoomDims } from "../robots";

interface Props {
  robot: RobotSpec;
  room: RoomDims;
  running: boolean;
  speed: number;
  progressRef: React.MutableRefObject<number>;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

export default function RobotScene({ robot, room, running, speed, progressRef }: Props) {
  const rig = useRef<THREE.Group>(null);
  const pathPts = samplePath(robot.motion, room);

  useFrame((_, delta) => {
    if (!rig.current) return;
    if (running && robot.motion !== "deploy") {
      progressRef.current = (progressRef.current + delta * speed * 0.06) % 1;
    }
    const { pos, heading } = pathPoint(robot.motion, progressRef.current, room);
    rig.current.position.set(pos[0], pos[1], pos[2]);
    rig.current.rotation.y = lerpAngle(rig.current.rotation.y, heading, 0.15);
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 4]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 3, -3]} intensity={16} color={robot.accent} distance={16} />

      {/* showroom floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[room.L + 3, room.W + 3]} />
        <meshStandardMaterial color="#0e1626" roughness={0.9} metalness={0.1} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[room.L + 3, room.W + 3]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1e3a52"
        sectionSize={2}
        sectionThickness={1}
        sectionColor={robot.accent}
        fadeDistance={22}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* coverage path */}
      {pathPts.length > 1 && (
        <Line points={pathPts} color={robot.accent} lineWidth={1.5} dashed dashSize={0.2} gapSize={0.12} transparent opacity={0.6} />
      )}

      {/* the robot */}
      <group ref={rig}>
        <RobotModel id={robot.id} running={running} accent={robot.accent} />
      </group>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={room.L + 4} blur={2.5} far={5} />
    </group>
  );
}
