import type { ReactElement, ReactNode } from "react";
import { Bot, Building2, ChevronRight, Cpu, PackageCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Station, StationId, Status } from "../../types/factory";

interface StationPanelProps {
  stations: Station[];
  selectedId: StationId | null;
  onOpen: (id: StationId) => void;
  renderDetails: ReactNode;
}

const STATUS_META: Record<Status, { label: string; dot: string }> = {
  ok: {
    label: "Stable",
    dot: "dot-ok",
  },
  warn: {
    label: "À surveiller",
    dot: "dot-warn",
  },
  bad: {
    label: "Bloqué",
    dot: "dot-bad",
  },
  idle: {
    label: "En veille",
    dot: "dot-idle",
  },
};

const KIND_META: Record<Station["kind"], { label: string; icon: LucideIcon }> = {
  booth: { label: "Bureau", icon: Building2 },
  robot: { label: "Agent", icon: Bot },
  machine: { label: "Machine", icon: Cpu },
  dock: { label: "Quai", icon: PackageCheck },
};

const STATUS_ORDER: Status[] = ["ok", "warn", "bad", "idle"];

export default function StationPanel({
  stations,
  selectedId,
  onOpen,
  renderDetails,
}: StationPanelProps): ReactElement {
  const counts = stations.reduce<Record<Status, number>>(
    (total, station) => {
      total[station.status] += 1;
      return total;
    },
    { ok: 0, warn: 0, bad: 0, idle: 0 },
  );

  return (
    <aside aria-labelledby="stations-title" className="rounded-2xl border border-factory-line/80 bg-factory-card/80 p-4 shadow-panel sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-factory-mut">
            Vue latérale
          </p>
          <h2 id="stations-title" className="mt-1 text-lg font-semibold text-white">
            Stations
          </h2>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-factory-mut">
          {stations.length} postes
        </span>
      </div>

      <div role="group" aria-label="Répartition des statuts" className="mt-4 grid grid-cols-2 gap-2">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="rounded-xl border border-white/[0.07] bg-black/15 px-3 py-2">
            <div className="flex items-center gap-2">
              <i className={`dot ${STATUS_META[status].dot}`} />
              <span className="text-[10px] text-factory-mut">{STATUS_META[status].label}</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-white">{counts[status]}</p>
          </div>
        ))}
      </div>

      {renderDetails ? <div className="mt-4">{renderDetails}</div> : null}

      <div className="mt-5 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-factory-mut">
          Postes de travail
        </h3>
        <span className="text-[10px] text-factory-mut/75">Sélectionnez une station</span>
      </div>

      {stations.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-factory-line p-4 text-sm text-factory-mut">
          Aucune station n’est disponible.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {stations.map((station) => {
            const Icon = KIND_META[station.kind].icon;
            const status = STATUS_META[station.status];
            const isSelected = station.id === selectedId;

            return (
              <li key={station.id}>
                <button
                  type="button"
                  onClick={() => onOpen(station.id)}
                  aria-pressed={isSelected}
                  className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-factory-acc ${
                    isSelected
                      ? "border-factory-acc/45 bg-factory-acc/[0.08]"
                      : "border-white/[0.07] bg-black/10 hover:border-factory-acc/30 hover:bg-white/[0.035]"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-factory-cyan">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-white">{station.label}</span>
                      <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-factory-mut">
                        <i className={`dot !h-2 !w-2 ${status.dot}`} />
                        {status.label}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-[10px] text-factory-mut/75">
                      <span>{KIND_META[station.kind].label}</span>
                      {station.pendingBoxes > 0 ? (
                        <span className="font-medium text-factory-warn">
                          {station.pendingBoxes} en attente
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-factory-mut transition group-hover:translate-x-0.5 group-hover:text-factory-acc" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
