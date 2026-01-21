# ⚡ **QUICK REFERENCE - Security & Environment Setup**

## 🔐 **Critical Changes Made**

### **All Secrets Now Use Environment Variables**
```properties
# OLD (❌ Exposed in VCS)
jwt.secret=VotreCleSecreteSuperSecuriseePourJWTMinimum256BitsDeSecurite2024

# NEW (✅ Secure)
jwt.secret=${JWT_SECRET:dev-secret-key}
```

**Files Updated**:
- ✅ `application.properties` - All secrets replaced with env vars
- ✅ `.gitignore` - Prevents `.env` from being committed
- ✅ `.env.example` - Template for developers
- ✅ `application-example.properties` - Reference configuration

---

## 🚀 **Getting Started (Developer)**

### **1. Copy Template**
```bash
cp .env.example .env
```

### **2. Edit `.env` with Your Values**
```env
JWT_SECRET=generate-random-256bit-string-here
DB_URL=jdbc:mysql://localhost:3306/gestionrh?...
DB_USER=gestionrh_app
DB_PASSWORD=your-actual-password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### **3. Run Backend**
```bash
cd GestionRH
export $(cat .env | xargs)  # Load variables
mvn spring-boot:run
```

### **4. Run Frontend**
```bash
cd gestionrh-frontend
npm install
npm run dev
```

### **5. Don't Commit `.env`**
Already in `.gitignore` ✅

---

## 🔐 **Flyway Settings - Now Production-Safe**

| Setting | Value | Why |
|---------|-------|-----|
| `baseline-on-migrate` | `false` | Prevent auto-baseline |
| `out-of-order` | `false` | Enforce sequential migrations |
| `repair-on-migrate` | `false` | Catch errors, don't auto-fix |
| `validate-on-migrate` | `true` | Validate before applying |

---

## 📊 **Logging - Optimized for Dev & Prod**

```properties
# Development
logging.level.root=INFO
logging.level.com.fares.gestionrh=DEBUG        # Detailed app logs
logging.level.org.springframework.security=WARN # Less noise
logging.level.org.flywaydb=INFO               # Migration info only

# Production - just set root level higher
logging.level.root=WARN
```

---

## ✅ **Pre-Production Checklist**

- [ ] `.env` file created locally (never committed)
- [ ] All secrets set to real values
- [ ] Backend starts with `mvn spring-boot:run`
- [ ] Frontend builds with `npm run build`
- [ ] Test login works end-to-end
- [ ] Database migrations run without errors
- [ ] Old secrets rotated (JWT, DB, SMTP)
- [ ] No `.env` file in git history check: `git status --ignored`

---

## 🆘 **Troubleshooting**

### **"Invalid JWT Secret" or null database password**
```bash
# Check env vars are loaded
echo $JWT_SECRET
echo $DB_PASSWORD

# If empty, manually export
export JWT_SECRET="your-value"
export DB_PASSWORD="your-value"
```

### **Flyway migration fails**
Check that `validate-on-migrate=true` is catching real errors (good!). Fix the migration file and retry.

### **SMTP not sending emails**
- Gmail requires "App Password" (not account password)
- Generate at: https://myaccount.google.com/apppasswords

---

## 📄 **Key Files Reference**

| File | Purpose | Commit? |
|------|---------|---------|
| `.env` | Your local secrets | ❌ NO - in .gitignore |
| `.env.example` | Template for team | ✅ YES |
| `application.properties` | App config (env vars) | ✅ YES |
| `application-example.properties` | Reference/documentation | ✅ YES |
| `.gitignore` | Prevent secret leaks | ✅ YES |
| `SECURITY_HARDENING.md` | Full security guide | ✅ YES |
| `PROJECT_ANALYSIS_COMPLETE.md` | This analysis | ✅ YES |

---

## 🔗 **Environment Variable List**

```bash
# JWT
JWT_SECRET=                          # Min 256 bits

# Database
DB_URL=                              # jdbc:mysql://...
DB_USER=                             # Database user
DB_PASSWORD=                         # Database password

# Mail (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=                       # Gmail address
MAIL_PASSWORD=                       # App-specific password

# Notifications
NOTIFICATION_EMAIL_ENABLED=false     # true/false
NOTIFICATION_EMAIL_FROM=
NOTIFICATION_EMAIL_TO=
NOTIFICATION_SLACK_ENABLED=false
NOTIFICATION_SLACK_WEBHOOK=
NOTIFICATION_SMS_ENABLED=false
NOTIFICATION_SMS_WEBHOOK=
NOTIFICATION_SMS_TO=

# Server
SERVER_PORT=8088
```

---

**Questions?** See [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) for complete details.
