/**
 * TEMPLATE EMAIL - RÉINITIALISATION MOT DE PASSE
 * Design luxe noir/or pour La Fine Parfumerie
 * Envoyé lors d'une demande de réinitialisation
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
} from "@react-email/components";

interface PasswordResetEmailProps {
  customerName: string;
  resetUrl: string;
  expiresIn: string;
}

export default function PasswordResetEmail({
  customerName = "Cher client",
  resetUrl = "https://lafineparfumerie.com/reset-password?token=xxx",
  expiresIn = "1 heure",
}: PasswordResetEmailProps) {
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

          {/* Icône sécurité */}
          <Section style={iconSection}>
            <div style={lockIcon}>🔐</div>
            <Heading style={title}>Réinitialisation de mot de passe</Heading>
          </Section>

          {/* Message */}
          <Text style={greeting}>Bonjour {customerName},</Text>
          <Text style={text}>
            Nous avons reçu une demande de réinitialisation de mot de passe pour
            votre compte La Fine Parfumerie. Si vous êtes à l&apos;origine de
            cette demande, cliquez sur le bouton ci-dessous pour créer un
            nouveau mot de passe.
          </Text>

          {/* Bouton CTA */}
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>

          {/* Expiration */}
          <Section style={expirationBox}>
            <Text style={expirationIcon}>⏱️</Text>
            <Text style={expirationText}>
              Ce lien expire dans <strong style={expirationStrong}>{expiresIn}</strong>
            </Text>
          </Section>

          {/* Avertissement sécurité */}
          <Section style={warningBox}>
            <Text style={warningTitle}>⚠️ Vous n&apos;êtes pas à l&apos;origine de cette demande ?</Text>
            <Text style={warningText}>
              Si vous n&apos;avez pas demandé de réinitialisation de mot de
              passe, vous pouvez ignorer cet email en toute sécurité. Votre mot
              de passe actuel restera inchangé.
            </Text>
            <Text style={warningText}>
              Pour renforcer la sécurité de votre compte, nous vous conseillons
              de ne jamais partager vos identifiants.
            </Text>
          </Section>

          {/* Lien alternatif */}
          <Section style={linkSection}>
            <Text style={linkTitle}>Le bouton ne fonctionne pas ?</Text>
            <Text style={linkText}>
              Copiez et collez ce lien dans votre navigateur :
            </Text>
            <Text style={linkUrl}>{resetUrl}</Text>
          </Section>

          {/* Footer */}
          <Hr style={footerDivider} />
          <Section style={footer}>
            <Text style={footerTitle}>La Fine Parfumerie</Text>
            <Text style={footerText}>
              Besoin d&apos;aide ?{" "}
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

const iconSection = {
  textAlign: "center" as const,
  padding: "40px 0 20px",
};

const lockIcon = {
  display: "inline-block",
  fontSize: "60px",
  margin: "0 0 20px",
};

const title = {
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
  padding: "16px 48px",
  borderRadius: "6px",
  display: "inline-block",
};

const expirationBox = {
  textAlign: "center" as const,
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  padding: "20px",
  margin: "30px 20px",
};

const expirationIcon = {
  fontSize: "24px",
  margin: "0 0 8px",
};

const expirationText = {
  fontSize: "14px",
  color: "#999999",
  margin: "0",
};

const expirationStrong = {
  color: "#c5a059",
};

const warningBox = {
  backgroundColor: "#1a1a0a",
  border: "1px solid #3a3a1a",
  borderRadius: "8px",
  padding: "24px",
  margin: "30px 20px",
};

const warningTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#ffcc00",
  margin: "0 0 12px",
};

const warningText = {
  fontSize: "14px",
  color: "#999999",
  lineHeight: "22px",
  margin: "0 0 12px",
};

const linkSection = {
  textAlign: "center" as const,
  padding: "20px",
  margin: "20px 0",
};

const linkTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#999999",
  margin: "0 0 8px",
};

const linkText = {
  fontSize: "12px",
  color: "#666666",
  margin: "0 0 8px",
};

const linkUrl = {
  fontSize: "12px",
  color: "#c5a059",
  wordBreak: "break-all" as const,
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
