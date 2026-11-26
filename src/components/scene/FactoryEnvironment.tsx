import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export default function FactoryEnvironment(): null {
  const { gl, scene } = useThree();

  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    const previousEnvironment = scene.environment;
    // The generated reflection map is an imperative Three.js scene effect.
    // eslint-disable-next-line react/immutability
    scene.environment = environment.texture;

    return () => {
      scene.environment = previousEnvironment;
      environment.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene]);

  return null;
}
