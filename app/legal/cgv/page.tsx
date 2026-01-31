import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente (CGV)",
  description:
    "Consultez les conditions générales de vente de Perfume Shop. Informations sur la commande, la livraison et les paiements.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CGVPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Conditions Générales de Vente</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <p className="text-sm text-gray-500 italic">
          Dernière mise à jour : Janvier 2024
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. Objet
          </h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les
            ventes de parfums et produits cosmétiques réalisées par Perfume Shop
            SAS sur le site www.perfumeshop.com.
          </p>
          <p>
            Le fait de passer commande implique l'acceptation pleine et entière
            des présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            2. Produits
          </h2>
          <p>
            Tous nos produits sont authentiques et proviennent directement des
            marques officielles ou de distributeurs agréés.
          </p>
          <p>
            Les photographies des produits sont aussi fidèles que possible mais
            ne peuvent assurer une similitude parfaite avec le produit
            réellement livré, notamment en ce qui concerne les couleurs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. Prix
          </h2>
          <p>
            Les prix de nos produits sont indiqués en euros (€) toutes taxes
            comprises (TTC), hors participation aux frais de port.
          </p>
          <p>
            Perfume Shop se réserve le droit de modifier ses prix à tout moment
            mais les produits seront facturés sur la base des tarifs en vigueur
            au moment de l'enregistrement de la commande.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. Commande
          </h2>
          <p>
            Pour passer commande, le client doit suivre le processus d'achat en
            ligne et valider sa commande après avoir vérifié son contenu.
          </p>
          <p>
            Une fois la commande validée et le paiement confirmé, un email de
            confirmation est envoyé à l'adresse email indiquée lors de la
            commande.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            5. Paiement
          </h2>
          <p>
            Le règlement des commandes s'effectue par carte bancaire via notre
            prestataire de paiement sécurisé Stripe.
          </p>
          <p>Cartes acceptées : Visa, Mastercard, American Express.</p>
          <p>
            Le débit de la carte bancaire est effectué au moment de la validation
            de la commande.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            6. Livraison
          </h2>
          <p>
            Les produits sont livrés à l'adresse indiquée par le client lors de
            sa commande.
          </p>
          <p>
            <strong>Délais de livraison :</strong> 2 à 5 jours ouvrés en France
            métropolitaine.
          </p>
          <p>
            <strong>Frais de port :</strong>
            <br />
            - Livraison standard : 4,90 €
            <br />
            - Livraison gratuite dès 50 € d'achat
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            7. Droit de rétractation
          </h2>
          <p>
            Conformément à l'article L221-18 du Code de la consommation, vous
            disposez d'un délai de 14 jours à compter de la réception de votre
            commande pour exercer votre droit de rétractation.
          </p>
          <p>
            Pour des raisons d'hygiène, les produits descellés ne pourront être
            repris ou échangés.
          </p>
          <p>
            Consultez notre{" "}
            <a
              href="/legal/retours"
              className="text-purple-600 hover:underline"
            >
              politique de retours
            </a>{" "}
            pour plus d'informations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            8. Service client
          </h2>
          <p>
            Pour toute question, notre service client est à votre disposition :
            <br />
            <strong>Email :</strong> contact@perfumeshop.com
            <br />
            <strong>Téléphone :</strong> +33 1 23 45 67 89
            <br />
            Du lundi au vendredi, de 9h à 18h
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            9. Droit applicable
          </h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige,
            les tribunaux français seront seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
