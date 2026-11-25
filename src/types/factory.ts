// Source de vérité unique entre composants 3D et HUD (§4 du cahier des charges)

export type Status = "ok" | "warn" | "bad" | "idle";

export interface KpiItem {
  label: string;
  value: string;
}

export type WorkshopId =
  | "idees"
  | "recrutmatch"
  | "architecture"
  | "communication";

export interface Workshop {
  id: WorkshopId;
  title: string;
  status: Status;
  statusText: string;
  progress: number; // 0 à 100
  progressLabel: string;
  worker: string;
  quota: string;
  nextAction: string;
  note: string;
  kpis: KpiItem[];
}

export type StationId =
  | "chef"
  | "codex"
  | "gemini"
  | "deepseek"
  | "qc"
  | "banc"
  | "serveurs"
  | "quai";

export interface Station {
  id: StationId;
  label: string;
  kind: "booth" | "robot" | "machine" | "dock";
  status: Status;
  position: [number, number, number];
  color?: string;
  summary: string;
  metrics: KpiItem[];
  pendingBoxes: number; // Empile des cartons devant le poste si > 0
  canApprove?: boolean; // Affiche le bouton "Feu vert" dans le drawer
}

export interface ConveyorFlow {
  id: string;
  points: [number, number, number][];
  activeBoxes: number;
  speed: number; // Unités par seconde (0 = arrêté)
}

export interface FactoryState {
  updatedAt: string;
  isLive: boolean;
  globalKpis: {
    workshopsCount: number;
    ideasTotal: number;
    ideasToSort: number;
  };
  workshops: Workshop[];
  stations: Station[];
  flows: ConveyorFlow[];
}