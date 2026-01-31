"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        setLoading(false);
      } else {
        // Connexion réussie
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-4xl text-[#c5a059] mb-2">
              La Fine Parfumerie
            </h1>
          </Link>
          <div className="w-16 h-px bg-[#c5a059] mx-auto mb-8" />
          <h2 className="text-2xl font-semibold text-white">Connexion</h2>
          <p className="text-gray-400 mt-2">
            Accédez à votre espace administration
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                placeholder="admin@lafineparfumerie.fr"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors shadow-lg shadow-[#c5a059]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {/* Liens */}
          <div className="flex items-center justify-between text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-[#c5a059] transition-colors"
            >
              ← Retour à l&apos;accueil
            </Link>
            <Link
              href="/register"
              className="text-[#c5a059] hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </form>

        {/* Informations de test */}
        <div className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 text-center mb-2">
            🔐 Compte de test Admin
          </p>
          <p className="text-xs text-gray-400 text-center">
            Email: <span className="text-[#c5a059]">admin@lafineparfumerie.fr</span>
          </p>
          <p className="text-xs text-gray-400 text-center">
            Mot de passe: <span className="text-[#c5a059]">admin123</span>
          </p>
        </div>

        {/* OAuth (Google) */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0a0a0a] text-gray-500">Ou continuer avec</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Connexion avec Google
        </button>
      </div>
    </div>
  );
}
