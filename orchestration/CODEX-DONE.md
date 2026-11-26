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
- Contrôle navigateur local précédent : scène visible, huit labels, deux tapis et HUD ; Pause/Reprendre fonctionnait. La capture visuelle finale/public n'a pas pu être confirmée : JEV a rendu la main avec `Target.createTarget: page unresponsive`.
- Site public `https://freemanflow10.github.io/usine-projets-dashboard/` : HTTP 200. L'HTML référence `assets/index-Y84J_jir.js` et `assets/index-C1LFeHJu.css` ; le bundle JavaScript répond aussi HTTP 200. Le contenu est bien publié, mais l'affichage du canvas sur le site public reste à recontrôler visuellement dans un navigateur réactif.

## Fichiers

Modifiés : `README.md`, `src/App.tsx`, `src/components/hud/WorkshopPanel.tsx`, `src/components/scene/ControlBooth.tsx`, `ConveyorBelt.tsx`, `DeliveryTruck.tsx`, `FactoryCanvas.tsx`, `RobotArm.tsx`, `StationNode.tsx`.

Créés : `orchestration/CODEX-DONE.md`, `public/models/.gitkeep`, `src/components/scene/FactoryEnvironment.tsx`, `FactoryPostProcessing.tsx`, `ModelLoader.tsx`, `StationLabel.tsx`, `createConveyorGeometry.ts`, `modelAssets.ts`.

## Déploiement

- `main` : `968755ad8d2f79ebcad3574e6adc8c880be03d5d` (`Rendre visible l'usine 3D et moderniser le cockpit`), poussé.
- `gh-pages` : `537e656bd1099a363e830b07bb56371260bdfa3c` (`Publier le rendu 3D et les modèles optionnels`), poussé à la racine avec les fichiers du build.
- Vérification HTTP du site et du bundle : 200.
- Réserve : le contrôle visuel du canvas public reste à faire dans un navigateur qui répond ; aucune preuve visuelle finale n'a pu être obtenue dans cette session.
