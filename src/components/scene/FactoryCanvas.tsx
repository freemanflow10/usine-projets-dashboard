import { Canvas } from "@react-three/fiber";
import { Grid, MapControls } from "@react-three/drei";
import type { StationId, Station, ConveyorFlow } from "../../types/factory";
import ControlBooth from "./ControlBooth";
import RobotArm from "./RobotArm";
import StationNode from "./StationNode";
import DeliveryTruck from "./DeliveryTruck";
import ConveyorBelt from "./ConveyorBelt";

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
        shadows="percentage"
        camera={{ position: [22, 24, 22], zoom: 75, near: 0.1, far: 200, up: [0, 1, 0] }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        {/* Caméra isométrique verrouillée : rotation impossible (§3) */}
        <MapControls
          enableRotate={false}
          enablePan={true}
          enableZoom={true}
          minZoom={45}
          maxZoom={150}
          panSpeed={1.1}
        />

        {/* Sol sombre + grille discrète */}
        <Grid
          args={[64, 64]}
          position={[0, 0, 0]}
          cellSize={1}
          cellThickness={0.55}
          cellColor="#182330"
          sectionSize={4}
          sectionThickness={1.1}
          sectionColor="#223048"
          fadeDistance={55}
          fadeStrength={1.4}
        />

        {/* Lumières : zénithale (ombres) + accent cyan central */}
        <ambientLight intensity={0.55} color="#dbe4ff" />
        <directionalLight
          position={[15, 25, 15]}
          intensity={2.2}
          color="#fff2dd"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-28}
          shadow-camera-right={28}
          shadow-camera-top={28}
          shadow-camera-bottom={-28}
        />
        <pointLight position={[0, 3.5, 0]} intensity={0.35} color="#38e8ff" distance={12} />

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
      </Canvas>
    </div>
  );
}