/**
 * TEMPLATE EMAIL - DEMANDE D'AVIS
 * Design luxe noir/or pour La Fine Parfumerie
 * Envoyé 7 jours après livraison
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Row,
  Column,
  Button,
  Hr,
  Heading,
} from "@react-email/components";

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  image?: string;
  productId: number;
}

interface ReviewRequestProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  promoCode?: string;
}

export default function ReviewRequest({
  orderNumber = "12345",
  customerName = "Cher client",
  items = [
    {
      id: "1",
      name: "Alexandria II",
      brand: "Xerjoff",
      productId: 1,
    },
  ],
  promoCode = "AVIS10",
}: ReviewRequestProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header avec logo */}
          <Section style={header}>
            <Heading style={logo}>La Fine Parfumerie</Heading>
            <Text style={tagline}>L&apos;elegance olfactive</Text>
          </Section>

          {/* Icône principale */}
          <Section style={heroSection}>
            <div style={heroIcon}>⭐</div>
            <Heading style={heroTitle}>Que pensez-vous de vos parfums ?</Heading>
          </Section>

          {/* Message */}
          <Text style={greeting}>Bonjour {customerName},</Text>
          <Text style={text}>
            Cela fait maintenant quelques jours que vous avez reçu votre
            commande #{orderNumber}. Nous espérons que vos nouvelles fragrances
            vous enchantent !
          </Text>
          <Text style={text}>
            Votre avis est précieux pour nous et pour la communauté des amateurs
            de parfums. Prenez quelques instants pour partager votre expérience.
          </Text>

          {/* Produits à évaluer */}
          <Section style={productsSection}>
            <Text style={productsSectionTitle}>Vos produits à évaluer</Text>
            {items.map((item) => (
              <div key={item.id} style={productCard}>
                <Row>
                  <Column style={productInfoColumn}>
                    <Text style={productName}>{item.name}</Text>
                    <Text style={productBrand}>{item.brand}</Text>
                  </Column>
                  <Column style={productActionColumn}>
                    <Button
                      style={reviewButton}
                      href={`https://lafineparfumerie.com/products/${item.productId}?review=true`}
                    >
                      Évaluer
                    </Button>
                  </Column>
                </Row>
              </div>
            ))}
          </Section>

          {/* Étoiles décoratives */}
          <Section style={starsSection}>
            <Text style={starsRow}>
              <span style={starEmpty}>☆</span>
              <span style={starEmpty}>☆</span>
              <span style={starEmpty}>☆</span>
              <span style={starEmpty}>☆</span>
              <span style={starEmpty}>☆</span>
            </Text>
            <Text style={starsText}>
              Cliquez sur un produit pour laisser votre note
            </Text>
          </Section>

          {/* Récompense */}
          {promoCode && (
            <Section style={rewardBox}>
              <Text style={rewardIcon}>🎁</Text>
              <Text style={rewardTitle}>Un cadeau pour vous remercier</Text>
              <Text style={rewardText}>
                En remerciement pour votre avis, profitez de
              </Text>
              <Text style={rewardDiscount}>-10%</Text>
              <Text style={rewardText}>sur votre prochaine commande</Text>
              <div style={promoCodeBox}>
                <Text style={promoCodeText}>{promoCode}</Text>
              </div>
              <Text style={rewardValidity}>
                Code valable 30 jours • Non cumulable
              </Text>
            </Section>
          )}

          {/* CTA Principal */}
          <Section style={ctaSection}>
            <Button
              style={mainButton}
              href={`https://lafineparfumerie.com/orders/${orderNumber}/review`}
            >
              Donner mon avis maintenant
            </Button>
          </Section>

          {/* Pourquoi laisser un avis */}
          <Section style={whySection}>
            <Text style={whyTitle}>Pourquoi votre avis compte ?</Text>
            <Row style={whyRow}>
              <Column style={whyColumn}>
                <Text style={whyIcon}>💬</Text>
                <Text style={whyItemTitle}>Aidez la communauté</Text>
                <Text style={whyItemText}>
                  Guidez les autres passionnés dans leurs choix
                </Text>
              </Column>
              <Column style={whyColumn}>
                <Text style={whyIcon}>📈</Text>
                <Text style={whyItemTitle}>Améliorez notre service</Text>
                <Text style={whyItemText}>
                  Vos retours nous aident à progresser
                </Text>
              </Column>
              <Column style={whyColumn}>
                <Text style={whyIcon}>🎁</Text>
                <Text style={whyItemTitle}>Gagnez des réductions</Text>
                <Text style={whyItemText}>
                  Chaque avis vous rapproche de nouvelles offres
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerTitle}>La Fine Parfumerie</Text>
            <Text style={footerText}>
              Merci de faire partie de notre communauté de passionnés.
            </Text>
            <Text style={footerText}>
              12 Rue des Parfumeurs, 67000 Strasbourg, France
            </Text>
            <Text style={unsubscribeText}>
              <a href="https://lafineparfumerie.com/preferences" style={unsubscribeLink}>
                Gérer mes préférences email
              </a>
            </Text>
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

const heroSection = {
  textAlign: "center" as const,
  padding: "40px 0 20px",
};

const heroIcon = {
  display: "inline-block",
  fontSize: "60px",
  margin: "0 0 20px",
};

const heroTitle = {
  fontSize: "24px",
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

const productsSection = {
  padding: "20px",
  margin: "20px 0",
};

const productsSectionTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 16px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const productCard = {
  backgroundColor: "#111111",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "12px",
  border: "1px solid #1a1a1a",
};

const productInfoColumn = {
  width: "70%",
  verticalAlign: "middle" as const,
};

const productActionColumn = {
  width: "30%",
  textAlign: "right" as const,
  verticalAlign: "middle" as const,
};

const productName = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 4px",
};

const productBrand = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
};

const reviewButton = {
  backgroundColor: "transparent",
  color: "#c5a059",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "8px 20px",
  borderRadius: "4px",
  border: "1px solid #c5a059",
  display: "inline-block",
};

const starsSection = {
  textAlign: "center" as const,
  padding: "20px",
};

const starsRow = {
  fontSize: "32px",
  letterSpacing: "8px",
  margin: "0 0 8px",
};

const starEmpty = {
  color: "#333333",
};

const starsText = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
};

const rewardBox = {
  textAlign: "center" as const,
  backgroundColor: "#1a1a0a",
  border: "2px solid #c5a059",
  borderRadius: "12px",
  padding: "32px 24px",
  margin: "30px 20px",
};

const rewardIcon = {
  fontSize: "40px",
  margin: "0 0 12px",
};

const rewardTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 16px",
};

const rewardText = {
  fontSize: "14px",
  color: "#999999",
  margin: "8px 0",
};

const rewardDiscount = {
  fontSize: "48px",
  fontWeight: "700",
  color: "#c5a059",
  margin: "12px 0",
};

const promoCodeBox = {
  backgroundColor: "#000000",
  border: "1px dashed #c5a059",
  borderRadius: "6px",
  padding: "12px 24px",
  margin: "16px auto",
  maxWidth: "200px",
};

const promoCodeText = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#c5a059",
  letterSpacing: "2px",
  margin: "0",
};

const rewardValidity = {
  fontSize: "12px",
  color: "#666666",
  margin: "12px 0 0",
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const mainButton = {
  backgroundColor: "#c5a059",
  color: "#000000",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "16px 48px",
  borderRadius: "6px",
  display: "inline-block",
};

const whySection = {
  padding: "30px 20px",
  backgroundColor: "#111111",
  margin: "30px 0",
};

const whyTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const whyRow = {
  marginBottom: "0",
};

const whyColumn = {
  textAlign: "center" as const,
  padding: "0 10px",
  width: "33.33%",
};

const whyIcon = {
  fontSize: "28px",
  margin: "0 0 8px",
};

const whyItemTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 6px",
};

const whyItemText = {
  fontSize: "12px",
  color: "#999999",
  lineHeight: "18px",
  margin: "0",
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

const unsubscribeText = {
  fontSize: "12px",
  margin: "16px 0",
};

const unsubscribeLink = {
  color: "#666666",
  textDecoration: "underline",
};

const footerCopyright = {
  fontSize: "12px",
  color: "#444444",
  margin: "20px 0 0",
};
