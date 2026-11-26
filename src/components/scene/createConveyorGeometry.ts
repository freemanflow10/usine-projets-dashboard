import * as THREE from "three";
import type { ConveyorFlow } from "../../types/factory";

const TRACK_SAMPLES = 96;
const BELT_WIDTH = 0.78;
const BELT_THICKNESS = 0.16;

export interface ConveyorGeometry {
  curve: THREE.CatmullRomCurve3;
  belt: THREE.BufferGeometry;
  railCurves: [THREE.CatmullRomCurve3, THREE.CatmullRomCurve3];
  glowCurves: [THREE.CatmullRomCurve3, THREE.CatmullRomCurve3];
  box: THREE.BoxGeometry;
  tape: THREE.BoxGeometry;
  boxCount: number;
}

function createRibbon(curve: THREE.CatmullRomCurve3): THREE.BufferGeometry {
  const positions = new Float32Array((TRACK_SAMPLES + 1) * 4 * 3);
  const indices: number[] = [];
  const halfWidth = BELT_WIDTH / 2;
  const halfThickness = BELT_THICKNESS / 2;

  for (let index = 0; index <= TRACK_SAMPLES; index += 1) {
    const progress = index / TRACK_SAMPLES;
    const center = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
    if (side.lengthSq() < 0.001) side.set(1, 0, 0);
    side.normalize();

    const corners = [
      center.clone().addScaledVector(side, -halfWidth).add(new THREE.Vector3(0, halfThickness, 0)),
      center.clone().addScaledVector(side, halfWidth).add(new THREE.Vector3(0, halfThickness, 0)),
      center.clone().addScaledVector(side, -halfWidth).add(new THREE.Vector3(0, -halfThickness, 0)),
      center.clone().addScaledVector(side, halfWidth).add(new THREE.Vector3(0, -halfThickness, 0)),
    ];
    for (let corner = 0; corner < corners.length; corner += 1) {
      corners[corner]!.toArray(positions, (index * 4 + corner) * 3);
    }

    if (index === TRACK_SAMPLES) continue;
    const current = index * 4;
    const next = current + 4;
    indices.push(
      current, next, current + 1, current + 1, next, next + 1,
      current + 2, current + 3, next + 2, current + 3, next + 3, next + 2,
      current, current + 2, next, next, current + 2, next + 2,
      current + 1, next + 1, current + 3, next + 1, next + 3, current + 3,
    );
  }

  const start = TRACK_SAMPLES * 4;
  indices.push(
    0, 1, 2, 1, 3, 2,
    start, start + 2, start + 1, start + 1, start + 2, start + 3,
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function createOffsetCurve(
  curve: THREE.CatmullRomCurve3,
  offset: number,
  height: number,
): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index <= TRACK_SAMPLES; index += 1) {
    const progress = index / TRACK_SAMPLES;
    const center = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress).normalize();
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
    if (side.lengthSq() < 0.001) side.set(1, 0, 0);
    points.push(center.addScaledVector(side.normalize(), offset).add(new THREE.Vector3(0, height, 0)));
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

export function createConveyorGeometry(flow: ConveyorFlow): ConveyorGeometry {
  const points = flow.points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  return {
    curve,
    belt: createRibbon(curve),
    railCurves: [
      createOffsetCurve(curve, -0.45, 0.14),
      createOffsetCurve(curve, 0.45, 0.14),
    ],
    glowCurves: [
      createOffsetCurve(curve, -0.34, 0.105),
      createOffsetCurve(curve, 0.34, 0.105),
    ],
    box: new THREE.BoxGeometry(0.48, 0.3, 0.4),
    tape: new THREE.BoxGeometry(0.22, 0.3, 0.015),
    boxCount: flow.activeBoxes,
  };
}
