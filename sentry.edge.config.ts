import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing pour edge runtime
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Environnement
  environment: process.env.NODE_ENV,

  // Ne pas envoyer en développement
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return event;
  },
});
