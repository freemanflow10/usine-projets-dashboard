import { useRef, useState, memo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useCursor } from "@react-three/drei";
import type { Mesh } from "three";
import type { Station } from "../../types/factory";

export interface ControlBoothProps {
  station: Station;
  selected: boolean;
  isPaused: boolean;
  onSelect: () => void;
}

// Bureau du chef : cabine vitrée centrale avec deux écrans cyan (§4)
function ControlBooth({ station, selected, isPaused, onSelect }: ControlBoothProps) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const dock = useRef<Mesh>(null);
  const [x, , z] = station.position;

  useFrame((state) => {
    if (isPaused || !dock.current) return;
    dock.current.position.y = 0.12 + Math.sin(state.clock.elapsedTime * 2.1) * 0.015;
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
  };
  const handleOut = () => setHover(false);
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  const highlight = hover || selected;
  const glassOp = highlight ? 0.32 : 0.18;

  return (
    <group position={[x, 0, z]} onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
      {/* socle */}
      <RoundedBox args={[2.6, 0.22, 2.2]} radius={0.08} smoothness={3} position={[0, 0.11, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a2130" metalness={0.5} roughness={0.45} />
      </RoundedBox>
      {/* cabine vitrée */}
      <RoundedBox
        args={[2.3, 1.55, 1.9]}
        radius={0.12}
        smoothness={4}
        position={[0, 1.05, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#16202b"
          transparent
          opacity={glassOp}
          roughness={0.15}
          metalness={0.2}
          emissive={highlight ? "#0e3f52" : "#0a2a38"}
          emissiveIntensity={0.6}
          side={2}
        />
      </RoundedBox>
      {/* table + deux écrans lumineux */}
      <RoundedBox args={[1.7, 0.55, 1.1]} radius={0.04} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color="#151b26" metalness={0.4} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 1.0, 0.62]}>
        <boxGeometry args={[0.8, 0.5, 0.06]} />
        <meshStandardMaterial color="#051016" emissive="#38e8ff" emissiveIntensity={1.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.0, -0.62]}>
        <boxGeometry args={[0.8, 0.5, 0.06]} />
        <meshStandardMaterial color="#051016" emissive="#38e8ff" emissiveIntensity={1.15} toneMapped={false} />
      </mesh>
      {/* anneau de sélection */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.025, 0]}>
        <ringGeometry args={[1.15, 1.32, 40]} />
        <meshBasicMaterial
          color={highlight ? "#38e8ff" : "#2a3546"}
          transparent
          opacity={highlight ? 0.85 : 0.35}
          side={2}
        />
      </mesh>
    </group>
  );
}

export default memo(ControlBooth);