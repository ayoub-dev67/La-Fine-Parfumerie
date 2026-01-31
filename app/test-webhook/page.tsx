'use client';

/**
 * PAGE DE TEST WEBHOOK
 * Interface pour tester le webhook Stripe en développement
 * ⚠️ DÉVELOPPEMENT SEULEMENT
 */

import { useState } from 'react';

export default function TestWebhookPage() {
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: 'Erreur de connexion',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#c5a059] mb-2">
            🧪 Test Webhook Stripe
          </h1>
          <p className="text-gray-400">
            Simulez le webhook Stripe pour marquer une commande comme payée en
            développement
          </p>
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ Développement seulement - Désactivé en production
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6 mb-6">
          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session ID Stripe
              </label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="cs_test_..."
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Copiez le Session ID depuis l&apos;URL après le paiement ou depuis
                votre terminal
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !sessionId}
              className="w-full px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Traitement...' : '✅ Simuler le paiement'}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-[#c5a059] mb-3">
            📋 Comment utiliser
          </h2>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-[#c5a059] font-bold">1.</span>
              <span>
                Effectuez un paiement test avec la carte: <code className="text-green-400 bg-gray-900 px-2 py-1 rounded">4242 4242 4242 4242</code>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#c5a059] font-bold">2.</span>
              <span>
                Copiez le Session ID depuis l&apos;URL (après <code className="text-gray-500">session_id=</code>)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#c5a059] font-bold">3.</span>
              <span>Collez-le ci-dessus et cliquez sur &quot;Simuler le paiement&quot;</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#c5a059] font-bold">4.</span>
              <span>Vérifiez que le statut passe à &quot;Payée&quot; sur la page de succès</span>
            </li>
          </ol>
        </div>

        {/* Résultat */}
        {result && (
          <div
            className={`border rounded-lg p-6 ${
              result.success
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <h2
              className={`text-lg font-bold mb-3 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {result.success ? '✅ Succès' : '❌ Erreur'}
            </h2>
            <pre className="text-sm text-gray-300 overflow-x-auto bg-black/50 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>

            {result.success && (
              <div className="mt-4 space-y-2">
                <p className="text-green-400 text-sm">
                  🎉 La commande a été mise à jour avec succès !
                </p>
                <p className="text-gray-400 text-sm">
                  • Commande ID: <code className="text-white">{result.orderId}</code>
                </p>
                <p className="text-gray-400 text-sm">
                  • Nouveau statut: <code className="text-white">{result.status}</code>
                </p>
                <p className="text-gray-400 text-sm">
                  • Email de confirmation envoyé
                </p>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <h3 className="text-sm font-bold text-gray-400 mb-2">
            💡 Pour la production
          </h3>
          <p className="text-xs text-gray-500">
            En production, utilisez Stripe CLI pour tester les webhooks localement:
          </p>
          <code className="block mt-2 text-xs text-gray-400 bg-black p-2 rounded">
            stripe listen --forward-to localhost:3000/api/webhook
          </code>
        </div>
      </div>
    </div>
  );
}
