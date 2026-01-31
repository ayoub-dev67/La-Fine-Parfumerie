import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retours & Remboursements",
  description:
    "Consultez notre politique de retours et remboursements. Droit de rétractation de 14 jours. Procédure simple et rapide.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RetoursPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Retours & Remboursements</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <p className="text-sm text-gray-500 italic">
          Dernière mise à jour : Janvier 2024
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. Droit de rétractation
          </h2>
          <p>
            Conformément aux dispositions de l'article L221-18 du Code de la
            consommation, vous disposez d'un délai de <strong>14 jours</strong> à
            compter de la réception de votre commande pour exercer votre droit de
            rétractation, sans avoir à justifier de motifs ni à payer de
            pénalité.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            2. Conditions de retour
          </h2>
          <p>
            Pour des raisons d'hygiène et de sécurité sanitaire, nous ne pouvons
            accepter le retour que des produits dans les conditions suivantes :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Le produit n'a pas été ouvert ni descellé</li>
            <li>L'emballage d'origine est intact</li>
            <li>Le produit est dans son état d'origine</li>
            <li>
              Le retour est effectué dans les 14 jours suivant la réception
            </li>
          </ul>
          <p className="bg-amber-50 border-l-4 border-amber-500 p-4 my-4">
            <strong>⚠️ Important :</strong> Les parfums descellés ou ouverts ne
            peuvent être ni repris ni échangés pour des raisons d'hygiène,
            conformément à l'article L221-28 du Code de la consommation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. Procédure de retour
          </h2>
          <p>Pour effectuer un retour, suivez ces étapes :</p>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong>Contactez notre service client</strong>
              <br />
              Envoyez un email à : retours@perfumeshop.com avec :
              <ul className="list-disc pl-6 mt-2">
                <li>Votre numéro de commande</li>
                <li>Le(s) produit(s) concerné(s)</li>
                <li>Le motif de retour</li>
              </ul>
            </li>
            <li>
              <strong>Réception de l'autorisation de retour</strong>
              <br />
              Nous vous enverrons un numéro de retour (RMA) et les instructions
              de renvoi dans les 48h ouvrées.
            </li>
            <li>
              <strong>Renvoi du produit</strong>
              <br />
              Renvoyez le produit à l'adresse indiquée avec le formulaire de
              retour complété et le numéro RMA bien visible sur le colis.
            </li>
            <li>
              <strong>Traitement du retour</strong>
              <br />
              Dès réception du colis, nous vérifions l'état du produit et
              procédons au remboursement sous 14 jours.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. Frais de retour
          </h2>
          <p>
            Les frais de retour sont à la charge du client, sauf en cas d'erreur
            de notre part (produit défectueux, erreur de livraison).
          </p>
          <p className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
            <strong>✓ Bon plan :</strong> Nous vous recommandons d'utiliser un
            mode d'envoi avec suivi. Nous ne pourrons être tenus responsables des
            colis perdus lors du retour.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            5. Remboursement
          </h2>
          <p>
            Le remboursement sera effectué dans les 14 jours suivant la réception
            du produit retourné, après vérification de son état.
          </p>
          <p>Le remboursement comprend :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Le prix du ou des produit(s) retourné(s)</li>
            <li>
              Les frais de livraison initiaux (hors frais supplémentaires si vous
              aviez choisi une livraison express)
            </li>
          </ul>
          <p>
            Le remboursement s'effectue par le même moyen de paiement que celui
            utilisé lors de l'achat.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            6. Échanges
          </h2>
          <p>
            Nous ne proposons pas d'échanges directs. Si vous souhaitez un autre
            produit :
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Effectuez un retour du produit initial</li>
            <li>Passez une nouvelle commande pour le produit souhaité</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            7. Produits défectueux ou erreur de livraison
          </h2>
          <p>
            Si vous recevez un produit défectueux ou si nous avons commis une
            erreur dans votre livraison :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Contactez-nous immédiatement à : sav@perfumeshop.com avec des photos
            </li>
            <li>Nous prenons en charge les frais de retour</li>
            <li>
              Nous vous envoyons un produit de remplacement en priorité ou
              procédons au remboursement intégral
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            8. Adresse de retour
          </h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="font-semibold mb-2">
              Perfume Shop - Service Retours
            </p>
            <p>123 Rue de la Parfumerie</p>
            <p>75001 Paris, France</p>
            <p className="mt-2 text-sm text-gray-600">
              N'oubliez pas d'indiquer votre numéro RMA sur le colis
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            9. Contact
          </h2>
          <p>
            Pour toute question concernant les retours :
            <br />
            <strong>Email :</strong> retours@perfumeshop.com
            <br />
            <strong>Téléphone :</strong> +33 1 23 45 67 89
            <br />
            Du lundi au vendredi, de 9h à 18h
          </p>
        </section>
      </div>
    </div>
  );
}
