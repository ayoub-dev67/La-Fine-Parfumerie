# Base de donnees PostgreSQL (Neon.tech)

## Configuration actuelle

- **Provider** : Neon.tech
- **PostgreSQL version** : 18
- **Region** : Europe (Frankfurt)
- **Database** : neondb

## Connection String

Stockee dans `.env.local` :

```
DATABASE_URL="postgresql://neondb_owner:***@ep-noisy-term-ag65os1v-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

## Commandes de migration appliquees

```bash
# Appliquer le schema
npx prisma db push

# Seeder les donnees
npx prisma db seed

# Lancer le serveur
npm run dev
```

## Acces a la base

Dashboard Neon : https://console.neon.tech

Fonctionnalites disponibles :
- Voir les tables
- Executer des requetes SQL
- Gerer les backups
- Monitorer les performances

## Avantages

- PostgreSQL production-ready
- Gratuit jusqu'a 3GB
- Backups automatiques
- Meme DB en dev et prod
- Interface web pour gerer la DB
- Cold start rapide (~500ms)

## Rollback vers SQLite

Si besoin de revenir a SQLite pour le dev local, voir [ROLLBACK_SQLITE.md](ROLLBACK_SQLITE.md)
