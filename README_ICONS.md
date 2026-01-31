# Génération des icônes PWA - La Fine Parfumerie

## Prérequis

Sharp doit être installé (déjà ajouté aux devDependencies).

```bash
npm install
```

## Génération des icônes

```bash
npm run generate:icons
```

## Icônes générées

Le script crée automatiquement dans `/public/icons/` :

| Fichier | Taille | Usage |
|---------|--------|-------|
| `icon-16x16.png` | 16×16 | Favicon |
| `icon-32x32.png` | 32×32 | Favicon |
| `icon-72x72.png` | 72×72 | PWA Android |
| `icon-96x96.png` | 96×96 | PWA Android |
| `icon-128x128.png` | 128×128 | PWA Chrome |
| `icon-144x144.png` | 144×144 | PWA MS Tile |
| `icon-152x152.png` | 152×152 | PWA iOS |
| `icon-192x192.png` | 192×192 | PWA Android |
| `icon-384x384.png` | 384×384 | PWA Splash |
| `icon-512x512.png` | 512×512 | PWA Splash |
| `apple-touch-icon.png` | 180×180 | iOS Home Screen |

Et dans `/public/` :

| Fichier | Taille | Usage |
|---------|--------|-------|
| `favicon.png` | 32×32 | Onglet navigateur |
| `og-image.jpg` | 1200×630 | Partage Facebook/LinkedIn |
| `twitter-image.jpg` | 1200×1200 | Partage Twitter/X |

## Design

Les icônes utilisent le thème luxe La Fine Parfumerie :
- **Fond** : Noir `#0a0a0a`
- **Texte** : Or `#c5a059`
- **Logo** : "FP" en serif

## Personnalisation

Pour modifier le design, éditez le fichier `GENERATE_ICONS.js` :
- `createIconSVG()` pour les icônes carrées
- Les templates SVG pour og-image et twitter-image

## Structure finale

```
public/
├── icons/
│   ├── icon-16x16.png
│   ├── icon-32x32.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
├── favicon.png
├── og-image.jpg
└── twitter-image.jpg
```
