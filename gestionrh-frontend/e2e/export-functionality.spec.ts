import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour la fonctionnalité d'export PDF/Excel
 * Vérifie que les boutons d'export créent bien les fichiers côté navigateur
 */

test.describe('Export PDF/Excel - Fonctionnalité', () => {
    test.beforeEach(async ({ page }) => {
        // Se connecter avec un compte Admin
        await page.goto('http://localhost:5173/login');
        await page.fill('input[name="email"]', 'admin@gestionrh.com');
        await page.fill('input[name="motDePasse"]', 'Admin123!');
        await page.click('button[type="submit"]');
        
        // Attendre la redirection vers le dashboard
        await page.waitForURL('**/dashboard/**', { timeout: 5000 });
    });

    test('Employés - Boutons Export PDF/Excel sont visibles', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/employees');
        await page.waitForLoadState('networkidle');

        // Vérifier que les boutons d'export sont présents
        const pdfButton = page.getByRole('button', { name: /Export PDF/i });
        const excelButton = page.getByRole('button', { name: /Export Excel/i });

        await expect(pdfButton).toBeVisible();
        await expect(excelButton).toBeVisible();
    });

    test('Employés - Export PDF déclenche un téléchargement', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/employees');
        await page.waitForLoadState('networkidle');

        // Attendre que les données soient chargées
        await page.waitForSelector('table', { timeout: 10000 });

        // Préparer l'écoute du téléchargement
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        
        // Cliquer sur Export PDF
        await page.getByRole('button', { name: /Export PDF/i }).click();

        // Vérifier qu'un téléchargement a été déclenché
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^employes_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    test('Employés - Export Excel déclenche un téléchargement', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/employees');
        await page.waitForLoadState('networkidle');

        // Attendre que les données soient chargées
        await page.waitForSelector('table', { timeout: 10000 });

        // Préparer l'écoute du téléchargement
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        
        // Cliquer sur Export Excel
        await page.getByRole('button', { name: /Export Excel/i }).click();

        // Vérifier qu'un téléchargement a été déclenché
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^employes_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    test('Départements - Export PDF déclenche un téléchargement', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/departments');
        await page.waitForLoadState('networkidle');

        await page.waitForSelector('table', { timeout: 10000 });

        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        await page.getByRole('button', { name: /Export PDF/i }).click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^departements_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    test('Départements - Export Excel déclenche un téléchargement', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/departments');
        await page.waitForLoadState('networkidle');

        await page.waitForSelector('table', { timeout: 10000 });

        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        await page.getByRole('button', { name: /Export Excel/i }).click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^departements_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    test('Postes - Export PDF déclenche un téléchargement', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/jobs');
        await page.waitForLoadState('networkidle');

        // Attendre que les groupes de postes soient rendus
        await page.waitForSelector('[class*="space-y"]', { timeout: 10000 });

        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        await page.getByRole('button', { name: /Export PDF/i }).click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^postes_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    test('Postes - Export Excel déclenche un téléchargement', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/jobs');
        await page.waitForLoadState('networkidle');

        await page.waitForSelector('[class*="space-y"]', { timeout: 10000 });

        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        await page.getByRole('button', { name: /Export Excel/i }).click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^postes_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    test('Responsive - Boutons wrappent correctement sur mobile', async ({ page }) => {
        // Définir une taille de viewport mobile
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('http://localhost:5173/dashboard/employees');
        await page.waitForLoadState('networkidle');

        const buttonContainer = page.locator('div.flex.flex-wrap').first();
        await expect(buttonContainer).toBeVisible();

        // Vérifier que tous les boutons sont visibles (wrappés verticalement)
        const pdfButton = page.getByRole('button', { name: /Export PDF/i });
        const excelButton = page.getByRole('button', { name: /Export Excel/i });
        const createButton = page.getByRole('button', { name: /Nouvel Employé/i });

        await expect(pdfButton).toBeVisible();
        await expect(excelButton).toBeVisible();
        await expect(createButton).toBeVisible();
    });

    test('Export sans données - Affiche un message d\'erreur toast', async ({ page }) => {
        await page.goto('http://localhost:5173/dashboard/employees');
        await page.waitForLoadState('networkidle');

        // Effectuer une recherche qui ne retourne aucun résultat
        const searchInput = page.locator('input[placeholder*="Rechercher"]');
        await searchInput.fill('AUCUNRESULTATPOSSIBLE123456789');
        
        // Attendre que le tableau soit vide
        await page.waitForTimeout(1000);

        // Essayer d'exporter
        await page.getByRole('button', { name: /Export PDF/i }).click();

        // Vérifier qu'un toast d'erreur apparaît
        const toast = page.locator('text="Aucune donnée à exporter"');
        await expect(toast).toBeVisible({ timeout: 3000 });
    });
});
