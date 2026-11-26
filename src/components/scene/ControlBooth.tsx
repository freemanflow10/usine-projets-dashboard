import { memo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useCursor } from "@react-three/drei";
import type { Mesh } from "three";
import type { Station } from "../../types/factory";
import OptionalGlbModel from "./ModelLoader";
import { FACTORY_MODEL_URLS } from "./modelAssets";
import StationLabel from "./StationLabel";

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
  const frameCorners = [
    [-1.12, -0.92],
    [-1.12, 0.92],
    [1.12, -0.92],
    [1.12, 0.92],
  ] as const;
  const frameLevels = [0.275, 1.825] as const;

  return (
    <group position={[x, 0, z]} onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
      <StationLabel label={station.label} position={[0, 2.1, 0]} />
      {/* socle */}
      <RoundedBox args={[2.6, 0.22, 2.2]} radius={0.08} smoothness={4} position={[0, 0.11, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1e2533" metalness={0.4} roughness={0.35} />
      </RoundedBox>
      {/* cabine vitrée */}
      <OptionalGlbModel
        url={FACTORY_MODEL_URLS.controlBooth}
        fallback={
          <group>
            <RoundedBox
              args={[2.3, 1.55, 1.9]}
              radius={0.12}
              smoothness={4}
              position={[0, 1.05, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#16202b"
                transmission={0.6}
                roughness={0.15}
                thickness={0.5}
                metalness={0.2}
                emissive={highlight ? "#0e3f52" : "#0a2a38"}
                emissiveIntensity={0.6}
                side={2}
              />
            </RoundedBox>
            {frameCorners.map(([frameX, frameZ]) => (
              <mesh
                key={`post-${frameX}-${frameZ}`}
                position={[frameX, 1.05, frameZ]}
                castShadow
              >
                <boxGeometry args={[0.06, 1.55, 0.06]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.32} />
              </mesh>
            ))}
            {frameLevels.map((level) => (
              <group key={level}>
                {[-0.92, 0.92].map((frameZ) => (
                  <mesh key={`crossbar-${frameZ}`} position={[0, level, frameZ]} castShadow>
                    <boxGeometry args={[2.3, 0.06, 0.06]} />
                    <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.32} />
                  </mesh>
                ))}
                {[-1.12, 1.12].map((frameX) => (
                  <mesh key={`sidebar-${frameX}`} position={[frameX, level, 0]} castShadow>
                    <boxGeometry args={[0.06, 0.06, 1.9]} />
                    <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.32} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        }
      />
      {/* table + deux écrans lumineux */}
      <RoundedBox args={[1.7, 0.55, 1.1]} radius={0.04} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color="#151b26" metalness={0.4} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 1.0, 0.62]}>
        <boxGeometry args={[0.8, 0.5, 0.06]} />
        <meshStandardMaterial color="#051016" emissive="#38e8ff" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.0, -0.62]}>
        <boxGeometry args={[0.8, 0.5, 0.06]} />
        <meshStandardMaterial color="#051016" emissive="#38e8ff" emissiveIntensity={2.2} toneMapped={false} />
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
