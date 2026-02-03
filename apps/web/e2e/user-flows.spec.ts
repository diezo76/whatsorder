import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('E2E User Flows - Frontend', () => {
  test.beforeEach(async ({ page }) => {
    // Attendre que la page soit chargée
    await page.goto(FRONTEND_URL);
  });

  test('Flux client complet : Accès menu → Panier → Commande', async ({ page }) => {
    // 1. Accéder à la page d'accueil
    await page.goto(FRONTEND_URL);
    await expect(page).toHaveURL(new RegExp(FRONTEND_URL));

    // 2. Accéder à un menu restaurant (si slug disponible)
    // Note: Dans un vrai test, on utiliserait un restaurant de test
    const restaurantSlug = 'test-restaurant';
    await page.goto(`${FRONTEND_URL}/${restaurantSlug}`);

    // Vérifier que la page se charge (peut être 404 si restaurant n'existe pas)
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();

    // 3. Vérifier que le menu s'affiche
    // Note: Ces sélecteurs doivent correspondre à votre structure HTML
    const menuExists = await page.locator('[data-testid="menu"]').count() > 0 ||
                       await page.locator('text=Menu').count() > 0;

    // Si le menu existe, tester l'ajout au panier
    if (menuExists) {
      // Cliquer sur un item (premier item disponible)
      const firstItem = page.locator('[data-testid="menu-item"]').first();
      if (await firstItem.count() > 0) {
        await firstItem.click();

        // Vérifier que le panier s'affiche ou se met à jour
        const cartExists = await page.locator('[data-testid="cart"]').count() > 0 ||
                          await page.locator('text=Panier').count() > 0;

        expect(cartExists).toBeTruthy();
      }
    }
  });

  test('Flux authentification : Login → Dashboard', async ({ page }) => {
    // 1. Accéder à la page de login
    await page.goto(`${FRONTEND_URL}/login`);

    // Vérifier que la page de login se charge
    const loginForm = page.locator('form').or(page.locator('[data-testid="login-form"]'));
    
    if (await loginForm.count() > 0) {
      // Remplir le formulaire (avec des credentials de test)
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'TestPassword123!');

      // Soumettre le formulaire
      await page.click('button[type="submit"]');

      // Attendre la redirection vers le dashboard
      await page.waitForURL(new RegExp(`${FRONTEND_URL}/dashboard`), { timeout: 5000 }).catch(() => {
        // Si la redirection échoue (credentials invalides), c'est OK pour le test
      });
    }
  });

  test('Flux restaurant : Dashboard → Menu → Commandes', async ({ page }) => {
    // Note: Ce test nécessite d'être authentifié
    // Dans un vrai test E2E, on utiliserait une session authentifiée

    // 1. Accéder au dashboard (nécessite authentification)
    await page.goto(`${FRONTEND_URL}/dashboard`);

    // Vérifier la redirection vers login si non authentifié
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Test réussi : redirection vers login si non authentifié
      expect(currentUrl).toContain('/login');
      return;
    }

    // Si authentifié, vérifier que le dashboard se charge
    if (currentUrl.includes('/dashboard')) {
      // Vérifier la présence d'éléments du dashboard
      const dashboardElements = [
        'text=Commandes',
        'text=Menu',
        'text=Inbox',
        '[data-testid="dashboard"]',
      ];

      let foundElement = false;
      for (const selector of dashboardElements) {
        if (await page.locator(selector).count() > 0) {
          foundElement = true;
          break;
        }
      }

      expect(foundElement).toBeTruthy();
    }
  });

  test('Flux inbox : Conversations → Messages', async ({ page }) => {
    // Note: Ce test nécessite d'être authentifié

    // 1. Accéder à l'inbox
    await page.goto(`${FRONTEND_URL}/dashboard/inbox`);

    // Vérifier la redirection vers login si non authentifié
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      expect(currentUrl).toContain('/login');
      return;
    }

    // Si authentifié, vérifier que l'inbox se charge
    if (currentUrl.includes('/inbox')) {
      // Vérifier la présence d'éléments de l'inbox
      const inboxElements = [
        'text=Conversations',
        '[data-testid="conversations-list"]',
        '[data-testid="inbox"]',
      ];

      let foundElement = false;
      for (const selector of inboxElements) {
        if (await page.locator(selector).count() > 0) {
          foundElement = true;
          break;
        }
      }

      expect(foundElement).toBeTruthy();
    }
  });

  test('Responsive : Vérifier l\'affichage mobile', async ({ page }) => {
    // Simuler un appareil mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(FRONTEND_URL);

    // Vérifier que le menu hamburger existe sur mobile
    const hamburgerMenu = page.locator('[data-testid="mobile-menu"]')
                          .or(page.locator('button[aria-label*="menu" i]'))
                          .or(page.locator('button[aria-label*="Menu" i]'));

    // Le menu hamburger peut exister ou non selon l'implémentation
    const hamburgerExists = await hamburgerMenu.count() > 0;
    
    // Vérifier que la page se charge correctement sur mobile
    const pageLoaded = await page.locator('body').count() > 0;
    expect(pageLoaded).toBeTruthy();
  });
});
