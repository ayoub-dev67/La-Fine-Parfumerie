/**
 * TEMPLATE EMAIL - CONFIRMATION DE COMMANDE
 * Design luxe noir/or pour La Fine Parfumerie
 * Envoyé après paiement réussi
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
  price: number;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
}

export default function OrderConfirmation({
  orderNumber = "12345",
  customerName = "Cher client",
  items = [
    {
      id: "1",
      name: "Alexandria II",
      brand: "Xerjoff",
      volume: "50ml",
      quantity: 1,
      price: 89.99,
    },
  ],
  totalAmount = 89.99,
  orderDate = new Date().toLocaleDateString("fr-FR"),
}: OrderConfirmationProps) {
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

          {/* Icône succès */}
          <Section style={successSection}>
            <div style={successIcon}>✓</div>
            <Heading style={successTitle}>Commande confirmée</Heading>
          </Section>

          {/* Message de confirmation */}
          <Text style={greeting}>Bonjour {customerName},</Text>
          <Text style={text}>
            Merci pour votre commande ! Nous sommes ravis de vous compter parmi
            nos clients. Votre commande a été reçue et sera traitée dans les
            plus brefs délais.
          </Text>

          {/* Numéro de commande */}
          <Section style={orderInfoBox}>
            <Row>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>Numéro de commande</Text>
                <Text style={orderNumberStyle}>#{orderNumber}</Text>
              </Column>
              <Column style={orderInfoColumn}>
                <Text style={orderInfoLabel}>Date</Text>
                <Text style={orderDateStyle}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          {/* Tableau produits */}
          <Section style={productsSection}>
            <Heading style={sectionTitle}>Vos produits</Heading>

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
                  <Column style={productPriceColumn}>
                    <Text style={productPrice}>{item.price.toFixed(2)}€</Text>
                  </Column>
                </Row>
              </div>
            ))}

            <Hr style={divider} />

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column>
                <Text style={totalAmountStyle}>{totalAmount.toFixed(2)}€</Text>
              </Column>
            </Row>
          </Section>

          {/* Informations de livraison */}
          <Section style={infoBox}>
            <Text style={infoIcon}>📦</Text>
            <Text style={infoTitle}>Informations de livraison</Text>
            <Text style={infoText}>
              Votre commande sera préparée avec soin et expédiée sous 2-3 jours
              ouvrés. Vous recevrez un email avec le numéro de suivi dès que
              votre colis sera en route.
            </Text>
          </Section>

          {/* Bouton CTA */}
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`https://lafineparfumerie.com/orders/${orderNumber}`}
            >
              Suivre ma commande
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerTitle}>La Fine Parfumerie</Text>
            <Text style={footerText}>
              Des questions ? Contactez-nous à{" "}
              <a href="mailto:contact@lafineparfumerie.fr" style={footerLink}>
                contact@lafineparfumerie.fr
              </a>
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
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  backgroundColor: "#1a3a1a",
  color: "#4ade80",
  fontSize: "36px",
  lineHeight: "60px",
  textAlign: "center" as const,
  margin: "0 auto 20px",
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

const orderInfoBox = {
  backgroundColor: "#111111",
  border: "1px solid #c5a059",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const orderInfoColumn = {
  textAlign: "center" as const,
};

const orderInfoLabel = {
  fontSize: "12px",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const orderNumberStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#c5a059",
  margin: "0",
};

const orderDateStyle = {
  fontSize: "16px",
  color: "#ffffff",
  margin: "0",
};

const productsSection = {
  padding: "20px",
  margin: "30px 0",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 20px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const productRow = {
  backgroundColor: "#111111",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "12px",
};

const productInfoColumn = {
  width: "60%",
};

const productQuantityColumn = {
  width: "15%",
  textAlign: "center" as const,
};

const productPriceColumn = {
  width: "25%",
  textAlign: "right" as const,
};

const productName = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0 0 6px",
};

const productDetails = {
  fontSize: "14px",
  color: "#666666",
  margin: "0",
};

const productQuantity = {
  fontSize: "14px",
  color: "#999999",
  margin: "0",
};

const productPrice = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0",
};

const divider = {
  borderColor: "#1a1a1a",
  margin: "20px 0",
};

const totalRow = {
  padding: "16px 0 0",
};

const totalLabel = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#ffffff",
  margin: "0",
};

const totalAmountStyle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#c5a059",
  margin: "0",
  textAlign: "right" as const,
};

const infoBox = {
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
  textAlign: "center" as const,
};

const infoIcon = {
  fontSize: "32px",
  margin: "0 0 12px",
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 12px",
};

const infoText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
  margin: "0",
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

const footerCopyright = {
  fontSize: "12px",
  color: "#444444",
  margin: "20px 0 0",
};
