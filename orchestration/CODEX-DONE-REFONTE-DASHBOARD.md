---
title: Refonte du dashboard global
type: delivery-report
status: review-pending
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
- Revue Claude : à demander sur le commit du lot avant toute publication.
- GitHub Pages : publication non effectuée à ce stade. Le worktree `/private/tmp/ghpages-diag` est réservé à la préparation de `dist/` après approbation.
- URL cible : <https://freemanflow10.github.io/usine-projets-dashboard/>.
