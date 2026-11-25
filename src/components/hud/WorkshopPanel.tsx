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
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-factory-mut">
          Bureau du chef
        </p>
        <h2 className="text-base font-extrabold text-white">
          4 ateliers · Cockpit
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {workshops.map((w) => {
          const isOpen = w.id === openId;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => (isOpen ? onClose() : onOpen(w.id))}
              className={`workshop-card flex flex-col gap-1.5 rounded-xl border bg-factory-card2 px-2.5 py-2 text-left ${
                isOpen ? "active border-factory-acc" : "border-factory-line"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <i className={DOT_CLASS[w.status]} />
                <b className="truncate text-[13px] leading-tight text-white">
                  {w.title}
                </b>
              </span>
              <span className="progress">
                <i
                  style={{
                    width: `${w.progress}%`,
                    background: STATUS_COLOR[w.status],
                  }}
                />
              </span>
              <span className="text-[11px] text-factory-mut">
                {w.progress} % · {w.worker}
              </span>
            </button>
          );
        })}
      </div>

      {open ? (
        <div className="drawer-in flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl border border-factory-acc/40 bg-factory-card2 p-3">
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
            {open.kpis.map((k) => (
              <span key={k.label} className="flex justify-between gap-2">
                <span className="text-factory-mut">{k.label}</span>
                <b className="text-white">{k.value}</b>
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
          <button
            type="button"
            className="mt-auto rounded-lg bg-factory-acc px-3 py-2 text-sm font-extrabold text-black transition hover:brightness-110"
          >
            {open.nextAction}
          </button>
        </div>
      ) : (
        <p className="mt-auto text-center text-[12px] text-factory-mut/70">
          Cliquez un atelier pour ouvrir sa fiche
        </p>
      )}
    </aside>
  );
}