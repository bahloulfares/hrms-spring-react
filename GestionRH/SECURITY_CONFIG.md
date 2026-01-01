# 🔐 Configuration Sécurité - HRMS

## Vue d'ensemble

Ce document explique comment configurer les secrets et variables d'environnement pour l'application HRMS en développement et production.

## 🚀 Démarrage Rapide

### 1. **Développement Local**

```bash
# Copier le fichier d'exemple
cp GestionRH/.env.example GestionRH/.env

# Éditer avec vos paramètres
nano GestionRH/.env
```

**Variables requises pour le dev:**
- `DATABASE_URL` : URL de connexion MySQL
- `DATABASE_USERNAME` : Utilisateur MySQL
- `DATABASE_PASSWORD` : Mot de passe (vide pour XAMPP par défaut)
- `JWT_SECRET` : Clé secrète JWT (peut être simple en dev)

**Démarrage:**
```bash
cd GestionRH
mvn spring-boot:run
```

---

### 2. **Production**

#### Option A: Variables d'environnement système

```bash
export DATABASE_URL="jdbc:postgresql://prod-server:5432/gestionrh"
export DATABASE_USERNAME="gestionrh_user"
export DATABASE_PASSWORD="secure_password_123"
export JWT_SECRET="$(openssl rand -base64 32)"
export JWT_EXPIRATION="86400000"

# Puis lancer l'app avec le profil prod
java -jar gestionrh.jar --spring.profiles.active=prod
```

#### Option B: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: gestionrh
      POSTGRES_USER: gestionrh_user
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    ports:
      - "5432:5432"

  gestionrh-backend:
    image: gestionrh:latest
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/gestionrh
      DATABASE_USERNAME: gestionrh_user
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8088:8088"
    depends_on:
      - postgres
```

**Lancer:**
```bash
docker-compose up -d
```

#### Option C: Kubernetes Secrets

```bash
# Créer les secrets
kubectl create secret generic gestionrh-secrets \
  --from-literal=DATABASE_PASSWORD=secure_password \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32)

# Référencer dans le deployment
env:
  - name: DATABASE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: gestionrh-secrets
        key: DATABASE_PASSWORD
```

---

## 📋 Variables d'Environnement Supportées

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|------------|
| `DATABASE_URL` | URL de connexion BD | `jdbc:postgresql://localhost:5432/gestionrh` | ✅ |
| `DATABASE_USERNAME` | Utilisateur BD | `gestionrh_user` | ✅ |
| `DATABASE_PASSWORD` | Mot de passe BD | `secure_password` | ✅ |
| `JWT_SECRET` | Clé secrète JWT (min 256 bits) | `base64_encoded_string` | ✅ |
| `JWT_EXPIRATION` | Expiration JWT (ms) | `86400000` | ❌ (défaut: 24h) |
| `SERVER_PORT` | Port du serveur | `8088` | ❌ (défaut: 8088) |
| `LOG_FILE_PATH` | Chemin des logs | `/var/log/gestionrh/app.log` | ❌ |
| `CORS_ALLOWED_ORIGINS` | Origines CORS | `https://app.com,https://www.com` | ❌ |

---

## 🔑 Générer une JWT_SECRET sécurisée

### Linux/Mac:
```bash
openssl rand -base64 32
# Résultat: AbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQr==
```

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Python:
```python
import secrets
import base64
secret = base64.b64encode(secrets.token_bytes(32)).decode()
print(secret)
```

---

## 🗄️ Configuration Base de Données

### Développement (MySQL avec XAMPP)
```properties
DATABASE_URL=jdbc:mysql://localhost:3306/gestionrh?createDatabaseIfNotExist=true&serverTimezone=Africa/Tunis
DATABASE_USERNAME=root
DATABASE_PASSWORD=
```

### Production (PostgreSQL recommandé)
```properties
DATABASE_URL=jdbc:postgresql://prod-db-server:5432/gestionrh
DATABASE_USERNAME=gestionrh_user
DATABASE_PASSWORD=secure_password
```

**Créer la base de données:**
```sql
CREATE DATABASE gestionrh;
CREATE USER gestionrh_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE gestionrh TO gestionrh_user;
```

---

## ⚠️ Bonnes Pratiques Sécurité

### ✅ À FAIRE:
- ✅ Utiliser des variables d'environnement en production
- ✅ Générer une JWT_SECRET complexe et unique
- ✅ Utiliser HTTPS en production
- ✅ Stocker les secrets dans un gestionnaire (Vault, AWS Secrets, etc.)
- ✅ Changer régulièrement les mots de passe BD
- ✅ Activer les logs d'audit
- ✅ Mettre à jour les dépendances régulièrement

### ❌ À ÉVITER:
- ❌ Ne PAS commiter `.env` en Git
- ❌ Ne PAS utiliser des secrets en dur dans le code
- ❌ Ne PAS exposer les logs contenant des mots de passe
- ❌ Ne PAS réutiliser JWT_SECRET sur plusieurs environnements
- ❌ Ne PAS désactiver HTTPS en production
- ❌ Ne PAS utiliser des mots de passe faibles en BD

---

## 🔍 Vérification

### Test de démarrage avec variables d'environnement:
```bash
# Export des variables
export DATABASE_URL="jdbc:mysql://localhost:3306/gestionrh"
export DATABASE_USERNAME="root"
export DATABASE_PASSWORD=""
export JWT_SECRET="test_secret_key_for_dev_only"

# Vérifier que l'app démarre
mvn spring-boot:run

# Accès à Swagger
curl http://localhost:8088/swagger-ui.html
```

### Logs pour vérifier la configuration:
```bash
# Rechercher "database" dans les logs
tail -f target/*.log | grep -i database

# Chercher les erreurs de connexion
tail -f target/*.log | grep -i "connection"
```

---

## 📞 Support

Pour toute question sur la configuration:
1. Consulter `application.properties` et `application-prod.properties`
2. Vérifier `SecurityConfig.java` pour les paramètres JWT
3. Lancer avec `--debug` pour plus de détails: `mvn spring-boot:run -Dspring-boot.run.arguments="--debug"`

---

**Dernière mise à jour:** 28/12/2024
