import { Pause, Play, RotateCcw, Radio } from "lucide-react";
import type { ConnectionStatus } from "../../hooks/useFactoryState";

export interface TopBarProps {
  workshopsCount: number;
  ideasTotal: number;
  ideasToSort: number;
  connection: ConnectionStatus;
  isPaused: boolean;
  reduced: boolean;
  onTogglePause: () => void;
  onReset: () => void;
}

const BADGE: Record<ConnectionStatus, { label: string; cls: string }> = {
  live: { label: "En direct", cls: "border-factory-ok/40 bg-factory-ok/10 text-factory-ok" },
  offline: { label: "Hors ligne", cls: "border-factory-bad/40 bg-factory-bad/10 text-factory-bad" },
  mock: { label: "Maquette", cls: "border-factory-cyan/40 bg-factory-cyan/10 text-factory-cyan" },
};

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs">
      <b className="text-sm text-factory-acc">{value}</b>
      <span className="text-factory-mut">{label}</span>
    </span>
  );
}

export default function TopBar({
  workshopsCount,
  ideasTotal,
  ideasToSort,
  connection,
  isPaused,
  reduced,
  onTogglePause,
  onReset,
}: TopBarProps) {
  const badge = BADGE[connection];

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <h1 className="text-lg font-extrabold tracking-tight text-white">
        L’usine <span className="text-factory-acc">des projets</span>
      </h1>
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badge.cls}`}
      >
        <Radio className="h-3.5 w-3.5" />
        {badge.label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Kpi label="ateliers suivis" value={workshopsCount} />
        <Kpi label="portefeuille Notion" value={ideasTotal} />
        <Kpi label="à trier" value={ideasToSort} />
      </div>
      <div className="ms-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePause}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-factory-line bg-factory-card px-3 py-1.5 text-sm font-semibold text-white transition hover:border-factory-acc"
          title={reduced ? "Animations réduites" : isPaused ? "Reprendre" : "Pause"}
        >
          {reduced ? (
            <Radio className="h-4 w-4 text-factory-warn" />
          ) : isPaused ? (
            <Play className="h-4 w-4 text-factory-ok" />
          ) : (
            <Pause className="h-4 w-4 text-factory-acc" />
          )}
          {reduced ? "Anim. réduites" : isPaused ? "Reprendre" : "Pause"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-factory-line bg-factory-card px-3 py-1.5 text-sm text-factory-mut transition hover:border-factory-acc hover:text-white"
          title="Réinitialiser la démo"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}