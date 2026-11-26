import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { StationId, WorkshopId } from "./types/factory";
import { useFactoryState } from "./hooks/useFactoryState";
import KpiOverview from "./components/dashboard/KpiOverview";
import StationPanel from "./components/dashboard/StationPanel";
import TopBar from "./components/hud/TopBar";
import WorkshopPanel from "./components/hud/WorkshopPanel";
import StationDrawer from "./components/hud/StationDrawer";

function reduceMotionInit(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function App(): ReactElement {
  const { state, connection, approveDock, resetDemo } = useFactoryState();
  const [selectedId, setSelectedId] = useState<StationId | null>(null);
  const [openWorkshop, setOpenWorkshop] = useState<WorkshopId | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [reduced] = useState(reduceMotionInit);
  const selectedStation = state.stations.find((station) => station.id === selectedId) ?? null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setSelectedId(null);
        setOpenWorkshop(null);
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("button, a, input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key === " " || event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsPaused((paused) => !paused);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleOpenWorkshop = (id: WorkshopId): void => {
    setOpenWorkshop(id);
    setSelectedId(null);
  };

  const handleOpenStation = (id: StationId): void => {
    setSelectedId(id);
    setOpenWorkshop(null);
  };

  const handleReset = (): void => {
    resetDemo();
    setSelectedId(null);
    setOpenWorkshop(null);
  };

  return (
    <div id="top" className={`min-h-screen bg-factory-bg text-white ${isPaused ? "dashboard-paused" : ""}`}>
      <TopBar
        connection={connection}
        isPaused={isPaused}
        reduced={reduced}
        onTogglePause={() => setIsPaused((paused) => !paused)}
        onReset={handleReset}
      />

      <main className="mx-auto w-full max-w-[1640px] px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <KpiOverview
          workshopsCount={state.globalKpis.workshopsCount}
          ideasTotal={state.globalKpis.ideasTotal}
          ideasToSort={state.globalKpis.ideasToSort}
          stationsCount={state.stations.length}
          updatedAt={state.updatedAt}
          isPaused={isPaused}
          reduced={reduced}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <WorkshopPanel
            workshops={state.workshops}
            openId={openWorkshop}
            onOpen={handleOpenWorkshop}
            onClose={() => setOpenWorkshop(null)}
          />

          <StationPanel
            stations={state.stations}
            selectedId={selectedId}
            onOpen={handleOpenStation}
            renderDetails={
              selectedStation ? (
                <StationDrawer
                  station={selectedStation}
                  onClose={() => setSelectedId(null)}
                  onApprove={approveDock}
                />
              ) : null
            }
          />
        </div>
      </main>
    </div>
  );
}
