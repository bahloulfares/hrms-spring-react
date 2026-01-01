# 🚀 Quick Start Guide - HRMS Amélioré

## 5 Minutes Pour Démarrer

### 1. Backend Spring Boot

```bash
cd GestionRH

# Démarrage en développement (MySQL XAMPP)
mvn clean spring-boot:run

# Alternative: Build et exécution
mvn clean package
java -jar target/GestionRH-0.0.1-SNAPSHOT.jar
```

✅ L'app démarre sur `http://localhost:8088`

### 2. Frontend React

```bash
cd ../gestionrh-frontend

# Installation des dépendances
npm install

# Dev server
npm run dev

# Accès sur http://localhost:5173
```

✅ Frontend prêt à l'emploi

---

## 📚 Accéder à la Documentation API

**Swagger UI Interactive:**
```
http://localhost:8088/swagger-ui.html
```

Vous pouvez:
- 🔍 Explorer tous les endpoints
- 📝 Tester directement (créer, modifier, supprimer)
- 🔐 S'authentifier et tester avec JWT
- 📋 Voir les réponses d'exemple

---

## 🧪 Exécuter les Tests

### Tous les tests
```bash
cd GestionRH
mvn test
```

### Avec rapport de couverture
```bash
mvn test jacoco:report

# Ouvrir le rapport
open target/site/jacoco/index.html  # Mac
xdg-open target/site/jacoco/index.html  # Linux
start target/site/jacoco/index.html  # Windows
```

### Tests spécifiques
```bash
# Une seule classe de test
mvn test -Dtest=UtilisateurServiceTest

# Une seule méthode
mvn test -Dtest=UtilisateurServiceTest#testCreerUtilisateurSuccess
```

---

## 🔐 Configuration Sécurité

### Development (avec XAMPP MySQL)

Aucune configuration nécessaire! Utilisez les defaults:
```properties
DATABASE_URL=jdbc:mysql://localhost:3306/gestionrh
DATABASE_USERNAME=root
DATABASE_PASSWORD=(vide)
JWT_SECRET=VotreCleSecreteSuperSecuriseePourJWTMinimum256BitsDeSecurite2024
```

### Production

1. Copier `.env.example` en `.env`
2. Éditer avec vos paramètres:

```bash
# Générer une JWT_SECRET sécurisée
openssl rand -base64 32

# Ajouter à .env
export JWT_SECRET="your_generated_key_here"
export DATABASE_PASSWORD="secure_password"

# Démarrer avec profil production
java -jar gestionrh.jar --spring.profiles.active=prod
```

Voir `SECURITY_CONFIG.md` pour plus de détails.

---

## 🎯 Premiers Tests API

### 1. Authentification
```bash
curl -X POST http://localhost:8088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "motDePasse": "password123"
  }'
```

### 2. Récupérer les employés (avec pagination)
```bash
curl -X GET "http://localhost:8088/api/employes?page=0&size=10&sortBy=dateCreation&sortDirection=DESC" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}"
```

### 3. Créer un employé
```bash
curl -X POST http://localhost:8088/api/employes \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "motDePasse": "password123",
    "nom": "Doe",
    "prenom": "John",
    "telephone": "06 12 34 56 78"
  }'
```

**💡 Conseil:** Utilisez Swagger UI au lieu de curl pour tester facilement!

---

## 📖 Documentation Complète

| Document | Contenu |
|----------|---------|
| `IMPROVEMENTS_SUMMARY.md` | Résumé des 7 améliorations majeures |
| `SECURITY_CONFIG.md` | Configuration sécurité, env vars, production |
| `TESTING_GUIDE.md` | Guide complet JUnit + Mockito |
| `GestionRH/HELP.md` | Aide Maven |
| `gestionrh-frontend/README.md` | Info Frontend |

---

## 🐛 Troubleshooting

### Backend ne démarre pas
```bash
# Vérifier MySQL XAMPP est lancé
# Vérifier que le port 8088 est disponible
lsof -i :8088  # Mac/Linux
netstat -ano | findstr :8088  # Windows

# Voir les logs détaillés
mvn spring-boot:run -e
```

### Frontend erreur de connexion
```bash
# Vérifier que le backend est lancé
curl http://localhost:8088/swagger-ui.html

# Vérifier VITE_API_URL en .env
# Par défaut: http://localhost:8088/api
```

### Tests échouent
```bash
# Nettoyer et relancer
mvn clean test

# Avec debug mode
mvn -X test
```

---

## ✨ Highlights des Améliorations

### Sécurité ✅
- JWT + HTTPOnly Cookies
- CORS configuré
- Spring Security intégré

### Scalabilité ✅
- Pagination des listes
- Indices BD pour performance

### API Documentation ✅
- Swagger UI interactive
- Tous les endpoints documentés

### Qualité Code ✅
- 27+ tests unitaires
- Gestion d'erreurs robuste
- Logging structuré

### Production-Ready ✅
- Secrets externalisés
- Configuration par profils
- Support Docker/K8s

---

## 🔄 Workflow Typique de Développement

```bash
# 1. Récupérer les derniers changements
git pull origin main

# 2. Backend: installer et tester
cd GestionRH
mvn clean test        # S'assurer que les tests passent
mvn spring-boot:run   # Lancer le serveur

# 3. Frontend: installer et tester
cd ../gestionrh-frontend
npm install
npm run dev

# 4. Tester l'API
open http://localhost:8088/swagger-ui.html  # Swagger
open http://localhost:5173                  # Frontend

# 5. Avant de push: tests
cd ../GestionRH
mvn clean test        # S'assurer que tout passe
```

---

## 📞 Besoin d'Aide?

1. **Consulter la doc:** Voir les fichiers `.md` en racine
2. **Vérifier Swagger:** `http://localhost:8088/swagger-ui.html`
3. **Voir les tests:** `src/test/java/com/fares/gestionrh/service/`
4. **Vérifier les logs:** Terminal ou logs du IDE

---

## 🎓 Apprendre Davantage

### Améliorations expliquées en détail
→ Lire `IMPROVEMENTS_SUMMARY.md`

### Configuration production
→ Lire `SECURITY_CONFIG.md`

### Écrire de nouveaux tests
→ Lire `TESTING_GUIDE.md`

### Comprendre Spring Security
→ [Spring Security Docs](https://spring.io/projects/spring-security)

### Comprendre les tests
→ [JUnit 5 Guide](https://junit.org/junit5/docs/current/user-guide/)

---

**Bon développement! 🚀**

*Dernière mise à jour: 28/12/2024*
