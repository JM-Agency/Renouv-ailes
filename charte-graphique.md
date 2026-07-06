# Charte graphique — Renouv'ailes

Direction retenue : **Forêt & Aube** — palette et typographie validées le 2026-07-03.

## 1. Territoire de marque

Renouv'ailes accompagne des séjours de jeûne encadrés dans le Jura (Franches-Montagnes), associés à la randonnée, la méditation et la déconnexion. Le nom porte déjà tout le concept : *renouveler* + *ailes* — se délester pour retrouver de la légèreté, comme un envol.

**Idée directrice** : la forêt de pins jurassienne au lever du jour. Le végétal sombre et dense (le corps qu'on met au repos), la lumière d'aube qui perce (la clarté qu'on retrouve), et un seul accent chaud (l'élan, le mouvement, l'envol).

**Ce qu'on évite délibérément** : le kit "bien-être" par défaut — beige, kraft, laiton, écriture manuscrite, photos de pieds sur un tapis de yoga, promesses vagues ("élevez votre bien-être"). Renouv'ailes n'est pas un spa générique : c'est une pratique exigeante (jeûne encadré, marche, discipline douce), la charte doit avoir de la tenue, pas juste du confort.

**Positionnement** : sérieux sans être clinique, chaleureux sans être mièvre, poétique sans être vague. Le site doit donner envie de partir en forêt, pas d'acheter un abonnement bien-être.

## 2. Palette — Forêt & Aube

| Rôle | Token | Hex | Usage |
|---|---|---|---|
| Pin profond | `--c-pine-950` | `#16241C` | Fond sombre (hero, footer, nav), texte fort sur clair |
| Pin | `--c-pine-800` | `#213629` | Cartes sombres, dégradés |
| Mousse | `--c-moss-600` | `#3F5344` | Secondaire — bordures actives, icônes |
| Mousse clair | `--c-moss-400` | `#6E8577` | Texte secondaire sur fond sombre |
| Ivoire | `--c-ivory-50` | `#F7F3E9` | Fond clair principal |
| Ivoire haut | `--c-ivory-100` | `#FBF9F3` | Cartes claires, respiration |
| **Ambre-corail (accent unique)** | `--c-amber-500` | `#E2703A` | CTA, liens, accents — jamais décoratif seul |
| Ambre foncé | `--c-amber-600` | `#C4592A` | Hover/active du CTA |
| Encre | `--c-ink` | `#16241C` | Texte sur fond clair |
| Bordure chaude | `--c-line` | `#E5DFCE` | Séparateurs sur fond clair |

**Règle d'or** : un seul accent (ambre-corail), verrouillé partout, jamais de deuxième couleur vive. Pas de bleu/violet IA. Contraste AA minimum vérifié sur tous les textes (le corail sur ivoire passe pour du texte large/CTA, pas pour du texte de paragraphe fin — utiliser l'encre pour le corps).

## 3. Typographie

- **Titres — Literata** (serif éditorial, empattements doux, belles italiques). Justifié par le ton contemplatif et citationnel de la marque (témoignages, formules type "se délester, respirer, renaître"). Graisses : 400 texte, 500 sous-titres, 600–700 titres, italique pour les citations.
- **Texte courant — Hanken Grotesk** (sans-serif géométrique sobre, très lisible). Corps de texte, navigation, boutons, légendes.
- Échelle : titres `clamp(2.25rem, 4vw, 4.5rem)` avec `tracking: -0.02em` ; corps `1.05rem/1.7` ; largeur de paragraphe max `65ch`.
- Citations/témoignages toujours en Literata italique, jamais en majuscules.
- Pas de majuscules intégrales sauf micro-labels (nav secondaire, badges), taille ≤ 0.75rem, `letter-spacing: 0.08em`.

## 4. Forme, rythme, mouvement

- **Rayon des angles** : un seul système — `--r-sm: 8px`, `--r-md: 16px`, `--r-lg: 28px`, `--r-full: 999px`. Cartes = `--r-lg`, boutons = `--r-full`, images = `--r-md`.
- **Densité** : aérée. Beaucoup de blanc (ivoire) tournant, sections respirent, jamais plus de 3 informations denses côte à côte.
- **Grille** : asymétrique et éditoriale — pas de 3 colonnes égales partout. Alternance de compositions (pleine largeur, décalée, empilée en scroll).
- **Motif signature** : lignes topographiques fines (courbes de niveau du relief jurassien) en filigrane, jamais au premier plan, opacité faible sur fonds sombres.
- **Mouvement** : discret et motivé — révélations au scroll (fondu + léger décalage vertical), parallaxe douce sur les silhouettes de crêtes en hero, un seul bandeau défilant (témoignages), bouton CTA à micro-interaction magnétique. Aucune animation gratuite ; `prefers-reduced-motion` toujours respecté.

## 5. Signe / logo

Pas de logo figuratif type plume ou oiseau réaliste (cliché). Un monogramme minimal : deux traits courbes asymétriques évoquant une aile ouverte, tracés comme une seule ligne continue (cohérent avec le motif topographique). Le wordmark "Renouv'ailes" est composé en Literata italique léger, minuscules, l'apostrophe légèrement stylisée. Le monogramme peut fonctionner seul en favicon/tampon.

## 6. Image et texture

Pas de banque d'images "spa" générique (pierres empilées, mains en prière, serviettes blanches). Direction :
- Photographie réelle à terme : forêt de pins dans la brume, sentiers des Franches-Montagnes, groupe en marche de dos, bols de bouillon sur bois brut, lumière rasante du matin. *(À remplacer par les vraies photos de Renouv'ailes — la V1 du site utilise des compositions génératives/illustrées en attendant.)*
- En attendant les vraies photos : dégradés "ciel d'aube" (pine → amber), silhouettes de crêtes en SVG superposées (effet parallaxe), lignes topographiques, aucune photo de personnes générée artificiellement (on ne fabrique pas de faux témoins pour une vraie marque).

## 7. Ton et voix

- Vouvoiement, chaleureux et direct, jamais impératif marketing ("Élevez votre bien-être" → interdit).
- Phrases courtes, sensorielles, ancrées dans le concret (le froid du matin, le bol de bouillon, le silence du sentier) plutôt que dans l'abstrait ("énergie", "vibration").
- Les témoignages réels restent la meilleure preuve sociale : on les cite tels quels, en italique, avec prénom seul.
- Toujours garder la clarté sur le cadre non-médical (mentions légales, contre-indications) — ne jamais l'habiller de manière à le rendre moins visible.

## 8. Réglages de conception (méthode taste-skill)

- **DESIGN_VARIANCE** : 7/10 — mise en page éditoriale asymétrique, pas de grille générique.
- **MOTION_INTENSITY** : 6/10 — révélations au scroll, parallaxe légère, un CTA magnétique, un seul marquee.
- **VISUAL_DENSITY** : 3/10 — très aéré, section = une idée.
- **Système de design** : aucun framework officiel — implémentation artisanale (HTML/CSS/JS vanilla + GSAP ScrollTrigger via CDN), cohérente avec le reste du workspace (pas d'outillage Node).

