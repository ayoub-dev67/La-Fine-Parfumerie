# Manual Testing Checklist

Checklist de tests manuels pour La Fine Parfumerie avant chaque release.

## Table des matières

- [Navigation & Layout](#navigation--layout)
- [Catalogue Produits](#catalogue-produits)
- [Fiche Produit](#fiche-produit)
- [Panier](#panier)
- [Checkout & Paiement](#checkout--paiement)
- [Authentification](#authentification)
- [Compte Utilisateur](#compte-utilisateur)
- [Wishlist](#wishlist)
- [Comparateur](#comparateur)
- [Chatbot](#chatbot)
- [Admin Dashboard](#admin-dashboard)
- [Accessibilité](#accessibilité)
- [Performance](#performance)
- [Mobile](#mobile)
- [PWA](#pwa)

---

## Navigation & Layout

### Header/Navbar
- [ ] Logo cliquable vers la home
- [ ] Menu de navigation fonctionnel
- [ ] Recherche accessible et fonctionnelle
- [ ] Icône panier avec compteur
- [ ] Icône wishlist (si connecté)
- [ ] Menu utilisateur (connexion/déconnexion)
- [ ] Responsive sur mobile (hamburger menu)

### Footer
- [ ] Liens de navigation fonctionnels
- [ ] Liens réseaux sociaux
- [ ] Mentions légales accessibles
- [ ] Newsletter (si implémentée)

### Pages d'erreur
- [ ] Page 404 stylisée
- [ ] Page d'erreur générique
- [ ] Liens de retour fonctionnels

---

## Catalogue Produits

### Affichage
- [ ] Grille de produits chargée
- [ ] Images produits affichées
- [ ] Prix affichés (avec réductions si applicable)
- [ ] Badge stock épuisé si pertinent
- [ ] Pagination fonctionnelle

### Filtres
- [ ] Filtre par catégorie
- [ ] Filtre par marque
- [ ] Filtre par genre (homme/femme/unisexe)
- [ ] Filtre par prix (min/max)
- [ ] Filtre par disponibilité
- [ ] Reset des filtres
- [ ] URL mise à jour avec les filtres

### Tri
- [ ] Tri par prix croissant
- [ ] Tri par prix décroissant
- [ ] Tri par nom
- [ ] Tri par nouveautés

### Recherche
- [ ] Recherche instantanée fonctionnelle
- [ ] Suggestions de recherche
- [ ] Résultats pertinents
- [ ] Message si aucun résultat

### Actions rapides
- [ ] Bouton Quick View fonctionne
- [ ] Bouton Compare fonctionne
- [ ] Ajout wishlist (si connecté)

---

## Fiche Produit

### Informations
- [ ] Nom du produit affiché
- [ ] Marque affichée
- [ ] Prix affiché (avec réduction si applicable)
- [ ] Description complète
- [ ] Notes olfactives (tête, cœur, fond)
- [ ] Volume/Concentration
- [ ] Stock affiché

### Galerie images
- [ ] Image principale affichée
- [ ] Thumbnails cliquables
- [ ] Zoom sur l'image fonctionne
- [ ] Navigation entre images
- [ ] Mode plein écran

### Actions
- [ ] Sélection de quantité
- [ ] Bouton "Ajouter au panier" fonctionne
- [ ] Bouton wishlist fonctionne
- [ ] Bouton compare fonctionne
- [ ] Partage sur réseaux sociaux

### Avis
- [ ] Liste des avis affichée
- [ ] Note moyenne calculée
- [ ] Formulaire d'ajout d'avis (si connecté)
- [ ] Pagination des avis

### Produits similaires
- [ ] Section produits similaires affichée
- [ ] Produits cliquables

---

## Panier

### Affichage
- [ ] Liste des produits ajoutés
- [ ] Images des produits
- [ ] Nom et détails
- [ ] Prix unitaire
- [ ] Quantité modifiable
- [ ] Sous-total par produit
- [ ] Total général

### Actions
- [ ] Modifier la quantité (+ / -)
- [ ] Supprimer un produit
- [ ] Vider le panier
- [ ] Appliquer un code promo
- [ ] Continuer les achats
- [ ] Procéder au paiement

### Persistance
- [ ] Panier sauvegardé (localStorage)
- [ ] Panier restauré après refresh
- [ ] Panier maintenu après navigation

### Code promo
- [ ] Champ de saisie du code
- [ ] Validation du code
- [ ] Message d'erreur si invalide
- [ ] Réduction appliquée au total

---

## Checkout & Paiement

### Formulaire
- [ ] Champs obligatoires marqués
- [ ] Validation en temps réel
- [ ] Messages d'erreur clairs
- [ ] Autocomplétion adresse (si implémentée)

### Stripe
- [ ] Redirection vers Stripe Checkout
- [ ] Paiement par carte fonctionne
- [ ] Retour après paiement réussi
- [ ] Gestion du paiement échoué
- [ ] Gestion de l'annulation

### Post-paiement
- [ ] Page de confirmation affichée
- [ ] Récapitulatif de commande
- [ ] Numéro de commande
- [ ] Email de confirmation envoyé

### Cartes de test
- [ ] `4242 4242 4242 4242` - Succès
- [ ] `4000 0000 0000 0002` - Refus
- [ ] `4000 0025 0000 3155` - 3D Secure

---

## Authentification

### Inscription
- [ ] Formulaire d'inscription
- [ ] Validation email
- [ ] Validation mot de passe (force)
- [ ] Inscription avec Google
- [ ] Email de bienvenue

### Connexion
- [ ] Formulaire de connexion
- [ ] Connexion par email/mot de passe
- [ ] Connexion avec Google
- [ ] Option "Se souvenir de moi"
- [ ] Mot de passe oublié

### Session
- [ ] Session maintenue après refresh
- [ ] Déconnexion fonctionnelle
- [ ] Redirection après connexion
- [ ] Protection des routes

---

## Compte Utilisateur

### Profil
- [ ] Affichage des informations
- [ ] Modification du nom
- [ ] Modification de l'email
- [ ] Changement de mot de passe

### Commandes
- [ ] Historique des commandes
- [ ] Détails d'une commande
- [ ] Statut de la commande
- [ ] Suivi d'expédition (si disponible)

### Adresses
- [ ] Liste des adresses
- [ ] Ajout d'adresse
- [ ] Modification d'adresse
- [ ] Suppression d'adresse
- [ ] Adresse par défaut

---

## Wishlist

### Gestion
- [ ] Affichage de la wishlist
- [ ] Ajout depuis la fiche produit
- [ ] Ajout depuis le catalogue
- [ ] Suppression d'un produit
- [ ] Déplacer vers le panier

### Partage
- [ ] Génération du lien de partage
- [ ] Copie du lien
- [ ] Page publique accessible
- [ ] Désactivation du partage

---

## Comparateur

### Ajout/Suppression
- [ ] Ajout depuis le catalogue
- [ ] Ajout depuis la fiche produit
- [ ] Limite de 4 produits respectée
- [ ] Suppression d'un produit
- [ ] Vider le comparateur

### Affichage
- [ ] Barre de comparaison visible
- [ ] Compteur de produits
- [ ] Lien vers page de comparaison

### Page de comparaison
- [ ] Tableau comparatif
- [ ] Images des produits
- [ ] Caractéristiques alignées
- [ ] Prix comparés
- [ ] Ajout au panier depuis la page

---

## Chatbot

### Interface
- [ ] Bouton d'ouverture visible
- [ ] Fenêtre de chat s'ouvre
- [ ] Fermeture du chat
- [ ] Position fixe en bas à droite

### Fonctionnalités
- [ ] Catégories de FAQ affichées
- [ ] Questions par catégorie
- [ ] Réponses affichées
- [ ] Recherche dans la FAQ
- [ ] Navigation retour

### Accessibilité
- [ ] Focus piégé dans le modal
- [ ] Fermeture avec Escape
- [ ] Annonces lecteur d'écran

---

## Admin Dashboard

### Accès
- [ ] Route protégée (admin only)
- [ ] Redirection si non autorisé

### Dashboard principal
- [ ] Statistiques CA
- [ ] Nombre de commandes
- [ ] Nombre de clients
- [ ] Graphiques fonctionnels
- [ ] Top produits

### Gestion produits
- [ ] Liste des produits
- [ ] Recherche/filtres
- [ ] Ajout d'un produit
- [ ] Modification d'un produit
- [ ] Suppression d'un produit
- [ ] Import CSV
- [ ] Export CSV

### Gestion commandes
- [ ] Liste des commandes
- [ ] Filtres par statut
- [ ] Détails d'une commande
- [ ] Modification du statut
- [ ] Ajout numéro de suivi

### Gestion clients
- [ ] Liste des clients
- [ ] Recherche clients
- [ ] Détails client
- [ ] Historique commandes client
- [ ] Statut VIP

### Alertes stock
- [ ] Liste des produits en alerte
- [ ] Seuil configurable
- [ ] Lien vers modification produit

---

## Accessibilité

### Navigation clavier
- [ ] Tab navigation fonctionnelle
- [ ] Focus visible sur tous les éléments
- [ ] Skip link fonctionnel
- [ ] Escape ferme les modals
- [ ] Flèches dans les listes

### Lecteurs d'écran
- [ ] Titres hiérarchiques (h1 > h2 > h3)
- [ ] Alt text sur les images
- [ ] Labels sur les formulaires
- [ ] ARIA labels appropriés
- [ ] Annonces live regions

### Contraste
- [ ] Texte lisible (ratio 4.5:1 minimum)
- [ ] Éléments interactifs visibles
- [ ] États focus visibles

### Formulaires
- [ ] Labels associés aux inputs
- [ ] Messages d'erreur accessibles
- [ ] Validation annoncée

---

## Performance

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Lighthouse
- [ ] Performance > 90
- [ ] Accessibility > 95
- [ ] Best Practices > 90
- [ ] SEO > 95

### Chargement
- [ ] Images lazy loaded
- [ ] Skeletons pendant chargement
- [ ] Pas de flash de contenu

---

## Mobile

### Responsive
- [ ] Layout adapté mobile
- [ ] Taille de police lisible
- [ ] Boutons assez grands (44x44px min)
- [ ] Pas de scroll horizontal

### Touch
- [ ] Swipe galerie images
- [ ] Pinch-to-zoom images
- [ ] Tap targets accessibles

### Navigation
- [ ] Menu hamburger fonctionnel
- [ ] Fermeture menu au tap
- [ ] Position fixed des éléments

---

## PWA

### Installation
- [ ] Prompt d'installation affiché
- [ ] Installation réussie
- [ ] Icône sur l'écran d'accueil
- [ ] Lancement en mode standalone

### Offline
- [ ] Cache des pages principales
- [ ] Message offline approprié
- [ ] Synchronisation au retour

### Notifications
- [ ] Demande de permission
- [ ] Réception des notifications

---

## Environnements de test

### Navigateurs
- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (dernière version)
- [ ] Edge (dernière version)

### Appareils
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Notes de test

| Date | Testeur | Version | Résultat | Notes |
|------|---------|---------|----------|-------|
| | | | | |

---

## Rappel

Avant chaque release :

1. Exécuter tous les tests automatisés : `npm run test`
2. Vérifier le build : `npm run build`
3. Auditer Lighthouse : `npm run lighthouse`
4. Parcourir cette checklist manuellement
5. Tester sur les principaux navigateurs et appareils
