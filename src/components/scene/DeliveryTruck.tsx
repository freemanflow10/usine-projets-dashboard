import { useRef, useState, memo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor, RoundedBox } from "@react-three/drei";
import type { MeshBasicMaterial } from "three";
import type { Station } from "../../types/factory";

export interface DeliveryTruckProps {
  station: Station;
  selected: boolean;
  isPaused: boolean;
  onSelect: () => void;
}

// Camion low-poly vert garé au quai + plot lumineux rouge (warn) / vert (ok) (§4)
function DeliveryTruck({ station, selected, isPaused, onSelect }: DeliveryTruckProps) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const light = useRef<MeshBasicMaterial>(null);
  const [x, , z] = station.position;
  const approved = station.status === "ok";

  useFrame((state) => {
    if (!light.current) return;
    const t = state.clock.elapsedTime;
    const baseColor = approved ? "#3ddc84" : "#ff4d4d";
    light.current.color.set(baseColor);

    if (!isPaused) {
      light.current.color.offsetHSL(0, 0, Math.sin(t * 2.2) * 0.14);
    }
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); };
  const handleOut = () => setHover(false);
  const handleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); };
  const highlight = hover || selected;
  const wheelZ = 0.52;

  return (
    <group position={[x, 0, z]} onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
      <group rotation-y={Math.PI * 0.12}>
        {/* remorque */}
        <RoundedBox args={[1.8, 0.9, 1.15]} radius={0.06} position={[-0.42, 0.72, 0]} castShadow>
          <meshStandardMaterial color="#1f5a3a" metalness={0.4} roughness={0.5} emissive="#0e3a24" emissiveIntensity={highlight ? 0.5 : 0.15} />
        </RoundedBox>
        {/* cabine */}
        <RoundedBox args={[0.62, 0.62, 1.05]} radius={0.08} position={[0.62, 0.5, 0]} castShadow>
          <meshStandardMaterial color="#2e7d4f" metalness={0.35} roughness={0.45} />
        </RoundedBox>
        <mesh position={[0.72, 0.56, 0.35]} rotation-y={Math.PI / 2}>
          <boxGeometry args={[0.06, 0.42, 0.5]} />
          <meshStandardMaterial color="#0b0f16" emissive="#bfe8ff" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        {/* roues */}
        {[-0.9, -0.1, 0.85].map((rx) => (
          <group key={rx} position={[rx, 0.26, 0]}>
            {[-wheelZ, wheelZ].map((wz) => (
              <mesh key={wz} position={[0, 0, wz]} rotation-x={Math.PI / 2} castShadow>
                <cylinderGeometry args={[0.24, 0.24, 0.14, 16]} />
                <meshStandardMaterial color="#0d1117" roughness={0.85} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* plot lumineux (feu de quai) */}
      <mesh position={[1.35, 0.15, 0.45]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 0.3, 12]} />
        <meshStandardMaterial color="#151b26" />
      </mesh>
      <mesh position={[1.35, 0.45, 0.45]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial ref={light} color={approved ? "#3ddc84" : "#ff4d4d"} toneMapped={false} />
      </mesh>

      {/* anneau de sélection */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.0, 1.2, 36]} />
        <meshBasicMaterial color={highlight ? "#f5c400" : "#2a3546"} transparent opacity={highlight ? 0.9 : 0.4} side={2} />
      </mesh>
    </group>
  );
}

export default memo(DeliveryTruck);