# Politique de Sécurité - La Fine Parfumerie

## Signaler une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, veuillez la signaler de manière responsable.

### Comment signaler

1. **Ne pas divulguer publiquement** la vulnérabilité avant qu'elle soit corrigée
2. **Envoyer un email** à security@lafineparfumerie.fr avec :
   - Description détaillée de la vulnérabilité
   - Étapes pour reproduire le problème
   - Impact potentiel
   - Suggestions de correction (si possible)

### Ce que nous ferons

- Accusé de réception sous 24h
- Évaluation de la vulnérabilité sous 72h
- Correction prioritaire selon la sévérité
- Notification une fois la correction déployée
- Reconnaissance publique (si souhaité)

---

## Mesures de Sécurité Implémentées

### 1. Headers HTTP de Sécurité

Tous les headers de sécurité sont configurés dans le middleware Next.js :

```
X-DNS-Prefetch-Control: on
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Content-Security-Policy: [voir ci-dessous]
```

### 2. Content Security Policy (CSP)

Notre CSP stricte protège contre les attaques XSS et l'injection de scripts :

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://api.stripe.com https://*.neon.tech;
frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

### 3. Authentification

- **NextAuth.js v5** pour la gestion des sessions
- **bcrypt** pour le hachage des mots de passe (12 rounds)
- **Sessions JWT** sécurisées avec secret fort
- **Protection CSRF** intégrée à NextAuth
- **OAuth 2.0** pour Google Sign-In

### 4. Rate Limiting

Protection contre les abus et attaques par force brute :

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/api/auth/*` | 5 requêtes | 15 minutes |
| `/api/checkout` | 5 requêtes | 1 minute |
| `/api/search` | 20 requêtes | 1 minute |
| `/api/*` (général) | 30 requêtes | 1 minute |
| `/api/admin/*` | 60 requêtes | 1 minute |

Implémenté avec LRU Cache pour une gestion mémoire efficace.

### 5. Validation des Entrées

Toutes les entrées utilisateur sont validées avec **Zod** :

- Schémas stricts pour chaque endpoint
- Sanitization automatique des strings
- Validation des types et formats
- Messages d'erreur localisés

Exemples de validation :
- Emails : format valide, max 255 caractères
- Mots de passe : min 8 caractères, majuscule, minuscule, chiffre
- Montants : positifs, max 99999.99€
- IDs produits : entiers positifs

### 6. Protection des Paiements

- **Stripe Checkout** (PCI-DSS compliant)
- Aucune donnée de carte stockée sur nos serveurs
- Webhooks avec vérification de signature cryptographique
- Calcul du montant côté serveur (jamais confiance au client)
- Vérification du stock avant création de session

### 7. Base de Données

- **PostgreSQL** sur Neon.tech avec SSL obligatoire
- **Prisma ORM** avec requêtes paramétrées (anti-SQL injection)
- Connexion poolée avec limite de connexions
- Pas d'accès direct à la base depuis le client

### 8. Protection des Routes

| Route | Protection |
|-------|------------|
| `/admin/*` | Authentification + rôle ADMIN |
| `/checkout/*` | Authentification requise |
| `/orders/*` | Authentification requise |
| `/account/*` | Authentification requise |
| `/api/admin/*` | Vérification rôle serveur |

---

## Bonnes Pratiques pour les Développeurs

### Variables d'Environnement

```bash
# ❌ Ne jamais faire
NEXT_PUBLIC_SECRET_KEY="..."  # Exposé au client !

# ✅ Faire
SECRET_KEY="..."  # Uniquement côté serveur
```

### Secrets requis

- `NEXTAUTH_SECRET` : min 32 caractères, généré aléatoirement
- `STRIPE_WEBHOOK_SECRET` : fourni par Stripe
- `DATABASE_URL` : avec `sslmode=require`

### Validation des données

```typescript
// ❌ Ne jamais faire
const price = req.body.price;  // Données non validées !

// ✅ Faire
const validation = ProductSchema.safeParse(req.body);
if (!validation.success) {
  return res.status(400).json({ error: validation.error });
}
const { price } = validation.data;
```

### Gestion des erreurs

```typescript
// ❌ Ne jamais faire
catch (error) {
  return res.json({ error: error.message });  // Fuite d'info !
}

// ✅ Faire
catch (error) {
  console.error('Erreur:', error);  // Log interne
  return res.json({ error: 'Une erreur est survenue' });  // Message générique
}
```

---

## Audit de Sécurité

### Vérification des dépendances

```bash
# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement (si possible)
npm audit fix

# Voir les détails
npm audit --json
```

### Checklist pré-déploiement

- [ ] `npm audit` sans vulnérabilités critiques
- [ ] Toutes les variables d'environnement configurées
- [ ] `NEXTAUTH_SECRET` fort et unique
- [ ] SSL/TLS activé
- [ ] Rate limiting testé
- [ ] Headers de sécurité vérifiés (securityheaders.com)
- [ ] CSP testé sans erreurs console
- [ ] Logs sensibles désactivés en production

---

## Versions Supportées

| Version | Supportée |
|---------|-----------|
| 0.1.x | ✅ Oui |
| < 0.1 | ❌ Non |

---

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Stripe Security](https://stripe.com/docs/security)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/introduction#security)

---

*Dernière mise à jour : Janvier 2026*
