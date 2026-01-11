# 🏖️ Logique Métier Complète: Gestion des Congés

**Date**: 11 Janvier 2026  
**Status**: Documentation Complète  
**Auteur**: Analyse Backend → Frontend

---

## 🎯 Vue d'Ensemble

Le système de congés fonctionne sur un modèle de **workflow d'approbation hiérarchique** avec:
- **Demandeurs**: EMPLOYE, MANAGER, ADMIN, RH (peuvent créer des demandes)
- **Approbateurs**: MANAGER, RH, ADMIN (peuvent valider/refuser)
- **Soldes**: Chaque employé a un solde par type de congé par année

---

## 👥 Rôles et Permissions Détaillées

### 🔵 **EMPLOYE** (Employé Standard)

**✅ Ce qu'il PEUT faire:**
```
1. Créer une demande de congé pour lui-même
   → Endpoint: POST /api/conges

2. Voir SES propres congés (historique complet)
   → Endpoint: GET /api/conges/mes-conges

3. Annuler SA demande (si status = EN_ATTENTE)
   → Endpoint: DELETE /api/conges/{id}

4. Voir SES soldes de congés (par type et par année)
   → Endpoint: GET /api/conges/mes-soldes
   → Frontend: Widget "Mes Soldes" sur Dashboard

5. Voir la liste des types de congés disponibles
   → Endpoint: GET /api/conges/types
```

**❌ Ce qu'il NE PEUT PAS faire:**
```
✗ Voir les congés des autres employés
✗ Valider/Refuser des demandes
✗ Voir les soldes des autres
✗ Accéder aux demandes en attente
✗ Générer des rapports
✗ Exporter des données
```

**🔄 Workflow Employé:**
```
1. Employé clique "Nouvelle Demande"
2. Choisit type (Congé Payé, Maladie, RTT...)
3. Sélectionne dates (début → fin)
4. Ajoute commentaire optionnel
5. Soumet → Status: EN_ATTENTE
6. Notification envoyée au MANAGER
7. Employé attend validation
8. Reçoit notification (APPROUVE ou REFUSE)
9. Si approuvé: Solde déduit automatiquement
```

---

### 🟠 **MANAGER** (Chef d'Équipe/Département)

**✅ Ce qu'il PEUT faire:**
```
1. TOUT ce que fait un EMPLOYE (pour ses propres congés)

2. Voir demandes EN_ATTENTE de SON département UNIQUEMENT
   → Endpoint: GET /api/conges/en-attente
   → Backend filtre automatiquement par departement_id

3. Valider/Refuser les demandes de SON département
   → Endpoint: PUT /api/conges/{id}/valider
   → Body: { "action": "APPROUVER/REFUSER", "commentaire": "..." }

4. Voir soldes d'UN employé de son département
   → Endpoint: GET /api/conges/soldes/employe/{employeId}
   → Usage: Avant validation, vérifier solde disponible

5. Voir soldes DE TOUS les employés de son département
   → Endpoint: GET /api/conges/soldes/departement
   → Frontend: Tableau récapitulatif

6. Générer rapports/statistiques de SON département
   → Endpoint: POST /api/conges/report/statistics
   → Body: { "dateDebut": "...", "dateFin": "...", "departementId": X }

7. Exporter données CSV de son département
   → Endpoint: POST /api/conges/report/export-csv
```

**❌ Ce qu'il NE PEUT PAS faire:**
```
✗ Voir/Gérer congés d'AUTRES départements (sauf si aussi Admin/RH)
✗ Modifier les types de congés (réservé Admin)
✗ Initialiser les soldes annuels (réservé Admin)
✗ Voir tous les congés de l'entreprise
```

**🔄 Workflow Manager:**
```
1. Manager reçoit notification "Nouvelle demande"
2. Va sur page "Demandes en Attente"
3. Voit liste filtrée: UNIQUEMENT son département
4. Pour chaque demande:
   - Voit: Employé, Type, Dates, Jours demandés
   - Voit: Solde actuel de l'employé
   - Lit commentaire de l'employé
5. Décide: Approuver ou Refuser
6. Si REFUSER: Commentaire obligatoire
7. Clique action → Notification envoyée à l'employé
```

---

### 🔴 **RH** (Ressources Humaines)

**✅ Ce qu'il PEUT faire:**
```
1. TOUT ce que fait un MANAGER

2. Voir TOUTES les demandes en attente (TOUS départements)
   → Endpoint: GET /api/conges/en-attente
   → Backend ne filtre PAS par département si role=RH

3. Valider/Refuser N'IMPORTE quelle demande
   → Endpoint: PUT /api/conges/{id}/valider

4. Voir soldes de N'IMPORTE quel employé
   → Endpoint: GET /api/conges/soldes/employe/{employeId}

5. Voir soldes de TOUS les départements
   → Endpoint: GET /api/conges/soldes/departement
   → Retourne TOUTE l'entreprise (pas filtré)

6. Générer rapports/statistiques GLOBAUX
   → Endpoint: POST /api/conges/report/statistics
   → Body: { ... } // sans filter departementId = toute entreprise

7. Exporter CSV complet
   → Endpoint: POST /api/conges/report/export-csv
```

**❌ Ce qu'il NE PEUT PAS faire:**
```
✗ Modifier les types de congés (réservé Admin)
✗ Initialiser les soldes annuels (réservé Admin)
```

**🔄 Workflow RH:**
```
1. RH voit TOUTES les demandes en attente (dashboard global)
2. Peut filtrer par département si besoin
3. Peut intervenir sur n'importe quelle demande
4. Peut générer rapports cross-département
5. Peut consulter soldes de toute l'entreprise
```

---

### ⚫ **ADMIN** (Administrateur Système)

**✅ Ce qu'il PEUT faire:**
```
1. TOUT ce que fait RH

2. Initialiser les soldes annuels pour TOUTE l'entreprise
   → Endpoint: POST /api/conges/admin/initialiser-soldes
   → Crée soldes pour tous les employés (ex: 25j Congé Payé)

3. Voir TOUS les congés (historique complet, toutes années)
   → Endpoint: GET /api/conges/all
   → Pas de filtre, tous statuts

4. Gérer les TYPES de congés (CRUD complet)
   → Endpoint: GET    /api/admin/type-conges
   → Endpoint: POST   /api/admin/type-conges
   → Endpoint: PUT    /api/admin/type-conges/{id}
   → Endpoint: DELETE /api/admin/type-conges/{id}
   → Ex: Créer "Congé Paternité", modifier jours alloués

5. Configuration système complète
6. Rapports illimités sans restriction
```

**🔄 Workflow Admin:**
```
1. Début d'année: Initialiser soldes
   → "Initialiser soldes 2026"
   → Système crée automatiquement soldes pour tous

2. Créer/Modifier types de congés si besoin
   → Ajouter "Congé Paternité" (14 jours)
   → Modifier "Congé Payé" (de 25 à 30 jours)

3. Accès complet à tous rapports/exports
4. Peut intervenir sur n'importe quelle demande
```

---

## 📊 Workflow COMPLET d'une Demande de Congé

### Étape 1️⃣: **Création de la Demande (EMPLOYE)**

**Interface Frontend:**
```
┌───────────────────────────────────┐
│  Nouvelle Demande de Congé        │
├───────────────────────────────────┤
│                                   │
│  Type de congé: *                 │
│  [v] Congé Payé ▼                 │
│                                   │
│  Date de début: *                 │
│  [15/01/2026] 📅                  │
│                                   │
│  Date de fin: *                   │
│  [20/01/2026] 📅                  │
│                                   │
│  Nombre de jours: 5 jours         │
│  Solde restant: 20/25 jours       │
│                                   │
│  Commentaire:                     │
│  ┌─────────────────────────────┐ │
│  │ Vacances famille            │ │
│  └─────────────────────────────┘ │
│                                   │
│  [Annuler]  [Soumettre]          │
└───────────────────────────────────┘
```

**Backend Process:**
```java
POST /api/conges
{
  "typeCongeId": 1,
  "dateDebut": "2026-01-15",
  "dateFin": "2026-01-20",
  "commentaire": "Vacances famille"
}

// Backend vérifie:
1. ✅ Solde suffisant? (20 >= 5) ✓
2. ✅ Pas de chevauchement? ✓
3. ✅ Dates valides? (début < fin) ✓

// Si OK:
- Créer Conge avec status = EN_ATTENTE
- NE PAS déduire solde (attend validation)
- Envoyer notification au MANAGER
- Retourner CongeResponse
```

**Réponse:**
```json
{
  "id": 123,
  "utilisateur": {
    "id": 42,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com"
  },
  "typeConge": "Congé Payé",
  "dateDebut": "2026-01-15",
  "dateFin": "2026-01-20",
  "nbJours": 5,
  "status": "EN_ATTENTE",
  "commentaire": "Vacances famille",
  "dateCreation": "2026-01-10T14:30:00"
}
```

---

### Étape 2️⃣: **Notification Manager**

**Email/Slack/SMS envoyé:**
```
📧 Nouvelle demande de congé

👤 Employé: Jean Dupont
📅 Dates: 15/01/2026 → 20/01/2026 (5 jours)
🏷️ Type: Congé Payé
💬 Commentaire: Vacances famille
📊 Solde actuel: 20/25 jours

👉 Valider la demande: https://app.gestionrh.com/conges/en-attente
```

---

### Étape 3️⃣: **Validation Manager**

**Interface Frontend Manager:**
```
┌────────────────────────────────────────────────┐
│  Demandes en Attente - Département IT          │
├────────────────────────────────────────────────┤
│                                                │
│  📋 5 demandes en attente                      │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 👤 Jean Dupont (jean.dupont@example.com) │ │
│  │ 🏷️ Congé Payé                            │ │
│  │ 📅 15/01/2026 → 20/01/2026 (5 jours)     │ │
│  │ 📊 Solde: 20/25 jours                    │ │
│  │ 💬 "Vacances famille"                     │ │
│  │ 🕐 Demandé le: 10/01/2026 14:30          │ │
│  │                                          │ │
│  │  [✅ Approuver]  [❌ Refuser]            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 👤 Sophie Martin                         │ │
│  │ 🏷️ Maladie                               │ │
│  │ 📅 10/01/2026 → 12/01/2026 (3 jours)     │ │
│  │ 📊 Solde: 7/10 jours                     │ │
│  │  [✅ Approuver]  [❌ Refuser]            │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Action Manager (Approuver):**
```
Manager clique "Approuver"
→ Modal confirmation:

┌────────────────────────────────┐
│  Approuver la demande?         │
├────────────────────────────────┤
│  Jean Dupont                   │
│  15/01 → 20/01 (5 jours)       │
│                                │
│  Commentaire (optionnel):      │
│  ┌──────────────────────────┐ │
│  │ Approuvé. Bon repos!     │ │
│  └──────────────────────────┘ │
│                                │
│  [Annuler]  [Confirmer]       │
└────────────────────────────────┘
```

**Backend Process:**
```java
PUT /api/conges/123/valider
{
  "action": "APPROUVER",
  "commentaire": "Approuvé. Bon repos!"
}

// Backend fait:
1. ✅ Vérifier: user = manager du département ✓
2. ✅ Changer status: EN_ATTENTE → APPROUVE
3. ✅ DEDUIRE SOLDE: 25 - 5 = 20 jours
4. ✅ Enregistrer validateur et date
5. ✅ Envoyer notification à Jean Dupont
6. ✅ Retourner CongeResponse mis à jour
```

**Réponse:**
```json
{
  "id": 123,
  "status": "APPROUVE",
  "validePar": "manager@example.com",
  "dateValidation": "2026-01-11T09:15:00",
  "commentaireValidation": "Approuvé. Bon repos!",
  "nbJours": 5,
  "soldeApresDeduction": 20
}
```

---

### Étape 4️⃣: **Notification Employé (Résultat)**

**Email/Slack/SMS envoyé à Jean:**
```
✅ Votre demande de congé a été APPROUVÉE

📅 Dates: 15/01/2026 → 20/01/2026 (5 jours)
🏷️ Type: Congé Payé
👤 Validé par: Manager IT
💬 Commentaire: "Approuvé. Bon repos!"
📊 Nouveau solde: 20/25 jours

Bonnes vacances! 🏖️
```

---

## 💰 Gestion des Soldes (Détaillée)

### **Structure des Soldes**

Chaque employé a **un solde par type de congé par année**:

```sql
Table: solde_conge
┌────────────┬──────────┬────────────┬────────┬──────────────┬──────────────┐
│ employe_id │ annee    │ type_conge │ alloue │ utilise      │ restant      │
├────────────┼──────────┼────────────┼────────┼──────────────┼──────────────┤
│ 42         │ 2026     │ Congé Payé │ 25     │ 5            │ 20           │
│ 42         │ 2026     │ Maladie    │ 10     │ 0            │ 10           │
│ 42         │ 2026     │ RTT        │ 12     │ 2            │ 10           │
└────────────┴──────────┴────────────┴────────┴──────────────┴──────────────┘
```

---

### **Initialisation Annuelle (Admin uniquement)**

**Quand?** Début de chaque année (ex: 01/01/2026)

**Comment?**
```
Admin clique "Initialiser Soldes 2026"
→ Backend: POST /api/conges/admin/initialiser-soldes

Backend fait:
1. Récupérer TOUS les utilisateurs actifs
2. Pour chaque utilisateur:
   a. Récupérer TOUS les types de congés
   b. Pour chaque type:
      - Créer SoldeConge avec:
        * annee = 2026
        * joursAlloues = type.joursParAn (ex: 25 pour Congé Payé)
        * joursUtilises = 0
        * joursRestants = joursAlloues
3. Retourner rapport:
   - Nombre utilisateurs traités
   - Nombre soldes créés
```

**Réponse:**
```json
{
  "utilisateursTraites": 50,
  "soldesCrees": 150,  // 50 users × 3 types
  "annee": 2026,
  "details": {
    "Congé Payé": 50,
    "Maladie": 50,
    "RTT": 50
  },
  "message": "Soldes initialisés avec succès pour l'année 2026"
}
```

---

### **Consultation Soldes (EMPLOYE)**

**Endpoint**: `GET /api/conges/mes-soldes`

**Réponse:**
```json
[
  {
    "id": 1,
    "typeConge": {
      "id": 1,
      "nom": "Congé Payé",
      "code": "CP"
    },
    "annee": 2026,
    "joursAlloues": 25,
    "joursUtilises": 5,
    "joursRestants": 20
  },
  {
    "id": 2,
    "typeConge": {
      "id": 2,
      "nom": "Maladie",
      "code": "MAL"
    },
    "annee": 2026,
    "joursAlloues": 10,
    "joursUtilises": 0,
    "joursRestants": 10
  },
  {
    "id": 3,
    "typeConge": {
      "id": 3,
      "nom": "RTT",
      "code": "RTT"
    },
    "annee": 2026,
    "joursAlloues": 12,
    "joursUtilises": 2,
    "joursRestants": 10
  }
]
```

**Frontend Widget (Dashboard):**
```
┌─────────────────────────────────────────┐
│  📊 MES SOLDES 2026                     │
├─────────────────────────────────────────┤
│                                         │
│  Congé Payé                             │
│  ████████████████░░░░  20/25 jours      │
│  80% utilisé                            │
│                                         │
│  Maladie                                │
│  ████████████████████  10/10 jours      │
│  0% utilisé                             │
│                                         │
│  RTT                                    │
│  ████████████████░░  10/12 jours        │
│  17% utilisé                            │
│                                         │
│  [+ Nouvelle Demande]                   │
└─────────────────────────────────────────┘
```

---

### **Consultation Soldes Employé (MANAGER/RH/ADMIN)**

**Endpoint**: `GET /api/conges/soldes/employe/{employeId}`

**Usage**: Manager veut voir solde de Jean avant validation

**Réponse**: Même format que `/mes-soldes`

---

### **Consultation Soldes Département (MANAGER/RH)**

**Endpoint**: `GET /api/conges/soldes/departement`

**Filtre Backend**:
- Si MANAGER: Retourne employés de SON département uniquement
- Si RH/ADMIN: Retourne TOUS les employés

**Réponse:**
```json
[
  {
    "employeId": 42,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "departement": "IT",
    "soldes": {
      "Congé Payé": {
        "alloues": 25,
        "utilises": 5,
        "restants": 20,
        "pourcentage": 80
      },
      "Maladie": {
        "alloues": 10,
        "utilises": 0,
        "restants": 10,
        "pourcentage": 100
      }
    }
  },
  {
    "employeId": 43,
    "nom": "Martin",
    "prenom": "Sophie",
    "soldes": { ... }
  }
]
```

**Frontend Table:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Soldes Département IT                                           │
├──────────────┬────────────────────┬────────────────────┬─────────┤
│ EMPLOYE      │ CONGÉ PAYÉ         │ MALADIE            │ RTT     │
├──────────────┼────────────────────┼────────────────────┼─────────┤
│ Jean Dupont  │ 20/25 (80%)       │ 10/10 (100%)       │ 10/12   │
│ Sophie M.    │ 22/25 (88%)       │ 8/10 (80%)         │ 12/12   │
│ Marc L.      │ 15/25 (60%)       │ 10/10 (100%)       │ 9/12    │
└──────────────┴────────────────────┴────────────────────┴─────────┘
```

---

## 📋 Qui Voit Quoi? (Matrice Complète)

### **Page: Mes Congés** (`/mes-conges`)

| Rôle | Endpoint | Ce qu'il voit | Filtrage Backend |
|------|----------|---------------|------------------|
| EMPLOYE | GET /mes-conges | **SES** congés uniquement | WHERE utilisateur_id = current_user.id |
| MANAGER | GET /mes-conges | **SES** congés (quand lui demandeur) | WHERE utilisateur_id = current_user.id |
| RH | GET /mes-conges | **SES** congés (quand lui demandeur) | WHERE utilisateur_id = current_user.id |
| ADMIN | GET /mes-conges | **SES** congés (quand lui demandeur) | WHERE utilisateur_id = current_user.id |

---

### **Page: Demandes en Attente** (`/en-attente`)

| Rôle | Endpoint | Ce qu'il voit | Filtrage Backend |
|------|----------|---------------|------------------|
| EMPLOYE | ❌ Pas d'accès | - | - |
| MANAGER | GET /en-attente | Demandes EN_ATTENTE **SON département** | WHERE status=EN_ATTENTE AND departement_id = manager.departement_id |
| RH | GET /en-attente | **TOUTES** les demandes EN_ATTENTE | WHERE status=EN_ATTENTE |
| ADMIN | GET /en-attente | **TOUTES** les demandes EN_ATTENTE | WHERE status=EN_ATTENTE |

**Code Backend (simplifié):**
```java
@GetMapping("/en-attente")
public List<CongeResponse> getDemandesEnAttente(Authentication auth) {
    User user = getUserFromAuth(auth);
    
    if (user.hasRole("MANAGER")) {
        // Filtrer par département
        return congeService.getDemandesEnAttenteByDepartement(
            user.getDepartement().getId()
        );
    } else if (user.hasRole("RH") || user.hasRole("ADMIN")) {
        // Toutes les demandes
        return congeService.getDemandesEnAttente();
    }
    
    throw new AccessDeniedException("Accès refusé");
}
```

---

### **Page: Tous les Congés** (`/all`)

| Rôle | Endpoint | Ce qu'il voit | Filtrage Backend |
|------|----------|---------------|------------------|
| EMPLOYE | ❌ Pas d'accès | - | - |
| MANAGER | ❌ Pas d'accès | - | - |
| RH | ❌ Pas d'accès | - | - |
| ADMIN | GET /all | **TOUS** les congés (historique complet) | Aucun filtre |

---

### **Page: Soldes**

| Action | EMPLOYE | MANAGER | RH | ADMIN |
|--------|---------|---------|-----|-------|
| Voir **SES** soldes | ✅ /mes-soldes | ✅ /mes-soldes | ✅ /mes-soldes | ✅ /mes-soldes |
| Voir soldes **d'un employé** | ❌ | ✅ /soldes/employe/{id} (son dept) | ✅ /soldes/employe/{id} (tous) | ✅ /soldes/employe/{id} (tous) |
| Voir soldes **département** | ❌ | ✅ /soldes/departement (son dept) | ✅ /soldes/departement (tous) | ✅ /soldes/departement (tous) |

---

## 🔄 États d'une Demande (Cycle de Vie)

```
┌─────────────────┐
│   CREATION      │
│   (Employé)     │
└────────┬────────┘
         │
         v
   ┌──────────────┐
   │  EN_ATTENTE  │ ← Status initial
   └──────┬───────┘
          │
          ├─────────────► ┌─────────────┐
          │               │  APPROUVE   │ ← Manager/RH/Admin valide
          │               │  (Solde ↓)  │
          │               └─────────────┘
          │
          └─────────────► ┌─────────────┐
                          │   REFUSE    │ ← Manager/RH/Admin refuse
                          │ (Solde = )  │ (solde non touché)
                          └─────────────┘
```

**Statuts possibles:**
- `EN_ATTENTE`: Demande créée, attend validation
- `APPROUVE`: Acceptée par manager/RH/admin, **solde déduit**
- `REFUSE`: Rejetée par manager/RH/admin, **solde intact**

**Règles:**
- ✅ EMPLOYE peut annuler SI et SEULEMENT SI `status = EN_ATTENTE`
- ❌ Si `APPROUVE` ou `REFUSE`, impossible d'annuler (permanent)

---

## 📊 Rapports & Statistiques

### **Générer Statistiques (MANAGER/RH/ADMIN)**

**Endpoint**: `POST /api/conges/report/statistics`

**Requête:**
```json
{
  "dateDebut": "2026-01-01",
  "dateFin": "2026-12-31",
  "departementId": 3,  // optionnel, pour MANAGER: obligatoire
  "typeCongeId": 1,    // optionnel, filtrer par type
  "status": "APPROUVE" // optionnel, filtrer par status
}
```

**Réponse:**
```json
{
  "periode": {
    "debut": "2026-01-01",
    "fin": "2026-12-31"
  },
  "totalDemandes": 120,
  "parStatus": {
    "APPROUVE": 100,
    "REFUSE": 15,
    "EN_ATTENTE": 5
  },
  "totalJours": 600,
  "parType": {
    "Congé Payé": {
      "demandes": 80,
      "jours": 400,
      "moyenneJours": 5.0
    },
    "Maladie": {
      "demandes": 30,
      "jours": 150,
      "moyenneJours": 5.0
    },
    "RTT": {
      "demandes": 10,
      "jours": 50,
      "moyenneJours": 5.0
    }
  },
  "parMois": [
    { "mois": "Janvier", "demandes": 15, "jours": 75 },
    { "mois": "Février", "demandes": 12, "jours": 60 },
    ...
  ],
  "parDepartement": {
    "IT": { "demandes": 40, "jours": 200 },
    "RH": { "demandes": 25, "jours": 125 }
  }
}
```

**Frontend Dashboard:**
```
┌──────────────────────────────────────────────────┐
│  📊 Statistiques Congés 2026                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  Total demandes: 120                             │
│  Total jours: 600                                │
│                                                  │
│  Par Status:                                     │
│  ┌─────────────────────────────────────────┐    │
│  │ ✅ Approuvées:  100 (83%)               │    │
│  │ ❌ Refusées:     15 (13%)               │    │
│  │ ⏳ En attente:    5 (4%)                │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Par Type:                                       │
│  [Graphique en camembert]                        │
│                                                  │
│  Evolution par Mois:                             │
│  [Graphique en barres]                           │
│                                                  │
│  [Exporter CSV]  [Imprimer]                     │
└──────────────────────────────────────────────────┘
```

---

### **Export CSV (MANAGER/RH/ADMIN)**

**Endpoint**: `POST /api/conges/report/export-csv`

**Même requête** que `/statistics`

**Réponse**: Fichier CSV téléchargé

**Contenu CSV:**
```csv
Employé,Email,Département,Type,Date Début,Date Fin,Jours,Status,Validé Par,Date Validation
Jean Dupont,jean@ex.com,IT,Congé Payé,2026-01-15,2026-01-20,5,APPROUVE,manager@ex.com,2026-01-11
Sophie Martin,sophie@ex.com,RH,Maladie,2026-01-10,2026-01-12,3,APPROUVE,rh@ex.com,2026-01-10
Marc Leroy,marc@ex.com,IT,RTT,2026-01-25,2026-01-26,2,REFUSE,manager@ex.com,2026-01-24
...
```

**Usage**: Import dans Excel pour analyses avancées

---

## 🔔 Système de Notifications

### **Événements qui déclenchent notifications:**

| Événement | Qui reçoit | Quand |
|-----------|-----------|-------|
| **Nouvelle demande créée** | MANAGER (du département) | Immédiatement après POST /conges |
| **Demande approuvée** | EMPLOYE (demandeur) | Immédiatement après PUT /valider (APPROUVER) |
| **Demande refusée** | EMPLOYE (demandeur) | Immédiatement après PUT /valider (REFUSER) |
| **Demande annulée** | MANAGER (du département) | Immédiatement après DELETE /conges/{id} |

---

### **Configuration Préférences Notifications**

**Endpoint**: `GET /api/users/me/notification-preferences`

**Réponse:**
```json
{
  "emailEnabled": true,
  "slackEnabled": false,
  "smsEnabled": false,
  "channels": {
    "email": {
      "enabled": true,
      "address": "jean.dupont@example.com"
    },
    "slack": {
      "enabled": false,
      "webhook": null
    },
    "sms": {
      "enabled": false,
      "phoneNumber": null
    }
  },
  "events": {
    "LEAVE_REQUESTED": true,   // Nouvelle demande (pour managers)
    "LEAVE_APPROVED": true,    // Demande approuvée (pour employés)
    "LEAVE_REJECTED": true,    // Demande refusée (pour employés)
    "LEAVE_CANCELLED": true    // Demande annulée (pour managers)
  }
}
```

**Modifier préférences:**

**Endpoint**: `POST /api/users/me/notification-preferences`

**Body:**
```json
{
  "emailEnabled": true,
  "slackEnabled": true,
  "smsEnabled": false,
  "slackWebhook": "https://hooks.slack.com/services/xxx",
  "phoneNumber": null,
  "events": {
    "LEAVE_REQUESTED": true,
    "LEAVE_APPROVED": true,
    "LEAVE_REJECTED": false,  // Désactiver notifications refus
    "LEAVE_CANCELLED": true
  }
}
```

---

## �️ AUDIT TRAIL (Historique des Actions)

### **Qu'est-ce que l'Audit Trail?**

Le système enregistre **automatiquement TOUTES les modifications** apportées aux demandes de congés dans une table dédiée `conge_historique`. Chaque changement de statut est tracé avec:
- ✅ **Statut précédent** → **Statut nouveau**
- ✅ **Qui** a effectué l'action (acteur)
- ✅ **Quand** (date/heure précise)
- ✅ **Pourquoi** (commentaire optionnel)

**Cas d'usage:**
- Audit et conformité légale
- Traçabilité complète des décisions
- Résolution de litiges (qui a refusé? quand?)
- Statistiques sur les délais de validation

---

### **Structure Technique**

**Table Backend: `conge_historique`**

```sql
CREATE TABLE conge_historique (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conge_id BIGINT NOT NULL,                    -- Référence à la demande
  statut_precedent VARCHAR(20),                -- EN_ATTENTE, APPROUVE, REFUSE
  statut_nouveau VARCHAR(20) NOT NULL,         -- EN_ATTENTE, APPROUVE, REFUSE
  acteur VARCHAR(100) NOT NULL,                -- Email de qui a fait l'action
  date_modification TIMESTAMP NOT NULL,        -- Date/heure auto
  commentaire VARCHAR(500),                    -- Raison de l'action
  FOREIGN KEY (conge_id) REFERENCES conge(id)
);
```

**Entité Java: `CongeHistorique`**

```java
@Entity
@Table(name = "conge_historique")
public class CongeHistorique {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conge_id")
    private Conge conge;

    @Enumerated(EnumType.STRING)
    private StatutConge statutPrecedent;  // null pour création initiale

    @Enumerated(EnumType.STRING)
    private StatutConge statutNouveau;

    private String acteur;  // email de l'utilisateur

    @CreationTimestamp
    private LocalDateTime dateModification;

    private String commentaire;
}
```

---

### **Quand l'Historique est Enregistré?**

Le backend enregistre **automatiquement** une entrée d'historique dans ces cas:

| Action | Statut Précédent | Statut Nouveau | Acteur | Commentaire |
|--------|-----------------|----------------|--------|-------------|
| **Création demande** | `null` | `EN_ATTENTE` | Employé (email) | Commentaire initial |
| **Approbation** | `EN_ATTENTE` | `APPROUVE` | Manager/RH/Admin | "Approuvé. Bon repos!" |
| **Refus** | `EN_ATTENTE` | `REFUSE` | Manager/RH/Admin | "Solde insuffisant" (obligatoire) |
| **Annulation** | `EN_ATTENTE` | `ANNULE` | Employé | "Changement de plans" |

**Code Backend (automatique):**
```java
// Dans CongeService.java
private void logStatutTransition(Conge conge, StatutConge statutPrecedent, 
                                StatutConge statutNouveau, String acteur, String commentaire) {
    CongeHistorique historique = CongeHistorique.builder()
        .conge(conge)
        .statutPrecedent(statutPrecedent)
        .statutNouveau(statutNouveau)
        .acteur(acteur)
        .commentaire(commentaire)
        .build();
    congeHistoriqueRepository.save(historique);
}

// Appelé automatiquement lors de:
- createConge() → log(null, EN_ATTENTE, employé, commentaire)
- validerConge() → log(EN_ATTENTE, APPROUVE/REFUSE, manager, commentaire)
- cancelConge() → log(EN_ATTENTE, ANNULE, employé, raison)
```

---

### **Exemple d'Historique Complet**

**Scénario: Jean Dupont demande un congé**

```
┌─────────────────────────────────────────────────────────────────────┐
│  Historique de la Demande #123                                      │
│  "Congé Payé - 15/01/2026 → 20/01/2026 (5 jours)"                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🟢 APPROUVE                                                        │
│  📅 11/01/2026 09:15:23                                            │
│  👤 Par: manager.it@example.com (Manager IT)                       │
│  💬 "Approuvé. Profitez bien de vos vacances!"                     │
│  🔄 EN_ATTENTE → APPROUVE                                          │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  🔵 EN_ATTENTE                                                      │
│  📅 10/01/2026 14:30:12                                            │
│  👤 Par: jean.dupont@example.com (Employé)                         │
│  💬 "Vacances en famille pour les fêtes"                           │
│  🔄 null → EN_ATTENTE (création initiale)                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Données JSON (Backend):**
```json
{
  "congeId": 123,
  "historique": [
    {
      "id": 245,
      "statutPrecedent": "EN_ATTENTE",
      "statutNouveau": "APPROUVE",
      "acteur": "manager.it@example.com",
      "dateModification": "2026-01-11T09:15:23",
      "commentaire": "Approuvé. Profitez bien de vos vacances!"
    },
    {
      "id": 244,
      "statutPrecedent": null,
      "statutNouveau": "EN_ATTENTE",
      "acteur": "jean.dupont@example.com",
      "dateModification": "2026-01-10T14:30:12",
      "commentaire": "Vacances en famille pour les fêtes"
    }
  ]
}
```

---

### **📍 PROBLÈME: Endpoint API Manquant!**

**⚠️ CRITIQUE:** Le backend enregistre l'historique mais **N'EXPOSE PAS d'endpoint API** pour le consulter!

**Repository existant:**
```java
public interface CongeHistoriqueRepository extends JpaRepository<CongeHistorique, Long> {
    // ✅ Méthodes disponibles
    List<CongeHistorique> findByCongeOrderByDateModificationDesc(Conge conge);
    List<CongeHistorique> findByCongeIdOrderByDateModificationDesc(Long congeId);
}
```

**🔴 Endpoint À CRÉER dans CongeController:**

```java
/**
 * Récupérer l'historique complet d'une demande de congé
 * 
 * @param id ID de la demande de congé
 * @return Liste chronologique des changements de statut
 */
@GetMapping("/{id}/historique")
@PreAuthorize("hasAnyRole('EMPLOYE', 'MANAGER', 'RH', 'ADMIN')")
public ResponseEntity<List<CongeHistoriqueDTO>> getHistorique(@PathVariable Long id) {
    // Vérifier: user peut voir ce congé (soit le sien, soit de son dept si manager)
    List<CongeHistorique> historique = congeHistoriqueRepository
        .findByCongeIdOrderByDateModificationDesc(id);
    return ResponseEntity.ok(historique.stream()
        .map(this::toDTO)
        .toList());
}
```

**DTO Response:**
```java
public class CongeHistoriqueDTO {
    private Long id;
    private String statutPrecedent;   // "EN_ATTENTE", "APPROUVE", etc.
    private String statutNouveau;
    private String acteur;            // Email
    private String acteurNom;         // "Jean Dupont"
    private LocalDateTime dateModification;
    private String commentaire;
}
```

---

### **Permissions d'Accès Historique**

| Rôle | Peut voir l'historique de... | Endpoint |
|------|------------------------------|----------|
| **EMPLOYE** | ✅ SES propres demandes uniquement | GET /conges/{id}/historique |
| **MANAGER** | ✅ Ses demandes + demandes de SON département | GET /conges/{id}/historique |
| **RH** | ✅ TOUTES les demandes | GET /conges/{id}/historique |
| **ADMIN** | ✅ TOUTES les demandes | GET /conges/{id}/historique |

**Backend doit vérifier:**
```java
Conge conge = congeRepository.findById(id).orElseThrow();
User currentUser = getCurrentUser();

if (currentUser.hasRole("EMPLOYE")) {
    // Employé: uniquement SES congés
    if (!conge.getUtilisateur().getId().equals(currentUser.getId())) {
        throw new AccessDeniedException("Pas votre congé");
    }
} else if (currentUser.hasRole("MANAGER")) {
    // Manager: SES congés + SON département
    if (!conge.getUtilisateur().getId().equals(currentUser.getId()) &&
        !conge.getUtilisateur().getDepartement().getId()
            .equals(currentUser.getDepartement().getId())) {
        throw new AccessDeniedException("Pas votre département");
    }
}
// RH et ADMIN: accès total (pas de filtre)
```

---

### **Frontend: Affichage Historique**

**1️⃣ Modal Détails Demande (avec timeline historique)**

```
┌──────────────────────────────────────────────────────────┐
│  📋 Détails de la Demande #123                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  👤 Employé: Jean Dupont (IT)                           │
│  🏷️ Type: Congé Payé                                    │
│  📅 Dates: 15/01/2026 → 20/01/2026 (5 jours)            │
│  📊 Solde après: 20/25 jours                            │
│  🟢 Statut actuel: APPROUVE                             │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  📜 HISTORIQUE DES ACTIONS                               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🟢 APPROUVE                                        │ │
│  │ 11 janvier 2026 à 09:15                           │ │
│  │ Par: Manager IT (manager.it@example.com)          │ │
│  │ 💬 "Approuvé. Profitez bien de vos vacances!"     │ │
│  │ ────────────────────────────────────────────────  │ │
│  │                                                    │ │
│  │ 🔵 EN_ATTENTE                                      │ │
│  │ 10 janvier 2026 à 14:30                           │ │
│  │ Par: Jean Dupont (jean.dupont@example.com)        │ │
│  │ 💬 "Vacances en famille pour les fêtes"           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Fermer]                                               │
└──────────────────────────────────────────────────────────┘
```

**2️⃣ Icône "Historique" dans Liste Congés**

```
┌────────────────────────────────────────────────────────┐
│  Mes Congés                                            │
├────────────────────────────────────────────────────────┤
│  📅 15-20 Jan  │ Congé Payé │ 🟢 APPROUVE │ [📜 Hist] │
│  📅 10-12 Fév  │ Maladie    │ 🔵 EN_ATTENTE │ [📜 Hist] │
│  📅 05-09 Mars │ RTT        │ 🔴 REFUSE   │ [📜 Hist] │
└────────────────────────────────────────────────────────┘
         ↑ Clic ouvre modal avec timeline historique
```

---

### **Cas d'Usage Réels**

**1️⃣ Employé consulte pourquoi sa demande a été refusée**
```
GET /api/conges/123/historique
→ Voit: "Refusé par manager le 10/01 à 15:45"
→ Commentaire: "Période de forte activité, proposez une autre date"
```

**2️⃣ RH audite les validations**
```
GET /api/conges/search?status=APPROUVE&dateDebut=2026-01-01
→ Pour chaque congé approuvé:
  - Qui a validé (acteur)
  - Quand (délai entre demande et validation)
  - Pourquoi (commentaire)
```

**3️⃣ Manager vérifie son historique de décisions**
```
Filtrer historique par acteur = "manager.it@example.com"
→ Liste de toutes ses validations/refus
→ Statistiques: 85% d'approbations, délai moyen 1.2 jours
```

**4️⃣ Admin analyse les annulations**
```
Filtrer historique par statutNouveau = "ANNULE"
→ Qui annule le plus?
→ Motifs fréquents d'annulation
→ Délai entre création et annulation
```

---

### **Intégration avec Rapports**

Le système d'audit trail permet des rapports avancés:

**Rapport "Délai de Traitement"**
```sql
SELECT 
  AVG(TIMESTAMPDIFF(HOUR, h_creation.date_modification, h_validation.date_modification)) as delai_moyen_heures
FROM conge_historique h_creation
JOIN conge_historique h_validation ON h_creation.conge_id = h_validation.conge_id
WHERE h_creation.statut_nouveau = 'EN_ATTENTE'
  AND h_validation.statut_precedent = 'EN_ATTENTE'
  AND h_validation.statut_nouveau IN ('APPROUVE', 'REFUSE')
```

**Rapport "Taux d'Approbation par Validateur"**
```sql
SELECT 
  acteur,
  COUNT(CASE WHEN statut_nouveau = 'APPROUVE' THEN 1 END) as approuves,
  COUNT(CASE WHEN statut_nouveau = 'REFUSE' THEN 1 END) as refuses,
  ROUND(COUNT(CASE WHEN statut_nouveau = 'APPROUVE' THEN 1 END) * 100.0 / COUNT(*), 2) as taux_approbation
FROM conge_historique
WHERE statut_nouveau IN ('APPROUVE', 'REFUSE')
GROUP BY acteur
ORDER BY taux_approbation DESC
```

---

### **📝 TODO Frontend: Implémentation Historique**

#### **CRITIQUE** 🔴

1. **Créer Endpoint Backend**
   ```java
   @GetMapping("/{id}/historique")
   public ResponseEntity<List<CongeHistoriqueDTO>> getHistorique(@PathVariable Long id)
   ```
   - Permissions: Vérifier accès utilisateur
   - DTO: Mapper entité → DTO avec nom de l'acteur

2. **API Client Frontend**
   ```typescript
   // src/features/leaves/api/index.ts
   export const getLeaveHistory = async (leaveId: number): Promise<LeaveHistory[]> => {
     const response = await axiosClient.get(`/conges/${leaveId}/historique`);
     return response.data;
   };
   ```

3. **Composant Timeline Historique**
   ```typescript
   // src/features/leaves/components/LeaveHistoryTimeline.tsx
   interface LeaveHistoryProps {
     leaveId: number;
   }
   
   export const LeaveHistoryTimeline: React.FC<LeaveHistoryProps> = ({ leaveId }) => {
     const { data: history } = useQuery(['leave-history', leaveId], () => 
       getLeaveHistory(leaveId)
     );
     
     return (
       <div className="timeline">
         {history?.map(entry => (
           <TimelineEntry 
             key={entry.id}
             status={entry.statutNouveau}
             actor={entry.acteurNom}
             date={entry.dateModification}
             comment={entry.commentaire}
           />
         ))}
       </div>
     );
   };
   ```

#### **IMPORTANT** 🟠

4. **Modal Détails avec Historique**
   - Bouton "Historique" dans liste des congés
   - Modal affichant infos + timeline chronologique
   - Couleurs: 🟢 Approuvé, 🔴 Refusé, 🔵 En attente, ⚫ Annulé

5. **Page Admin: Audit Log Complet**
   - Table filtrable: Tous les changements
   - Filtres: Date, Acteur, Type d'action, Statut
   - Export CSV pour audit externe

---

### **Sécurité & Conformité**

**✅ Avantages du système d'audit trail:**

1. **Traçabilité totale**
   - Impossible de modifier l'historique (table append-only)
   - Horodatage automatique précis
   - Identification de l'acteur via email

2. **Conformité légale**
   - RGPD: Justification des décisions
   - Audit interne: Transparence RH
   - Litiges: Preuve des validations

3. **Statistiques avancées**
   - KPI: Délai moyen de traitement
   - Performance: Taux d'approbation par manager
   - Tendances: Pics d'annulation

4. **Intégrité des données**
   - `@CreationTimestamp`: Date non modifiable
   - Foreign Key: Lien permanent avec demande
   - Cascade: Si demande supprimée → historique conservé (optionnel)

---

**🎯 RÉSUMÉ AUDIT TRAIL**

| Aspect | Status | Notes |
|--------|--------|-------|
| **Backend: Table** | ✅ Existe | `conge_historique` créée |
| **Backend: Entité** | ✅ Existe | `CongeHistorique.java` |
| **Backend: Repository** | ✅ Existe | `CongeHistoriqueRepository` avec méthodes |
| **Backend: Service** | ✅ Existe | `logStatutTransition()` auto-appelée |
| **Backend: Endpoint API** | ❌ **MANQUANT** | `GET /{id}/historique` à créer |
| **Frontend: API Client** | ❌ **MANQUANT** | `getLeaveHistory()` à créer |
| **Frontend: UI Timeline** | ❌ **MANQUANT** | Composant historique à créer |

**👉 Action prioritaire:** Créer l'endpoint backend `GET /conges/{id}/historique` pour exposer l'audit trail existant!

---

## �🚨 Règles Métier Importantes

### 1️⃣ **Vérification du Solde**

```java
Avant création demande:
if (joursRestants < joursDemandes) {
    throw new InsufficientBalanceException(
        "Solde insuffisant: " + joursRestants + " jours disponibles"
    );
}
```

**Frontend**: Afficher erreur avant soumission

---

### 2️⃣ **Pas de Chevauchement**

```java
// Vérifier dates ne se chevauchent pas
List<Conge> congesExistants = getCongesByUser(user);
for (Conge c : congesExistants) {
    if (nouvelleDemande.overlapsWith(c)) {
        throw new OverlappingDatesException();
    }
}
```

**Exemple d'erreur:**
```
Impossible: vous avez déjà un congé du 18/01 au 22/01
```

---

### 3️⃣ **Annulation Limitée**

```java
if (conge.getStatus() != Status.EN_ATTENTE) {
    throw new CannotCancelException(
        "Impossible d'annuler: status = " + conge.getStatus()
    );
}
```

---

### 4️⃣ **Validation Hiérarchique**

```java
// Manager peut UNIQUEMENT valider son département
if (role == MANAGER) {
    if (!conge.getUser().getDepartement().equals(manager.getDepartement())) {
        throw new UnauthorizedException("Pas votre département");
    }
}
```

---

### 5️⃣ **Déduction Automatique du Solde**

```java
if (action == APPROUVER) {
    // Déduire solde
    SoldeConge solde = getSoldeByUserAndType(conge.getUser(), conge.getType(), currentYear);
    solde.setJoursUtilises(solde.getJoursUtilises() + conge.getNbJours());
    solde.setJoursRestants(solde.getJoursAlloues() - solde.getJoursUtilises());
    soldeRepository.save(solde);
}
```

---

## 📌 Résumé: Qui Fait Quoi? (Tableau Complet)

| Action | EMPLOYE | MANAGER | RH | ADMIN |
|--------|---------|---------|-----|-------|
| Créer demande (pour soi) | ✅ | ✅ | ✅ | ✅ |
| Voir **ses** congés | ✅ | ✅ | ✅ | ✅ |
| Annuler **sa** demande (EN_ATTENTE) | ✅ | ✅ | ✅ | ✅ |
| Voir demandes **en attente** | ❌ | ✅ (son dept) | ✅ (tous) | ✅ (tous) |
| **Valider/Refuser** demandes | ❌ | ✅ (son dept) | ✅ (tous) | ✅ (tous) |
| Voir **ses** soldes | ✅ | ✅ | ✅ | ✅ |
| Voir soldes **d'un employé** | ❌ | ✅ (son dept) | ✅ (tous) | ✅ (tous) |
| Voir soldes **département** | ❌ | ✅ (son dept) | ✅ (tous) | ✅ (tous) |
| **Rapports/Statistiques** | ❌ | ✅ (son dept) | ✅ (tous) | ✅ (tous) |
| **Export CSV** | ❌ | ✅ (son dept) | ✅ (tous) | ✅ (tous) |
| **Initialiser soldes annuels** | ❌ | ❌ | ❌ | ✅ |
| **Gérer types congés** (CRUD) | ❌ | ❌ | ❌ | ✅ |
| Voir **tous les congés** (historique) | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Implémentation Frontend À Faire

### **CRITIQUE** 🔴

1. **Widget Soldes sur Dashboard Employé**
   - Endpoint: `GET /mes-soldes`
   - Afficher: Barres de progression par type
   - Position: Page d'accueil après login

2. **Page Validation Manager**
   - Endpoint: `GET /en-attente`
   - Liste avec cards par demande
   - Actions: Approuver/Refuser avec modal

3. **Badge Notification**
   - Compteur sur icône "Congés"
   - Afficher nombre demandes en attente (pour managers)

### **IMPORTANT** 🟠

4. **Page Rapports (Manager/RH/Admin)**
   - Endpoint: `POST /report/statistics`
   - Graphiques: Chart.js ou Recharts
   - Export CSV

5. **Modal Détail Congé**
   - Endpoint: `GET /conges/{id}`
   - Historique: Créé, Validé, Commentaires

6. **Page Soldes Département**
   - Endpoint: `GET /soldes/departement`
   - Tableau: Tous employés + soldes

---

**✅ Documentation Complète de la Logique Congés**

Tout est expliqué: Rôles, Permissions, Workflows, Endpoints, Règles Métier!
