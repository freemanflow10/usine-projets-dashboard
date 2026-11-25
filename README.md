# L'usine des projets — Dashboard 3D

Dashboard 3D isométrique de pilotage des ateliers, bâti sur le
**cahier des charges `cahier_des_charges_deepseek_l_usine_des_projets.md`**.

## Stack

React 19 · TypeScript strict · Vite 8 · Tailwind CSS 4 ·
`@react-three/fiber` 9 · `@react-three/drei` 10 · three · lucide-react.
Gestionnaire de paquets : **pnpm uniquement**.

## Architecture (découplée)

- `src/types/factory.ts` — contrat de données (source de vérité).
- `src/data/mockFactoryState.ts` — données initiales + coordonnées 3D (§5).
- `src/hooks/useFactoryState.ts` — accès à l'état + polling `/api/factory-state`.
- `src/components/scene/` — scène 3D : aucun `fetch`, aucun texte long,
  lit `FactoryState` et remonte les clics via `onSelectStation(id)`.
- `src/components/hud/` — cockpit HTML/CSS : 100 % des KPIs, cartes,
  barres de progression, boutons.
- `server/` — exemple d'endpoint Node (hors build) : connecteurs
  Notion / RecrutMatch / Healthchecks + `POST /api/dock/approve` par token.

## Développer

```bash
pnpm install
pnpm dev          # http://localhost:4176
pnpm build        # tsc -b && vite build (0 erreur TS exigée)
pnpm preview      # http://localhost:4177
```

## Mode LIVE (Lot 6)

Le dashboard démarre en **Maquette**. Pour le basculer en **En direct** :

1. Démarrer l'API : `node server/factoryState.ts` (Node ≥ 22.6 lit le TS natif).
2. Configurer le front avec l'URL de l'API :
   `VITE_FACTORY_API_BASE=http://localhost:8787 pnpm dev`.

Le badge passe à **En direct** dès le premier `GET /api/factory-state` réussi,
à **Hors ligne** en cas de coupure (les données retombent sur le mock sans
planter la scène). Le feu vert du quai appelle `POST /api/dock/approve`
avec un token Bearer — variable d'environnement, jamais en dur dans le front.

Fichier modèle : `.env.example` (copier vers `.env.local`).

## Déploiement

`pnpm build` avec `base: './'` puis publication du dossier `dist/`
sur GitHub Pages (voir la branche `gh-pages`).