import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Boxes, Cpu, Lightbulb, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiOverviewProps {
  workshopsCount: number;
  ideasTotal: number;
  ideasToSort: number;
  stationsCount: number;
  updatedAt: string;
  isPaused: boolean;
  reduced: boolean;
}

interface Metric {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  highlight?: boolean;
}

interface NumberTickerProps {
  value: number;
  isPaused: boolean;
  reduced: boolean;
}

const numberFormat = new Intl.NumberFormat("fr-FR");

function NumberTicker({ value, isPaused, reduced }: NumberTickerProps): ReactElement {
  const [displayed, setDisplayed] = useState(reduced ? value : 0);
  const displayedRef = useRef(displayed);

  useEffect(() => {
    if (reduced || isPaused) {
      displayedRef.current = value;
      if (reduced) return;

      const pausedFrame = window.requestAnimationFrame(() => setDisplayed(value));
      return () => window.cancelAnimationFrame(pausedFrame);
    }

    const startValue = displayedRef.current;
    const startTime = performance.now();
    const duration = 850;
    let frameId = 0;

    const step = (now: number): void => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + (value - startValue) * easedProgress);
      displayedRef.current = nextValue;
      setDisplayed(nextValue);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        displayedRef.current = value;
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [isPaused, reduced, value]);

  const visibleValue = reduced || isPaused ? value : displayed;
  return <span aria-hidden="true">{numberFormat.format(visibleValue)}</span>;
}

function formatUpdatedAt(updatedAt: string): string {
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return "Date non disponible";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export default function KpiOverview({
  workshopsCount,
  ideasTotal,
  ideasToSort,
  stationsCount,
  updatedAt,
  isPaused,
  reduced,
}: KpiOverviewProps): ReactElement {
  const metrics: Metric[] = [
    {
      label: "Ateliers suivis",
      value: workshopsCount,
      note: "Portefeuille de projets",
      icon: Boxes,
    },
    {
      label: "Idées au portefeuille",
      value: ideasTotal,
      note: "Volume suivi",
      icon: Lightbulb,
    },
    {
      label: "À trier",
      value: ideasToSort,
      note: "File de l’atelier idées",
      icon: ListTodo,
      highlight: ideasToSort > 0,
    },
    {
      label: "Stations suivies",
      value: stationsCount,
      note: "Postes de l’usine",
      icon: Cpu,
    },
  ];

  return (
    <section aria-labelledby="kpi-overview-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-factory-acc">
            KPI overview
          </p>
          <h2 id="kpi-overview-title" className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Vue d’ensemble
          </h2>
        </div>
        <p className="text-xs text-factory-mut sm:text-sm">
          Mise à jour · {formatUpdatedAt(updatedAt)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              role="group"
              aria-label={`${metric.label} : ${metric.value}`}
              className={`kpi-card rounded-2xl border p-4 sm:p-5 ${
                metric.highlight
                  ? "kpi-highlight border-factory-acc/45 bg-factory-card2/90"
                  : "border-factory-line/80 bg-factory-card/90"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium text-factory-mut sm:text-xs">{metric.label}</p>
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-factory-acc">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                <NumberTicker value={metric.value} isPaused={isPaused} reduced={reduced} />
              </p>
              <p className="mt-1 text-[11px] text-factory-mut/80 sm:text-xs">{metric.note}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
