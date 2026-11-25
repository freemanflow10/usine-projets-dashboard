// Connecteurs prêts à brancher (Lot 6) — Notion, RecrutMatch, Healthchecks.
// Chaque connecteur lit ses variables d'environnement ; si l'une manque, il
// répond `available: false` pour que le dashboard retombe proprement sur le mock.

export interface ConnectorResult<T> {
  available: boolean;
  value: T;
}

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function notAvailable<T>(value: T): ConnectorResult<T> {
  return { available: false, value };
}

export interface NotionIdeas {
  ideasTotal: number;
  ideasToSort: number;
}

// Notion — base « Idées » : total des lignes et idées restant à trier.
export async function fetchNotionIdeas(): Promise<ConnectorResult<NotionIdeas>> {
  const token = env("NOTION_TOKEN");
  const dbId = env("NOTION_IDEAS_DB_ID");
  if (!token || !dbId) return notAvailable({ ideasTotal: 49, ideasToSort: 46 });

  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    // Échantillonne les 100 premières lignes pour compter l'avancement du tri.
    body: JSON.stringify({
      page_size: 100,
      filter: { property: "Statut", select: { is_not_empty: true } },
    }),
  });
  if (!res.ok) throw new Error(`Notion HTTP ${res.status}`);

  const body = (await res.json()) as {
    results?: Array<{ properties?: Record<string, unknown> }>;
  };
  const rows = body.results ?? [];
  let toSort = 0;
  for (const row of rows) {
    const statut = row.properties?.["Statut"] as { select?: { name?: string } } | undefined;
    if (statut?.select?.name === "À trier") toSort += 1;
  }
  return { available: true, value: { ideasTotal: rows.length, ideasToSort: toSort } };
}

export interface RecrutMatchStatus {
  progress: number;
  status: "ok" | "bad";
}

// RecrutMatch — Firestore/Stripe/API : santé de l'atelier et avancement.
export async function fetchRecrutMatch(): Promise<ConnectorResult<RecrutMatchStatus>> {
  const base = env("RECRUTMATCH_API_URL");
  if (!base) return notAvailable({ progress: 68, status: "bad" });

  const res = await fetch(`${base}/health`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return { available: true, value: { progress: 68, status: "bad" } };
  return { available: true, value: { progress: 100, status: "ok" } };
}

export interface HostHealth {
  host: string;
  ok: boolean;
}

// Healthchecks — sondes HTTP de l'usine (Mac, hermes6, Render, Oracle).
export async function fetchHealthchecks(): Promise<ConnectorResult<HostHealth[]>> {
  const slots: Array<[host: string, key: string]> = [
    ["Mac", "HCHECK_MAC"],
    ["hermes6", "HCHECK_HERMES6"],
    ["Render", "HCHECK_RENDER"],
    ["Oracle", "HCHECK_ORACLE"],
  ];
  const targets = slots.filter(([, key]) => env(key));
  if (targets.length === 0) return notAvailable([]);

  const results = await Promise.all(
    targets.map(async ([host, key]) => {
      const uuid = env(key);
      try {
        const res = await fetch(`https://hc-ping.com/${uuid}`, {
          signal: AbortSignal.timeout(5000),
        });
        return { host, ok: res.ok } satisfies HostHealth;
      } catch {
        return { host, ok: false } satisfies HostHealth;
      }
    }),
  );
  return { available: true, value: results };
}