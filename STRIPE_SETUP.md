# Configuration Stripe - Guide Complet

## 📋 Prérequis

Vous devez avoir un compte Stripe en mode TEST.

## 🔑 Obtenir vos clés Stripe

### Étape 1 : Créer un compte Stripe (si vous n'en avez pas)

1. Allez sur https://dashboard.stripe.com/register
2. Créez votre compte
3. **Activez le mode TEST** (toggle en haut à droite)

### Étape 2 : Récupérer vos clés API

1. Connectez-vous à https://dashboard.stripe.com
2. **Activez le mode TEST** (toggle en haut à droite de l'écran)
3. Allez dans **Developers** > **API Keys**
4. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_`)
   - **Secret key** (commence par `sk_test_`) - Cliquez sur "Reveal test key"

## ⚙️ Configuration du projet

### Modifier le fichier `.env.local`

Ouvrez le fichier `.env.local` à la racine du projet et remplacez les valeurs par vos vraies clés :

```env
# Clé publique Stripe (commence par pk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI

# Clé secrète Stripe (commence par sk_test_)
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI

# URL de base (ne pas modifier en local)
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### Redémarrer le serveur

Après avoir modifié `.env.local`, **redémarrez obligatoirement le serveur** :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer :
npm run dev
```

## 🧪 Tester le paiement

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester :

| Carte | Numéro | Résultat |
|-------|--------|----------|
| **Visa (succès)** | `4242 4242 4242 4242` | ✅ Paiement réussi |
| **Visa (décliné)** | `4000 0000 0000 0002` | ❌ Carte déclinée |
| **Mastercard** | `5555 5555 5555 4444` | ✅ Paiement réussi |

**Autres informations (pour tous les tests) :**
- **Date d'expiration** : N'importe quelle date future (ex: 12/25)
- **CVC** : N'importe quel code à 3 chiffres (ex: 123)
- **Code postal** : N'importe lequel (ex: 75001)

### Flow de test complet

1. Ajoutez des produits au panier
2. Cliquez sur "Passer la commande"
3. Vérifiez le récapitulatif sur `/checkout`
4. Cliquez sur "Payer maintenant"
5. Vous serez redirigé vers Stripe Checkout
6. Utilisez la carte `4242 4242 4242 4242`
7. Validez le paiement
8. Vous serez redirigé vers `/success`
9. Le panier sera automatiquement vidé

## 🔒 Sécurité

### ✅ Ce qui est sécurisé

- ✅ Clé secrète **uniquement** côté serveur
- ✅ Montants recalculés côté serveur (jamais confiance au client)
- ✅ Validation des données avant envoi à Stripe
- ✅ `.env.local` ignoré par Git

### ⚠️ Important

- **Ne jamais committer** le fichier `.env.local`
- **Ne jamais** exposer la clé secrète (`sk_test_`) côté client
- Toujours utiliser les clés **TEST** en développement
- Les clés **LIVE** (`pk_live_`, `sk_live_`) sont pour la production uniquement

## 🐛 Dépannage

### Erreur "STRIPE_SECRET_KEY is missing"

➡️ Vous n'avez pas créé le fichier `.env.local` ou il est mal configuré.

**Solution :**
1. Créez `.env.local` à la racine du projet
2. Ajoutez vos clés Stripe
3. **Redémarrez le serveur** avec `npm run dev`

### Erreur "Invalid API Key"

➡️ Votre clé Stripe est incorrecte ou vous n'êtes pas en mode TEST.

**Solution :**
1. Vérifiez que vous êtes en **mode TEST** sur Stripe Dashboard
2. Copiez-collez à nouveau vos clés
3. Redémarrez le serveur

### Le paiement ne se lance pas

➡️ Vérifiez la console du navigateur (F12) pour les erreurs.

**Solution :**
1. Ouvrez la console (F12)
2. Essayez de passer commande
3. Regardez les erreurs réseau (onglet Network)

## 📚 Ressources

- [Documentation Stripe Checkout](https://stripe.com/docs/checkout)
- [Cartes de test Stripe](https://stripe.com/docs/testing)
- [Dashboard Stripe](https://dashboard.stripe.com)

---

**Mode TEST activé** - Aucun vrai paiement ne sera effectué 🛡️
