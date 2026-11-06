---
name: r3f-lighting
description: >-
  Expertise d'éclairage temps réel pour scènes Three.js / react-three-fiber :
  éclairage physique (PBR), image-based lighting via HDRI/Environment, tone mapping
  et exposition, ombres (real-time, ContactShadows, AccumulativeShadows/PCSS), setups
  studio et cinématiques (key/fill/rim, température de couleur), et l'API drei associée.
  Utilise CE skill dès qu'une tâche R3F touche à la lumière, au rendu, à l'ambiance
  ou aux ombres — même sans le mot "lumière" : "ma scène est plate/terne", "rendre plus
  réaliste", "look studio/produit", "ambiance de nuit/cinématique", "mes ombres sont
  moches/absentes", "régler l'Environment/HDRI", "exposition/tone mapping", "pourquoi
  c'est cramé/tout noir". Ne PAS l'utiliser pour le cadrage caméra ou les effets de
  frame (→ skill r3f-composition).
---

# Éclairage R3F / Three.js

Tu appliques ce savoir en écrivant directement le JSX de la scène. Objectif : donner
du **volume, de la lisibilité et une intention** à une scène, pas seulement "l'éclairer".
Une scène plate vient presque toujours d'un ambient trop fort qui écrase le modelé.

## Modèle mental

Le rendu R3F = **PBR + tone mapping**. Deux paradigmes d'éclairage, à combiner :

1. **Image-Based Lighting (IBL)** — un HDRI éclaire toute la scène (reflets + diffus).
   C'est ce qui donne le réalisme "gratuit". Base par défaut pour tout ce qui est
   matériaux PBR / produit / réaliste.
2. **Lumières analytiques** — directional/spot/point/hemisphere/rectArea. Servent à
   **sculpter** (donner une direction, des ombres portées, un rim), pas à tout éclairer.

Recette qui marche presque partout : **Environment (HDRI) pour le diffus/reflets +
1 directionalLight comme key pour l'ombre et le modelé.** Pas quinze lumières.

## Éclairage physique (depuis three r155) — piège n°1

Depuis three **r155**, l'éclairage est **physiquement correct par défaut**
(`useLegacyLights = false`, supprimé depuis) : intensités en unités physiques,
`decay = 2` sur point/spot. Conséquence : **il faut des intensités bien plus élevées**
qu'avant (un `intensity={1}` de tuto ancien ne fait rien). R3F v9 embarque un three
récent → tu es en physique. Si "tout est trop sombre", c'est souvent ça.

## Tone mapping & exposition

Change TOUT le rendu. À régler sur le `<Canvas>` :

```tsx
<Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}>
```

- **ACESFilmic** = défaut R3F, look ciné neutre. **AgX** (three récent) = highlights
  plus doux, très en vogue. **Neutral** aussi dispo.
- `toneMappingExposure` est ton "diaphragme" : baisse-le si ça crame, monte-le si c'est
  bouché. C'est souvent le premier réglage à toucher, avant de retoucher les lumières.
- **Ne combats pas la gestion des couleurs.** R3F gère sRGB/linéaire correctement par
  défaut (`flat={false}`). Ne force pas les colorSpaces à la main sans raison.

## Les lumières et quand les utiliser

- **directionalLight** — le soleil. Rayons parallèles, seule à porter une ombre nette
  "extérieur". Ta **key** par défaut.
- **hemisphereLight** — dégradé ciel/sol. **Le meilleur "ambient" pas cher** : donne un
  fill directionnel gratuit (ciel bleuté en haut, rebond chaud du sol en bas). Préfère-la
  à `ambientLight` plat.
- **ambientLight** — fill uniforme, aplatit le modelé. À dose **homéopathique** ou pas du
  tout si tu as un Environment.
- **spotLight** — cône focalisé (`angle`, `penumbra`, `decay`, `distance`). Théâtral.
  `<SpotLight>` de drei ajoute le **volumétrique** (god rays).
- **pointLight** — ampoule omnidirectionnelle (`decay`, `distance`). Bougies, néons.
- **rectAreaLight** — softbox douce, top pour le look studio/vitrine. **Nécessite**
  `RectAreaLightUniformsLib.init()`. Ne porte pas d'ombre.
- **`<Lightformer>`** (drei, dans `<Environment>`) — dessine tes propres sources dans
  l'HDRI (softbox, néon, ring). Le move pro pour un studio custom et des reflets maîtrisés.

## Setups de référence

- **Trois points (produit/héros)** : **key** (directional, chaude, 3/4 avant) +
  **fill** (hemisphere ou rectArea, plus froide, ~1/2 de la key, côté opposé) +
  **rim/back** (spot ou directional derrière, souvent saturée) pour détacher du fond.
- **Studio/produit réaliste** : `<Environment preset="studio" />` (ou HDRI custom +
  `<Lightformer>`) + `<AccumulativeShadows>` au sol. `<Stage>` de drei fait tout ça
  automatiquement pour un shot rapide.
- **Extérieur jour** : `<Environment preset="sunset/dawn/park" />` + directionalLight
  alignée sur le soleil de l'HDRI, ombres nettes.
- **Nuit/ciné** : Environment sombre + fill froid faible + points colorés (néons) +
  rim saturé. Fog pour la profondeur.

## Ombres — piège n°2 (frustum non réglé)

- `castShadow` sur la lumière + les meshes, `receiveShadow` sur le sol. Active
  `shadows` sur `<Canvas>` (PCFSoft par défaut).
- **La cause n°1 d'ombres absentes/baveuses** : le frustum de la shadow camera trop large.
  Resserre-le sur ta scène : `shadow-camera-far`, `-left/-right/-top/-bottom`.
  `shadow-mapSize={[2048, 2048]}` pour la netteté.
- Acné/peter-panning → `shadow-bias` (négatif léger, ~-0.0001) et/ou `shadow-normalBias`.
- Helpers drei — préfère-les au real-time quand tu peux :
  - **`<ContactShadows>`** — fausse ombre de contact au sol, très cheap, ancre les objets.
  - **`<SoftShadows>`** — PCSS global (ombres douces plus loin = plus floues). Coûteux.
  - **`<AccumulativeShadows>` + `<RandomizedLight>`** — ombres douces "bakées" pour scène
    **statique**. Rendu magnifique, quasi gratuit une fois accumulé. Le choix pro produit.
  - **`<BakeShadows>`** — fige les shadow maps si rien ne bouge.

## Ambiance & couleur

- **Température** : key chaude (~ambre) + fill/ambient froids (~bleu) = cliché ciné qui
  marche. Rim saturé (magenta/cyan) pour un look stylisé.
- **Fog** (`<fog>` / `<fogExp2>`) : profondeur atmosphérique + révèle les volumétriques.
- Cohérence : la couleur de tes lumières doit servir **une** intention (heure, mood).

## Perf (non négociable)

- **Les ombres real-time coûtent cher.** Minimise le nombre de lumières qui `castShadow`
  (idéalement **une**). Le reste éclaire sans ombre.
- Scène statique → `<AccumulativeShadows>` / `<ContactShadows>` / `<BakeShadows>` plutôt
  que des shadow maps recalculées chaque frame.
- Peu de rectAreaLight (coûteux), peu de spot/point à ombre.
- Résolution de shadow map = compromis : 1024 souvent suffit, 2048 pour les gros plans.

## Application

1. Pose l'IBL (`<Environment>`) en premier, regarde le rendu **avant** d'ajouter des lumières.
2. Règle `toneMappingExposure` pour caler l'expo.
3. Ajoute la **key** (direction + ombre), puis un fill doux, puis un rim si besoin.
4. Choisis la stratégie d'ombre selon statique/dynamique.
5. Vérifie sur mobile/dpr bas que ça ne rame pas (ombres = premier suspect).

> Vérifie les presets/props exacts de drei (`Environment`, `AccumulativeShadows`,
> `Lightformer`…) dans la doc à jour (`drei.docs.pmnd.rs`) si un doute — l'API évolue.
