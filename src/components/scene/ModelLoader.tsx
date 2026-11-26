import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { Color, Mesh } from "three";
import type { Material, Object3D } from "three";

export interface OptionalGlbModelProps {
  url: string;
  fallback: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}

interface ModelBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ModelBoundaryState {
  hasError: boolean;
}

interface ModelSizeCache {
  state: "pending" | "ready";
  bool: boolean;
}

interface ModelInstance {
  object: Object3D;
  materials: Material[];
}

// Un seul probe réseau par URL : le fallback ne tente un chargement GLB que si
// le fichier existe réellement et commence par le magic « glTF ». Ainsi un
// .glb absent n'engendre jamais d'erreur rouge (§4.C du plan).
const modelCache = new Map<string, ModelSizeCache>();

function probeModel(url: string, notify: (ok: boolean) => void): void {
  const hit = modelCache.get(url);
  if (hit && hit.state === "ready") {
    notify(hit.bool);
    return;
  }
  if (!hit) modelCache.set(url, { state: "pending", bool: false });
  void (async () => {
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const head = new Uint8Array(buf, 0, 4);
      // Magic glTF (0x67 0x6c 0x54 0x46) du format binaire GLB.
      const isGlb =
        buf.byteLength >= 12 &&
        head[0] === 0x67 &&
        head[1] === 0x6c &&
        head[2] === 0x54 &&
        head[3] === 0x46;
      modelCache.set(url, { state: "ready", bool: isGlb });
      notify(isGlb);
    } catch {
      modelCache.set(url, { state: "ready", bool: false });
      notify(false);
    }
  })();
}

function useModelAvailable(url: string): boolean {
  const [available, setAvailable] = useState(false);
  const probing = useRef(false);
  useEffect(() => {
    if (probing.current) return;
    probing.current = true;
    probeModel(url, (ok) => setAvailable(ok));
  }, [url]);
  return available;
}

class ModelErrorBoundary extends Component<ModelBoundaryProps, ModelBoundaryState> {
  state: ModelBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ModelBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function cloneModel(scene: Object3D, color?: string): ModelInstance {
  const object = scene.clone(true);
  const materialCopies = new Map<Material, Material>();

  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (!color) return;

    const sourceMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    const copies = sourceMaterials.map((source) => {
      const existingCopy = materialCopies.get(source);
      if (existingCopy) return existingCopy;

      const copy = source.clone();
      if ("color" in copy && copy.color instanceof Color) {
        copy.color.set(color);
      }
      materialCopies.set(source, copy);
      return copy;
    });
    child.material = Array.isArray(child.material) ? copies : copies[0]!;
  });

  return { object, materials: [...materialCopies.values()] };
}

function LoadedGlbModel({ url, color }: { url: string; color?: string }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => cloneModel(scene, color), [color, scene]);

  useEffect(
    () => () => model.materials.forEach((material: Material) => material.dispose()),
    [model],
  );

  return <primitive object={model.object} />;
}

export default function OptionalGlbModel({
  url,
  fallback,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color,
}: OptionalGlbModelProps) {
  const available = useModelAvailable(url);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {available ? (
        <ModelErrorBoundary key={url} fallback={fallback}>
          <Suspense fallback={fallback}>
            <LoadedGlbModel url={url} color={color} />
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        fallback
      )}
    </group>
  );
}
