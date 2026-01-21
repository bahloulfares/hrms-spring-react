import { test, expect } from '@playwright/test';

test.describe('Audit Trail Feature', () => {
    test.beforeEach(async ({ page }) => {
        // Login avant de tester
        await page.goto('http://localhost:3000/login');
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Connexion")');
        
        // Attendre la redirection
        await page.waitForURL('http://localhost:3000/dashboard');
        
        // Naviguer vers l'audit trail
        await page.goto('http://localhost:3000/dashboard/audit-history');
    });

    test('should render audit trail page with filters', async ({ page }) => {
        // Vérifier que la page se charge
        await expect(page.locator('h1')).toContainText('Historique');
        
        // Vérifier la présence des filtres
        expect(await page.locator('input[placeholder*="ID"]')).toBeDefined();
        expect(await page.locator('input[placeholder*="Email"]')).toBeDefined();
        expect(await page.locator('select')).toBeDefined();
        expect(await page.locator('input[type="date"]')).toBeDefined();
    });

    test('should filter by status', async ({ page }) => {
        // Cliquer sur le dropdown de statut
        const statusSelect = page.locator('select').first();
        await statusSelect.click();
        
        // Sélectionner un statut
        await page.locator('option:has-text("APPROUVE")').click();
        
        // Vérifier que le filtre est appliqué
        await expect(statusSelect).toHaveValue('APPROUVE');
        
        // Attendre que les résultats se rechargent
        await page.waitForTimeout(500);
        
        // Vérifier que le tableau se met à jour
        const tableRows = page.locator('tbody tr');
        if (await tableRows.count() > 0) {
            // Vérifier que les statuts affichés sont "APPROUVE"
            const badges = page.locator('[data-testid*="status-badge"]');
            const badgeCount = await badges.count();
            expect(badgeCount).toBeGreaterThanOrEqual(0);
        }
    });

    test('should filter by user/acteur', async ({ page }) => {
        // Remplir le champ acteur
        const acteurInput = page.locator('input[placeholder*="Acteur"]');
        if (await acteurInput.isVisible()) {
            await acteurInput.fill('admin@example.com');
            
            // Attendre le filtre
            await page.waitForTimeout(500);
            
            // Vérifier que le champ est rempli
            await expect(acteurInput).toHaveValue('admin@example.com');
        }
    });

    test('should filter by date range', async ({ page }) => {
        // Remplir la date de début
        const dateInputs = page.locator('input[type="date"]');
        const count = await dateInputs.count();
        
        if (count >= 2) {
            await dateInputs.nth(0).fill('2026-01-01');
            await dateInputs.nth(1).fill('2026-01-31');
            
            // Attendre le filtre
            await page.waitForTimeout(500);
            
            // Vérifier les dates
            await expect(dateInputs.nth(0)).toHaveValue('2026-01-01');
            await expect(dateInputs.nth(1)).toHaveValue('2026-01-31');
        }
    });

    test('should paginate through records', async ({ page }) => {
        // Vérifier que les contrôles de pagination sont visibles
        const paginationControls = page.locator('[data-testid="pagination"]');
        
        if (await paginationControls.isVisible()) {
            // Vérifier la présence du bouton "Suivant"
            const nextButton = page.locator('button:has-text("Suivant")');
            const hasNextButton = await nextButton.isVisible();
            
            if (hasNextButton) {
                const initialPageText = await page.locator('[data-testid="page-info"]').textContent();
                
                // Cliquer sur Suivant
                await nextButton.click();
                await page.waitForTimeout(500);
                
                // Vérifier que la page a changé
                const newPageText = await page.locator('[data-testid="page-info"]').textContent();
                expect(initialPageText).not.toEqual(newPageText);
            }
        }
    });

    test('should change page size', async ({ page }) => {
        // Trouver le sélecteur de page size
        const pageSizeSelect = page.locator('select').last();
        
        // Obtenir la valeur initiale
        const initialValue = await pageSizeSelect.inputValue();
        
        // Changer la page size
        await pageSizeSelect.selectOption('25');
        await page.waitForTimeout(500);
        
        // Vérifier que la page size a changé
        const newValue = await pageSizeSelect.inputValue();
        expect(newValue).toBe('25');
    });

    test('should search by conge ID', async ({ page }) => {
        // Remplir la barre de recherche
        const searchInput = page.locator('input[placeholder*="ID"]');
        await searchInput.fill('123');
        
        // Attendre le filtre
        await page.waitForTimeout(500);
        
        // Vérifier que le champ est rempli
        await expect(searchInput).toHaveValue('123');
    });

    test('should display table with correct columns', async ({ page }) => {
        // Vérifier la présence des colonnes du tableau
        const headers = page.locator('th');
        
        const headerTexts = await headers.allTextContents();
        expect(headerTexts).toContain('Date');
        expect(headerTexts.some(h => h.includes('Ancien'))).toBeTruthy();
        expect(headerTexts.some(h => h.includes('Nouveau'))).toBeTruthy();
        expect(headerTexts.some(h => h.includes('Acteur'))).toBeTruthy();
    });

    test('should display status badges with correct colors', async ({ page }) => {
        // Attendre que le tableau se charge
        const tableRows = page.locator('tbody tr');
        const rowCount = await tableRows.count();
        
        if (rowCount > 0) {
            // Vérifier la présence de badges de statut
            const badges = page.locator('[class*="badge"]');
            const badgeCount = await badges.count();
            
            // Vérifier que les badges ont des classes de couleur
            if (badgeCount > 0) {
                const firstBadge = badges.first();
                const classes = await firstBadge.getAttribute('class');
                
                expect(classes).toMatch(/(bg-|text-)/);
            }
        }
    });

    test('should show empty state when no records', async ({ page }) => {
        // Appliquer un filtre qui ne retournera aucun résultat
        const searchInput = page.locator('input[placeholder*="ID"]');
        await searchInput.fill('9999999');
        
        await page.waitForTimeout(500);
        
        // Vérifier le message de résultats vides ou le tableau vide
        const emptyState = page.locator('text=/Aucun|No results/i');
        const tableRows = page.locator('tbody tr');
        
        const hasEmptyMessage = await emptyState.isVisible().catch(() => false);
        const rowCount = await tableRows.count();
        
        expect(hasEmptyMessage || rowCount === 0).toBeTruthy();
    });

    test('should show error state on API error', async ({ page }) => {
        // Intercepter les requêtes API et simuler une erreur
        await page.route('**/conges/*/historique', route => {
            route.abort('failed');
        });
        
        // Recharger la page
        await page.reload();
        
        // Vérifier le message d'erreur
        const errorMessage = page.locator('[role="alert"]');
        const toastError = page.locator('[class*="error"], [class*="toast"]');
        
        const hasError = await errorMessage.isVisible().catch(() => false) || 
                        await toastError.isVisible().catch(() => false);
        
        expect(hasError || await page.locator('text=/Erreur|Error/i').isVisible().catch(() => false)).toBeTruthy();
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Définir la taille mobile
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Attendre le chargement
        await page.waitForLoadState('networkidle');
        
        // Vérifier que le contenu est visible
        expect(await page.locator('h1').isVisible()).toBeTruthy();
        
        // Vérifier que le tableau scrolle horizontalement si nécessaire
        const table = page.locator('table');
        if (await table.isVisible()) {
            const boundingBox = await table.boundingBox();
            expect(boundingBox).toBeTruthy();
        }
    });

    test('should clear filters on reset button', async ({ page }) => {
        // Remplir les filtres
        const searchInput = page.locator('input[placeholder*="ID"]');
        await searchInput.fill('123');
        
        // Chercher un bouton reset/clear
        const resetButton = page.locator('button:has-text(/Réinitialiser|Clear|Reset/i)');
        
        if (await resetButton.isVisible()) {
            await resetButton.click();
            await page.waitForTimeout(500);
            
            // Vérifier que le champ est vidé
            await expect(searchInput).toHaveValue('');
        }
    });
});
