import { Vector2 } from "three";
import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export default function FactoryPostProcessing(): null {
  const { camera, gl, scene, size } = useThree();
  const composer = useMemo(() => {
    const effectComposer = new EffectComposer(gl);
    effectComposer.addPass(new RenderPass(scene, camera));
    effectComposer.addPass(
      new UnrealBloomPass(new Vector2(1, 1), 0.75, 0.4, 1.0),
    );
    // Keep bloom last: this pass composites directly to the screen.
    return effectComposer;
  }, [camera, gl, scene]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size.height, size.width]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame((_, delta) => composer.render(delta), 1);
  return null;
}
