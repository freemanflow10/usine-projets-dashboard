import type { Station, Status } from "../../types/factory";

export interface StationDrawerProps {
  station: Station | null;
  onClose: () => void;
  onApprove: () => void;
}

const STATUS_PILL: Record<Status, { label: string; cls: string }> = {
  ok: { label: "OK", cls: "dot-ok" },
  warn: { label: "Surveillé", cls: "dot-warn" },
  bad: { label: "Bloqué", cls: "dot-bad" },
  idle: { label: "En veille", cls: "dot-idle" },
};

const KIND_LABEL: Record<Station["kind"], string> = {
  booth: "Bureau",
  robot: "Robot",
  machine: "Machine",
  dock: "Quai",
};

export default function StationDrawer({
  station,
  onClose,
  onApprove,
}: StationDrawerProps) {
  if (!station) return null;
  const pill = STATUS_PILL[station.status];

  return (
    <div className="drawer-in absolute bottom-4 left-4 z-30 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-factory-acc/50 bg-factory-card/95 p-4 backdrop-blur-md shadow-2xl">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-factory-mut">
            {KIND_LABEL[station.kind]} · station
          </p>
          <h3 className="flex items-center gap-2 text-base font-extrabold text-white">
            {station.label}
            <i className={`dot ${pill.cls}`} title={pill.label} />
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-1.5 text-factory-mut transition hover:text-white"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      <p className="mt-2 text-[13px] leading-snug text-factory-mut">
        {station.summary}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
        {station.metrics.map((m) => (
          <span key={m.label} className="flex justify-between gap-2">
            <span className="text-factory-mut">{m.label}</span>
            <b className="text-white">{m.value}</b>
          </span>
        ))}
        <span className="flex justify-between gap-2">
          <span className="text-factory-mut">État</span>
          <b className="text-white">{pill.label}</b>
        </span>
        {station.pendingBoxes > 0 ? (
          <span className="flex justify-between gap-2">
            <span className="text-factory-mut">Cartons</span>
            <b className={station.status === "warn" ? "text-factory-warn" : "text-white"}>
              {station.pendingBoxes}
            </b>
          </span>
        ) : null}
      </div>

      {station.canApprove ? (
        <button
          type="button"
          onClick={onApprove}
          className="mt-3 w-full rounded-lg bg-factory-acc px-3 py-2.5 text-sm font-extrabold text-black transition hover:brightness-110"
        >
          Feu vert · livrer en production
        </button>
      ) : null}
    </div>
  );
}