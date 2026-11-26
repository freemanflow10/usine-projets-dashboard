---
title: Refonte du dashboard global
type: delivery-report
status: completed
date: 2026-11-26
---

# Refonte du dashboard global

## Résultat

- La page principale présente maintenant un dashboard sombre teal, sans scène 3D montée dans l’interface.
- Le bandeau « KPI overview » affiche les ateliers, le portefeuille d’idées, les éléments à trier et les stations. Les nombres s’animent à l’ouverture; le mouvement est réduit selon les préférences du système et peut être mis en pause.
- Les quatre ateliers sont affichés en cartes décalées, avec leur état, leur progression, leur responsable et leur prochaine action.
- Le sélecteur « Avancement » ouvre une seconde vue en barres horizontales. Les valeurs viennent des champs `progress` présents dans les données de chaque atelier.
- Le panneau latéral liste les stations, leurs états et les files en attente. La fiche du quai conserve l’action « Feu vert » et reflète le nombre de cartons du hook.
- Le contrat `src/types/factory.ts` et le hook `src/hooks/useFactoryState.ts` n’ont pas été modifiés. Le mode LIVE, le repli maquette, `base: './'` et le port 4176 sont conservés.
- Les composants Three.js sont conservés dans le dépôt; `App.tsx` ne les monte plus. La garde WebGL a été retirée de l’écran principal, qui n’en dépend plus.

## Référence et décisions

- La vidéo `REF-VIDEO-DASHBOARD-SOUHAITE.mp4` a été visualisée par extraction locale de plusieurs images. Les choix repris sont l’en-tête plat, le fond nuit teal, les indicateurs animés, les cartes en cascade et la fiche latérale.
- La seconde vue en barres suit la demande écrite de la passation et utilise uniquement les progressions réelles des ateliers. Aucune métrique synthétique n’a été ajoutée.
- Les maquettes `mockups/v2`, `v3` et `v4` n’ont pas été consultées ni utilisées.

## Validation locale

- `pnpm build` : PASS, TypeScript sans erreur.
- `pnpm lint` : PASS; un avertissement préexistant subsiste dans `src/hooks/useFactoryState.ts:88`.
- `git diff --check` : PASS.
- Aperçu navigateur local en mode maquette, `http://localhost:4176/` : vue cartes, vue en barres, fiche d’atelier, fiche station et approbation locale du quai observées. Après approbation simulée, le quai passe à stable et sa fiche affiche zéro carton en attente.
- Le parcours n’a pas appelé d’API : `VITE_FACTORY_API_BASE` était vide pour l’aperçu.

## Revue et publication

- Base de travail : `main` à `3cfd799`.
- Revue Claude : approuvée au tour 3 sur `eb3878f61f610e4325aff94392f77d1f7f893e19` (aucun finding bloquant; remarque mineure sur l’échappement d’identifiants fermés). Revue indépendante du snapshot au même SHA approuvée.
- Validation indépendante : installation hors ligne, `pnpm build` et `pnpm lint` réussis; les deux fichiers protégés restent identiques à la baseline. L’unique avertissement lint préexistant reste dans `src/hooks/useFactoryState.ts:88`.
- `main` a été poussé jusqu’à `eb3878f` (trois commits du lot). GitHub Pages a été publié par le commit `236047b` sur `gh-pages`.
- Vérification publique : HTTP 200; JEV voit le bandeau KPI et les quatre ateliers. Le HTML publié référence `index-DQPm3yWa.js` et `index-BT1ilr20.css`.
- La page publique affiche le badge « Maquette » : aucun `VITE_FACTORY_API_BASE` n’a été fourni à cette compilation statique. Le branchement LIVE et son fallback restent présents dans le code; pour les données live sur Pages, il faudra fournir cette variable au moment du build.
- URL cible : <https://freemanflow10.github.io/usine-projets-dashboard/>.
