import { useState } from "react";
import type { ReactElement } from "react";
import { ArrowUpRight, BarChart3, ChevronRight, LayoutGrid, X } from "lucide-react";
import type { Workshop, WorkshopId, Status } from "../../types/factory";

interface WorkshopPanelProps {
  workshops: Workshop[];
  openId: WorkshopId | null;
  onOpen: (id: WorkshopId) => void;
  onClose: () => void;
}

interface WorkshopViewProps {
  workshops: Workshop[];
  openId: WorkshopId | null;
  onOpen: (id: WorkshopId) => void;
}

type WorkshopView = "cards" | "progress";

const STATUS_META: Record<Status, { label: string; badge: string; bar: string; dot: string }> = {
  ok: {
    label: "Stable",
    badge: "border-factory-ok/25 bg-factory-ok/10 text-factory-ok",
    bar: "bg-factory-ok",
    dot: "dot-ok",
  },
  warn: {
    label: "À surveiller",
    badge: "border-factory-warn/25 bg-factory-warn/10 text-factory-warn",
    bar: "bg-factory-warn",
    dot: "dot-warn",
  },
  bad: {
    label: "Bloqué",
    badge: "border-factory-bad/25 bg-factory-bad/10 text-factory-bad",
    bar: "bg-factory-bad",
    dot: "dot-bad",
  },
  idle: {
    label: "En veille",
    badge: "border-white/10 bg-white/[0.035] text-factory-mut",
    bar: "bg-slate-500",
    dot: "dot-idle",
  },
};

const STATUS_ORDER: Status[] = ["ok", "warn", "bad", "idle"];

function getProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function WorkshopStatus({ status }: { status: Status }): ReactElement {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${meta.badge}`}>
      <i className={`dot !h-1.5 !w-1.5 ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function WorkshopDetails({ workshop, onClose }: { workshop: Workshop; onClose: () => void }): ReactElement {
  return (
    <section id={`workshop-details-${workshop.id}`} aria-label={`Fiche atelier : ${workshop.title}`} className="mt-5 rounded-2xl border border-factory-acc/30 bg-factory-card2/85 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-factory-acc">Fiche atelier</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{workshop.title}</h3>
            <WorkshopStatus status={workshop.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche atelier"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-factory-mut transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-factory-acc"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-factory-mut">{workshop.statusText}</p>

      {workshop.kpis.length > 0 ? (
        <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {workshop.kpis.map((kpi) => (
            <div key={kpi.label} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/15 px-3 py-2.5">
              <dt className="text-xs text-factory-mut">{kpi.label}</dt>
              <dd className="text-sm font-semibold text-white">{kpi.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.07] bg-black/15 px-3 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-factory-mut">Responsable</p>
          <p className="mt-1 text-sm font-medium text-white">{workshop.worker}</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-black/15 px-3 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-factory-mut">Quota</p>
          <p className="mt-1 text-sm font-medium text-white">{workshop.quota}</p>
        </div>
      </div>

      {workshop.note ? <p className="mt-4 text-xs leading-relaxed text-factory-mut">{workshop.note}</p> : null}

      <div className="mt-4 rounded-xl border border-factory-acc/15 bg-factory-acc/[0.06] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-factory-acc">Prochaine action</p>
        <p className="mt-1 text-sm font-medium text-white">{workshop.nextAction}</p>
      </div>
    </section>
  );
}

function WorkshopCards({ workshops, openId, onOpen }: WorkshopViewProps): ReactElement {
  if (workshops.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-factory-line p-6 text-sm text-factory-mut">
        Aucun atelier n’est disponible.
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {workshops.map((workshop, index) => {
        const meta = STATUS_META[workshop.status];
        const progress = getProgress(workshop.progress);
        const isOpen = workshop.id === openId;

        return (
          <article
            key={workshop.id}
            className={`dashboard-card rounded-2xl border bg-factory-card/85 p-4 shadow-panel transition-colors hover:border-factory-acc/35 sm:p-5 ${
              isOpen ? "border-factory-acc/45" : "border-factory-line/80"
            }`}
            style={{ animationDelay: `${index * 85}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpen(workshop.id)}
                aria-expanded={isOpen}
                aria-controls={isOpen ? `workshop-details-${workshop.id}` : undefined}
                className="min-w-0 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-factory-acc"
              >
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-factory-mut">
                  Atelier
                </span>
                <span className="mt-1 block text-base font-semibold leading-snug text-white sm:text-lg">
                  {workshop.title}
                </span>
              </button>
              <WorkshopStatus status={workshop.status} />
            </div>

            <p className="mt-3 min-h-10 text-xs leading-relaxed text-factory-mut">
              {workshop.statusText}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-factory-mut">Avancement</span>
              <span className="text-sm font-semibold text-white">
                {workshop.progressLabel || `${progress}%`}
              </span>
            </div>
            <div
              className="progress mt-2 h-2"
              role="progressbar"
              aria-label={`Avancement de ${workshop.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <i className={`progress-fill ${meta.bar}`} style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-factory-mut">
                Responsable <b className="font-medium text-white">{workshop.worker}</b>
              </span>
              <span className="text-factory-mut">
                Quota <b className="font-medium text-white">{workshop.quota}</b>
              </span>
            </div>

            {workshop.kpis.length > 0 ? (
              <dl className="mt-4 grid grid-cols-2 gap-2">
                {workshop.kpis.slice(0, 2).map((kpi) => (
                  <div key={kpi.label} className="min-w-0 rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2">
                    <dt className="truncate text-[10px] text-factory-mut">{kpi.label}</dt>
                    <dd className="mt-1 truncate text-xs font-semibold text-white">{kpi.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.07] pt-3">
              <p className="min-w-0 text-[11px] leading-snug text-factory-mut">
                <span className="font-semibold text-factory-acc">À faire · </span>
                {workshop.nextAction}
              </p>
              <button
                type="button"
                onClick={() => onOpen(workshop.id)}
                aria-label={`${isOpen ? "Afficher" : "Ouvrir"} la fiche ${workshop.title}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-factory-acc"
              >
                Fiche
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-factory-acc" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProgressView({ workshops, openId, onOpen }: WorkshopViewProps): ReactElement {
  if (workshops.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-factory-line p-6 text-sm text-factory-mut">
        Aucun atelier n’est disponible.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-factory-line/80 bg-factory-card/80 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Avancement par atelier</h3>
          <p className="mt-1 text-xs text-factory-mut">Progression déclarée dans les données de chaque projet</p>
        </div>
        <span className="text-xs text-factory-mut">Échelle · 0 à 100 %</span>
      </div>

      <div className="mt-6 space-y-5">
        {workshops.map((workshop) => {
          const meta = STATUS_META[workshop.status];
          const progress = getProgress(workshop.progress);
          const isOpen = workshop.id === openId;

          return (
            <button
              key={workshop.id}
              type="button"
              onClick={() => onOpen(workshop.id)}
              aria-pressed={isOpen}
              className="group block w-full rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-factory-acc"
            >
              <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-medium text-white transition group-hover:text-factory-acc">
                  {workshop.title}
                </span>
                <span className="flex items-center gap-2 text-xs text-factory-mut">
                  {workshop.worker}
                  <b className="font-semibold text-white">{workshop.progressLabel || `${progress}%`}</b>
                </span>
              </span>
              <span className="progress mt-2 block h-2.5" aria-hidden="true">
                <i className={`progress-fill ${meta.bar}`} style={{ width: `${progress}%` }} />
              </span>
              <span className="mt-2 flex items-center gap-2 text-[10px] text-factory-mut">
                <i className={`dot !h-1.5 !w-1.5 ${meta.dot}`} />
                {meta.label}
                {isOpen ? <span className="text-factory-acc">· fiche ouverte</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[0.07] pt-4">
        {STATUS_ORDER.map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5 text-[10px] text-factory-mut">
            <i className={`dot !h-1.5 !w-1.5 ${STATUS_META[status].dot}`} />
            {STATUS_META[status].label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WorkshopPanel({
  workshops,
  openId,
  onOpen,
  onClose,
}: WorkshopPanelProps): ReactElement {
  const [view, setView] = useState<WorkshopView>("cards");
  const selected = workshops.find((workshop) => workshop.id === openId) ?? null;
  const handleOpen = (id: WorkshopId): void => {
    if (id === openId) {
      onClose();
      return;
    }
    onOpen(id);
  };

  return (
    <section id="ateliers" aria-labelledby="workshops-title" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-factory-mut">
            Portefeuille
          </p>
          <h2 id="workshops-title" className="mt-1 text-xl font-semibold text-white sm:text-2xl">
            Ateliers
          </h2>
        </div>

        <div aria-label="Mode de visualisation des ateliers" className="inline-flex rounded-xl border border-factory-line bg-factory-card p-1">
          <button
            type="button"
            onClick={() => setView("cards")}
            aria-pressed={view === "cards"}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-factory-acc ${
              view === "cards" ? "bg-factory-acc/[0.12] text-white" : "text-factory-mut hover:text-white"
            }`}
          >
            <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" />
            Cartes
          </button>
          <button
            type="button"
            onClick={() => setView("progress")}
            aria-pressed={view === "progress"}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-factory-acc ${
              view === "progress" ? "bg-factory-acc/[0.12] text-white" : "text-factory-mut hover:text-white"
            }`}
          >
            <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />
            Avancement
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-factory-mut">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/[0.04] text-factory-acc">
          {view === "cards" ? <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" /> : <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />}
        </span>
        {view === "cards" ? "État, progression et prochaine action" : "Comparaison visuelle des progressions"}
        <ArrowUpRight aria-hidden="true" className="ml-auto h-3.5 w-3.5 text-factory-acc" />
      </div>

      {view === "cards" ? (
        <WorkshopCards workshops={workshops} openId={openId} onOpen={handleOpen} />
      ) : (
        <ProgressView workshops={workshops} openId={openId} onOpen={handleOpen} />
      )}

      {selected ? <WorkshopDetails workshop={selected} onClose={onClose} /> : null}
    </section>
  );
}
