# 🔔 Système de Notifications V1 - Documentation Complète

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Installation & Configuration](#installation--configuration)
6. [Tests](#tests)
7. [Évolutions V2](#évolutions-v2)

---

## 🎯 Vue d'ensemble

### Fonctionnalités V1
✅ **Notifications en base de données** - Stockage persistant avec PostgreSQL/MySQL  
✅ **Polling automatique** - Rafraîchissement toutes les 30 secondes  
✅ **Badge dynamique** - Compteur de notifications non lues (limité à 99+)  
✅ **Dropdown professionnel** - Interface moderne avec scroll, animations  
✅ **Marquer comme lu** - Action individuelle ou en masse  
✅ **Suppression** - Nettoyage des notifications (auto après 30 jours)  
✅ **4 types d'événements** - CREATED, APPROVED, REJECTED, CANCELLED  

### Événements déclencheurs
| Événement | Déclencheur | Destinataire |
|-----------|-------------|--------------|
| **LEAVE_CREATED** | Employé crée une demande | Manager + RH |
| **LEAVE_APPROVED** | Manager/RH approuve | Employé |
| **LEAVE_REJECTED** | Manager/RH rejette | Employé |
| **LEAVE_CANCELLED** | Employé annule | Manager + RH |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DashboardLayout.tsx                                  │   │
│  │  ├─ Bell Icon (Badge dynamique)                       │   │
│  │  └─ NotificationDropdown (Dropdown)                   │   │
│  │     ├─ NotificationItem (Liste)                       │   │
│  │     └─ useNotifications (React Query + Polling 30s)   │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ REST API                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  NotificationController                               │   │
│  │  ├─ GET /api/notifications                            │   │
│  │  ├─ GET /api/notifications/unread-count               │   │
│  │  ├─ PUT /api/notifications/{id}/read                  │   │
│  │  ├─ POST /api/notifications/mark-all-read             │   │
│  │  └─ DELETE /api/notifications/{id}                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  NotificationPersistenceService                       │   │
│  │  ├─ createNotificationFromEvent()                     │   │
│  │  ├─ getUserNotifications()                            │   │
│  │  ├─ getUnreadCount()                                  │   │
│  │  ├─ markAsRead() / markAllAsRead()                    │   │
│  │  └─ cleanupOldNotifications() [30 jours]             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LeaveEventListener (@Async)                          │   │
│  │  └─ Écoute les événements de congés                   │   │
│  │     ├─ Envoie EMAIL (NotificationService)             │   │
│  │     └─ Crée NOTIFICATION DB (Persistence)             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database (MySQL/PostgreSQL)                          │   │
│  │  └─ Table: notifications                              │   │
│  │     ├─ id, utilisateur_id, type, titre, message       │   │
│  │     ├─ lue, conge_id, date_creation                   │   │
│  │     └─ employe_nom, type_conge, action_par (denorm)   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend

### 1. Entity - `Notification.java`
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type; // LEAVE_CREATED, LEAVE_APPROVED, etc.

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean lue = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conge_id")
    private Conge conge;

    @CreationTimestamp
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    // Champs dénormalisés pour éviter les jointures
    @Column(name = "employe_nom")
    private String employeNom;

    @Column(name = "type_conge", length = 100)
    private String typeConge;

    @Column(name = "action_par")
    private String actionPar;
}
```

### 2. Repository - `NotificationRepository.java`
```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Top 50 pour performance (limiter la charge)
    List<Notification> findTop50ByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);
    
    // Badge count
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.utilisateur.id = :utilisateurId AND n.lue = false")
    long countUnreadByUtilisateurId(@Param("utilisateurId") Long utilisateurId);
    
    // Mark all as read (bulk update)
    @Modifying
    @Query("UPDATE Notification n SET n.lue = true WHERE n.utilisateur.id = :utilisateurId AND n.lue = false")
    int markAllAsReadByUtilisateurId(@Param("utilisateurId") Long utilisateurId);
    
    // Cleanup old notifications (30 days)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.dateCreation < :cutoffDate")
    void deleteOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
}
```

### 3. Service - `NotificationPersistenceService.java`
**Méthodes principales :**
- `createNotificationFromEvent(LeaveEvent event, String recipientEmail)` - Crée notification à partir d'événement
- `getUserNotifications(String email)` - Récupère les 50 dernières notifications
- `getUnreadCount(String email)` - Compte les non lues
- `markAsRead(Long id, String email)` - Marque comme lue (vérifie propriétaire)
- `markAllAsRead(String email)` - Marque toutes comme lues
- `deleteNotification(Long id, String email)` - Supprime (vérifie propriétaire)
- `cleanupOldNotifications()` - **@Scheduled** - Nettoie notifications > 30 jours

### 4. Controller - `NotificationController.java`
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/notifications` | GET | Liste des notifications (50 max) | ✅ |
| `/api/notifications/unread-count` | GET | Compteur non lues | ✅ |
| `/api/notifications/{id}/read` | PUT | Marquer comme lue | ✅ |
| `/api/notifications/mark-all-read` | POST | Tout marquer comme lu | ✅ |
| `/api/notifications/{id}` | DELETE | Supprimer notification | ✅ |

### 5. Event Listener - `LeaveEventListener.java`
```java
@Async
@EventListener
public void handleLeaveEvent(LeaveEvent event) {
    // 1. Envoyer email (existant)
    notificationService.sendNotificationForLeaveEvent(event);
    
    // 2. NOUVEAU : Créer notification en DB
    createDatabaseNotifications(event);
}

private void createDatabaseNotifications(LeaveEvent event) {
    switch (event.getType()) {
        case CREATED -> {
            // Manager + RH reçoivent notification
            managerList.forEach(manager -> 
                notificationPersistenceService.createNotificationFromEvent(event, manager.getEmail())
            );
        }
        case APPROVED, REJECTED, CANCELLED -> {
            // Employé reçoit notification
            notificationPersistenceService.createNotificationFromEvent(event, employee.getEmail());
        }
    }
}
```

---

## 💻 Frontend

### 1. Types - `notification.ts`
```typescript
export interface Notification {
    id: number;
    type: 'LEAVE_CREATED' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'LEAVE_CANCELLED';
    titre: string;
    message: string;
    lue: boolean;
    congeId?: number;
    dateCreation: string;
    employeNom?: string;
    typeConge?: string;
    actionPar?: string;
}
```

### 2. API Client - `notificationApi.ts`
```typescript
export const notificationApi = {
    getNotifications: () => axiosClient.get('/notifications'),
    getUnreadCount: () => axiosClient.get('/notifications/unread-count'),
    markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),
    markAllAsRead: () => axiosClient.post('/notifications/mark-all-read'),
    deleteNotification: (id) => axiosClient.delete(`/notifications/${id}`),
};
```

### 3. Hook - `useNotifications.ts`
```typescript
export const useNotifications = () => {
    // React Query avec polling 30s
    const { data: notifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        refetchInterval: 30000, // ⚡ POLLING 30s
        refetchOnWindowFocus: true,
    });

    const { data: unreadCount } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationApi.getUnreadCount,
        refetchInterval: 30000,
    });

    // Mutations pour actions
    const markAsRead = useMutation({ ... });
    const markAllAsRead = useMutation({ ... });
    const deleteNotification = useMutation({ ... });

    return { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification };
};
```

### 4. Components

#### `NotificationDropdown.tsx`
- **Position** : Absolute, right-0, top-14
- **Max Height** : 32rem avec scroll personnalisé
- **Header** : Titre + Badge count + Bouton "Tout lire"
- **Body** : Liste de NotificationItem (scroll)
- **Empty State** : Icône + Message "Aucune notification"
- **Click Outside** : Ferme automatiquement le dropdown

#### `NotificationItem.tsx`
- **Background** : Bleu (non lue) ou Blanc (lue)
- **Badge** : Point bleu pour non lues
- **Icône** : Variable selon type (FileText, ThumbsUp, ThumbsDown, Ban)
- **Actions** : Marquer comme lu (✓) + Supprimer (×) au hover
- **Time Ago** : `date-fns` avec locale française ("il y a 5 minutes")
- **Navigation** : Click → Redirige vers `/dashboard/leaves` si `congeId` existe

#### `DashboardLayout.tsx`
```tsx
const [isNotificationOpen, setIsNotificationOpen] = useState(false);
const { unreadCount } = useNotifications();

<button onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
    <Bell className="w-5 h-5" />
    {unreadCount > 0 && (
        <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
    )}
</button>

<NotificationDropdown 
    isOpen={isNotificationOpen} 
    onClose={() => setIsNotificationOpen(false)} 
/>
```

---

## 📦 Installation & Configuration

### Backend

#### 1. Migration SQL (Flyway)
Fichier : `V4__create_notifications_table.sql`
```sql
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    lue BOOLEAN DEFAULT FALSE,
    conge_id BIGINT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    employe_nom VARCHAR(255),
    type_conge VARCHAR(100),
    action_par VARCHAR(255),
    INDEX idx_utilisateur_date (utilisateur_id, date_creation DESC),
    INDEX idx_utilisateur_lue (utilisateur_id, lue),
    CONSTRAINT fk_notification_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
    CONSTRAINT fk_notification_conge FOREIGN KEY (conge_id) REFERENCES conges(id)
);
```

#### 2. Configuration Spring
Pas de configuration supplémentaire requise. Flyway appliquera automatiquement la migration au démarrage.

#### 3. Démarrage
```bash
cd GestionRH
mvn clean spring-boot:run
```

### Frontend

#### 1. Installation (déjà fait)
Les dépendances sont déjà présentes :
- `@tanstack/react-query` - Gestion état + Polling
- `date-fns` - Formatage timestamps
- `lucide-react` - Icônes
- `react-hot-toast` - Notifications toast

#### 2. Build
```bash
cd gestionrh-frontend
npm run build  # Production
npm run dev    # Développement
```

---

## 🧪 Tests

### 1. Backend - Test API avec cURL

#### a) Créer une demande de congé (déclenche LEAVE_CREATED)
```bash
curl -X POST http://localhost:8080/api/conges \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dateDebut": "2025-06-01",
    "dateFin": "2025-06-05",
    "typeCongeId": 1,
    "commentaire": "Vacances d'été"
  }'
```

#### b) Vérifier notifications créées
```bash
# Lister les notifications
curl -X GET http://localhost:8080/api/notifications \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Compter non lues
curl -X GET http://localhost:8080/api/notifications/unread-count \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

#### c) Approuver congé (déclenche LEAVE_APPROVED)
```bash
curl -X PUT http://localhost:8080/api/conges/1/approuver \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

#### d) Marquer notification comme lue
```bash
curl -X PUT http://localhost:8080/api/notifications/1/read \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```

#### e) Tout marquer comme lu
```bash
curl -X POST http://localhost:8080/api/notifications/mark-all-read \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"
```

### 2. Frontend - Test manuel

1. **Login** : Connectez-vous en tant qu'employé
2. **Créer demande** : Allez dans Congés → Nouvelle demande
3. **Vérifier badge** : Le badge sur l'icône Bell devrait apparaître pour le manager/RH
4. **Ouvrir dropdown** : Cliquer sur l'icône Bell
5. **Tester actions** :
   - Marquer une notification comme lue (✓)
   - Supprimer une notification (×)
   - Tout marquer comme lu (bouton en haut)
6. **Vérifier polling** : Attendre 30s, créer une nouvelle demande depuis un autre compte, le badge se met à jour automatiquement

### 3. Test de performance

#### Requêtes SQL optimisées
- **Limit 50** sur `findTop50ByUtilisateurId` évite surcharge
- **Indexes** sur `(utilisateur_id, date_creation)` et `(utilisateur_id, lue)`
- **Dénormalisation** des champs `employeNom`, `typeConge`, `actionPar` évite JOINs

#### Vérifier performance avec EXPLAIN
```sql
EXPLAIN SELECT * FROM notifications 
WHERE utilisateur_id = 1 
ORDER BY date_creation DESC 
LIMIT 50;
```
Doit utiliser l'index `idx_utilisateur_date`.

---

## 🚀 Évolutions V2 (Futures)

### 1. WebSocket en temps réel
**Objectif** : Remplacer polling par push server → client

**Stack** : Spring WebSocket + STOMP + SockJS
```java
@MessageMapping("/notifications")
@SendToUser("/queue/notifications")
public NotificationDTO sendNotification(NotificationDTO notification) {
    return notification;
}
```

**Frontend** :
```typescript
const stompClient = new Client({ brokerURL: 'ws://localhost:8080/ws' });
stompClient.subscribe('/user/queue/notifications', (message) => {
    const notification = JSON.parse(message.body);
    queryClient.setQueryData(['notifications', 'unread-count'], (old) => old + 1);
    toast.success(notification.titre);
});
```

### 2. Préférences utilisateur
- **Email ON/OFF** : Activer/désactiver emails par type d'événement
- **Slack/SMS** : Configuration optionnelle
- **Fréquence digest** : Résumé quotidien au lieu de temps réel

### 3. Notifications push navigateur
- **Web Push API** : Notifications natives même quand tab fermée
- **Service Worker** : Background sync

### 4. Filtrage & Tri
- Filtrer par type (CREATED, APPROVED, etc.)
- Tri par date / importance
- Recherche full-text dans messages

### 5. Archivage avancé
- Rétention configurable (30 / 60 / 90 jours)
- Export historique (CSV, PDF)

---

## 📊 Statistiques & Monitoring

### Métriques à surveiller
- **Volume** : Notifications créées / heure
- **Latence** : Temps entre événement et création DB
- **Lecture** : Taux de notifications lues vs non lues
- **Rétention** : Taille table notifications

### Logs
```java
@Slf4j
public class NotificationPersistenceService {
    log.info("Notification créée: type={}, utilisateur={}, congeId={}", type, email, congeId);
    log.debug("Nettoyage notifications > 30 jours: {} supprimées", deletedCount);
}
```

---

## 🐛 Dépannage

### Problème 1 : Badge ne se met pas à jour
**Cause** : Polling désactivé ou erreur CORS  
**Solution** :
```typescript
// Vérifier react-query-devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
<ReactQueryDevtools initialIsOpen={false} />

// Vérifier console pour erreurs 401/403
```

### Problème 2 : Notifications non créées en DB
**Cause** : Événement non publié ou transaction rollback  
**Solution** :
```java
// Vérifier logs LeaveEventListener
log.info("LeaveEvent reçu: {}", event);

// Vérifier @Async fonctionne
@EnableAsync dans @SpringBootApplication
```

### Problème 3 : Dropdown ne s'affiche pas
**Cause** : `z-index` ou overflow hidden  
**Solution** :
```css
.notification-dropdown {
    z-index: 9999; /* Plus haut que tout */
}
```

---

## 📄 Résumé des fichiers créés

### Backend (6 fichiers)
1. `Notification.java` - Entity JPA
2. `NotificationRepository.java` - Data access
3. `NotificationDTO.java` - Transfer object
4. `NotificationPersistenceService.java` - Business logic
5. `NotificationController.java` - REST endpoints
6. `LeaveEventListener.java` - **Modifié** (ajout createDatabaseNotifications)
7. `V4__create_notifications_table.sql` - Migration Flyway

### Frontend (7 fichiers)
1. `notification.ts` - Types TypeScript
2. `notificationApi.ts` - API client
3. `useNotifications.ts` - React Query hook
4. `NotificationDropdown.tsx` - Dropdown UI
5. `NotificationItem.tsx` - Item component
6. `index.ts` - Barrel export
7. `DashboardLayout.tsx` - **Modifié** (intégration bell icon)
8. `index.css` - **Modifié** (custom scrollbar)

---

## ✅ Checklist déploiement

- [ ] Backend build sans erreurs (`mvn clean install`)
- [ ] Migration Flyway appliquée (table `notifications` existe)
- [ ] Frontend build sans erreurs (`npm run build`)
- [ ] Tests API endpoints (GET, POST, PUT, DELETE)
- [ ] Tests UI (badge, dropdown, marquer comme lu)
- [ ] Vérifier polling 30s fonctionne
- [ ] Tester avec plusieurs utilisateurs (employé, manager, RH)
- [ ] Vérifier logs backend (création notifications)
- [ ] Monitoring métriques (nombre notifications, latence)

---

**Version** : 1.0.0  
**Date** : 2025-01-XX  
**Auteur** : Équipe GestionRH  
**Stack** : Spring Boot 4.0.1 + React 18 + TypeScript 5.9 + React Query + MySQL 8.0
