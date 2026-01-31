/**
 * TEMPLATE EMAIL - BIENVENUE
 * Design luxe noir/or pour La Fine Parfumerie
 * Envoyé lors de la création du compte
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Heading,
  Row,
  Column,
} from "@react-email/components";

interface WelcomeEmailProps {
  customerName: string;
  promoCode: string;
}

export default function WelcomeEmail({
  customerName = "Cher client",
  promoCode = "BIENVENUE10",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header avec logo */}
          <Section style={header}>
            <Heading style={logo}>La Fine Parfumerie</Heading>
            <Text style={tagline}>L&apos;élégance olfactive</Text>
          </Section>

          {/* Icône bienvenue */}
          <Section style={welcomeSection}>
            <div style={welcomeIcon}>✨</div>
            <Heading style={welcomeTitle}>Bienvenue !</Heading>
          </Section>

          {/* Message de bienvenue */}
          <Text style={greeting}>Bonjour {customerName},</Text>
          <Text style={text}>
            Nous sommes ravis de vous accueillir dans l&apos;univers exclusif de
            La Fine Parfumerie. En rejoignant notre communauté, vous entrez dans
            un monde où l&apos;excellence olfactive rencontre l&apos;élégance
            intemporelle.
          </Text>

          {/* Code promo */}
          <Section style={promoBox}>
            <Text style={promoTitle}>🎁 Cadeau de bienvenue</Text>
            <Text style={promoText}>
              Pour célébrer votre arrivée, profitez de
            </Text>
            <Text style={promoDiscount}>-10%</Text>
            <Text style={promoText}>sur votre première commande avec le code</Text>
            <div style={promoCodeBox}>
              <Text style={promoCodeStyle}>{promoCode}</Text>
            </div>
            <Text style={promoValidity}>
              Valable 30 jours • Applicable sur tout le catalogue
            </Text>
          </Section>

          {/* Bouton CTA */}
          <Section style={buttonContainer}>
            <Button style={button} href="https://lafineparfumerie.com/products">
              Découvrir nos parfums
            </Button>
          </Section>

          {/* Avantages */}
          <Section style={benefitsSection}>
            <Heading style={benefitsTitle}>Vos avantages exclusifs</Heading>

            <Row style={benefitRow}>
              <Column style={benefitIconColumn}>
                <Text style={benefitIcon}>🎁</Text>
              </Column>
              <Column style={benefitTextColumn}>
                <Text style={benefitName}>Échantillons offerts</Text>
                <Text style={benefitDescription}>
                  Découvrez gratuitement de nouvelles fragrances avec chaque
                  commande
                </Text>
              </Column>
            </Row>

            <Row style={benefitRow}>
              <Column style={benefitIconColumn}>
                <Text style={benefitIcon}>🚚</Text>
              </Column>
              <Column style={benefitTextColumn}>
                <Text style={benefitName}>Livraison gratuite</Text>
                <Text style={benefitDescription}>
                  Dès 75€ d&apos;achat, partout en France
                </Text>
              </Column>
            </Row>

            <Row style={benefitRow}>
              <Column style={benefitIconColumn}>
                <Text style={benefitIcon}>✨</Text>
              </Column>
              <Column style={benefitTextColumn}>
                <Text style={benefitName}>Emballage de luxe</Text>
                <Text style={benefitDescription}>
                  Chaque commande est préparée comme un cadeau dans notre
                  packaging signature
                </Text>
              </Column>
            </Row>

            <Row style={benefitRow}>
              <Column style={benefitIconColumn}>
                <Text style={benefitIcon}>💎</Text>
              </Column>
              <Column style={benefitTextColumn}>
                <Text style={benefitName}>Accès prioritaire</Text>
                <Text style={benefitDescription}>
                  Soyez les premiers informés des nouveautés et éditions limitées
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Notre sélection */}
          <Section style={selectionBox}>
            <Text style={selectionIcon}>🌟</Text>
            <Text style={selectionTitle}>Notre sélection</Text>
            <Text style={selectionText}>
              Nous avons soigneusement sélectionné pour vous les plus grandes
              maisons de parfumerie : Xerjoff, Montale, Mancera, Nasomatto, et
              bien d&apos;autres marques prestigieuses.
            </Text>
            <Text style={selectionText}>
              Chaque fragrance raconte une histoire unique et reflète
              l&apos;art de la parfumerie de luxe.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerTitle}>La Fine Parfumerie</Text>
            <Text style={footerText}>
              Besoin d&apos;aide pour choisir votre parfum ?
              <br />
              Notre équipe est à votre écoute :{" "}
              <a href="mailto:contact@lafineparfumerie.fr" style={footerLink}>
                contact@lafineparfumerie.fr
              </a>
            </Text>
            <Text style={footerText}>
              12 Rue des Parfumeurs, 67000 Strasbourg, France
            </Text>

            {/* Réseaux sociaux */}
            <Section style={socialSection}>
              <Text style={socialTitle}>Suivez-nous</Text>
              <Row>
                <Column style={socialColumn}>
                  <a href="https://instagram.com/lafineparfumerie" style={socialLink}>
                    Instagram
                  </a>
                </Column>
                <Column style={socialColumn}>
                  <a href="https://facebook.com/lafineparfumerie" style={socialLink}>
                    Facebook
                  </a>
                </Column>
                <Column style={socialColumn}>
                  <a href="https://twitter.com/lafineparfumerie" style={socialLink}>
                    Twitter
                  </a>
                </Column>
              </Row>
            </Section>

            <Text style={footerCopyright}>
              © 2024 La Fine Parfumerie. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================
// STYLES INLINE (Noir/Or luxe)
// ============================================

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  padding: "0 20px",
  maxWidth: "600px",
  backgroundColor: "#000000",
};

const header = {
  textAlign: "center" as const,
  padding: "40px 0 30px",
  borderBottom: "1px solid #1a1a1a",
};

const logo = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#c5a059",
  margin: "0 0 8px",
  fontFamily: "Georgia, serif",
};

const tagline = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
  fontStyle: "italic",
};

const welcomeSection = {
  textAlign: "center" as const,
  padding: "40px 0 20px",
};

const welcomeIcon = {
  display: "inline-block",
  fontSize: "60px",
  margin: "0 0 20px",
};

const welcomeTitle = {
  fontSize: "28px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0",
};

const greeting = {
  fontSize: "16px",
  color: "#ffffff",
  margin: "30px 0 0",
  padding: "0 20px",
};

const text = {
  fontSize: "16px",
  color: "#999999",
  lineHeight: "24px",
  margin: "16px 0",
  padding: "0 20px",
};

const promoBox = {
  backgroundColor: "linear-gradient(135deg, #1a1a0a 0%, #0a0a0a 100%)",
  border: "2px solid #c5a059",
  borderRadius: "12px",
  padding: "32px 24px",
  margin: "30px 20px",
  textAlign: "center" as const,
};

const promoTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 16px",
};

const promoText = {
  fontSize: "14px",
  color: "#999999",
  margin: "8px 0",
};

const promoDiscount = {
  fontSize: "48px",
  fontWeight: "700",
  color: "#c5a059",
  margin: "16px 0",
};

const promoCodeBox = {
  backgroundColor: "#000000",
  border: "1px dashed #c5a059",
  borderRadius: "6px",
  padding: "16px 24px",
  margin: "20px auto",
  maxWidth: "250px",
};

const promoCodeStyle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#c5a059",
  letterSpacing: "2px",
  margin: "0",
};

const promoValidity = {
  fontSize: "12px",
  color: "#666666",
  margin: "16px 0 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#c5a059",
  color: "#000000",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "14px 40px",
  borderRadius: "6px",
  display: "inline-block",
};

const benefitsSection = {
  padding: "20px",
  margin: "30px 0",
};

const benefitsTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const benefitRow = {
  marginBottom: "20px",
};

const benefitIconColumn = {
  width: "60px",
  verticalAlign: "top" as const,
};

const benefitTextColumn = {
  verticalAlign: "top" as const,
};

const benefitIcon = {
  fontSize: "32px",
  margin: "0",
};

const benefitName = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 6px",
};

const benefitDescription = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "20px",
  margin: "0",
};

const selectionBox = {
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
  textAlign: "center" as const,
};

const selectionIcon = {
  fontSize: "32px",
  margin: "0 0 12px",
};

const selectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 16px",
};

const selectionText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
  margin: "0 0 12px",
};

const footerDivider = {
  borderColor: "#1a1a1a",
  margin: "40px 20px 30px",
};

const footer = {
  textAlign: "center" as const,
  padding: "0 20px 40px",
};

const footerTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 16px",
  fontFamily: "Georgia, serif",
};

const footerText = {
  fontSize: "14px",
  color: "#666666",
  lineHeight: "22px",
  margin: "8px 0",
};

const footerLink = {
  color: "#c5a059",
  textDecoration: "none",
};

const socialSection = {
  margin: "24px 0",
};

const socialTitle = {
  fontSize: "14px",
  color: "#999999",
  margin: "0 0 12px",
};

const socialColumn = {
  textAlign: "center" as const,
};

const socialLink = {
  color: "#c5a059",
  textDecoration: "none",
  fontSize: "14px",
};

const footerCopyright = {
  fontSize: "12px",
  color: "#444444",
  margin: "20px 0 0",
};
