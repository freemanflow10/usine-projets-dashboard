import { Canvas } from "@react-three/fiber";
import { ContactShadows, Grid, MapControls } from "@react-three/drei";
import type { StationId, Station, ConveyorFlow } from "../../types/factory";
import ControlBooth from "./ControlBooth";
import RobotArm from "./RobotArm";
import StationNode from "./StationNode";
import DeliveryTruck from "./DeliveryTruck";
import ConveyorBelt from "./ConveyorBelt";
import FactoryEnvironment from "./FactoryEnvironment";
import FactoryPostProcessing from "./FactoryPostProcessing";

// Post-traitement désactivé par défaut : l'EffectComposer/UnrealBloomPass
// produit un rendu noir sur certains GPU/ANGLE sans erreur console. La scène
// procédurale (matériaux emissifs + pointLights) reste correcte sans bloom.
// Réactivation : `VITE_ENABLE_BLOOM=1 pnpm build`.
const ENABLE_BLOOM =
  (import.meta.env as Record<string, string | undefined>).VITE_ENABLE_BLOOM ===
  "1";

export interface FactoryCanvasProps {
  stations: Station[];
  flows: ConveyorFlow[];
  selectedId: StationId | null;
  isPaused: boolean;
  onSelectStation: (id: StationId) => void;
}

export default function FactoryCanvas({
  stations,
  flows,
  selectedId,
  isPaused,
  onSelectStation,
}: FactoryCanvasProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        orthographic
        frameloop={isPaused ? "demand" : "always"}
        shadows="percentage"
        camera={{ position: [22, 24, 22], zoom: 75, near: 0.1, far: 200, up: [0, 1, 0] }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#12161f"]} />
        {/* Caméra isométrique verrouillée : rotation impossible (§3) */}
        <MapControls
          enableRotate={false}
          enablePan={true}
          enableZoom={true}
          minZoom={45}
          maxZoom={150}
          panSpeed={1.1}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.02, 0]}
          receiveShadow
        >
          <planeGeometry args={[64, 64]} />
          <meshStandardMaterial
            color="#141821"
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>
        <Grid
          args={[64, 64]}
          position={[0, 0.005, 0]}
          cellSize={1}
          cellThickness={0.55}
          cellColor="#263042"
          sectionSize={4}
          sectionThickness={1.1}
          sectionColor="#3a4861"
          fadeDistance={45}
          fadeStrength={1.4}
        />

        <FactoryEnvironment />
        <ambientLight intensity={0.6} />
        <hemisphereLight args={["#b8d0ff", "#1a2030", 0.5]} />
        <directionalLight
          position={[18, 28, 16]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-28}
          shadow-camera-right={28}
          shadow-camera-top={28}
          shadow-camera-bottom={-28}
        />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.65}
          scale={35}
          blur={2}
          far={6}
          frames={1}
        />

        {stations.map((st) => {
          const common = {
            selected: selectedId === st.id,
            isPaused,
            onSelect: () => onSelectStation(st.id),
          };
          if (st.kind === "booth") return <ControlBooth key={st.id} {...common} station={st} />;
          if (st.kind === "robot") return <RobotArm key={st.id} {...common} station={st} />;
          if (st.kind === "dock") return <DeliveryTruck key={st.id} {...common} station={st} />;
          return <StationNode key={st.id} {...common} station={st} />;
        })}

        {flows.map((flow) => (
          <ConveyorBelt key={flow.id} flow={flow} isPaused={isPaused} />
        ))}
        {ENABLE_BLOOM ? <FactoryPostProcessing /> : null}
      </Canvas>
    </div>
  );
}
