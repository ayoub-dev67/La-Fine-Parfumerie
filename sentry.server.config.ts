import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing côté serveur
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Environnement
  environment: process.env.NODE_ENV,

  // Ne pas envoyer en développement
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Sentry server event (dev):", event.exception?.values?.[0]?.value);
      return null;
    }
    return event;
  },

  // Ignorer certaines erreurs
  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],
});
