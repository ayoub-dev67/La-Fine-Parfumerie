import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Mentions légales et informations sur Perfume Shop.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            1. Informations légales
          </h2>
          <p>
            <strong>Raison sociale :</strong> Perfume Shop SAS
            <br />
            <strong>Siège social :</strong> 123 Rue de la Parfumerie, 75001
            Paris, France
            <br />
            <strong>Capital social :</strong> 50 000 €
            <br />
            <strong>SIRET :</strong> 123 456 789 00012
            <br />
            <strong>RCS :</strong> Paris B 123 456 789
            <br />
            <strong>TVA intracommunautaire :</strong> FR12 123456789
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            2. Directeur de la publication
          </h2>
          <p>
            <strong>Nom :</strong> Jean Dupont
            <br />
            <strong>Email :</strong> direction@perfumeshop.com
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            3. Hébergement
          </h2>
          <p>
            Ce site est hébergé par :
            <br />
            <strong>Vercel Inc.</strong>
            <br />
            340 S Lemon Ave #4133, Walnut, CA 91789, USA
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            4. Contact
          </h2>
          <p>
            Pour toute question concernant le site, vous pouvez nous contacter :
            <br />
            <strong>Email :</strong> contact@perfumeshop.com
            <br />
            <strong>Téléphone :</strong> +33 1 23 45 67 89
            <br />
            <strong>Adresse :</strong> 123 Rue de la Parfumerie, 75001 Paris,
            France
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            5. Propriété intellectuelle
          </h2>
          <p>
            L'ensemble des contenus présents sur ce site (textes, images, logos,
            vidéos, etc.) sont protégés par les droits de propriété
            intellectuelle et sont la propriété exclusive de Perfume Shop, sauf
            mention contraire.
          </p>
          <p>
            Toute reproduction, distribution, modification, adaptation,
            retransmission ou publication de ces différents éléments est
            strictement interdite sans l'accord exprès par écrit de Perfume Shop.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            6. Données personnelles
          </h2>
          <p>
            Conformément au RGPD et à la loi Informatique et Libertés, vous
            disposez d'un droit d'accès, de rectification, de suppression et
            d'opposition aux données personnelles vous concernant.
          </p>
          <p>
            Pour exercer ces droits, veuillez nous contacter à l'adresse :
            donnees@perfumeshop.com
          </p>
          <p>
            Consultez notre{" "}
            <a
              href="/legal/confidentialite"
              className="text-purple-600 hover:underline"
            >
              Politique de confidentialité
            </a>{" "}
            pour plus d'informations.
          </p>
        </section>
      </div>
    </div>
  );
}
