import { useEffect, useMemo, useState } from "react";
import type { StationId, WorkshopId } from "./types/factory";
import { useFactoryState } from "./hooks/useFactoryState";
import TopBar from "./components/hud/TopBar";
import WorkshopPanel from "./components/hud/WorkshopPanel";
import StationDrawer from "./components/hud/StationDrawer";
import FactoryCanvas from "./components/scene/FactoryCanvas";

const reduceMotionInit = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Assemblage Radar 3D + Cockpit HTML (§7) : la scène remonte le clic, le HUD
// porte 100 % des informations. La scène ne lit que l'état et isPaused.
export default function App() {
  const { state, connection, approveDock, resetDemo } = useFactoryState();
  const [selectedId, setSelectedId] = useState<StationId | null>(null);
  const [openWorkshop, setOpenWorkshop] = useState<WorkshopId | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const reduced = useMemo(reduceMotionInit, []);

  const selectedStation = state.stations.find((s) => s.id === selectedId) || null;

  // Pause globale : bouton HautDroit + raccourci Espace ; Échap ferme fiche/drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "p") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        setIsPaused((v) => !v);
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setOpenWorkshop(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleApprove = () => {
    approveDock();
    // la fiche se met à jour via l'état (quai → ok, feu vert dessiné)
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-factory-bg text-white">
      <FactoryCanvas
        stations={state.stations}
        flows={state.flows}
        selectedId={selectedId}
        isPaused={isPaused}
        onSelectStation={(id) => {
          setSelectedId(id);
          setOpenWorkshop(null);
        }}
      />

      <TopBar
        workshopsCount={state.globalKpis.workshopsCount}
        ideasTotal={state.globalKpis.ideasTotal}
        ideasToSort={state.globalKpis.ideasToSort}
        connection={connection}
        isPaused={isPaused}
        reduced={reduced}
        onTogglePause={() => setIsPaused((v) => !v)}
        onReset={() => {
          resetDemo();
          setSelectedId(null);
          setOpenWorkshop(null);
        }}
      />

      <WorkshopPanel
        workshops={state.workshops}
        openId={openWorkshop}
        onOpen={(id) => {
          setOpenWorkshop(id);
          setSelectedId(null);
        }}
        onClose={() => {
          setOpenWorkshop(null);
          setSelectedId(null);
        }}
      />

      <StationDrawer
        station={selectedStation}
        onClose={() => setSelectedId(null)}
        onApprove={handleApprove}
      />

    </div>
  );
}
