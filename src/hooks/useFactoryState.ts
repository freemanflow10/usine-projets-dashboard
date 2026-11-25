// Accès à l'état de l'usine (§6) : mock par défaut, puis polling /api/factory-state.
// Si VITE_FACTORY_API_BASE est vide (hors-ligne, GitHub Pages), le dashboard
// reste en mode MAQUETTE ; sinon il poll le backend et bascule en LIVE / HORS LIGNE.
import { useCallback, useEffect, useRef, useState } from "react";
import type { FactoryState, Status, Station } from "../types/factory";
import { mockFactoryState } from "../data/mockFactoryState";

export type ConnectionStatus = "live" | "offline" | "mock";

const API_BASE = (import.meta.env.VITE_FACTORY_API_BASE as string | undefined)?.trim() || "";
const APPROVE_TOKEN = (import.meta.env.VITE_APPROVE_TOKEN as string | undefined)?.trim() || "";
const FALLBACK_POLL_MS = 30_000;
const rawPoll = Number(import.meta.env.VITE_FACTORY_POLL_MS ?? FALLBACK_POLL_MS);
const POLL_MS = Number.isFinite(rawPoll) && rawPoll > 0 ? rawPoll : FALLBACK_POLL_MS;

export interface FactoryController {
  state: FactoryState;
  connection: ConnectionStatus;
  approveDock: () => void;
  resetDemo: () => void;
}

const VALID_STATUS: readonly Status[] = ["ok", "warn", "bad", "idle"];

// Garde les statuts reçus du serveur contre toute valeur inattendue.
function toStatus(value: unknown, fallback: Status = "idle"): Status {
  return typeof value === "string" && (VALID_STATUS as readonly string[]).includes(value)
    ? (value as Status)
    : fallback;
}

function normalize(input: FactoryState): FactoryState {
  return {
    ...input,
    stations: input.stations.map((st) => ({ ...st, status: toStatus(st.status) })),
    workshops: input.workshops.map((w) => ({ ...w, status: toStatus(w.status) })),
  };
}

function offlineCopy(source: FactoryState): FactoryState {
  return {
    ...structuredClone(source),
    isLive: false,
    updatedAt: new Date().toISOString(),
  };
}

export function useFactoryState(): FactoryController {
  const [state, setState] = useState<FactoryState>(mockFactoryState);
  const [connection, setConnection] = useState<ConnectionStatus>(
    API_BASE ? "offline" : "mock",
  );
  const lastLive = useRef<FactoryState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const poll = useCallback(async () => {
    if (!API_BASE) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch(`${API_BASE}/api/factory-state`, {
        headers: { Accept: "application/json" },
        signal: ac.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as FactoryState | null;
      if (!data) throw new Error("Réponse vide");
      const live = {
        ...normalize(data),
        isLive: true,
        updatedAt: new Date().toISOString(),
      };
      lastLive.current = live;
      setState(live);
      setConnection("live");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      // Coupure du backend : badge HORS LIGNE, données tombées sur le mock.
      setConnection("offline");
      const last = lastLive.current;
      setState(last ? offlineCopy(last) : offlineCopy(mockFactoryState));
    }
  }, []);

  useEffect(() => {
    if (!API_BASE) return;
    void poll();
    const id = window.setInterval(() => void poll(), POLL_MS);
    return () => {
      window.clearInterval(id);
      abortRef.current?.abort();
    };
  }, [poll]);

  // « Feu vert » du quai : optimiste local, puis POST /api/dock/approve (token d'env).
  const approveDock = useCallback(() => {
    setState((s) => ({
      ...s,
      updatedAt: new Date().toISOString(),
      stations: s.stations.map((st: Station): Station =>
        st.id === "quai"
          ? {
              ...st,
              status: "ok",
              summary: "Feu vert : le lot 3x-A part en production.",
              pendingBoxes: 0,
            }
          : st,
      ),
    }));
    if (!API_BASE || !APPROVE_TOKEN) return;
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/dock/approve`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${APPROVE_TOKEN}`,
          },
          body: JSON.stringify({ stationId: "quai" }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        void poll(); // resynchronise immédiatement avec le serveur
      } catch {
        // Le feu vert local est conservé ; le prochain polling resynchronisera.
      }
    })();
  }, [poll]);

  // Remet l'ensemble à l'état initial (démonstration), puis re-sonde si connecté.
  const resetDemo = useCallback(() => {
    setState(() => structuredClone(mockFactoryState));
    if (API_BASE) {
      lastLive.current = null;
      setConnection("offline");
      void poll();
    } else {
      setConnection("mock");
    }
  }, [poll]);

  return { state, connection, approveDock, resetDemo };
}