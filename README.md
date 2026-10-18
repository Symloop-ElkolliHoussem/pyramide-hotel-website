# Site web — Hôtel Pyramides (Baïnem, Alger)

Site vitrine et parcours de réservation de l’Hôtel Pyramides, réalisé par **SYMLOOP** (Sétif) d’après la maquette Figma
« Hôtel Pyramide Website » (pages 01 → 09.4, composants « _Composants » et « _Composants / Parcours »).

- Next.js 16 (App Router, TypeScript, Turbopack, Cache Components), React 19, Tailwind CSS 4
- Polices auto-hébergées par `next/font/google` : **Bodoni Moda** (titres, axe de taille optique), **Archivo** (texte,
  menus, boutons), **IBM Plex Mono** (surtitres et libellés)
- Contenu en français (`lang="fr"`), aucune dépendance externe à l’exécution, aucun traceur, aucun secret

## Lancer le projet

Prérequis : Node.js ≥ 20 (testé avec Node 24.19 / npm 11.17).

```bash
npm install
npm run dev          # http://localhost:3000 (développement)

npm run lint         # ESLint
npm run typecheck    # génère les types de routes (next typegen) puis tsc --noEmit
npm run build        # build de production (toutes les pages sont pré-rendues)
npm run start        # serveur de production (après build) — ex. npm run start -- -p 3100
```

Le premier `npm run build` télécharge les polices Google (accès réseau nécessaire au moment du build seulement).

## Pages (routes)

| Route | Écran Figma |
| --- | --- |
| `/` | 01 — Accueil (carrousel du hero, bandeau de réservation) |
| `/chambres` | 02 — Chambres & tarifs |
| `/chambres/[slug]` | 02.1 → 02.7 — fiches des 7 chambres (`double-vue-sur-mer`, `single-vip-vue-sur-mer`, `twin-vue-sur-mer`, `double-vue-sur-montagne`, `single-vue-sur-montagne`, `triple-vue-sur-montagne`, `nuit-de-noces`) |
| `/restauration` | 03 — Restauration (ancres `#cafeteria`, `#restaurant`, `#rooftop`, `#salle-des-fetes`) |
| `/galerie` | 04, 04.1 (visionneuse), 04.2 (filtres) |
| `/reservation` | 05 — Demande de réservation |
| `/reservation/envoyee` | 05.9 — Demande de réservation envoyée |
| `/reserver` | 05.1 / 05.1a — Dates et voyageurs |
| `/reserver/chambres` | 05.2 (recherche), 05.3 (chambres disponibles), 05.3a (aucune disponibilité), 05.3b (liste d’attente) |
| `/reserver/options` | 05.4 — Chambre et options |
| `/reserver/coordonnees` | 05.5 / 05.5a — Vos coordonnées |
| `/reserver/recapitulatif` | 05.6 — Récapitulatif de la demande (aucun règlement en ligne) |
| `/reserver/confirmation` | 05.7 — Réservation enregistrée |
| `/contact` | 06, 06.1 (message envoyé), 06.2 (erreurs) |
| `/faq` | 07 — Questions fréquentes |
| `/ma-reservation` | 08.1 / 08.1a — accès (référence + e-mail) |
| `/ma-reservation/detail` | 08.2, 08.4 (fenêtre d’annulation), 08.4a (annulée) |
| `/ma-reservation/modifier` | 08.3 / 08.3a |
| `/mentions-legales`, `/cgv`, `/confidentialite` | 09.1, 09.2, 09.3 |
| toute autre URL | 09.4 — page 404 personnalisée |

Une URL de fiche inconnue (`/chambres/xyz`) renvoie un vrai statut 404 grâce à `src/proxy.ts`. Les anciennes adresses
`/reserver/paiement/*` et `/ma-reservation/justificatif` redirigent (307) vers `/reserver/recapitulatif` et
`/ma-reservation/detail`.

Plus `sitemap.xml` et `robots.txt` (le parcours `/reserver/*` et l’espace `/ma-reservation` ne sont pas indexés).

## Structure

```
src/
  app/                 routes (une page = un dossier), layout racine, 404, sitemap, robots, icônes
  components/
    layout/            en-tête (menu mobile) et pied de page
    ui/                boutons, champs de formulaire, ornements, en-têtes de section, bandeau de page, photo encadrée
    home/              carrousel du hero et bandeau de réservation (01)
    rooms/             carte chambre, fiche, galerie de chambre, encart de réservation
    gallery/           mosaïque et visionneuse (lightbox)
    booking/           parcours de réservation (étapes, calendrier, récapitulatif…)
    account/ contact/ legal/   espace client, formulaire de contact, pages légales
  data/hotel.ts        ★ SOURCE UNIQUE : chambres, tarifs, suppléments, coordonnées, photos, galerie, navigation
  lib/                 format (DZD), dates (français), booking (calcul, validation, stockage local), availability (mock)
public/
  images/              photos réelles de l’hôtel (dossier hotel-pictures, identiques à la maquette) + logo
  ornaments/ icons/    ornements et pictogrammes exportés de Figma (SVG)
```

Les jetons de design (couleurs `Pyramides / Couleurs/*`, espacements `espace/*`, styles de texte `Titre/*` et
`Texte/*`) sont définis dans `src/app/globals.css` (`@theme` Tailwind + utilitaires `t-display`, `t-h1`… `t-label`).

### Tarifs (src/data/hotel.ts)

| Chambre | DZD / nuit |
| --- | --- |
| Double — vue sur mer | 12 800 |
| Single VIP — vue sur mer | 12 800 |
| Twin — vue sur mer | 11 600 |
| Double — vue sur montagne | 9 600 |
| Single — vue sur montagne | 8 600 |
| Triple — vue sur montagne | 10 600 |
| Nuit de noces — vue sur mer avec balcon | 17 800 |

Suppléments : matelas supplémentaire adulte **2 500 DZD par personne** ; heures supplémentaires après le check-out
**1 000 DZD par heure**. Exemple de la maquette : 12 800 × 3 nuits + 2 500 + 2 × 1 000 = **42 900 DZD**.

## Ce qui est simulé (mock)

Aucun serveur, aucune base de données, aucun règlement en ligne, aucun e-mail envoyé.

- **Disponibilités** (`src/lib/availability.ts`) : règles fixes reprises de la maquette — hôtel complet les nuits du
  30 octobre, 31 octobre et 1ᵉʳ novembre 2026 (dates barrées du calendrier 05.1) (→ écran « Aucune disponibilité » avec dates proches), Chambre Twin complète du 22 au
  25 octobre 2026, le reste disponible.
- **Réservations** : gardées dans le `localStorage` du navigateur pour être retrouvées dans « Gérer ma réservation ».
  Réservation d’exemple toujours disponible : référence **PYR-2026-00418**, e-mail **karim.benali@exemple.com**.
  Pour remettre la démonstration à zéro (par ex. après avoir annulé la réservation d’exemple), effacer les données du
  site dans le navigateur (localStorage / sessionStorage).
- **Formulaires** (contact, demande de réservation, liste d’attente, modification) : validés côté client, puis écran
  de confirmation ; rien n’est transmis.
- **Carte** : emplacement réservé (aucune carte externe intégrée).

## Éléments « à confirmer » / « à renseigner » (à fournir par l’hôtel)

Repris tels quels de la maquette :

- Adresse exacte, téléphone, e-mail, horaires de la réception, liens réseaux sociaux, position sur la carte
- Horaires d’arrivée / de départ (check-in, check-out), petit-déjeuner (formule, prix, lieu), taxe de séjour
- Superficie, étage, literie (Single / Single VIP), prestations VIP, équipements des chambres
- Prestation « Nuit de noces », horaires et cartes de la cafétéria, du restaurant et du rooftop, salle des fêtes
  (capacité, tarifs)
- Conditions d’annulation, modalités de règlement à l’hôtel, délai de confirmation
- Raison sociale, RC / NIF / NIS, hébergeur, directeur de publication
- Âge limite enfants, nombre maximal de chambres et de nuits réservables en ligne, durée de conservation des données
- Textes juridiques définitifs (mentions légales, CGV, politique de confidentialité)
- Domaine définitif du site (`HOTEL.siteUrl` dans `src/data/hotel.ts`, utilisé pour le sitemap et les métadonnées)

## Notes

- Nom de l’hôtel : la maquette et le logo indiquent « Hôtel Pyramides » ; le brief et le PMS écrivent « Hôtel
  Pyramide ». Le nom affiché est centralisé dans `HOTEL.name` (`src/data/hotel.ts`) — à confirmer par le client.
- Le carrousel du hero défile toutes les 5 s (fondu 0,8 s), se met en pause au survol / au focus, possède un bouton
  pause, est utilisable au clavier (← →) et ne défile pas si l’utilisateur a demandé à réduire les animations.
- Aucun déploiement n’est configuré.
