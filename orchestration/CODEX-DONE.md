# CODEX-DONE — upgrade visuel, UI et modèles `.glb`

Date : 26 novembre 2026

## Résultat

- Caméra orthographique conservée à `[22, 24, 22]`, zoom 75, rotation désactivée.
- Pause bascule le canvas sur `frameloop="demand"` et les animations vérifient `isPaused` ; la reprise réactive les mouvements.
- WorkshopPanel en une colonne défilante, actions jaunes, pied de panneau fixe ; badges non interactifs et espacés.
- Grille, sol, huit stations, deux tapis, robots, cabine et véhicule utilisent des géométries procédurales. Les `.glb` restent optionnels et ont un fallback sûr si le fichier est absent.

## Cause de la scène noire

1. `FactoryCanvas.tsx` montait `FactoryPostProcessing` sans importer le composant. Le navigateur levait `ReferenceError: FactoryPostProcessing is not defined` et démontait l'application React.
2. Placer `OutputPass` après `UnrealBloomPass` dans cet `EffectComposer` produisait un canvas noir. La configuration conserve `RenderPass`, puis `UnrealBloomPass` en dernier, qui compose à l'écran.

Le composer suit la taille et le pixel ratio du renderer ; le DPR du canvas est plafonné à 1,5. L'éclairage d'environnement est généré localement avec Three.js `RoomEnvironment`, sans preset HDR distant.

## Vérifications

- `pnpm build` : réussi (`tsc -b` strict puis Vite). Bundle JavaScript : 1 297,77 Ko (357,71 Ko gzip) ; avertissement non bloquant de chunk supérieur à 500 Ko.
- `pnpm lint` : réussi ; deux avertissements préexistants dans `src/App.tsx` et `src/hooks/useFactoryState.ts`. Aucun avertissement dans les fichiers de ce lot.
- `git diff --check` : réussi.
- Contrôle navigateur précédent : scène visible, huit labels, deux tapis et HUD ; Pause/Reprendre fonctionnait. Pendant la vérification finale, le DOM a confirmé le titre, le canvas et les huit labels, mais le navigateur de contrôle est devenu non réactif avant une nouvelle capture visuelle. La vérification HTTP/visuelle publique est à compléter après publication.

## Fichiers

Modifiés : `README.md`, `src/App.tsx`, `src/components/hud/WorkshopPanel.tsx`, `src/components/scene/ControlBooth.tsx`, `ConveyorBelt.tsx`, `DeliveryTruck.tsx`, `FactoryCanvas.tsx`, `RobotArm.tsx`, `StationNode.tsx`.

Créés : `orchestration/CODEX-DONE.md`, `public/models/.gitkeep`, `src/components/scene/FactoryEnvironment.tsx`, `FactoryPostProcessing.tsx`, `ModelLoader.tsx`, `StationLabel.tsx`, `createConveyorGeometry.ts`, `modelAssets.ts`.

## Déploiement

À compléter après le commit/push de `main`, la publication du contenu de `dist/` à la racine de `gh-pages`, puis le contrôle HTTP et visuel du site public.
