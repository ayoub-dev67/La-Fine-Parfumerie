'use client';

/**
 * Toast Components and Provider
 * Uses react-hot-toast with custom styling
 */

import { Toaster, toast as hotToast, ToastOptions } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Custom toast styles
const baseToastStyle = {
  background: '#1a1a1a',
  color: '#f5f0e8',
  border: '1px solid rgba(197, 160, 89, 0.3)',
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
};

// Toast Provider Component
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      containerStyle={{
        bottom: 80, // Above the compare bar
      }}
      toastOptions={{
        duration: 4000,
        style: baseToastStyle,
        success: {
          iconTheme: {
            primary: '#c5a059',
            secondary: '#1a1a1a',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#1a1a1a',
          },
        },
      }}
    />
  );
}

// Custom toast functions
export const toast = {
  // Success toast
  success: (message: string, options?: ToastOptions) => {
    return hotToast.success(message, {
      ...options,
      style: {
        ...baseToastStyle,
        borderColor: 'rgba(197, 160, 89, 0.5)',
      },
    });
  },

  // Error toast
  error: (message: string, options?: ToastOptions) => {
    return hotToast.error(message, {
      ...options,
      style: {
        ...baseToastStyle,
        borderColor: 'rgba(239, 68, 68, 0.5)',
      },
    });
  },

  // Info toast
  info: (message: string, options?: ToastOptions) => {
    return hotToast(message, {
      ...options,
      icon: '💡',
      style: {
        ...baseToastStyle,
        borderColor: 'rgba(59, 130, 246, 0.5)',
      },
    });
  },

  // Loading toast (returns ID for dismissing)
  loading: (message: string, options?: ToastOptions) => {
    return hotToast.loading(message, {
      ...options,
      style: baseToastStyle,
    });
  },

  // Cart added toast
  cartAdded: (productName: string) => {
    return hotToast.success(
      `${productName} ajouté au panier`,
      {
        icon: '🛒',
        style: {
          ...baseToastStyle,
          borderColor: 'rgba(197, 160, 89, 0.5)',
        },
      }
    );
  },

  // Wishlist added toast
  wishlistAdded: (productName: string) => {
    return hotToast.success(
      `${productName} ajouté aux favoris`,
      {
        icon: '❤️',
        style: {
          ...baseToastStyle,
          borderColor: 'rgba(236, 72, 153, 0.5)',
        },
      }
    );
  },

  // Wishlist removed toast
  wishlistRemoved: (productName: string) => {
    return hotToast(
      `${productName} retiré des favoris`,
      {
        icon: '💔',
        style: baseToastStyle,
      }
    );
  },

  // Compare added toast
  compareAdded: (productName: string) => {
    return hotToast.success(
      `${productName} ajouté à la comparaison`,
      {
        icon: '📊',
        style: {
          ...baseToastStyle,
          borderColor: 'rgba(197, 160, 89, 0.5)',
        },
      }
    );
  },

  // Compare limit reached
  compareLimitReached: () => {
    return hotToast.error(
      'Maximum 4 produits dans la comparaison',
      {
        icon: '⚠️',
        style: {
          ...baseToastStyle,
          borderColor: 'rgba(239, 68, 68, 0.5)',
        },
      }
    );
  },

  // Copied toast
  copied: (what: string = 'Lien') => {
    return hotToast.success(
      `${what} copié !`,
      {
        icon: '📋',
        duration: 2000,
        style: {
          ...baseToastStyle,
          borderColor: 'rgba(197, 160, 89, 0.5)',
        },
      }
    );
  },

  // Order placed toast
  orderPlaced: () => {
    return hotToast.success(
      'Commande confirmée ! 🎉',
      {
        duration: 5000,
        style: {
          ...baseToastStyle,
          borderColor: 'rgba(34, 197, 94, 0.5)',
        },
      }
    );
  },

  // Promise toast (for async operations)
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return hotToast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: baseToastStyle,
        success: {
          style: {
            ...baseToastStyle,
            borderColor: 'rgba(197, 160, 89, 0.5)',
          },
        },
        error: {
          style: {
            ...baseToastStyle,
            borderColor: 'rgba(239, 68, 68, 0.5)',
          },
        },
      }
    );
  },

  // Dismiss toast
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },

  // Custom toast with component
  custom: (component: React.ReactNode, options?: ToastOptions) => {
    return hotToast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              style={baseToastStyle}
            >
              {component}
            </motion.div>
          )}
        </AnimatePresence>
      ),
      options
    );
  },
};

// Undo toast with action
export function toastWithUndo(
  message: string,
  onUndo: () => void,
  duration: number = 5000
) {
  return hotToast(
    (t) => (
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button
          onClick={() => {
            onUndo();
            hotToast.dismiss(t.id);
          }}
          className="px-2 py-1 bg-or text-noir text-xs font-medium rounded hover:bg-or/90 transition-colors"
        >
          Annuler
        </button>
      </div>
    ),
    {
      duration,
      style: baseToastStyle,
    }
  );
}
