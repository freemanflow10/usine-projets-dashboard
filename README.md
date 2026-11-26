# L'usine des projets — Tableau de bord global

Tableau de bord de pilotage des projets, ateliers et stations de l’usine.
L’interface principale présente les indicateurs globaux, les fiches projets et
une vue de progression par atelier.

## Stack

React 19 · TypeScript strict · Vite 8 · Tailwind CSS 4 ·
`@react-three/fiber` 9 · `@react-three/drei` 10 · three · lucide-react.
Gestionnaire de paquets : **pnpm uniquement**.

## Architecture (découplée)

- `src/types/factory.ts` — contrat de données (source de vérité).
- `src/data/mockFactoryState.ts` — données initiales + coordonnées 3D (§5).
- `src/hooks/useFactoryState.ts` — accès à l'état + polling `/api/factory-state`.
- `src/components/dashboard/` — indicateurs globaux et liste des stations.
- `src/components/hud/` — cartes et fiches d’atelier, fiche de station.
- `src/components/scene/` — composants Three.js conservés dans le dépôt,
  non montés par le tableau de bord global.
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

## Modèles 3D `.glb`

Les modèles sont unitaires et se placent dans `public/models/`. Le chargeur
les partage par URL avec `useGLTF` et conserve un fallback procédural tant
qu'un fichier manque ou ne se charge pas.

| Fichier | Usage | Budget maximal |
| --- | --- | ---: |
| `robot-arm.glb` | Bras Codex, Gemini et DeepSeek | 300 Ko |
| `control-booth.glb` | Cabine vitrée du bureau | 300 Ko |
| `silo.glb` | Futures cuves d'acquisition réutilisables | 200 Ko |
| `server-rack.glb` | Racks de la salle des machines | 200 Ko |
| `truck.glb` | Camion du quai | 300 Ko |
| `cardboard-box.glb` | Cartons des tapis et des bouchons | 100 Ko |

Garder l'ensemble de l'usine sous **2 Mo** et les textures à **512 × 512 px**
maximum. Avant d'ajouter un modèle, générer le composant TypeScript et la
copie optimisée avec `gltfjsx` :

```bash
pnpm dlx gltfjsx public/models/<nom>.glb --types --transform --resolution 512 --output src/components/scene/<Nom>.tsx
```

`--transform` produit une copie `-transformed.glb` avec compression Draco,
textures WebP redimensionnées et géométries dédupliquées. Après contrôle de
taille, remplacer le fichier source par cette copie en conservant le nom
canonique attendu par le chargeur (par exemple `robot-arm.glb`). Garder le
fichier TypeScript généré pour accéder à une structure de nœuds typée si le
modèle a besoin d'un comportement dédié. Le composant généré référence
initialement la copie `-transformed.glb`; si cette copie est renommée en nom
canonique, ajuster aussi son appel `useGLTF` si le composant généré est utilisé.

Les origines des modèles doivent être alignées sur l'origine de leur station;
les bras, camions et cabines doivent garder l'échelle des fallbacks procéduraux.
Le chargeur surcharge la couleur du bras par `station.color` et active les
ombres sur les meshes. `silo.glb` est réservé aux futures stations d'acquisition
qui ne font pas encore partie du contrat `FactoryState`.
