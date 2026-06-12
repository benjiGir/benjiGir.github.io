# PLAN — Extension du portfolio 3D

Feuille de route validée avec Benjamin. Chaque phase est livrable indépendamment.
Ce fichier est la référence : **lire la section de la phase en cours avant d'implémenter.**

## Règles pour tout agent travaillant sur ce repo

- **Ne JAMAIS lancer** `pnpm dev/build/test`, `tsc`, ni aucune commande node/npm/pnpm.
  Benjamin lance lui-même et colle les erreurs. S'arrêter après les modifications de code.
- Si une dépendance doit être installée, **demander à Benjamin** de lancer `pnpm add …`.
- Style : primitives Three.js procédurales uniquement (pas de GLB), cohérent avec
  `src/scene/DeskScene.tsx` (meshStandardMaterial, castShadow/receiveShadow, couleurs sobres).
- Conventions : pas de semicolons, single quotes, 100 chars (Prettier). UI/commentaires en
  français. Jamais de barrel `index.ts`. Alias `@` → `src/`.
- État global : un store zustand par préoccupation dans `src/store/`, composants abonnés
  par sélecteurs.
- Sons : tout son UI est synthétisé dans `src/lib/audio.ts` (Web Audio, pas de fichiers).
- Perf : viser l'instancing quand >20 meshes identiques ; pas de useState dans useFrame ;
  mutations par refs.

## Architecture existante (résumé)

- `App.tsx` : `<Canvas>` (scène R3F) + overlays DOM (CameraUI, FullscreenOverlay, AudioUnlock).
- `scene/DeskScene.tsx` : pièce (2 murs, sol 12×12, murs à x=-3 et z=-3), bureau assis-debout
  (`DeskLiftGroup`), moniteur dont l'écran est un `<Html transform>` ciblé par le portail.
- `scene/CameraRig.tsx` : `CameraControls` drei + presets `overview`/`screen` depuis
  `store/useCameraStore.ts`.
- `scene/PowerSequence.tsx` : orchestration boot (`usePowerStore` : off→bios→booting→on,
  shuttingDown).
- `os/` : mini-OS (Desktop, Window, appRegistry avec lazy imports — chaque app = un chunk).
  Écran logique 1280×720 (`SCREEN_W/H` dans `os/Desktop.tsx`).
- Pattern interactif de référence : `Tower` dans DeskScene (hover + cursor pointer + tooltip
  `<Html>` + playClick).

---

## Phase 1 — Fondations : pièce agrandie, POI caméra, hotspots, toasts

### 1.1 Agrandir la pièce (`scene/DeskScene.tsx`)

Passer la pièce de 6×6 à **8×8 m** : mur du fond à z=-4 (largeur 8.16), mur gauche à x=-4
(profondeur 8), plinthes ajustées, sol inchangé (12×12 couvre déjà). Déplacer fenêtre,
étagère, cadre photo, plante en conséquence (les garder sur leurs murs respectifs).
Le bureau reste centré en (0, 0, 0 environ). Réserver les zones suivantes (vides en phase 1) :

| Zone | Emplacement approx. | Contenu futur |
|---|---|---|
| Coin jeu | mur du fond gauche, x≈-2.4, z≈-3.6 | meuble bas + TV CRT + console (phase 5) |
| Coin atelier | mur du fond droit, x≈2.4, z≈-3.6 | établi électronique + oscillo (phase 4) |
| Coin musique | mur gauche, près de la fenêtre, x≈-3.5, z≈2 | guitare sur stand (phase 3) |
| Coin legos | premier plan droit, x≈2.6, z≈1.2 | table basse + briques (phase 6) |
| Tapis | déjà présent sous le bureau | parcours du robot (phase 2) |

Adapter `PRESETS.overview` dans CameraRig (reculer un peu, ex. pos [0, 2.2, 4.2]) et
élargir `minAzimuthAngle/maxAzimuthAngle` si nécessaire pour voir les coins.

### 1.2 Système de POI

- `store/useCameraStore.ts` : remplacer `CameraPreset` par
  `PoiId = 'overview' | 'screen' | 'guitar' | 'workbench' | 'crt' | 'legos' | 'robot'`.
  Garder l'API `focusOn(poi)` + ajouter `back()` (retour `overview`).
- `scene/pois.ts` : registre `Record<PoiId, { pos; target; minDist?; maxDist? }>`.
  CameraRig le consomme (au lieu de son objet PRESETS local) et applique les éventuelles
  contraintes de distance par POI.
- `scene/Hotspot.tsx` : composant réutilisable
  `<Hotspot poi label position onFocus?>{children}</Hotspot>` —
  englobe les meshes de l'objet, gère hover (cursor pointer + légère émissive ou anneau au
  sol), tooltip `<Html>` (reprendre le style de la tooltip du bouton power de `Tower`),
  clic → `playClick()` + `focusOn(poi)`. Désactivé quand un POI est déjà actif.
- Retour : touche Échap + bouton DOM « ← Retour » (intégrer dans
  `components/CameraUI.tsx` — lire ce fichier d'abord, il gère déjà de l'UI caméra).
  Le retour est masqué quand `preset === 'overview'` ou en fullscreen OS.
- Migrer le zoom écran existant : cliquer le moniteur = POI `screen` (comportement actuel
  de PowerSequence/CameraUI conservé).

### 1.3 Toasts OS

- `store/useToastStore.ts` : `{ toasts: Toast[]; push(toast): void }`,
  `Toast = { id; icon?; title; body?; duration?=4000 }`, auto-expiration par timeout.
- `os/Toasts.tsx` : pile en bas à droite de l'écran OS (au-dessus de la taskbar),
  glassmorphism cohérent avec la taskbar, animation slide-in/out CSS. Monté dans
  `os/Desktop.tsx`.
- Démo : toast « Bienvenue sur Bureau OS » au premier passage à `power === 'on'`.

### Dépendance

Demander à Benjamin : `pnpm add maath` (easings pour les transitions). Rapier attendra la
phase 6.

---

## Phase 2 — Robot NAO + app RobotLab

### Objet 3D (`scene/Robot.tsx`)

Humanoïde façon NAO en primitives : ~60 cm, corps blanc (sphères/capsules/boîtes arrondies),
poitrail avec LED, yeux = 2 sphères émissives. Posé **debout sur le tapis**, à côté du bureau.
- Idle : respiration légère (scale/rotation sinusoïdale), yeux qui clignotent.
- Au survol/POI `robot` : la tête suit le pointeur (look-at amorti, limité en angle).
- Au clic : petit son de servo (nouveau son synthétisé dans `lib/audio.ts` : sweep court
  + bruit filtré) et animation de salut (bras).

### Mini-jeu : app OS « RobotLab » (`os/apps/RobotLabApp.tsx`)

L'app OS pilote le robot **dans la scène 3D** — c'est la démo signature du portfolio.
- `store/useRobotStore.ts` : grille logique du tapis (ex. 6×6), position/orientation du
  robot, file d'instructions, état d'exécution, niveau courant.
- App : palette de blocs (Avancer, Tourner à gauche/droite, Bip, Danser), zone séquence
  (ajout/suppression/réordonnancement simple), bouton Exécuter/Reset, 4-5 niveaux :
  atteindre une case cible (marquée dans la 3D par un marqueur émissif) avec un nombre
  max d'instructions.
- Côté scène : le robot consomme la file à ~1 instruction/600 ms — translation lissée case
  à case, rotation 90°, marche procédurale simple (balancement bras/jambes pendant la
  translation suffit). Bip = son synthétisé. Échec (sortie de grille) = animation « non »
  de la tête + reset.
- Enregistrer l'app dans `os/appRegistry.tsx` (lazy) + commande terminal `open robotlab`.

---

## Phase 3 — Guitare (coin musique)

### Objet 3D (`scene/Guitar.tsx`)

Guitare acoustique stylisée sur stand, coin musique (près de la fenêtre). Corps = CSG ou
extrude simple, manche, 6 cordes = cylindres fins.

### Interaction

- POI `guitar` : caméra face à la guitare.
- **Synthèse Karplus-Strong** dans `lib/audio.ts` : `playPluck(freq)` — buffer de bruit
  + boucle de feedback filtrée (delay = 1/freq). Accordage standard EADGBE.
- Cordes cliquables individuellement (raycast par corde) + vibration visuelle (légère
  oscillation du mesh pendant ~1 s).
- Mini-jeu « Simon musical » : séquence de cordes qui s'allonge, déclenchable depuis un
  petit panneau `<Html>` près de la guitare quand le POI est actif. High score en
  localStorage.

---

## Phase 4 — Établi électronique (coin atelier)

### Objet 3D (`scene/Workbench.tsx`)

Établi contre le mur du fond droit : plan de travail, breadboard avec LED clignotante,
fer à souder sur support, multimètre, et **oscilloscope** dont l'écran est un
`<canvas>` en texture (`CanvasTexture`).

### Interactions

- **Oscilloscope branché sur le vrai audio** : `AnalyserNode` ajouté sur le master gain
  de `lib/audio.ts` (exporter `getAnalyser()`), waveform dessinée dans le canvas à chaque
  frame (uniquement quand le POI `workbench` est actif ou l'oscillo visible — perf).
  Jouer de la guitare 3D fait bouger l'oscillo.
- Mini-jeu : app OS « Circuit Lab » (`os/apps/CircuitLabApp.tsx`) — puzzles de portes
  logiques : relier entrées/portes (AND, OR, NOT, XOR)/LED par des fils (SVG ou divs),
  ~6 niveaux de difficulté croissante. Quand un niveau est résolu, la LED de la breadboard
  3D change de couleur (store partagé léger ou réutiliser un store existant).

---

## Phase 5 — TV CRT + console rétro (coin jeu)

### Objet 3D (`scene/RetroCorner.tsx`)

Meuble bas + petite TV cathodique (caisson bombé, écran légèrement convexe) + console
posée dessous + une manette + 2-3 cartouches posées à côté.

### Pipeline jeu

- Le jeu est rendu dans un `<canvas>` 2D offscreen (logique de jeu en TS pur,
  `lib/games/pong.ts` : update/draw découplés, ~320×240) affiché sur l'écran TV via
  `CanvasTexture`.
- **Shader CRT** sur l'écran (material custom) : scanlines, légère courbure/distorsion,
  vignette, bloom déjà fourni par le post-processing global.
- POI `crt` : caméra face à la TV ; contrôles clavier (↑/↓ ou souris) actifs uniquement
  quand le POI est actif. Insertion de cartouche au clic = la TV s'allume (son CRT
  synthétisé : sweep haute fréquence) et Pong démarre.
- Pong d'abord ; l'architecture `lib/games/` doit permettre d'ajouter Snake/Breakout
  ensuite (interface commune `{ init, update(dt, inputs), draw(ctx) }`, une cartouche
  par jeu).

---

## Phase 6 — Legos + physique

### Dépendance

Demander à Benjamin : `pnpm add @react-three/rapier`.

### Objet 3D (`scene/LegoCorner.tsx`)

Table basse au premier plan droit, set en cours de montage + briques éparses.
Briques = `InstancedMesh` (boîte + tenons cylindriques instanciés, 2-3 tailles, palette
de couleurs lego).

- **Montage étape par étape** : POI `legos` actif → clic = le groupe de briques suivant
  s'assemble (animation d'arrivée flottante, easing maath), ~8-10 étapes pour un petit
  modèle (voiture ou fusée). Bouton reset.
- **Physique** : une tour de briques posée sur la table, `RigidBody` rapier — cliquer la
  tour la pousse, elle s'écroule. `<Physics>` monté paresseusement (uniquement quand le
  POI legos a été visité au moins une fois) pour ne pas payer rapier au chargement.

---

## Phase 7 — Polish final

À détailler le moment venu, dans cet ordre indicatif :
1. **Achievements** : `store/useAchievementStore.ts` persisté localStorage
   (`zustand/middleware persist`), toasts à l'obtention, app OS « Trophées ».
   Trophées prévus : premier boot, robot niveau final, Simon ≥ 8, circuit final,
   high score Pong, lego terminé, easter egg terminal trouvé.
2. **Jour/nuit** : lumière fenêtre selon l'heure réelle du visiteur, lampe de bureau
   cliquable on/off, presets d'éclairage nuit (lampe + écrans seuls).
3. **Screensaver OS** après inactivité (starfield canvas), easter eggs terminal
   (`sudo`, `rm -rf /`, `cowsay`, `matrix`, faux `vim`).
4. **Perf** : envisager `frameloop='demand'`, instancing touches clavier, audit drawcalls.
5. **Contenu** : bio AboutApp, descriptions d'expériences, liens projets (placeholders
   pour l'instant — Benjamin fournira).

---

## Processus par phase

1. Claude (orchestrateur) spawne `react-r3f-senior` avec : la section de phase de ce
   fichier + les fichiers existants à lire + les contraintes (pas de commandes, prettier).
2. L'agent implémente. Benjamin lance `pnpm build` / `pnpm dev` et colle les erreurs.
3. Corrections itératives. Si blocage : stopper et poser des questions à Benjamin.
4. Benjamin valide visuellement avant de passer à la phase suivante.
