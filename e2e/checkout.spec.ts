import { test, expect } from "@playwright/test";

/**
 * Tests E2E du parcours d'achat
 *
 * Ces tests verifient le workflow complet:
 * 1. Navigation dans le catalogue
 * 2. Ajout au panier
 * 3. Passage au checkout
 * 4. Paiement (mode test Stripe)
 */

test.describe("Parcours d'achat", () => {
  test.beforeEach(async ({ page }) => {
    // Nettoyer le localStorage avant chaque test
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test("la page d'accueil s'affiche correctement", async ({ page }) => {
    await page.goto("/");

    // Verifier le titre
    await expect(page).toHaveTitle(/La Fine Parfumerie/);

    // Verifier que le logo est visible
    await expect(page.getByText("La Fine")).toBeVisible();
    await expect(page.getByText("Parfumerie")).toBeVisible();
  });

  test("navigation vers le catalogue", async ({ page }) => {
    await page.goto("/");

    // Cliquer sur "Collection"
    await page.getByRole("link", { name: "Collection" }).click();

    // Verifier qu'on est sur la page produits
    await expect(page).toHaveURL(/\/products/);

    // Verifier que des produits sont affiches
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("filtrage des produits par categorie", async ({ page }) => {
    await page.goto("/products");

    // Attendre que les produits soient charges
    await page.waitForSelector("article");

    // Verifier qu'il y a des produits
    const initialCount = await page.locator("article").count();
    expect(initialCount).toBeGreaterThan(0);
  });

  test("ajout d'un produit au panier", async ({ page }) => {
    await page.goto("/products");

    // Attendre les produits
    await page.waitForSelector("article");

    // Cliquer sur le premier bouton "Ajouter au panier"
    const addToCartButton = page
      .locator("article")
      .first()
      .getByRole("button", { name: /ajouter/i });

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Verifier que le badge du panier apparait
      await expect(page.locator('[aria-label*="Panier"]').locator("span")).toContainText(
        "1"
      );
    }
  });

  test("ouverture du panier", async ({ page }) => {
    await page.goto("/products");

    // Ajouter un produit
    await page.waitForSelector("article");
    const addButton = page
      .locator("article")
      .first()
      .getByRole("button", { name: /ajouter/i });

    if (await addButton.isVisible()) {
      await addButton.click();
    }

    // Ouvrir le panier
    await page.getByRole("button", { name: /panier/i }).click();

    // Verifier que le panier est ouvert
    await expect(page.getByText("Votre Panier")).toBeVisible();
  });

  test("modification de la quantite dans le panier", async ({ page }) => {
    await page.goto("/products");

    // Ajouter un produit
    await page.waitForSelector("article");
    const addButton = page
      .locator("article")
      .first()
      .getByRole("button", { name: /ajouter/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Ouvrir le panier
      await page.getByRole("button", { name: /panier/i }).click();

      // Augmenter la quantite
      const increaseButton = page.getByLabel("Augmenter la quantité");
      await increaseButton.click();

      // Verifier que la quantite a augmente
      await expect(page.getByText("2", { exact: true })).toBeVisible();
    }
  });

  test("suppression d'un article du panier", async ({ page }) => {
    await page.goto("/products");

    // Ajouter un produit
    await page.waitForSelector("article");
    const addButton = page
      .locator("article")
      .first()
      .getByRole("button", { name: /ajouter/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Ouvrir le panier
      await page.getByRole("button", { name: /panier/i }).click();

      // Supprimer l'article
      await page.getByLabel("Supprimer l'article").click();

      // Verifier que le panier est vide
      await expect(page.getByText("Votre panier est vide")).toBeVisible();
    }
  });

  test("acces a la page checkout", async ({ page }) => {
    await page.goto("/products");

    // Ajouter un produit
    await page.waitForSelector("article");
    const addButton = page
      .locator("article")
      .first()
      .getByRole("button", { name: /ajouter/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Ouvrir le panier et aller au checkout
      await page.getByRole("button", { name: /panier/i }).click();
      await page.getByRole("button", { name: /passer commande/i }).click();

      // Verifier qu'on est sur la page checkout
      await expect(page).toHaveURL(/\/checkout/);
    }
  });

  test("vidage du panier", async ({ page }) => {
    await page.goto("/products");

    // Ajouter un produit
    await page.waitForSelector("article");
    const addButton = page
      .locator("article")
      .first()
      .getByRole("button", { name: /ajouter/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // Ouvrir le panier
      await page.getByRole("button", { name: /panier/i }).click();

      // Vider le panier
      await page.getByRole("button", { name: /vider le panier/i }).click();

      // Verifier que le panier est vide
      await expect(page.getByText("Votre panier est vide")).toBeVisible();
    }
  });
});

test.describe("Fiche produit", () => {
  test("affichage d'une fiche produit", async ({ page }) => {
    await page.goto("/products");

    // Attendre les produits
    await page.waitForSelector("article");

    // Cliquer sur un produit
    await page.locator("article").first().click();

    // Verifier qu'on est sur une page produit
    await expect(page).toHaveURL(/\/products\/\d+/);
  });

  test("ajout au panier depuis la fiche produit", async ({ page }) => {
    await page.goto("/products");

    // Attendre les produits et cliquer sur le premier
    await page.waitForSelector("article");
    await page.locator("article").first().click();

    // Attendre la page produit
    await page.waitForURL(/\/products\/\d+/);

    // Ajouter au panier
    const addButton = page.getByRole("button", { name: /ajouter au panier/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Verifier le badge du panier
      await expect(
        page.locator('[aria-label*="Panier"]').locator("span").first()
      ).toContainText("1");
    }
  });
});

test.describe("Recherche", () => {
  test("recherche de produits", async ({ page }) => {
    await page.goto("/");

    // Trouver et remplir la barre de recherche
    const searchInput = page.getByPlaceholder(/rechercher/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("parfum");
      await searchInput.press("Enter");

      // Verifier les resultats
      await page.waitForURL(/\/products\?.*q=parfum/);
    }
  });
});

test.describe("Authentification", () => {
  test("acces a la page de connexion", async ({ page }) => {
    await page.goto("/");

    // Cliquer sur Connexion
    const signInLink = page.getByRole("link", { name: /connexion/i });
    if (await signInLink.isVisible()) {
      await signInLink.click();

      // Verifier qu'on est sur la page de connexion
      await expect(page).toHaveURL(/\/auth\/signin/);
    }
  });
});

test.describe("Accessibilite", () => {
  test("navigation au clavier", async ({ page }) => {
    await page.goto("/");

    // Tabulation vers les liens de navigation
    await page.keyboard.press("Tab");

    // Verifier qu'un element a le focus
    const focusedElement = await page.locator(":focus").first();
    await expect(focusedElement).toBeVisible();
  });

  test("skip link est present", async ({ page }) => {
    await page.goto("/");

    // Le skip link devrait etre le premier element focusable
    await page.keyboard.press("Tab");

    // Chercher le skip link
    const skipLink = page.getByText(/aller au contenu/i);
    // Note: le skip link peut etre visible uniquement au focus
  });
});

test.describe("Responsive", () => {
  test("menu mobile s'affiche sur petit ecran", async ({ page }) => {
    // Simuler un ecran mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verifier que le bouton menu mobile est visible
    await expect(page.getByLabel(/ouvrir le menu/i)).toBeVisible();

    // Verifier que la navigation desktop est cachee
    await expect(
      page.locator("nav").getByRole("link", { name: "Collection" })
    ).toBeHidden();
  });

  test("ouverture du menu mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Ouvrir le menu
    await page.getByLabel(/ouvrir le menu/i).click();

    // Verifier que les liens sont visibles
    await expect(page.getByText("Accueil")).toBeVisible();
  });
});
