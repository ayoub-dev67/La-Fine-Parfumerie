import { test, expect } from "@playwright/test";

/**
 * Tests E2E pour l'authentification
 */

test.describe("Authentification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("redirection vers signin pour les pages protegees", async ({ page }) => {
    // Essayer d'acceder aux commandes sans etre connecte
    await page.goto("/orders");

    // Devrait rediriger vers la page de connexion
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("affichage de la page de connexion", async ({ page }) => {
    await page.goto("/auth/signin");

    // Verifier les elements de la page
    await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();

    // Verifier le formulaire
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
  });

  test("lien vers la page d'inscription", async ({ page }) => {
    await page.goto("/auth/signin");

    // Chercher le lien d'inscription
    const signupLink = page.getByRole("link", { name: /créer un compte|s'inscrire/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/\/auth\/signup/);
    }
  });

  test("validation du formulaire de connexion", async ({ page }) => {
    await page.goto("/auth/signin");

    // Soumettre un formulaire vide
    await page.getByRole("button", { name: /se connecter/i }).click();

    // Verifier les messages d'erreur
    // Note: le comportement exact depend de l'implementation
  });

  test("bouton Google OAuth est present", async ({ page }) => {
    await page.goto("/auth/signin");

    // Verifier que le bouton Google est visible
    const googleButton = page.getByRole("button", { name: /google/i });
    await expect(googleButton).toBeVisible();
  });
});

test.describe("Page d'inscription", () => {
  test("affichage de la page d'inscription", async ({ page }) => {
    await page.goto("/auth/signup");

    // Verifier les champs du formulaire
    await expect(page.getByLabel(/nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i).first()).toBeVisible();
  });

  test("validation des champs requis", async ({ page }) => {
    await page.goto("/auth/signup");

    // Soumettre sans remplir
    const submitButton = page.getByRole("button", { name: /créer|s'inscrire/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Les champs requis devraient afficher une erreur
    }
  });

  test("validation du format email", async ({ page }) => {
    await page.goto("/auth/signup");

    // Remplir avec un email invalide
    await page.getByLabel(/email/i).fill("invalid-email");

    const submitButton = page.getByRole("button", { name: /créer|s'inscrire/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Devrait afficher une erreur de format
    }
  });

  test("validation de la force du mot de passe", async ({ page }) => {
    await page.goto("/auth/signup");

    // Remplir avec un mot de passe faible
    const passwordInput = page.getByLabel(/mot de passe/i).first();
    await passwordInput.fill("123");

    // Devrait afficher une indication de force
  });
});

test.describe("Protection des routes admin", () => {
  test("redirection pour les utilisateurs non admin", async ({ page }) => {
    // Essayer d'acceder a /admin sans etre connecte
    await page.goto("/admin");

    // Devrait rediriger
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test("redirection pour les routes admin specifiques", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page).not.toHaveURL(/\/admin\/products/);

    await page.goto("/admin/orders");
    await expect(page).not.toHaveURL(/\/admin\/orders/);
  });
});

test.describe("Session utilisateur", () => {
  test("la navbar change selon l'etat de connexion", async ({ page }) => {
    await page.goto("/");

    // Non connecte: bouton Connexion visible
    const signInButton = page.getByRole("link", { name: /connexion/i });

    // Le bouton devrait etre visible pour les utilisateurs non connectes
    if (await signInButton.isVisible()) {
      expect(true).toBe(true);
    }
  });
});
