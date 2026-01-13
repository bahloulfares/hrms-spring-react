# 🚀 Guide de Démarrage Rapide - Système de Notifications V1

## ⚡ Démarrage en 3 minutes

### 1️⃣ Backend (30 secondes)
```bash
cd GestionRH
mvn clean spring-boot:run
```
✅ La table `notifications` sera créée automatiquement par Flyway  
✅ Les endpoints API seront disponibles sur `http://localhost:8080`

### 2️⃣ Frontend (30 secondes)
```bash
cd gestionrh-frontend
npm run dev
```
✅ Application disponible sur `http://localhost:5173`

### 3️⃣ Test (2 minutes)

#### Scénario : Employé crée une demande de congé

**👤 Compte 1 : Employé**
1. Login : `employee@example.com`
2. Aller dans **Congés** → **Nouvelle demande**
3. Remplir formulaire : 
   - Date début : 01/06/2025
   - Date fin : 05/06/2025
   - Type : Congé payé
   - Commentaire : "Vacances d'été"
4. Soumettre ✅

**👨‍💼 Compte 2 : Manager**
1. Login : `manager@example.com`
2. **Badge rouge** apparaît sur l'icône 🔔 (notification non lue)
3. Cliquer sur 🔔 → Dropdown s'ouvre
4. Voir notification : *"📄 Nouvelle demande de congé - Fares Nasri..."*
5. Cliquer sur la notification → Redirige vers page Validations

**✓ Actions possibles :**
- ✅ Marquer comme lue (icône ✓)
- ❌ Supprimer (icône ×)
- 📖 Tout marquer comme lu (bouton en haut)

---

## 🔧 Configuration avancée

### Modifier l'intervalle de polling
**Fichier** : `gestionrh-frontend/src/hooks/useNotifications.ts`
```typescript
refetchInterval: 30000, // 30 secondes (défaut)
// Changer à :
refetchInterval: 10000, // 10 secondes (plus fréquent)
refetchInterval: 60000, // 60 secondes (moins fréquent)
```

### Modifier la rétention des notifications
**Fichier** : `GestionRH/src/main/java/com/fares/gestionrh/service/NotificationPersistenceService.java`
```java
LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30); // 30 jours (défaut)
// Changer à :
LocalDateTime cutoffDate = LocalDateTime.now().minusDays(60); // 60 jours
LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90); // 90 jours
```

### Activer le nettoyage automatique (Scheduled Task)
**Fichier** : `GestionRH/src/main/java/com/fares/gestionrh/GestionRhApplication.java`
```java
@SpringBootApplication
@EnableAsync
@EnableScheduling // Ajouter cette annotation
public class GestionRhApplication {
    // ...
}
```

**Cron expression dans NotificationPersistenceService :**
```java
@Scheduled(cron = "0 0 2 * * ?") // Tous les jours à 2h du matin
public void cleanupOldNotifications() {
    // ...
}
```

---

## 🐛 Problèmes courants

### ❌ Badge ne se met pas à jour
**Cause** : Backend non démarré ou CORS bloqué  
**Solution** :
1. Vérifier backend tourne : `curl http://localhost:8080/actuator/health`
2. Vérifier console navigateur (F12) pour erreurs CORS
3. Si CORS, vérifier `@CrossOrigin` dans `NotificationController.java`

### ❌ Dropdown ne s'affiche pas
**Cause** : Erreur de compilation TypeScript  
**Solution** :
1. Vérifier console VSCode pour erreurs TypeScript
2. Rebuild : `npm run build`
3. Vérifier import `NotificationDropdown` dans `DashboardLayout.tsx`

### ❌ Notifications non créées en DB
**Cause** : Événement non publié  
**Solution** :
1. Vérifier logs backend : `LeaveEvent reçu: LEAVE_CREATED`
2. Vérifier table `notifications` existe : `SHOW TABLES LIKE 'notifications';`
3. Vérifier migration Flyway appliquée : `SELECT * FROM flyway_schema_history;`

### ❌ Erreur 403 Forbidden sur API
**Cause** : JWT token expiré ou manquant  
**Solution** :
1. Se reconnecter (refresh token)
2. Vérifier `@PreAuthorize("isAuthenticated()")` dans controller
3. Vérifier cookie `JSESSIONID` présent dans DevTools → Application

---

## 📊 Dashboard React Query DevTools

Pour débugger le polling et l'état des requêtes :

**Installation :**
```bash
npm install @tanstack/react-query-devtools
```

**Ajout dans App.tsx :**
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {/* Votre app */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}
```

**Utilisation :**
- Cliquer sur l'icône React Query (coin bas droit)
- Voir état des queries `['notifications']` et `['notifications', 'unread-count']`
- Vérifier `dataUpdatedAt` pour confirmer polling fonctionne

---

## 🧪 Tests API avec Thunder Client (VS Code)

### 1. Importer collection
Créer fichier `notifications.http` :

```http
### Variables
@baseUrl = http://localhost:8080/api
@token = YOUR_JWT_TOKEN_HERE

### 1. Get all notifications
GET {{baseUrl}}/notifications
Authorization: Bearer {{token}}

### 2. Get unread count
GET {{baseUrl}}/notifications/unread-count
Authorization: Bearer {{token}}

### 3. Mark as read
PUT {{baseUrl}}/notifications/1/read
Authorization: Bearer {{token}}

### 4. Mark all as read
POST {{baseUrl}}/notifications/mark-all-read
Authorization: Bearer {{token}}

### 5. Delete notification
DELETE {{baseUrl}}/notifications/1
Authorization: Bearer {{token}}
```

### 2. Exécuter
1. Installer extension **REST Client** dans VS Code
2. Remplacer `YOUR_JWT_TOKEN_HERE` par votre token (récupéré après login)
3. Cliquer sur **Send Request** au-dessus de chaque requête

---

## 📈 Monitoring production

### Métriques à surveiller
```sql
-- Nombre total de notifications
SELECT COUNT(*) FROM notifications;

-- Notifications non lues par utilisateur
SELECT utilisateur_id, COUNT(*) as non_lues 
FROM notifications 
WHERE lue = false 
GROUP BY utilisateur_id;

-- Notifications par type
SELECT type, COUNT(*) as total 
FROM notifications 
GROUP BY type;

-- Taille table (MySQL)
SELECT 
    table_name AS `Table`,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS `Size (MB)`
FROM information_schema.TABLES
WHERE table_schema = 'gestionrh'
AND table_name = 'notifications';
```

### Logs importants
```bash
# Suivre logs en temps réel
tail -f GestionRH/logs/spring.log | grep "Notification"

# Chercher erreurs
grep "ERROR.*Notification" GestionRH/logs/spring.log

# Compter notifications créées aujourd'hui
grep "Notification créée" GestionRH/logs/spring.log | wc -l
```

---

## ✅ Checklist Go-Live

### Avant déploiement
- [ ] Backend compile : `mvn clean package -DskipTests`
- [ ] Frontend compile : `npm run build`
- [ ] Tests API tous passent (200 OK)
- [ ] Migration Flyway testée sur DB prod
- [ ] Indexes créés sur table `notifications`
- [ ] Backup DB avant migration

### Après déploiement
- [ ] Vérifier endpoint health : `/actuator/health`
- [ ] Créer une notification test
- [ ] Vérifier badge s'affiche
- [ ] Tester marquer comme lu
- [ ] Vérifier polling (attendre 30s)
- [ ] Monitoring CloudWatch/Grafana activé

---

## 🎯 Prochaines étapes (V2)

1. **WebSocket** : Remplacer polling par push temps réel
2. **Push notifications** : Notifications navigateur (Web Push API)
3. **Préférences** : Activer/désactiver types de notifications
4. **Slack/Teams** : Intégration webhooks
5. **Analytics** : Tableau de bord admin (stats notifications)

---

**Besoin d'aide ?**  
📖 Lire la doc complète : `NOTIFICATION_SYSTEM_V1_DOCUMENTATION.md`  
🐛 Reporter un bug : GitHub Issues  
💬 Support : Slack #gestionrh-support
