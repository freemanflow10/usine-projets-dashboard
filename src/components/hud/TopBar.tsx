import type { ReactElement } from "react";
import { ArrowUpRight, Factory, Pause, Play, Radio, RotateCcw } from "lucide-react";
import type { ConnectionStatus } from "../../hooks/useFactoryState";

interface TopBarProps {
  connection: ConnectionStatus;
  isPaused: boolean;
  reduced: boolean;
  onTogglePause: () => void;
  onReset: () => void;
}

const CONNECTION_BADGE: Record<
  ConnectionStatus,
  { label: string; className: string; dotClassName: string }
> = {
  live: {
    label: "En direct",
    className: "border-factory-ok/25 bg-factory-ok/10 text-factory-ok",
    dotClassName: "bg-factory-ok shadow-[0_0_10px_var(--color-factory-ok)]",
  },
  offline: {
    label: "Hors ligne",
    className: "border-factory-bad/25 bg-factory-bad/10 text-factory-bad",
    dotClassName: "bg-factory-bad shadow-[0_0_10px_var(--color-factory-bad)]",
  },
  mock: {
    label: "Maquette",
    className: "border-factory-cyan/25 bg-factory-cyan/10 text-factory-cyan",
    dotClassName: "bg-factory-cyan shadow-[0_0_10px_var(--color-factory-cyan)]",
  },
};

function PauseStateIcon({ isPaused, reduced }: { isPaused: boolean; reduced: boolean }): ReactElement {
  if (isPaused) return <Play aria-hidden="true" className="h-4 w-4 text-factory-ok" />;
  if (reduced) return <Radio aria-hidden="true" className="h-4 w-4 text-factory-warn" />;
  return <Pause aria-hidden="true" className="h-4 w-4" />;
}

export default function TopBar({
  connection,
  isPaused,
  reduced,
  onTogglePause,
  onReset,
}: TopBarProps): ReactElement {
  const badge = CONNECTION_BADGE[connection];
  let pauseLabel = "Mettre les animations en pause";
  if (isPaused) pauseLabel = "Reprendre les animations";
  else if (reduced) pauseLabel = "Animations réduites par les préférences système";

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-factory-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1640px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-factory-acc sm:gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-factory-acc/25 bg-factory-acc/[0.08] text-factory-acc">
            <Factory aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <h1 className="block truncate text-sm font-semibold tracking-tight text-white sm:text-base">
              <span className="sm:hidden">L’usine<span className="sr-only"> des projets</span></span>
              <span className="hidden sm:inline">L’usine des projets</span>
            </h1>
            <span className="hidden text-[10px] text-factory-mut sm:block">
              Pilotage des ateliers
            </span>
          </span>
        </a>

        <span
          aria-live="polite"
          aria-atomic="true"
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-semibold sm:ml-2 sm:px-2.5 sm:text-xs ${badge.className}`}
        >
          <i aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${badge.dotClassName}`} />
          <span className="sr-only sm:not-sr-only">{badge.label}</span>
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href="#ateliers"
            aria-label="Voir les ateliers"
            title="Voir les ateliers"
            className="grid h-9 w-9 place-items-center rounded-xl border border-factory-acc/40 text-xs font-semibold text-white transition hover:border-factory-acc hover:bg-factory-acc/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-factory-acc sm:flex sm:h-10 sm:w-auto sm:items-center sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            <span className="sr-only sm:not-sr-only">Voir les ateliers</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-factory-acc" />
          </a>
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={pauseLabel}
            aria-pressed={isPaused}
            title={pauseLabel}
            className="grid h-9 w-9 place-items-center rounded-xl border border-factory-line bg-factory-card text-factory-mut transition hover:border-factory-acc/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-factory-acc sm:h-10 sm:w-10"
          >
            <PauseStateIcon isPaused={isPaused} reduced={reduced} />
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Réinitialiser la démonstration"
            title="Réinitialiser la démonstration"
            className="grid h-9 w-9 place-items-center rounded-xl border border-factory-line bg-factory-card text-factory-mut transition hover:border-factory-acc/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-factory-acc sm:h-10 sm:w-10"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
