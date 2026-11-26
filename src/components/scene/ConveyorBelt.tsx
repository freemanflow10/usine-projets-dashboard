import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import type { ConveyorFlow } from "../../types/factory";
import OptionalGlbModel from "./ModelLoader";
import { createConveyorGeometry } from "./createConveyorGeometry";
import { FACTORY_MODEL_URLS } from "./modelAssets";

export interface ConveyorBeltProps {
  flow: ConveyorFlow;
  isPaused: boolean;
}

const TRACK_SAMPLES = 96;
const CARTON_CENTER_OFFSET = 0.23;
const FORWARD = new THREE.Vector3(0, 0, 1);

export default function ConveyorBelt({
  flow,
  isPaused,
}: ConveyorBeltProps) {
  const cartons = useRef<Group>(null);
  const progress = useRef(0);
  const model = useMemo(() => createConveyorGeometry(flow), [flow]);

  useFrame((_, delta) => {
    if (isPaused || !cartons.current) return;
    progress.current = (progress.current + flow.speed * delta) % 1;
    const children = cartons.current.children;
    const count = children.length;
    if (count === 0) return;

    for (let index = 0; index < count; index += 1) {
      const progressAtCarton = (progress.current + index / count) % 1;
      const position = model.curve.getPointAt(progressAtCarton);
      const tangent = model.curve.getTangentAt(progressAtCarton);
      const carton = children[index] as Group;
      carton.position.set(
        position.x,
        position.y + CARTON_CENTER_OFFSET,
        position.z,
      );
      carton.quaternion.setFromUnitVectors(FORWARD, tangent);
    }
  });

  return (
    <group>
      <mesh geometry={model.belt} receiveShadow castShadow>
        <meshStandardMaterial color="#1c222e" roughness={0.7} metalness={0.35} />
      </mesh>
      {model.railCurves.map((curve, index) => (
        <mesh key={`rail-${index}`}>
          <tubeGeometry args={[curve, TRACK_SAMPLES, 0.055, 8, false]} />
          <meshStandardMaterial color="#66748b" metalness={0.8} roughness={0.28} />
        </mesh>
      ))}
      {model.glowCurves.map((curve, index) => (
        <mesh key={`glow-${index}`}>
          <tubeGeometry args={[curve, TRACK_SAMPLES, 0.022, 8, false]} />
          <meshStandardMaterial
            color="#38e8ff"
            emissive="#38e8ff"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      ))}
      <group ref={cartons}>
        {Array.from({ length: model.boxCount }).map((_, index) => (
          <group key={index} position={[0, -100, 0]}>
            <OptionalGlbModel
              url={FACTORY_MODEL_URLS.cardboardBox}
              fallback={
                <group>
                  <mesh geometry={model.box} castShadow receiveShadow>
                    <meshStandardMaterial color="#c78c56" roughness={0.8} />
                  </mesh>
                  <mesh geometry={model.tape} position={[0, 0, 0.2]}>
                    <meshStandardMaterial color="#e8c391" roughness={0.7} />
                  </mesh>
                </group>
              }
            />
          </group>
        ))}
      </group>
    </group>
  );
}
