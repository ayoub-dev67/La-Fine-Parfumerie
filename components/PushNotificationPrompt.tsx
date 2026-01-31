'use client';

/**
 * PushNotificationPrompt - Invite l'utilisateur à activer les notifications push
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function PushNotificationPrompt() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Vérifier le support des notifications
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    setPermission(Notification.permission);

    // Afficher le prompt après 30s si pas encore demandé et utilisateur connecté
    if (Notification.permission === 'default' && session?.user) {
      const timer = setTimeout(() => setShowPrompt(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  async function handleSubscribe() {
    if (!session?.user) {
      alert('Veuillez vous connecter pour activer les notifications');
      return;
    }

    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.error('VAPID public key not configured');
      return;
    }

    setIsSubscribing(true);

    try {
      // Demander la permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        setShowPrompt(false);
        return;
      }

      // Attendre le service worker
      const registration = await navigator.serviceWorker.ready;

      // S'abonner aux notifications push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      // Envoyer la subscription au serveur
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (response.ok) {
        setShowPrompt(false);
        // Afficher notification de test
        if (Notification.permission === 'granted') {
          new Notification('Notifications activées !', {
            body: 'Vous recevrez des alertes pour vos commandes et offres exclusives.',
            icon: '/icons/icon-192x192.png',
          });
        }
      } else {
        throw new Error('Erreur serveur');
      }
    } catch (error) {
      console.error('Erreur activation notifications:', error);
      alert('Impossible d\'activer les notifications. Veuillez réessayer.');
    } finally {
      setIsSubscribing(false);
    }
  }

  // Ne rien afficher si déjà autorisé/refusé ou pas supporté
  if (permission !== 'default' || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="bg-gradient-to-br from-noir to-gray-900 rounded-xl p-5 border border-or/30 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl">🔔</div>
          <div>
            <h3 className="font-bold text-or mb-1">Restez informé !</h3>
            <p className="text-sm text-creme/70">
              Recevez des notifications pour vos commandes et offres exclusives.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="flex-1 px-4 py-2 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors disabled:opacity-50"
          >
            {isSubscribing ? 'Activation...' : 'Activer'}
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2 text-creme/60 hover:text-creme transition-colors"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Convertit une clé VAPID base64 en Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Hook pour gérer les notifications push
 */
export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window &&
                      'serviceWorker' in navigator &&
                      'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const response = await fetch('/api/push/subscribe');
      const data = await response.json();
      setIsSubscribed(data.subscribed);
    } catch {
      setIsSubscribed(false);
    }
  }

  async function unsubscribe() {
    try {
      await fetch('/api/push/subscribe', { method: 'DELETE' });
      setIsSubscribed(false);
    } catch (error) {
      console.error('Erreur désactivation:', error);
    }
  }

  return {
    isSupported,
    isSubscribed,
    unsubscribe,
    checkSubscription,
  };
}
