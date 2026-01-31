# Lighthouse Performance Guide

Guide pour optimiser et maintenir les scores Lighthouse.

## Score Targets

| Métrique | Target | Minimum |
|----------|--------|---------|
| Performance | 95+ | 90 |
| Accessibility | 100 | 95 |
| Best Practices | 95+ | 90 |
| SEO | 100 | 95 |
| PWA | 80+ | 70 |

## Running Lighthouse

### Chrome DevTools

1. Ouvrir Chrome DevTools (F12)
2. Aller à l'onglet "Lighthouse"
3. Sélectionner les catégories à tester
4. Choisir "Mobile" ou "Desktop"
5. Cliquer "Analyze page load"

### CLI

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://lafineparfumerie.fr --view

# Run in headless mode
lighthouse https://lafineparfumerie.fr --output=json --output-path=./lighthouse-report.json

# Run specific categories
lighthouse https://lafineparfumerie.fr --only-categories=performance,accessibility
```

### Lighthouse CI (Automated)

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run with config
lhci autorun

# Run collect only
lhci collect --url=http://localhost:3000

# Run assertions
lhci assert --preset=lighthouse:recommended
```

## Performance Optimizations

### Images

✅ **Implemented:**
- Next.js Image component with automatic optimization
- WebP/AVIF formats
- Lazy loading by default
- Responsive sizes

```tsx
<Image
  src="/product.jpg"
  alt="Description"
  width={400}
  height={400}
  priority={isAboveTheFold}  // For LCP images
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Fonts

✅ **Implemented:**
- Google Fonts via next/font (self-hosted)
- Font-display: swap
- Preconnect to font origins

```tsx
// In layout.tsx
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
```

### JavaScript

✅ **Implemented:**
- Code splitting automatique
- Dynamic imports pour composants lourds
- Tree shaking

```tsx
// Dynamic import for heavy components
const HeavyChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### CSS

✅ **Implemented:**
- Tailwind CSS avec purge automatique
- Critical CSS inline
- Pas de CSS inutilisé

### Caching

✅ **Implemented:**
- Static assets cached
- API responses avec cache headers appropriés
- Stale-while-revalidate patterns

## Accessibility Checklist

### Must Pass (Error level)

- [ ] `image-alt`: Toutes images ont alt text
- [ ] `label`: Tous inputs ont labels associés
- [ ] `link-name`: Tous liens ont texte accessible
- [ ] `button-name`: Tous boutons ont nom accessible
- [ ] `document-title`: Page a un titre
- [ ] `html-has-lang`: HTML a attribut lang

### Should Pass (Warning level)

- [ ] `color-contrast`: Ratio ≥ 4.5:1
- [ ] `heading-order`: Hiérarchie des titres
- [ ] `landmark-one-main`: Un élément main
- [ ] `tabindex`: Pas de tabindex > 0

## Best Practices Checklist

- [ ] HTTPS utilisé
- [ ] Pas de console errors
- [ ] Pas de deprecated APIs
- [ ] Pas de bibliothèques vulnérables
- [ ] Pas de document.write()
- [ ] Safe external links (rel="noopener")

## SEO Checklist

- [ ] Meta description présente
- [ ] Title tag présent et < 60 chars
- [ ] Canonical URL définie
- [ ] robots.txt accessible
- [ ] sitemap.xml accessible
- [ ] Structured data valide (JSON-LD)
- [ ] Mobile-friendly
- [ ] Liens crawlables

## Common Issues & Fixes

### Performance Issues

**Issue: Large Contentful Paint (LCP) > 2.5s**
```tsx
// Fix: Add priority to hero images
<Image priority src="/hero.jpg" ... />

// Fix: Preload critical resources
<link rel="preload" as="image" href="/hero.jpg" />
```

**Issue: Cumulative Layout Shift (CLS) > 0.1**
```tsx
// Fix: Always set width/height on images
<Image width={400} height={300} ... />

// Fix: Reserve space for dynamic content
<div style={{ minHeight: '300px' }}>
  {loading ? <Skeleton /> : <Content />}
</div>
```

**Issue: Total Blocking Time (TBT) > 200ms**
```tsx
// Fix: Use dynamic imports
const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });

// Fix: Defer non-critical JS
<Script src="/analytics.js" strategy="lazyOnload" />
```

### Accessibility Issues

**Issue: Color contrast insufficient**
```css
/* Fix: Ensure ratio ≥ 4.5:1 */
.text-muted {
  color: #767676; /* Instead of #999 on white */
}
```

**Issue: Missing form labels**
```tsx
// Fix: Associate label with input
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Or use aria-label
<input aria-label="Search products" type="search" />
```

### SEO Issues

**Issue: Missing meta description**
```tsx
// Fix: Add in page metadata
export const metadata = {
  description: "Description de la page (150-160 chars max)"
};
```

**Issue: Multiple H1 tags**
```tsx
// Fix: Only one H1 per page
<h1>Main Title</h1>
<h2>Section Title</h2> {/* Not another h1 */}
```

## Monitoring

### Set up Lighthouse CI in GitHub Actions

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Track Scores Over Time

1. Upload results to Lighthouse CI Server
2. Set up alerts for regressions
3. Review in PR comments

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring Calculator](https://googlechrome.github.io/lighthouse/scorecalc/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
