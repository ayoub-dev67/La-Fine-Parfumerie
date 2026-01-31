## Description

<!-- Décrivez brièvement les changements apportés -->

## Type de changement

- [ ] Bug fix (changement non-breaking qui corrige un problème)
- [ ] Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] Breaking change (fix ou feature qui modifierait le comportement existant)
- [ ] Documentation (mise à jour de la documentation uniquement)
- [ ] Refactoring (pas de changement fonctionnel)
- [ ] Performance (amélioration des performances)
- [ ] Tests (ajout ou modification de tests)
- [ ] CI/CD (changements de configuration CI/CD)

## Checklist

### Code
- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une self-review de mon code
- [ ] J'ai commenté le code si nécessaire (logique complexe)
- [ ] Mes changements ne génèrent pas de nouveaux warnings

### Tests
- [ ] J'ai ajouté des tests pour mes changements
- [ ] Les tests existants passent toujours (`npm run test`)
- [ ] J'ai testé manuellement mes changements

### Accessibilité
- [ ] Les éléments interactifs sont accessibles au clavier
- [ ] Les contrastes de couleurs sont conformes (WCAG AA)
- [ ] Les attributs ARIA sont appropriés
- [ ] Testé avec un lecteur d'écran (si applicable)

### Performance
- [ ] Pas d'impact négatif sur les scores Lighthouse
- [ ] Les images sont optimisées
- [ ] Pas de dépendances inutiles ajoutées

### Documentation
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Le CHANGELOG est à jour (si applicable)

## Screenshots (si applicable)

<!-- Ajoutez des captures d'écran pour les changements visuels -->

| Avant | Après |
|-------|-------|
| image | image |

## Notes pour les reviewers

<!-- Informations supplémentaires pour faciliter la review -->

## Issues liées

<!-- Liens vers les issues GitHub liées -->
Fixes #

---

**Rappel** : Assurez-vous que le build passe avant de demander une review (`npm run build`)
