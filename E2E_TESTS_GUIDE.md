# Guide Exécution Tests E2E - P2 #2-3

## 🚀 Démarrage Rapide

### Prérequis
- ✅ Serveur dev Vite running: `npm run dev` (port 3000)
- ✅ Backend Spring Boot running (port 8080)
- ✅ Database MySQL/PostgreSQL accessible
- ✅ User test account: `admin@example.com` / `password123`

### Exécuter Tous les Tests

```bash
# Installation Playwright (première fois)
npm install

# Exécuter tous les tests E2E
npx playwright test

# Ou spécifiquement P2 #2-3
npx playwright test audit-trail.spec.ts websocket.spec.ts

# Mode headed (voir le navigateur)
npx playwright test --headed

# Debug mode interactif
npx playwright test --debug

# Générer rapport HTML
npx playwright test
npx playwright show-report
```

## 📋 Tests par Domaine

### Audit Trail (e2e/audit-trail.spec.ts)

#### Test 1: Render page with filters
```bash
npx playwright test audit-trail -g "render audit trail"
```
**Vérifie**: Page charge, filtres présents (statut, acteur, date)

#### Test 2: Filter by status
```bash
npx playwright test audit-trail -g "filter by status"
```
**Vérifie**: Sélectionner statut → tableau se met à jour

#### Test 3: Filter by user/acteur
```bash
npx playwright test audit-trail -g "filter by user"
```
**Vérifie**: Remplir champ acteur → filtre appliqué

#### Test 4: Filter by date range
```bash
npx playwright test audit-trail -g "filter by date"
```
**Vérifie**: Dates début/fin filtre les résultats

#### Test 5: Paginate through records
```bash
npx playwright test audit-trail -g "paginate"
```
**Vérifie**: Boutons Next/Prev changent la page

#### Test 6: Change page size
```bash
npx playwright test audit-trail -g "change page size"
```
**Vérifie**: Dropdown page size modifie items affichés

#### Test 7: Search by conge ID
```bash
npx playwright test audit-trail -g "search by conge"
```
**Vérifie**: Barre recherche ID filtre correctement

#### Test 8: Display table columns
```bash
npx playwright test audit-trail -g "display table"
```
**Vérifie**: Colonnes Date, Ancien Statut, Nouveau Statut, Acteur, Commentaire

#### Test 9: Status badge colors
```bash
npx playwright test audit-trail -g "status badges"
```
**Vérifie**: Badges color-codés (jaune/vert/rouge/gris)

#### Test 10: Empty state
```bash
npx playwright test audit-trail -g "empty state"
```
**Vérifie**: Message/tableau vide si aucun résultat

#### Test 11: Error state
```bash
npx playwright test audit-trail -g "error state"
```
**Vérifie**: Message d'erreur si API échoue

#### Test 12: Responsive on mobile
```bash
npx playwright test audit-trail -g "responsive"
```
**Vérifie**: Layout adapté sur 375x667

#### Test 13: Clear filters
```bash
npx playwright test audit-trail -g "clear filters"
```
**Vérifie**: Bouton réinitialise tous les filtres

### WebSocket (e2e/websocket.spec.ts)

#### Test 1: Display indicator
```bash
npx playwright test websocket -g "display.*indicator"
```
**Vérifie**: Icône Wifi visible en header

#### Test 2: Connected icon
```bash
npx playwright test websocket -g "connected icon"
```
**Vérifie**: Icône Wifi si connecté

#### Test 3: Notification badge
```bash
npx playwright test websocket -g "notification badge"
```
**Vérifie**: Badge nombre notifications non-lues

#### Test 4: Open dropdown
```bash
npx playwright test websocket -g "open notification"
```
**Vérifie**: Clic sur icon → dropdown s'ouvre

#### Test 5: Close on outside click
```bash
npx playwright test websocket -g "close notification"
```
**Vérifie**: Clic dehors → dropdown se ferme

#### Test 6: Handle messages
```bash
npx playwright test websocket -g "handle notification"
```
**Vérifie**: Message reçu → badge se met à jour

#### Test 7: Fallback to polling
```bash
npx playwright test websocket -g "fallback to polling"
```
**Vérifie**: Si WS échoue → polling HTTP prend relais

#### Test 8: Offline icon
```bash
npx playwright test websocket -g "offline icon"
```
**Vérifie**: Icône WifiOff si déconnecté

#### Test 9: Reconnect
```bash
npx playwright test websocket -g "reconnect"
```
**Vérifie**: Auto-reconnect après déconnexion temporaire

#### Test 10: Persist during navigation
```bash
npx playwright test websocket -g "persist.*navigation"
```
**Vérifie**: Badge notifications préservé en naviguant

#### Test 11: Update unread count
```bash
npx playwright test websocket -g "update unread"
```
**Vérifie**: Unread count augmente avec nouvelles notifs

#### Test 12: Rapid cycles
```bash
npx playwright test websocket -g "rapid connect"
```
**Vérifie**: Supporte 5 cycles rapides connect/disconnect

#### Test 13: Receive while on page
```bash
npx playwright test websocket -g "received while"
```
**Vérifie**: Notification reçue → dropdown peut s'ouvrir

#### Test 14: Network recovery
```bash
npx playwright test websocket -g "network recovery"
```
**Vérifie**: Après offline → reconnect automatique

#### Test 15: Desktop vs Mobile
```bash
npx playwright test websocket -g "desktop.*mobile"
```
**Vérifie**: Responsive behavior correct

## 🔧 Dépannage

### WebSocket tests échouent
**Cause**: Backend n'a pas l'endpoint `/ws/notifications`
**Solution**: Tests utilisent mocks/simulations, devrait passer même sans backend WS

### Audit Trail tests échouent
**Cause**: Backend n'a pas les données, ou authentification échoue
**Solution**:
```bash
# Vérifier login fonctionne
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Vérifier endpoint audit existe
curl http://localhost:8080/api/conges/1/historique \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Tests timeout
**Cause**: Serveur trop lent ou offline
**Solution**:
```bash
# Augmenter timeout
npx playwright test --timeout=30000

# Ou en config playwright.config.ts:
timeout: 30000,
webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
}
```

### Intermittent failures
**Cause**: Tests sensibles aux timings
**Solution**:
```bash
# Réexécuter
npx playwright test --retries=2

# Ou un test spécifique
npx playwright test audit-trail -g "filter by status" --debug
```

## 📊 Rapports & Debugging

### Voir la vidéo du test
```bash
# Tests sauvegardent les vidéos dans: test-results/
npx playwright test --headed  # Voir en direct
npx playwright show-report    # Ouvrir rapport HTML
```

### Debug mode interactif
```bash
npx playwright test --debug
# UI: Step through test, inspect elements, modify selectors
```

### Browser DevTools
```bash
npx playwright test --headed
# F12 ouvre DevTools pendant le test
```

## ✅ Checklist Avant Exécution

- [ ] `npm run dev` lancé et accessible sur `http://localhost:3000`
- [ ] Backend Spring Boot accessible sur `http://localhost:8080`
- [ ] User test existe: `admin@example.com`
- [ ] Database a des données de test
- [ ] Pas d'erreurs TypeScript: `npm run build`
- [ ] Node modules installés: `npm install`

## 🎯 Tests Critiques à Prioriser

1. **Audit Trail - Render page** (basique, doit passer)
2. **Audit Trail - Filter & paginate** (core functionality)
3. **WebSocket - Display indicator** (basique)
4. **WebSocket - Fallback to polling** (robustesse)

## 📈 Rapport Résultat Attendu

```
✓ Audit Trail Feature (14 tests)
  ✓ render audit trail page with filters (2.5s)
  ✓ filter by status (3.2s)
  ✓ filter by user/acteur (2.8s)
  ✓ filter by date range (3.1s)
  ✓ paginate through records (2.6s)
  ✓ change page size (2.4s)
  ✓ search by conge ID (2.5s)
  ✓ display table with correct columns (2.3s)
  ✓ display status badges with correct colors (2.4s)
  ✓ show empty state when no records (2.1s)
  ✓ show error state on API error (2.2s)
  ✓ be responsive on mobile (2.0s)
  ✓ clear filters on reset button (2.6s)

✓ WebSocket Notifications Feature (17 tests)
  ✓ display WebSocket connection indicator (1.8s)
  ✓ show connected icon when WebSocket is active (1.5s)
  ✓ display notification badge (1.6s)
  ✓ open notification dropdown (2.1s)
  ✓ close notification dropdown on click outside (2.0s)
  ✓ handle notification messages (1.9s)
  ✓ fallback to polling if WebSocket fails (3.5s)
  ✓ display offline icon on WebSocket disconnect (1.7s)
  ✓ reconnect after temporary disconnect (2.8s)
  ✓ persist notification state during page navigation (2.5s)
  ✓ update unread notification count (2.2s)
  ✓ handle rapid connect/disconnect cycles (3.2s)
  ✓ display notification when received while on page (2.0s)
  ✓ restore connection on network recovery (2.6s)
  ✓ show indicator on desktop and hide on mobile (2.4s)

31 tests passed (1m 15s)
```

## 🚀 CI/CD Integration

Pour intégrer dans GitHub Actions:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npx playwright install
      - run: npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

**Documentation créée**: 21 janvier 2026  
**Status**: ✅ Tests prêts à exécuter
