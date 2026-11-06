---
name: r3f-composition
description: >-
  Expertise de composition et cadrage pour scènes Three.js / react-three-fiber :
  choix et réglage caméra (perspective vs orthographique, FOV/focale comme outil),
  contrôles drei (CameraControls, PresentationControls, ScrollControls, Bounds),
  règles de cadrage (tiers, hiérarchie focale, espace négatif), profondeur et staging
  (plans, fog atmosphérique, ancrage au sol), et le look de frame via postprocessing
  (Depth of Field, Vignette, Bloom, color grading/LUT). Utilise CE skill dès qu'une
  tâche R3F touche au cadrage, à la caméra, à la mise en scène ou au "look" final —
  même sans le mot "composition" : "ma scène manque de profondeur/de peps", "rendre
  plus cinématique", "bien cadrer mon modèle/héros", "caméra qui tourne autour",
  "look isométrique", "ajouter du flou d'arrière-plan", "étalonnage/ambiance colorée",
  "présentation portfolio d'un objet 3D". Ne PAS l'utiliser pour l'éclairage lui-même
  (types de lumières, ombres, HDRI, tone mapping → skill r3f-lighting).
---

# Composition & cadrage R3F / Three.js

Tu appliques ce savoir en écrivant le JSX. La lumière donne le volume ; la **composition
décide ce que l'œil voit, dans quel ordre, et avec quelle émotion**. Une scène "correcte"
mais fade a presque toujours un problème de cadrage, de profondeur ou de hiérarchie focale.

## Caméra : perspective vs orthographique

- **PerspectiveCamera** — vision humaine, fuyantes, profondeur. Défaut pour l'immersif.
- **OrthographicCamera** — pas de perspective, look **technique / iso / jeu**. Parfait
  pour les vues isométriques, la 2.5D, le "diorama" propre. (Pertinent pour du city/iso.)
- `makeDefault` avec les composants drei pour qu'elle devienne la caméra active.

## FOV / focale = un outil de composition

Le FOV n'est pas qu'un réglage technique, c'est un choix narratif :

- **FOV bas (~20–35°)** = téléobjectif : compresse les plans, peu de distorsion, look
  "portrait/produit", intime. **Ton défaut pour présenter un objet héros.**
- **FOV élevé (~55–90°)** = grand-angle : dramatique, immersif, exagère la profondeur —
  mais **distord** si trop haut (effet fisheye sur les bords). >90° rarement souhaitable.
- Éloigne la caméra + baisse le FOV pour un objet "propre" ; rapproche + monte le FOV
  pour de l'énergie/immersion.

## Contrôles (drei)

- **`<OrbitControls>`** — le basique, orbite libre. Vite lassant/amateur si laissé brut.
- **`<CameraControls>`** — plus riche et fluide (damping, `setLookAt`, transitions,
  bornes). À préférer dès que tu veux du contrôle et du smooth.
- **`<PresentationControls>`** — rotation **contrainte** type vitrine (spring, limites).
  Idéal **portfolio/produit** : l'objet pivote joliment sans jamais mal se cadrer.
- **`<ScrollControls>`** — caméra/animation pilotées par le scroll (landing, narration).
- **`<Bounds>` / `useBounds`** — auto-fit : cadre automatiquement pour que l'objet remplisse
  bien la vue. Combine avec `<Center>` pour recentrer un modèle mal pivoté.
- **`<MapControls>`** — pan type carte (vues iso/top-down).

## Règles de cadrage

- **Règle des tiers** : place le sujet / la ligne d'horizon sur un tiers, pas au centre mort.
- **Hiérarchie focale** : décide **ce que l'œil frappe en premier** (le héros), puis le
  reste. Contraste, netteté (DoF), lumière et taille servent cette hiérarchie.
- **Espace négatif** : laisse respirer. Un sujet collé aux bords étouffe ; un peu de vide
  dirigé (leading room) donne du mouvement.
- **Silhouette** : oriente la caméra pour une silhouette lisible (test : l'objet en noir
  sur blanc reste-t-il reconnaissable ?). Un mauvais angle tue un bon modèle.
- **Off-center** : décentre légèrement le héros plutôt que de tout mettre au milieu.

## Profondeur & staging

C'est ce qui sort une scène du "flat" :

- **Plans** : avant / milieu / arrière-plan distincts. Un objet seul dans le vide manque
  de profondeur — ajoute des éléments qui se **chevauchent** pour que l'œil lise les distances.
- **Profondeur atmosphérique** : `<fog>`/`<fogExp2>` (fondu vers l'arrière), ou fade des
  lointains. Le lointain doit être plus pâle/désaturé.
- **Ancrage** : un objet doit "poser" sur le sol — ombre de contact (`<ContactShadows>`),
  reflet, ou plan de sol. Sans ça, il **flotte**.
- **Grille / sol** : `<Grid>` de drei pour poser un plan et donner l'échelle (utile iso).
- **Échelle** : introduis une référence de taille pour crédibiliser la scène.

## Le "look" de frame (postprocessing)

Un seul `<EffectComposer>`, effets regroupés, **avec retenue** (le postprocessing coûte cher) :

- **`<DepthOfField>`** — le plus fort levier ciné : net sur le héros, flou devant/derrière →
  sépare le sujet et guide l'œil. Attention à ne pas sur-flouter (`focusDistance`, `bokehScale`).
- **`<Vignette>`** — assombrit les bords, ramène l'œil au centre. Subtil.
- **`<Bloom>`** — glow sur les hautes lumières (néons, émissifs). **Restraint absolu** :
  90 % des scènes "cheap" sont sur-bloomées.
- **Étalonnage** : `<HueSaturation>`, `<BrightnessContrast>`, ou `<LUT>` (charge une LUT
  pour un grade cohérent). Une palette resserrée = look pro instantané.
- **`<ChromaticAberration>` / `<Noise>` / `<ToneMapping>` (effect)** — grain fin, touche
  argentique. Toujours discret.
- Ordre & coût : DoF et Bloom sont les plus chers ; mesure avec `r3f-perf`.

## Mouvement comme composition (dans le temps)

- **Dérive douce** de caméra (léger parallax, respiration) > caméra figée.
- **Damping** : jamais de snap. `easing.damp3(cam.position, target, lambda, delta)`
  (maath) ou le damping intégré de `CameraControls`. L'accélération/décélération fait le pro.
- Parallax souris (léger déplacement caméra selon le pointeur) pour de la vie sans lourdeur.

## Responsive

- Le cadrage doit tenir du mobile portrait au desktop large. Adapte FOV / distance / position
  selon l'aspect (`useThree(s => s.viewport)` / `size`). `<Bounds>` aide à re-cadrer tout seul.

## Pièges fréquents

- Tout au centre mort, aucune profondeur, silhouette illisible.
- FOV trop large → distorsion fisheye.
- DoF/Bloom trop agressifs (le "tell" du rendu amateur).
- Objet qui flotte (pas d'ancrage/ombre de contact).
- Caméra OrbitControls brute laissée telle quelle sur un portfolio.

## Application

1. Choisis perspective vs ortho selon l'intention (immersif vs iso/technique).
2. Cale FOV + distance pour le héros ; décentre, applique les tiers.
3. Construis la profondeur : plans, chevauchement, fog, ancrage au sol.
4. Ajoute le contrôle adapté au contexte (Presentation pour un produit, Scroll pour une
   landing, Camera pour du libre maîtrisé).
5. Passe de look : DoF pour séparer, vignette + grade léger pour l'ambiance — avec retenue.
6. Ajoute damping/parallax pour la vie, puis vérifie le rendu sur plusieurs aspects.

> Vérifie les props exacts de drei/postprocessing (`CameraControls`, `Bounds`,
> `DepthOfField`, `LUT`…) dans la doc à jour si un doute — l'API bouge.
