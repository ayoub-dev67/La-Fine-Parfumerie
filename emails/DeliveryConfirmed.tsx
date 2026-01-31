/**
 * TEMPLATE EMAIL - LIVRAISON CONFIRMÉE
 * Design luxe noir/or pour La Fine Parfumerie
 * Envoyé lorsque le colis est livré
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
  volume: string;
  quantity: number;
}

interface DeliveryConfirmedProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  deliveryDate: string;
}

export default function DeliveryConfirmed({
  orderNumber = "12345",
  customerName = "Cher client",
  items = [
    {
      id: "1",
      name: "Alexandria II",
      brand: "Xerjoff",
      volume: "50ml",
      quantity: 1,
    },
  ],
  deliveryDate = new Date().toLocaleDateString("fr-FR"),
}: DeliveryConfirmedProps) {
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

          {/* Icône succès */}
          <Section style={successSection}>
            <div style={successIcon}>🎉</div>
            <Heading style={successTitle}>Votre commande est arrivée !</Heading>
          </Section>

          {/* Message */}
          <Text style={greeting}>Bonjour {customerName},</Text>
          <Text style={text}>
            Excellente nouvelle ! Votre commande #{orderNumber} a été livrée
            avec succès le {deliveryDate}. Nous espérons que vos nouvelles
            fragrances vous apporteront beaucoup de plaisir.
          </Text>

          {/* Récapitulatif commande */}
          <Section style={orderBox}>
            <Text style={orderBoxTitle}>📦 Votre commande</Text>
            {items.map((item) => (
              <div key={item.id} style={productRow}>
                <Row>
                  <Column style={productInfoColumn}>
                    <Text style={productName}>{item.name}</Text>
                    <Text style={productDetails}>
                      {item.brand} • {item.volume}
                    </Text>
                  </Column>
                  <Column style={productQuantityColumn}>
                    <Text style={productQuantity}>×{item.quantity}</Text>
                  </Column>
                </Row>
              </div>
            ))}
          </Section>

          {/* Section conseils */}
          <Section style={tipsBox}>
            <Text style={tipsTitle}>✨ Conseils d&apos;utilisation</Text>
            <Text style={tipsText}>
              • <strong>Conservation</strong> : Gardez vos parfums à l&apos;abri
              de la lumière et de la chaleur
            </Text>
            <Text style={tipsText}>
              • <strong>Application</strong> : Vaporisez sur les points de
              pulsation (poignets, cou, derrière les oreilles)
            </Text>
            <Text style={tipsText}>
              • <strong>Layering</strong> : Superposez différentes fragrances
              pour créer votre signature unique
            </Text>
          </Section>

          {/* CTA Avis */}
          <Section style={reviewBox}>
            <Text style={reviewIcon}>⭐</Text>
            <Text style={reviewTitle}>Partagez votre expérience</Text>
            <Text style={reviewText}>
              Votre avis compte ! Aidez d&apos;autres passionnés à découvrir ces
              fragrances en partageant votre expérience.
            </Text>
            <Button
              style={button}
              href={`https://lafineparfumerie.com/orders/${orderNumber}/review`}
            >
              Donner mon avis
            </Button>
          </Section>

          {/* Section problème */}
          <Section style={helpBox}>
            <Text style={helpTitle}>Un souci avec votre commande ?</Text>
            <Text style={helpText}>
              Notre équipe est là pour vous aider. Contactez-nous dans les 14
              jours suivant la livraison pour toute réclamation.
            </Text>
            <Button
              style={secondaryButton}
              href="mailto:contact@lafineparfumerie.fr"
            >
              Nous contacter
            </Button>
          </Section>

          {/* Prochaine commande */}
          <Section style={nextOrderBox}>
            <Text style={nextOrderIcon}>🎁</Text>
            <Text style={nextOrderTitle}>Envie de nouvelles découvertes ?</Text>
            <Text style={nextOrderText}>
              Explorez notre collection de parfums de niche et trouvez votre
              prochaine signature olfactive.
            </Text>
            <Button
              style={goldButton}
              href="https://lafineparfumerie.com/products"
            >
              Découvrir la collection
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerTitle}>La Fine Parfumerie</Text>
            <Text style={footerText}>
              Merci de votre confiance.
              <br />
              L&apos;équipe La Fine Parfumerie
            </Text>
            <Text style={footerText}>
              12 Rue des Parfumeurs, 67000 Strasbourg, France
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

const successSection = {
  textAlign: "center" as const,
  padding: "40px 0 20px",
};

const successIcon = {
  display: "inline-block",
  fontSize: "60px",
  margin: "0 0 20px",
};

const successTitle = {
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

const orderBox = {
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const orderBoxTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 16px",
};

const productRow = {
  backgroundColor: "#0a0a0a",
  borderRadius: "6px",
  padding: "12px 16px",
  marginBottom: "8px",
};

const productInfoColumn = {
  width: "80%",
};

const productQuantityColumn = {
  width: "20%",
  textAlign: "right" as const,
};

const productName = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 4px",
};

const productDetails = {
  fontSize: "12px",
  color: "#666666",
  margin: "0",
};

const productQuantity = {
  fontSize: "14px",
  color: "#999999",
  margin: "0",
};

const tipsBox = {
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const tipsTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 16px",
};

const tipsText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
  margin: "0 0 10px",
};

const reviewBox = {
  textAlign: "center" as const,
  backgroundColor: "#1a1a0a",
  border: "2px solid #c5a059",
  borderRadius: "12px",
  padding: "32px 24px",
  margin: "30px 20px",
};

const reviewIcon = {
  fontSize: "40px",
  margin: "0 0 12px",
};

const reviewTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 12px",
};

const reviewText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
  margin: "0 0 20px",
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

const helpBox = {
  textAlign: "center" as const,
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const helpTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 12px",
};

const helpText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
  margin: "0 0 16px",
};

const secondaryButton = {
  backgroundColor: "transparent",
  color: "#c5a059",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 32px",
  borderRadius: "6px",
  border: "1px solid #c5a059",
  display: "inline-block",
};

const nextOrderBox = {
  textAlign: "center" as const,
  padding: "30px 20px",
};

const nextOrderIcon = {
  fontSize: "32px",
  margin: "0 0 12px",
};

const nextOrderTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 12px",
};

const nextOrderText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
  margin: "0 0 20px",
};

const goldButton = {
  backgroundColor: "#c5a059",
  color: "#000000",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 32px",
  borderRadius: "6px",
  display: "inline-block",
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

const footerCopyright = {
  fontSize: "12px",
  color: "#444444",
  margin: "20px 0 0",
};
