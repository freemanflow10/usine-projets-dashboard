// Exemple d'endpoint serveur pour le dashboard « L'usine des projets » (Lot 6).
//
// Lancement : `node server/factoryState.ts`  (Node ≥ 22.6 lit le TS nativement)
//
// Routes :
//   GET  /api/factory-state  → FactoryState complète (badge LIVE côté front).
//   POST /api/dock/approve   → feu vert du quai, token Bearer obligatoire.
//   GET  /healthz            → état de l'endpoint.
//
// Variables d'environnement (voir `.env.example`) : NOTION_TOKEN,
//   NOTION_IDEAS_DB_ID, RECRUTMATCH_API_URL, HCHECK_MAC, HCHECK_HERMES6,
//   HCHECK_RENDER, HCHECK_ORACLE, APPROVE_TOKEN, FACTORY_PORT.
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { FactoryState } from "../src/types/factory.ts";
import { mockFactoryState } from "../src/data/mockFactoryState.ts";
import { fetchNotionIdeas, fetchHealthchecks, fetchRecrutMatch } from "./connectors.ts";

const PORT = Number(process.env.FACTORY_PORT ?? 8787);
const TOKEN = process.env.APPROVE_TOKEN?.trim() ?? "";

// Feu vert du quai : mémoire volontaire, le vrai backend persiste en base.
let quaiApproved = false;

function applyQuai(state: FactoryState): void {
  const quai = state.stations.find((s) => s.id === "quai" && s.canApprove);
  if (quai && quaiApproved) {
    quai.status = "ok";
    quai.pendingBoxes = 0;
    quai.summary = "Feu vert : le lot 3x-A part en production.";
  }
}

async function handleFactoryState(res: ServerResponse): Promise<void> {
  const state = structuredClone(mockFactoryState);
  state.isLive = true;
  state.updatedAt = new Date().toISOString();
  applyQuai(state);

  // Chaque connecteur échouant seul ne doit pas faire tomber toute l'API :
  // la maquette sert de valeur de repli, le badge « HORS LIGNE » fera le reste.
  const [notion, recrut, healths] = await Promise.all([
    fetchNotionIdeas().catch(() => ({ available: false, value: { ideasTotal: 49, ideasToSort: 46 } })),
    fetchRecrutMatch().catch(() => ({ available: false, value: { progress: 68, status: "bad" as const } })),
    fetchHealthchecks().catch(() => ({ available: false, value: [] })),
  ]);

  if (notion.available) {
    state.globalKpis.ideasTotal = notion.value.ideasTotal;
    state.globalKpis.ideasToSort = notion.value.ideasToSort;
  }

  const recrutMatch = state.workshops.find((w) => w.id === "recrutmatch");
  if (recrutMatch && recrut.available) {
    recrutMatch.status = recrut.value.status;
    recrutMatch.statusText =
      recrut.value.status === "ok"
        ? "Service opérationnel"
        : "Dashboard indisponible · cause non confirmée";
    recrutMatch.progress = recrut.value.progress;
    recrutMatch.progressLabel = `${recrut.value.progress} %`;
  }

  if (healths.available) {
    state.stations = state.stations.map((st) => {
      if (st.id !== "serveurs") return st;
      const allOk = healths.value.every((h) => h.ok);
      return {
        ...st,
        status: allOk ? "ok" : "warn",
        summary: allOk
          ? "Racks Mac, hermes6, Render et Oracle sous surveillance."
          : `Sondes : ${healths.value.filter((h) => h.ok).length}/${healths.value.length} en ligne.`,
      };
    });
  }

  send(res, 200, state);
}

async function handleApprove(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const auth = req.headers.authorization ?? "";
  if (!TOKEN || auth !== `Bearer ${TOKEN}`) {
    return send(res, 401, { error: "Token manquant ou invalide." });
  }
  const raw = await readBody(req);
  let body: { stationId?: unknown } = {};
  try {
    body = raw ? (JSON.parse(raw) as { stationId?: unknown }) : {};
  } catch {
    body = {};
  }
  if (body.stationId !== "quai") {
    return send(res, 400, { error: "stationId inconnu." });
  }
  quaiApproved = true;
  send(res, 200, { ok: true, stationId: "quai", approved: true });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk;
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

// CORS : le dashboard vit sur GitHub Pages → origine sans domaine possible.
// Ajoute `--cors-origin http://localhost:4177` pour resserrer en développement.
const CORS_ORIGIN = process.env.FACTORY_CORS_ORIGIN?.trim() || "*";

function send(res: ServerResponse, code: number, body: unknown): void {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  void (async () => {
    const url = req.url ?? "/";
    const path = url.split("?")[0] ?? "/";
    if (req.method === "OPTIONS") return send(res, 204, {});
    if (req.method === "GET" && path === "/healthz") return send(res, 200, { ok: true });
    if (req.method === "GET" && path === "/api/factory-state") return handleFactoryState(res);
    if (req.method === "POST" && path === "/api/dock/approve") return handleApprove(req, res);
    send(res, 404, { error: "Route inconnue." });
  })();
});

server.listen(PORT, () => {
  console.log(`Usine des projets — API : http://localhost:${PORT}/api/factory-state`);
});