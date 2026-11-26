const MODEL_BASE = `${import.meta.env.BASE_URL}models/`;

export const FACTORY_MODEL_URLS = {
  robotArm: `${MODEL_BASE}robot-arm.glb`,
  controlBooth: `${MODEL_BASE}control-booth.glb`,
  silo: `${MODEL_BASE}silo.glb`,
  serverRack: `${MODEL_BASE}server-rack.glb`,
  truck: `${MODEL_BASE}truck.glb`,
  cardboardBox: `${MODEL_BASE}cardboard-box.glb`,
} as const;
