import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description:
    "Découvrez comment Perfume Shop collecte, utilise et protège vos données personnelles. Conformité RGPD.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <p className="text-sm text-gray-500 italic">
          Dernière mise à jour : Janvier 2024
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. Introduction
          </h2>
          <p>
            Perfume Shop accorde une grande importance à la protection de vos
            données personnelles. Cette politique de confidentialité vous informe
            sur la manière dont nous collectons, utilisons et protégeons vos
            données conformément au Règlement Général sur la Protection des
            Données (RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            2. Responsable du traitement
          </h2>
          <p>
            Le responsable du traitement des données est :
            <br />
            <strong>Perfume Shop SAS</strong>
            <br />
            123 Rue de la Parfumerie, 75001 Paris, France
            <br />
            Email : donnees@perfumeshop.com
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. Données collectées
          </h2>
          <p>Nous collectons les données suivantes :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Données d'identification :</strong> nom, prénom, adresse
              email
            </li>
            <li>
              <strong>Données de livraison :</strong> adresse postale, numéro de
              téléphone
            </li>
            <li>
              <strong>Données de paiement :</strong> informations de carte
              bancaire (traitées par notre prestataire Stripe)
            </li>
            <li>
              <strong>Données de navigation :</strong> adresse IP, cookies,
              historique de navigation
            </li>
            <li>
              <strong>Données de commande :</strong> produits achetés, montants,
              dates
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. Finalités du traitement
          </h2>
          <p>Vos données sont collectées pour les finalités suivantes :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Traitement et suivi de vos commandes</li>
            <li>Gestion de la relation client et du service après-vente</li>
            <li>Facturation et comptabilité</li>
            <li>Lutte contre la fraude</li>
            <li>
              Amélioration de nos services et personnalisation de votre
              expérience
            </li>
            <li>Envoi d'offres commerciales (avec votre consentement)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            5. Base légale du traitement
          </h2>
          <p>
            Le traitement de vos données repose sur :
            <br />- L'exécution du contrat de vente (article 6.1.b RGPD)
            <br />- Nos obligations légales (article 6.1.c RGPD)
            <br />- Notre intérêt légitime (article 6.1.f RGPD)
            <br />- Votre consentement pour les communications marketing (article
            6.1.a RGPD)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            6. Durée de conservation
          </h2>
          <p>
            Vos données sont conservées pendant la durée nécessaire aux finalités
            pour lesquelles elles ont été collectées :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Données de compte client : durée de la relation commerciale</li>
            <li>Données de commande : 10 ans (obligations comptables)</li>
            <li>
              Données de prospection : 3 ans à compter du dernier contact
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            7. Destinataires des données
          </h2>
          <p>Vos données peuvent être transmises à :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Nos prestataires de services (paiement, livraison, hébergement)
            </li>
            <li>Les autorités compétentes sur demande légale</li>
          </ul>
          <p>
            Nous veillons à ce que ces tiers respectent la sécurité et la
            confidentialité de vos données.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            8. Vos droits
          </h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants concernant
            vos données personnelles :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Droit d'accès :</strong> obtenir une copie de vos données
            </li>
            <li>
              <strong>Droit de rectification :</strong> corriger vos données
              inexactes
            </li>
            <li>
              <strong>Droit à l'effacement :</strong> demander la suppression de
              vos données
            </li>
            <li>
              <strong>Droit à la limitation :</strong> limiter le traitement de
              vos données
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> recevoir vos données dans
              un format structuré
            </li>
            <li>
              <strong>Droit d'opposition :</strong> vous opposer au traitement de
              vos données
            </li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à : donnees@perfumeshop.com
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            9. Sécurité des données
          </h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles
            appropriées pour assurer la sécurité de vos données personnelles et
            les protéger contre toute destruction, perte, altération, divulgation
            ou accès non autorisé.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            10. Cookies
          </h2>
          <p>
            Notre site utilise des cookies pour améliorer votre expérience de
            navigation. Vous pouvez gérer vos préférences de cookies via les
            paramètres de votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            11. Modifications
          </h2>
          <p>
            Nous nous réservons le droit de modifier cette politique de
            confidentialité à tout moment. La version en vigueur est celle
            publiée sur notre site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            12. Contact et réclamation
          </h2>
          <p>
            Pour toute question concernant vos données personnelles, contactez
            notre délégué à la protection des données : donnees@perfumeshop.com
          </p>
          <p>
            Vous avez également le droit d'introduire une réclamation auprès de
            la CNIL (Commission Nationale de l'Informatique et des Libertés) :
            www.cnil.fr
          </p>
        </section>
      </div>
    </div>
  );
}
