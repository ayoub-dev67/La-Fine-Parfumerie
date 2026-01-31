# Rollback vers SQLite

Si tu rencontres des problemes avec PostgreSQL/Neon et que tu veux revenir a SQLite pour le developpement local.

## Etapes de rollback

### 1. Modifier .env.local

```env
# Commenter PostgreSQL
# DATABASE_URL="postgresql://..."

# Reactiver SQLite
DATABASE_URL="file:./dev.db"
```

### 2. Modifier prisma/schema.prisma

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Supprimer l'ancienne DB et regenerer

```bash
# Supprimer l'ancien fichier SQLite si present
del prisma\dev.db 2>nul

# Regenerer le client Prisma
npx prisma generate

# Creer la nouvelle DB SQLite
npx prisma db push

# Seeder les donnees
npx prisma db seed
```

### 4. Relancer le serveur

```bash
npm run dev
```

## Differences SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Setup | Aucun | Neon/Docker |
| Performance | Bonne (dev) | Excellente (prod) |
| Concurrent users | Limite | Illimite |
| JSON support | Basique | Avance |
| Full-text search | Non | Oui |

## Quand utiliser SQLite ?

- Developpement local rapide
- Tests unitaires
- Prototypage
- Pas d'acces internet

## Quand utiliser PostgreSQL ?

- Production
- Plusieurs utilisateurs simultanes
- Donnees critiques
- Besoin de backups automatiques
