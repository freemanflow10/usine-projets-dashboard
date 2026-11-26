# PASSATION Codex — Écran noir « L'usine des projets » (2026-11-26)

Passation rédigée par Claude le **26/11/2026**. À exécuter par Codex.

## Mission

Corriger l'**écran noir du site public** `https://freemanflow10.github.io/usine-projets-dashboard/`
qui se reproduit **aussi sur la machine de dev** (captures Playwright headless), malgré :
WebGL2 fonctionnel, HUD présent dans le DOM, bloom déjà désactivé.

## Contexte vérifié (ne pas refaire ce qui est fait)

- **Repo** : `freemanflow10/usine-projets-dashboard` — `main` = source, `gh-pages` = déploiement racine.
- **Site actif** : version single-file — CSS Tailwind **inline** dans `index.html`, bundle `assets/index-BYnuYiYH.js` (HTTP 200). `dist/` local = même hash.
- **Derniers commits** : `main` `92e7753` (bloom off), `gh-pages` `0bd8399` (CSS inline).
- `pnpm build` strict = `tsc -b && vite build`, **0 erreur TS**, `base:'./'`.
- Chronologie correctifs gh-pages : `537e656` → `59eb968` (garde-fou WebGL) → `0ddd6a5` (bloom off) → `0bd8399` (CSS inline).

## Faits mesurés (objectifs, à partir des captures et readPixels)

1. **WebGL2 OK chez l'utilisateur ET en capture headless** (diag : `GL WebGL 2.0 / Apple GPU`).
2. **Le HUD est bien dans le DOM** : `document.body.innerText` = « Salle des machines … » ; `body text len = 492`.
3. **Mais le canvas 3D rend noir** : `readPixels` au centre = NOIR ; toutes les captures Playwright avec canvas = **luminance max ~0.07–0.083** (uniforme, = fond canvas `#12161f`). Aucun contenu peint.
4. **Le contenu HTML, lui, s'affiche** : la capture du fallback WebGL (`fix-webgl-off.png`) = luminance max 1.0 (« Vue 3D indisponible » visible) ; le test statique HTML/CSS s'affiche aussi.
5. Les 404 `models/*.glb` sont **comportement attendu** (probe modèle optionnel → fallback procédural). Ignorer.

**Contradiction à écarter** : `orchestration/CODEX-DONE.md` (26/11 11:13) prétend une capture « usine isométrique complète visible », alors que toutes les captures `/tmp` du même moment sont noires. Cette assertion était erronée — s'y fier.

## Hypothèses à tester, par ordre de priorité

1. **Frustum caméra orthographique** (`FactoryCanvas.tsx:31-35`) :
   `<Canvas orthographic camera={{ position:[22,24,22], zoom:75, near:0.1, far:200 }}>`
   Avec R3F, la taille du frustum est dérivée de la taille du canvas / `zoom`. Vérifier le cadrage réel ; tester un `zoom` plus faible (ex. 5–10) ou des plans explicites.
2. **Shaders drei/three échouant silencieusement en headless** : isoler `shadows="percentage"`, `<Grid>`, `<ContactShadows>` — désactiver **un par un** et re-mesurer la luminance.
3. **`FactoryEnvironment` (PMREMGenerator + RoomEnvironment)** : tester sans, un environnement mal initialisé peut noircir le rendu.

## Protocole de vérification obligatoire (ne pas « regarder l'écran »)

- Reconstruire (`pnpm build`) puis **mesurer les pixels** : utiliser `readPixels` via Playwright
  (`node` + Chromium) sur le canvas, ou mesurer la luminance d'une capture (`swift` script AppKit accessible).
  La scène est visible **si** la luminance max d'une zone non-HUD > ~0.15 (fond canvas seul ≈ 0.085).
- Après chaque correctif jugé bon : publier `main` **plus** `gh-pages` (worktree) **plus** vérifier
  `https://freemanflow10.github.io/usine-projets-dashboard/` (attendre propagation CDN, ~1–2 min).

## Contraintes

- **pnpm uniquement**. `pnpm build` strict, 0 erreur TS.
- Ne **pas** réintroduire un post-traitement par défaut (bloom reste off).
- Caméra verrouillée `enableRotate={false}` ; zéro régression du contrat `FactoryState` et du HUD.
- **Aucun secret** dans les commits ; publier sur GitHub `main` + `gh-pages`.
- Scène 3D : aucun `fetch` texte ; seule la lecture state/mock et remontée `onSelectStation`.

## Livrable attendu

Un `orchestration/CODEX-DONE-ECRAN-NOIR.md` dans le repo, résumant :
cause racine identifiée (fichier:ligne), correctif appliqué, commandes de vérification (métrique luminance),
commits poussés (`main` + `gh-pages`), et confirmation du site public.

## Récupérer la fin

Écrire le fichier `orchestration/CODEX-DONE-ECRAN-NOIR.md` et le committer. Claude détectera la fin par ce fichier.