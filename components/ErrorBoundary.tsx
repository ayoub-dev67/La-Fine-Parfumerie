"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary - Capture les erreurs React
 * Affiche une UI de fallback au lieu de crasher toute l'app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur pour monitoring
    console.error("[ErrorBoundary] Erreur capturée:", error);
    console.error("[ErrorBoundary] Info:", errorInfo.componentStack);

    // En production, envoyer à un service de monitoring
    if (process.env.NODE_ENV === "production") {
      // TODO: Intégrer Sentry, LogRocket, etc.
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personnalisée ou par défaut
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 border border-or/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-or/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="font-serif text-xl text-creme mb-3">
              Une erreur est survenue
            </h2>
            <p className="text-creme/60 text-sm mb-6">
              Nous sommes désolés, quelque chose s&apos;est mal passé.
              Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="px-6 py-3 bg-or text-noir font-semibold text-sm tracking-wider uppercase hover:bg-or-light transition-colors"
            >
              Rafraîchir la page
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-or/70 text-xs cursor-pointer">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-3 bg-noir-100 text-red-400 text-xs overflow-auto max-h-40 rounded">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC pour wrapper un composant avec ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
