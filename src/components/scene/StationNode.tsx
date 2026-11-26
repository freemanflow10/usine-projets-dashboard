import { useRef, useState, memo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor, RoundedBox } from "@react-three/drei";
import { Color } from "three";
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import type { Station, Status } from "../../types/factory";
import OptionalGlbModel from "./ModelLoader";
import { FACTORY_MODEL_URLS } from "./modelAssets";
import StationLabel from "./StationLabel";

export interface StationNodeProps {
  station: Station;
  selected: boolean;
  isPaused: boolean;
  onSelect: () => void;
}

const STATUS_GLOW: Record<Status, string> = {
  ok: "#3ddc84",
  warn: "#ffb020",
  bad: "#ff4d4d",
  idle: "#64748b",
};

// Poste générique (machine) : socle + module + voyant d'état émissif + pile de cartons si bouchon (§4)
function StationNode({ station, selected, isPaused, onSelect }: StationNodeProps) {
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const orb = useRef<Mesh>(null);
  const alertMat = useRef<MeshBasicMaterial>(null);
  const bob = useRef<Group>(null);
  const [x, , z] = station.position;
  const glow = new Color(STATUS_GLOW[station.status]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orb.current) {
      const material = orb.current.material as MeshStandardMaterial;
      material.emissive.lerp(glow, 0.05);
      material.emissiveIntensity = isPaused
        ? 2.2
        : 2.2 + Math.sin(t * 2.6) * 0.15;
    }
    if (alertMat.current) {
      alertMat.current.opacity = station.status === "warn" ? 0.35 + (Math.sin(t * 3.2) + 1) * 0.2 : 0;
      alertMat.current.color.set(glow);
    }
    if (bob.current && !isPaused) bob.current.position.y = 0.3 + Math.sin(t * 1.9) * 0.04;
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); };
  const handleOut = () => setHover(false);
  const handleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); };
  const highlight = hover || selected;
  const pending = station.pendingBoxes;

  return (
    <group position={[x, 0, z]} onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
      <StationLabel label={station.label} />
      {/* socle */}
      <RoundedBox args={[1.5, 0.3, 1.5]} radius={0.08} smoothness={4} position={[0, 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1e2533" metalness={0.4} roughness={0.35} />
      </RoundedBox>
      {/* module machine */}
      <group ref={bob} position={[0, 0.3, 0]}>
        {station.id === "serveurs" ? (
          <OptionalGlbModel
            url={FACTORY_MODEL_URLS.serverRack}
            fallback={
              <RoundedBox args={[1.0, 1.05, 1.0]} radius={0.08} position={[0, 0.55, 0]} castShadow>
                <meshStandardMaterial
                  color={highlight ? "#244060" : "#1c2740"}
                  metalness={0.45}
                  roughness={0.5}
                  emissive={glow}
                  emissiveIntensity={highlight ? 0.22 : 0.1}
                />
              </RoundedBox>
            }
          />
        ) : (
          <RoundedBox args={[1.0, 1.05, 1.0]} radius={0.08} position={[0, 0.55, 0]} castShadow>
            <meshStandardMaterial
              color={highlight ? "#244060" : "#1c2740"}
              metalness={0.45}
              roughness={0.5}
              emissive={glow}
              emissiveIntensity={highlight ? 0.22 : 0.1}
            />
          </RoundedBox>
        )}
        {/* bande d'état */}
        <mesh position={[0, 1.06, 0]}>
          <boxGeometry args={[0.3, 0.07, 0.3]} />
          <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
        {/* voyant sphérique émissif */}
        <mesh ref={orb} position={[0, 1.42, 0]}>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial
            color="#10151e"
            emissive={glow}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        {/* halo au sol (bouchon) */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.7, 1.05, 40]} />
          <meshBasicMaterial ref={alertMat} color={glow} transparent opacity={0} side={2} toneMapped={false} />
        </mesh>
      </group>

      {/* pile de cartons si bouchon */}
      {pending > 0 ? (
        <group position={[0.95, 0, 0.35]}>
          {Array.from({ length: Math.min(pending, 6) }).map((_, i) => (
            <group key={i} position={[i % 2 === 0 ? 0 : 0.32, 0.15 + Math.floor(i / 2) * 0.34, (i % 2) * 0.28]}>
              <OptionalGlbModel
                url={FACTORY_MODEL_URLS.cardboardBox}
                fallback={
                  <group>
                    <mesh castShadow>
                      <boxGeometry args={[0.5, 0.3, 0.42]} />
                      <meshStandardMaterial color="#c78c56" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0, 0.22]}>
                      <boxGeometry args={[0.22, 0.3, 0.015]} />
                      <meshStandardMaterial color="#e8c391" roughness={0.7} />
                    </mesh>
                  </group>
                }
              />
            </group>
          ))}
        </group>
      ) : null}

      {/* anneau de sélection */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.78, 0.94, 36]} />
        <meshBasicMaterial color={highlight ? glow : "#2a3546"} transparent opacity={highlight ? 0.9 : 0.4} side={2} />
      </mesh>
    </group>
  );
}

export default memo(StationNode);
