/**
 * TEMPLATE EMAIL - NOTIFICATION D'EXPÉDITION
 * Design luxe noir/or pour La Fine Parfumerie
 * Envoyé quand la commande est expédiée
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

interface OrderShippedProps {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
}

export default function OrderShipped({
  orderNumber = "12345",
  customerName = "Cher client",
  trackingNumber = "1234567890",
  carrier = "Colissimo",
  estimatedDelivery = "2-3 jours ouvrés",
}: OrderShippedProps) {
  const trackingUrl = getTrackingUrl(carrier, trackingNumber);

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

          {/* Icône livraison */}
          <Section style={shippingSection}>
            <div style={shippingIcon}>📦</div>
            <Heading style={shippingTitle}>Votre commande est en route !</Heading>
          </Section>

          {/* Message */}
          <Text style={greeting}>Bonjour {customerName},</Text>
          <Text style={text}>
            Excellente nouvelle ! Votre commande a été expédiée et est
            maintenant en route vers vous. Vous recevrez votre colis très
            prochainement.
          </Text>

          {/* Informations de suivi */}
          <Section style={trackingBox}>
            <Row>
              <Column style={trackingColumn}>
                <Text style={trackingLabel}>Numéro de commande</Text>
                <Text style={trackingValue}>#{orderNumber}</Text>
              </Column>
            </Row>
            <Hr style={trackingDivider} />
            <Row>
              <Column style={trackingColumn}>
                <Text style={trackingLabel}>Transporteur</Text>
                <Text style={trackingValue}>{carrier}</Text>
              </Column>
            </Row>
            <Hr style={trackingDivider} />
            <Row>
              <Column style={trackingColumn}>
                <Text style={trackingLabel}>Numéro de suivi</Text>
                <Text style={trackingNumberStyle}>{trackingNumber}</Text>
              </Column>
            </Row>
            <Hr style={trackingDivider} />
            <Row>
              <Column style={trackingColumn}>
                <Text style={trackingLabel}>Livraison estimée</Text>
                <Text style={trackingValue}>{estimatedDelivery}</Text>
              </Column>
            </Row>
          </Section>

          {/* Bouton de suivi */}
          <Section style={buttonContainer}>
            <Button style={button} href={trackingUrl}>
              Suivre mon colis
            </Button>
          </Section>

          {/* Informations pratiques */}
          <Section style={infoBox}>
            <Text style={infoTitle}>📍 Informations utiles</Text>
            <Text style={infoText}>
              • Vous recevrez une notification dès que le colis sera livré
              <br />
              • Le transporteur peut vous contacter pour convenir d&apos;un
              créneau
              <br />
              • En cas d&apos;absence, un avis de passage sera déposé
              <br />• Le colis peut être retiré en point relais si nécessaire
            </Text>
          </Section>

          {/* Section qualité */}
          <Section style={qualityBox}>
            <Text style={qualityIcon}>✨</Text>
            <Text style={qualityTitle}>Emballage de luxe</Text>
            <Text style={qualityText}>
              Votre parfum est emballé avec le plus grand soin dans notre
              packaging signature noir et or. Chaque commande est préparée comme
              un cadeau.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerTitle}>La Fine Parfumerie</Text>
            <Text style={footerText}>
              Des questions sur votre livraison ?
              <br />
              Contactez-nous à{" "}
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

// Helper pour générer l'URL de suivi
function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const carriers: Record<string, string> = {
    Colissimo: `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
    Chronopost: `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${trackingNumber}`,
    DHL: `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${trackingNumber}`,
    UPS: `https://www.ups.com/track?loc=fr_FR&tracknum=${trackingNumber}`,
  };

  return carriers[carrier] || `https://lafineparfumerie.com/tracking/${trackingNumber}`;
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

const shippingSection = {
  textAlign: "center" as const,
  padding: "40px 0 20px",
};

const shippingIcon = {
  display: "inline-block",
  fontSize: "60px",
  margin: "0 0 20px",
};

const shippingTitle = {
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

const trackingBox = {
  backgroundColor: "#111111",
  border: "1px solid #c5a059",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const trackingColumn = {
  textAlign: "center" as const,
};

const trackingLabel = {
  fontSize: "12px",
  color: "#666666",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const trackingValue = {
  fontSize: "16px",
  color: "#ffffff",
  margin: "0",
  fontWeight: "500",
};

const trackingNumberStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#c5a059",
  margin: "0",
  letterSpacing: "1px",
};

const trackingDivider = {
  borderColor: "#1a1a1a",
  margin: "16px 0",
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

const infoBox = {
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 16px",
};

const infoText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "24px",
  margin: "0",
};

const qualityBox = {
  textAlign: "center" as const,
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const qualityIcon = {
  fontSize: "32px",
  margin: "0 0 12px",
};

const qualityTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#c5a059",
  margin: "0 0 12px",
};

const qualityText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
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

const footerLink = {
  color: "#c5a059",
  textDecoration: "none",
};

const footerCopyright = {
  fontSize: "12px",
  color: "#444444",
  margin: "20px 0 0",
};
