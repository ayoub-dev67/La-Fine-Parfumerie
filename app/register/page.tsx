"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      // Inscription réussie, rediriger vers login
      router.push("/login?registered=true");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
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
          <h2 className="text-2xl font-semibold text-white">Créer un compte</h2>
          <p className="text-gray-400 mt-2">
            Rejoignez notre cercle d&apos;amateurs de parfums
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
            {/* Nom */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                placeholder="Jean Dupont"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                placeholder="vous@exemple.com"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                placeholder="Minimum 6 caractères"
              />
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg focus:outline-none focus:border-[#c5a059]/50 transition-colors"
                placeholder="Confirmez votre mot de passe"
              />
            </div>
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors shadow-lg shadow-[#c5a059]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
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
              href="/login"
              className="text-[#c5a059] hover:underline"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>

        {/* Note légale */}
        <p className="text-xs text-gray-500 text-center">
          En créant un compte, vous acceptez nos conditions d&apos;utilisation
          et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
