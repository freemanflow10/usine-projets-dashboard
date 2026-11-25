import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import type { ConveyorFlow } from "../../types/factory";

export interface ConveyorBeltProps {
  flow: ConveyorFlow;
  isPaused: boolean;
}

const BELT_FLAT = 0.12; // aplatissement vertical du tapis (tube → ruban)

// Tapis roulant lumineux : courbe CatmullRom + rails cyan + cartons animés (§5)
function ConveyorBelt({ flow, isPaused }: ConveyorBeltProps) {
  const carts = useRef<Group>(null);
  const progress = useRef(Math.random() * 0.9);

  const model = useMemo(() => {
    const vecs: THREE.Vector3[] = [];
    for (const p of flow.points) {
      vecs.push(new THREE.Vector3(p[0] ?? 0, p[1] ?? 0.25, p[2] ?? 0));
    }
    const curve = new THREE.CatmullRomCurve3(vecs, false, "catmullrom", 0.5);
    const beltGeom = new THREE.TubeGeometry(curve, 96, 0.26, 4, false);

    // rails = courbe décalée de ±0.34 perpendiculairement au tangent local
    const lPts: THREE.Vector3[] = [];
    const rPts: THREE.Vector3[] = [];
    for (let i = 0; i < vecs.length; i++) {
      const v = vecs[i]!;
      const a = vecs[Math.max(0, i - 1)]!;
      const b = vecs[Math.min(vecs.length - 1, i + 1)]!;
      const tan = b.clone().sub(a).normalize();
      const perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      lPts.push(v.clone().addScaledVector(perp, 0.34));
      rPts.push(v.clone().addScaledVector(perp, -0.34));
    }
    const railCurveL = new THREE.CatmullRomCurve3(lPts, false, "catmullrom", 0.5);
    const railCurveR = new THREE.CatmullRomCurve3(rPts, false, "catmullrom", 0.5);

    const boxGeom = new THREE.BoxGeometry(0.48, 0.3, 0.4);
    const tapeGeom = new THREE.BoxGeometry(0.2, 0.3, 0.012);
    return { curve, beltGeom, railCurveL, railCurveR, boxGeom, tapeGeom, boxCount: flow.activeBoxes };
  }, [flow]);

  useFrame((_, delta) => {
    if (isPaused || !carts.current) return;
    progress.current = (progress.current + flow.speed * delta) % 1;
    const kids = carts.current.children;
    const n = kids.length;
    if (n === 0) return;
    for (let i = 0; i < n; i++) {
      const base = (progress.current + i / n) % 1;
      const p = model.curve.getPointAt(base);
      const tan = model.curve.getTangentAt(base);
      const cart = kids[i] as Group;
      cart.position.set(p.x, p.y + 0.19, p.z);
      cart.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
    }
  });

  return (
    <group>
      {/* corps du tapis (ruban aplati) */}
      <mesh geometry={model.beltGeom} scale={[1, BELT_FLAT, 1]} receiveShadow>
        <meshStandardMaterial color="#1e2533" roughness={0.7} metalness={0.35} />
      </mesh>
      {/* rails cyan émissifs */}
      <mesh>
        <tubeGeometry args={[model.railCurveL, 96, 0.045, 8, false]} />
        <meshStandardMaterial color="#38e8ff" emissive="#38e8ff" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh>
        <tubeGeometry args={[model.railCurveR, 96, 0.045, 8, false]} />
        <meshStandardMaterial color="#38e8ff" emissive="#38e8ff" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* cartons */}
      <group ref={carts}>
        {Array.from({ length: model.boxCount }).map((_, i) => (
          <group key={i} position={[0, -100, 0]}>
            <mesh geometry={model.boxGeom} castShadow>
              <meshStandardMaterial color="#c78c56" roughness={0.8} />
            </mesh>
            <mesh geometry={model.tapeGeom} position={[0, 0, 0.2]}>
              <meshStandardMaterial color="#e8c391" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export default ConveyorBelt;