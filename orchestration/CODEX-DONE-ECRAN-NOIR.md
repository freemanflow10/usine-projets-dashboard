# Écran noir — résultat de l’intervention

Date : 26 novembre 2026

## Cause et correctif

La cause était l’échelle CSS des libellés 3D dans `src/components/scene/StationLabel.tsx` (appel `<Html>`, lignes 14–18). La prop `distanceFactor={24}` y était combinée par Drei à la caméra orthographique : dans `node_modules/@react-three/drei/web/Html.js:274`, l’échelle est calculée comme `objectScale(group, camera) * distanceFactor`; pour une caméra orthographique, `objectScale` vaut son zoom. Avec le zoom 75 de `FactoryCanvas.tsx:41`, les étiquettes atteignaient une échelle de `75 × 24 = 1 800`. Leurs grands fonds semi-transparents recouvraient le canvas et le HUD, ne laissant visible que le fond sombre.

Le correctif supprime `distanceFactor` de `StationLabel`. Drei conserve alors l’échelle CSS normale (1). La caméra `[22, 24, 22]`, son zoom 75, la grille, `shadows="percentage"`, `ContactShadows`, `FactoryEnvironment`, la garde WebGL et le bloom désactivé par défaut sont inchangés.

Les essais de zoom réduit et de désactivation des ombres n’ont pas fait apparaître la scène. Après le seul retrait de `distanceFactor`, le rendu est revenu alors que grille, ombres, `ContactShadows` et PMREM restaient actifs : ces effets n’étaient pas la cause.

## Vérifications

- `git diff --check` : réussi.
- `pnpm build` : réussi (`tsc -b` et Vite, aucune erreur TypeScript). Vite signale seulement le bundle JavaScript supérieur à 500 kB.
- `pnpm lint` : code de sortie 0 ; trois avertissements préexistants dans `src/App.tsx` et `src/hooks/useFactoryState.ts`.
- Preview local construit : WebGL2 actif. Capture 1440 × 813 ; luminance moyenne 0,2365, maximum 1,0, 981 034 pixels au-dessus de 0,15. Dans la zone de scène hors HUD supérieur et panneau droit (`x < 1100`, `y ≥ 50`) : maximum 0,9547, moyenne 0,2411, 828 117 / 839 300 pixels au-dessus de 0,15.
- Avant le correctif : capture 1440 × 813, maximum 0,07062, moyenne 0,07056, aucun pixel au-dessus de 0,15 — le fond du canvas seul.
- Site public après publication : HTTP 200 ; le document sert le nouveau bundle `assets/index-BNB_vSZf.js` et le CSS `assets/index-Cw9Irs0c.css` (tous deux HTTP 200). WebGL2 actif (`three.js r187`). Capture 1440 × 813 : maximum 1,0, moyenne 0,2362, 981 033 pixels au-dessus de 0,15. Même zone de scène : maximum 0,9547, moyenne 0,2408, 828 116 / 839 300 pixels au-dessus de 0,15.

## Publication

- `main` : correctif poussé dans `44df0a0` (`Fix black factory scene from oversized labels`).
- `gh-pages` : build publié dans `ac72628` (`Publish visible factory scene`).
- Le présent compte rendu est ajouté séparément sur `main` après la publication.
