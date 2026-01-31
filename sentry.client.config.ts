import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing - ajuste le taux selon le volume de trafic
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Session Replay - capture les sessions pour debug
  replaysSessionSampleRate: 0.1, // 10% des sessions normales
  replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreurs

  integrations: [
    Sentry.replayIntegration({
      // Masquer les données sensibles
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Environnement
  environment: process.env.NODE_ENV,

  // Ne pas envoyer en développement
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Sentry event (dev):", event.exception?.values?.[0]?.value);
      return null;
    }
    return event;
  },

  // Ignorer certaines erreurs communes non critiques
  ignoreErrors: [
    // Erreurs réseau utilisateur
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // Erreurs de navigation
    "ResizeObserver loop",
    // Erreurs de tiers
    "Non-Error promise rejection",
  ],
});
