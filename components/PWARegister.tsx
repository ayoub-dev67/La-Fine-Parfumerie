"use client";

import { useEffect } from "react";

/**
 * Composant pour enregistrer le Service Worker PWA
 * Silencieux - pas d'UI, juste l'enregistrement
 */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Enregistrer le service worker après le chargement de la page
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker enregistré:", registration.scope);

            // Vérifier les mises à jour
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // Nouvelle version disponible
                    console.log("[PWA] Nouvelle version disponible");
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("[PWA] Erreur enregistrement Service Worker:", error);
          });
      });
    }
  }, []);

  return null;
}
