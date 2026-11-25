# Passation à Codex — L'usine des projets (upgrade visuel, UI & .glb)

Document de passation rédigé par Claude le **25/11/2026** à l'attention de Codex.

## État au moment de la passation

- **Projet :** dashboard 3D isométrique « L'usine des projets », **terminé Lots 1 → 6** du cahier des charges initial et **déployé en ligne** :
  - 🔗 https://freemanflow10.github.io/usine-projets-dashboard/
  - Repo : `freemanflow10/usine-projets-dashboard` — `main` = source, `gh-pages` = déploiement à la racine.
- **Stack :** pnpm · Vite 8 · React 19.3.1 · TypeScript strict (`noUnusedLocals`, `noUncheckedIndexedAccess`, `erasableSyntaxOnly`) · Tailwind CSS 4 · `@react-three/fiber` 9.8.2 · `@react-three/drei` 10.7.9 · three 0.187 · lucide-react.
- Le dépôt `usine-3d` (prototype Three.js pur) est archivé et ne doit pas être touché.

## Structure existante (déjà en place)

| Dossier/Fichier | Rôle |
| :--- | :--- |
| `src/types/factory.ts` | Contrat de données (source de vérité) : `Status`, `Station`, `Workshop`, `ConveyorFlow`, `FactoryState` |
| `src/data/mockFactoryState.ts` | 8 stations + 2 flows (coordonnées §5 du cahier) |
| `src/hooks/useFactoryState.ts` | Hook : mock + polling `VITE_FACTORY_API_BASE` (30 s) + `approveDock` + `resetDemo` |
| `src/components/hud/` | `TopBar` (chips KPIs, badge Maquette/En direct/Hors ligne, Pause), `WorkshopPanel` (4 ateliers, grille 2×2), `StationDrawer` (fiche + Feu vert quai) |
| `src/components/scene/` | `FactoryCanvas`, `ControlBooth`, `RobotArm`, `StationNode`, `DeliveryTruck`, `ConveyorBelt` |
| `server/` | Exemple d'endpoint Node (hors build) : polling, `POST /api/dock/approve` (token), connecteurs Notion/RecrutMatch/Healthchecks |

## Déjà en place côté 3D

- Caméra **orthographique isométrique verrouillée** (`enableRotate={false}`), position `[22, 24, 22]`, zoom 75, `<MapControls>` pan + zoom.
- **Primitives uniquement** (`RoundedBox`, `boxGeometry`, `cylinderGeometry`, `sphereGeometry`, `TubeGeometry`) — **aucun `.glb`/`.gltf`**, **aucun post-processing** (autorisés désormais par le plan).
- Néon simulé par `emissive`/`emissiveIntensity` + `pointLight` locaux. Grille au sol 64×64. `shadows="percentage"`.
- 2 tapis `ConveyorBelt` (CatmullRom) avec cartons animés ; Pause (Espace) fige cartons + bras via `isPaused`.

## Nouvelle mission — DOCUMENT À SUIVRE (obligatoire)

> **Exécuter le plan : `/Users/monmac/Downloads/plan_d_upgrade_visuel_glb_codex.md`**
> (« Plan d'upgrade visuel, UI & .glb modulaire »).

3 phases, dans l'ordre, **`pnpm build` (0 erreur TS) après chacune** :
1. **Phase 1 — HUD & étiquettes 3D** : `WorkshopPanel` en 1 colonne + boutons d'action jaunes sur chaque carte + footer flex ; supprimer l'artefact visuel du bord gauche ; ajouter les badges `<Html>` (nom court) sur les 5 composants scène.
2. **Phase 2 — Rendu R3F** : installer `@react-three/postprocessing` + `postprocessing` (vérifier la compat avec React 19 / R3F 9 / three 0.187) ; fond `#12161f`, sol texturé, `Environment preset="city"`, lumières, `ContactShadows frames={1}`, `EffectComposer` + `Bloom` sélectif (`toneMapped={false}`, `emissiveIntensity={2.2}` sur liserés/voyants/écrans) ; socles `RoundedBox` biseautés ; tapis en vraie bande + rails métalliques/cyan ; cabine vitrée `transmission`.
3. **Phase 3 — Architecture `.glb` modulaire** : 6 assets cibles (budget < 2 Mo), composant `OptionalGlbModel` (`ErrorBoundary` + `<Suspense>`, fallback procédural Phase 2 si le `.glb` manque), dossier `public/models/`, instructions `gltfjsx` documentées dans le `README.md`.

## Règles non négociables (rappel)

- **pnpm uniquement.** `pnpm build` = `tsc -b && vite build`, 0 erreur TypeScript.
- Scène 3D : **aucun `fetch`**, aucun paragraphe ; lit `FactoryState`, remonte `onSelectStation(id)`.
- Caméra verrouillée `enableRotate={false}`.
- Économie GPU : `frameloop={isPaused ? "demand" : "always"}` (pas encore branché), `useGLTF.preload()`, géométrie partagée/`InstancedMesh` pour les cartons, `ContactShadows frames={1}`.
- **Zéro régression** du contrat `FactoryState` et des interactions existantes (`StationDrawer`, « Feu vert » du quai).
- **Aucun secret** : ne jamais committer de token (`.env` est ignoré ; `.env.example` = noms de variables vides uniquement).
- Publier chaque phase sur GitHub (`main`), puis reconstruire et re-servir `gh-pages` (déploiement à la racine, `base: './'`).

## Livrable attendu (fin de mission)

Résumer **uniquement** : fichiers modifiés/créés, versions de dépendances ajustées, coordonnées/ajustements 3D, et points d'attention restants.