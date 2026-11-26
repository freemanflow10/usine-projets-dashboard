import type { ReactElement } from "react";
import { Check, X } from "lucide-react";
import type { Station, Status } from "../../types/factory";

interface StationDrawerProps {
  station: Station | null;
  onClose: () => void;
  onApprove: () => void;
}

const STATUS_PILL: Record<Status, { label: string; className: string; dot: string }> = {
  ok: {
    label: "Stable",
    className: "border-factory-ok/25 bg-factory-ok/10 text-factory-ok",
    dot: "dot-ok",
  },
  warn: {
    label: "À surveiller",
    className: "border-factory-warn/25 bg-factory-warn/10 text-factory-warn",
    dot: "dot-warn",
  },
  bad: {
    label: "Bloqué",
    className: "border-factory-bad/25 bg-factory-bad/10 text-factory-bad",
    dot: "dot-bad",
  },
  idle: {
    label: "En veille",
    className: "border-white/10 bg-white/[0.035] text-factory-mut",
    dot: "dot-idle",
  },
};

const KIND_LABEL: Record<Station["kind"], string> = {
  booth: "Bureau",
  robot: "Agent",
  machine: "Machine",
  dock: "Quai",
};

export default function StationDrawer({
  station,
  onClose,
  onApprove,
}: StationDrawerProps): ReactElement | null {
  if (!station) return null;
  const status = STATUS_PILL[station.status];
  const metrics = station.metrics.map((metric) => {
    if (station.canApprove && metric.label === "En attente") {
      return { ...metric, value: String(station.pendingBoxes) };
    }
    return metric;
  });

  return (
    <section aria-label={`Fiche station : ${station.label}`} className="rounded-2xl border border-factory-acc/30 bg-factory-card2/85 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-factory-acc">
            {KIND_LABEL[station.kind]} · station
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">{station.label}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche station"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-factory-mut transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-factory-acc"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${status.className}`}>
        <i className={`dot !h-1.5 !w-1.5 ${status.dot}`} />
        {status.label}
      </span>

      <p className="mt-3 text-xs leading-relaxed text-factory-mut">{station.summary}</p>

      <dl className="mt-4 space-y-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2 last:border-0 last:pb-0">
            <dt className="text-xs text-factory-mut">{metric.label}</dt>
            <dd className="text-xs font-semibold text-white">{metric.value}</dd>
          </div>
        ))}
        {station.pendingBoxes > 0 ? (
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
            <dt className="text-xs text-factory-mut">Cartons en attente</dt>
            <dd className="text-xs font-semibold text-factory-warn">{station.pendingBoxes}</dd>
          </div>
        ) : null}
      </dl>

      {station.canApprove ? (
        <button
          type="button"
          onClick={onApprove}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-factory-acc px-3 py-2.5 text-xs font-bold text-[#06221c] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-factory-cyan"
        >
          <Check aria-hidden="true" className="h-4 w-4" />
          Feu vert · livrer en production
        </button>
      ) : null}
    </section>
  );
}
