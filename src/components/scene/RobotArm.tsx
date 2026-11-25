import { useRef, useState, memo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import type { Group, Mesh } from "three";
import type { Station } from "../../types/factory";

export interface RobotArmProps {
  station: Station;
  selected: boolean;
  isPaused: boolean;
  onSelect: () => void;
}

// Bras robotisé animé (Codex, Gemini, DeepSeek) — couleur portée par la station (§4)
function RobotArm({ station, selected, isPaused, onSelect }: RobotArmProps) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const turret = useRef<Group>(null);
  const upper = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  const f1 = useRef<Mesh>(null);
  const f2 = useRef<Mesh>(null);
  const [x, , z] = station.position;
  const color = station.color ?? "#3ddc84";
  const dormant = station.status === "bad";

  useFrame((state) => {
    if (isPaused || dormant || !turret.current) return;
    const t = state.clock.elapsedTime;
    const pulse = station.status === "idle" ? 0.35 : 1;
    turret.current.rotation.y = Math.sin(t * 0.45 * pulse) * 1.15;
    if (upper.current) upper.current.rotation.x = 0.42 + Math.sin(t * 0.7 * pulse) * 0.14;
    if (elbow.current) elbow.current.rotation.x = -0.55 + Math.sin(t * 0.95 * pulse) * 0.2;
    const grip = Math.sin(t * 1.4 * pulse);
    const open = (1 + grip) * 0.11; // ouverture périodique de la pince
    if (f1.current) f1.current.position.x = -0.16 - open;
    if (f2.current) f2.current.position.x = 0.16 + open;
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); };
  const handleOut = () => setHover(false);
  const handleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); };
  const highlight = hover || selected;

  return (
    <group position={[x, 0, z]} onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
      {/* base */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.32, 24]} />
        <meshStandardMaterial color="#20283a" metalness={0.55} roughness={0.4} />
      </mesh>
      {/* tourelle rotative */}
      <group ref={turret} position={[0, 0.34, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.5, 0.56, 20]} />
          <meshStandardMaterial color="#26304a" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* bras supérieur */}
        <group ref={upper} position={[0, 0.6, 0]} rotation-x={0.42}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.42, 1.0, 0.42]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} emissive={color} emissiveIntensity={highlight ? 0.5 : 0.12} />
          </mesh>
          {/* avant-bras */}
          <group ref={elbow} position={[0, 1.02, 0]} rotation-x={-0.55}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.34, 0.9, 0.34]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} emissive={color} emissiveIntensity={0.08} />
            </mesh>
            {/* pince */}
            <group position={[0, 0.92, 0]}>
              <mesh ref={f1} position={[-0.16, 0.05, 0]}>
                <boxGeometry args={[0.08, 0.26, 0.16]} />
                <meshStandardMaterial color="#cfd8ea" metalness={0.7} roughness={0.25} />
              </mesh>
              <mesh ref={f2} position={[0.16, 0.05, 0]}>
                <boxGeometry args={[0.08, 0.26, 0.16]} />
                <meshStandardMaterial color="#cfd8ea" metalness={0.7} roughness={0.25} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
      {/* anneau */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.78, 0.95, 36]} />
        <meshBasicMaterial color={highlight ? color : "#2a3546"} transparent opacity={highlight ? 0.9 : 0.4} side={2} />
      </mesh>
    </group>
  );
}

export default memo(RobotArm);