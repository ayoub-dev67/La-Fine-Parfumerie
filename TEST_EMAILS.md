# 📧 Test des Emails Transactionnels

Guide de test pour le système d'emails de La Fine Parfumerie.

## ⚙️ Configuration

La clé API Resend est déjà configurée dans `.env.local`.

Le serveur dev tourne sur : **http://localhost:3001**

## 🧪 URLs de Test

Remplace `TON_EMAIL@gmail.com` par ton adresse email réelle.

### 1. Email de Bienvenue ✨

```
http://localhost:3001/api/test-email?to=TON_EMAIL@gmail.com&type=welcome
```

**Contenu :**
- Message de bienvenue personnalisé
- Code promo -10% (BIENVENUE10)
- Présentation des avantages
- Design noir/or luxueux

---

### 2. Email de Confirmation de Commande 📦

```
http://localhost:3001/api/test-email?to=TON_EMAIL@gmail.com&type=order
```

**Contenu :**
- Numéro de commande
- Récapitulatif des produits
- Montant total
- Informations de livraison
- Bouton "Suivre ma commande"

---

### 3. Email de Notification d'Expédition 🚚

```
http://localhost:3001/api/test-email?to=TON_EMAIL@gmail.com&type=shipping
```

**Contenu :**
- Numéro de suivi
- Transporteur (Colissimo)
- Délai de livraison estimé
- Bouton "Suivre mon colis"
- Informations pratiques

---

## 📊 Vérifier les Logs du Serveur

Dans le terminal où tourne `npm run dev`, tu verras :

**En cas de succès :**
```
📧 Envoi email bienvenue à TON_EMAIL@gmail.com
✅ Email bienvenue envoyé avec succès (ID: xxx)
```

**En cas d'erreur :**
```
❌ Erreur envoi email bienvenue: [détails de l'erreur]
```

## 🎯 Dashboard Resend

Pour voir tous les emails envoyés et leur statut :

1. Va sur : https://resend.com/emails
2. Connecte-toi avec ton compte
3. Tu verras la liste de tous les emails envoyés
4. Clique sur un email pour voir :
   - Statut (delivered, bounced, etc.)
   - Contenu HTML
   - Logs détaillés

## ✅ Checklist de Test

- [ ] Email de bienvenue reçu
- [ ] Email de confirmation reçu
- [ ] Email d'expédition reçu
- [ ] Design noir/or correct
- [ ] Responsive sur mobile
- [ ] Liens cliquables fonctionnels
- [ ] Images affichées correctement

## 🔄 Test Automatique (Webhook Stripe)

Pour tester l'envoi automatique après un paiement :

1. Lance Stripe CLI :
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook
   ```

2. Fais une commande de test sur le site

3. L'email de confirmation sera envoyé automatiquement

4. Vérifie les logs :
   ```
   ✅ Commande XXX marquée comme PAYÉE
   📧 Email de confirmation envoyé à client@email.com
   ```

## 🛠️ Dépannage

### Aucun email reçu ?

1. Vérifie que `RESEND_API_KEY` est dans `.env.local`
2. Redémarre le serveur dev (`Ctrl+C` puis `npm run dev`)
3. Vérifie les logs du serveur
4. Regarde le Dashboard Resend pour voir le statut

### Email en spam ?

- Normal pour les tests
- En production, configure le domaine dans Resend
- Ajoute les enregistrements DNS SPF/DKIM

### Erreur "API key manquante" ?

```bash
# Vérifie que la variable est chargée
echo $RESEND_API_KEY

# Si vide, redémarre le serveur
npm run dev
```

## 📝 Exemple de Réponse API

**Succès :**
```json
{
  "success": true,
  "type": "welcome",
  "to": "test@example.com",
  "data": {
    "id": "abc123..."
  }
}
```

**Erreur :**
```json
{
  "success": false,
  "type": "welcome",
  "to": "test@example.com",
  "error": "API key manquante"
}
```

## 🎨 Aperçu des Templates

Les emails utilisent un design cohérent :
- **Fond** : Noir (#000000)
- **Accents** : Or (#c5a059)
- **Police** : Sans-serif moderne
- **Logo** : "La Fine Parfumerie" en or
- **Boutons** : Fond or, texte noir
- **Responsive** : Optimisé mobile et desktop

## 📚 Documentation

- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email)
- Code source des templates : `/emails/`
- Service d'envoi : `/lib/email.ts`

---

**🚀 Prêt à tester !**

Remplace `TON_EMAIL@gmail.com` par ton email et ouvre les URLs ci-dessus dans ton navigateur.
