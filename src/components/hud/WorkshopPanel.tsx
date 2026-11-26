import type { Workshop, WorkshopId, Status } from "../../types/factory";

export interface WorkshopPanelProps {
  workshops: Workshop[];
  openId: WorkshopId | null;
  onOpen: (id: WorkshopId) => void;
  onClose: () => void;
}

const STATUS_COLOR: Record<Status, string> = {
  ok: "#3ddc84",
  warn: "#ffb020",
  bad: "#ff4d4d",
  idle: "#64748b",
};

const DOT_CLASS: Record<Status, string> = {
  ok: "dot dot-ok",
  warn: "dot dot-warn",
  bad: "dot dot-bad",
  idle: "dot dot-idle",
};

export default function WorkshopPanel({
  workshops,
  openId,
  onOpen,
  onClose,
}: WorkshopPanelProps) {
  const open = workshops.find((w) => w.id === openId) ?? null;

  return (
    <aside className="absolute right-4 top-16 bottom-4 z-20 flex w-[300px] flex-col gap-3 overflow-hidden rounded-2xl border border-slate-700/60 bg-factory-card/90 p-4 backdrop-blur-md shadow-2xl">
      <div className="shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-factory-mut">
          Bureau du chef
        </p>
        <h2 className="text-base font-extrabold text-white">
          4 ateliers · Cockpit
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3">
          {workshops.map((workshop) => {
            const isOpen = workshop.id === openId;
            return (
              <section
                key={workshop.id}
                className={`workshop-card rounded-xl border bg-factory-card2 p-2.5 ${
                  isOpen ? "active border-factory-acc" : "border-factory-line"
                }`}
              >
                <button
                  type="button"
                  onClick={() => (isOpen ? onClose() : onOpen(workshop.id))}
                  aria-expanded={isOpen}
                  className="flex w-full flex-col gap-1.5 text-left"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <i className={DOT_CLASS[workshop.status]} />
                    <b className="text-[13px] leading-tight text-white">
                      {workshop.title}
                    </b>
                  </span>
                  <span className="progress w-full">
                    <i
                      style={{
                        width: `${workshop.progress}%`,
                        background: STATUS_COLOR[workshop.status],
                      }}
                    />
                  </span>
                  <span className="text-[11px] text-factory-mut">
                    {workshop.progress} % · {workshop.worker}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpen(workshop.id)}
                  aria-label={`Afficher la fiche ${workshop.title} : ${workshop.nextAction}`}
                  className="mt-2 w-full rounded-md bg-[#f5c400] px-3 py-2 text-xs font-semibold text-[#111] transition hover:bg-[#ffda43]"
                >
                  {workshop.nextAction}
                </button>
              </section>
            );
          })}
        </div>

        {open ? (
          <div className="drawer-in mt-3 flex flex-col gap-2.5 rounded-xl border border-factory-acc/40 bg-factory-card2 p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                <i className={DOT_CLASS[open.status]} />
                {open.title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-1.5 text-factory-mut transition hover:text-white"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] leading-snug text-factory-mut">
              {open.statusText}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
              {open.kpis.map((kpi) => (
                <span key={kpi.label} className="flex justify-between gap-2">
                  <span className="text-factory-mut">{kpi.label}</span>
                  <b className="text-white">{kpi.value}</b>
                </span>
              ))}
              <span className="flex justify-between gap-2">
                <span className="text-factory-mut">Quota</span>
                <b className="text-white">{open.quota}</b>
              </span>
            </div>
            {open.note ? (
              <p className="text-[12px] leading-snug text-factory-mut/90">
                {open.note}
              </p>
            ) : null}
            <p className="text-[11px] font-semibold text-factory-acc">
              Prochaine action : {open.nextAction}
            </p>
          </div>
        ) : null}
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 pt-3">
        <p className="text-[10px] leading-tight text-factory-mut/70">
          Cliquez une carte pour ouvrir sa fiche
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md px-1.5 py-1 text-xs font-semibold text-factory-mut transition hover:text-white"
        >
          Vue d’ensemble
        </button>
      </footer>
    </aside>
  );
}
