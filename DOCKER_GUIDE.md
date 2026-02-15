# GestionRH Docker Deployment

## Quick Start

### Prerequisites
- Docker Desktop installed (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Minimum 4GB RAM available for Docker
- Ports 80, 3000, 5432, 8088 available

### Initial Setup

1. **Copy environment file:**
   ```powershell
   Copy-Item .env.docker .env
   ```

2. **Edit `.env` file** with your secure credentials:
   - Change `POSTGRES_PASSWORD` to a strong password
   - Generate a secure `JWT_SECRET` (minimum 256 bits):
     ```powershell
     [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
     ```

3. **Build and start all services:**
   ```powershell
   docker-compose up -d
   ```

4. **Check service health:**
   ```powershell
   docker-compose ps
   ```

### Service URLs

- **Frontend (React):** http://localhost:3000
- **Backend API:** http://localhost:8088/api
- **Nginx Reverse Proxy:** http://localhost
- **PostgreSQL:** localhost:5432

### Common Commands

```powershell
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d gestionrh
```

### Architecture

```
┌─────────────────┐
│   Nginx (80)    │ ← Reverse Proxy
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼────┐  ┌──▼────────┐
│Frontend│  │  Backend  │
│ (3000) │  │   (8088)  │
└────────┘  └─────┬─────┘
                  │
            ┌─────▼──────┐
            │ PostgreSQL │
            │   (5432)   │
            └────────────┘
```

### Database Migrations

Flyway migrations run automatically on backend startup. Migration files are in:
```
GestionRH/src/main/resources/db/migration/
```

### Troubleshooting

**Backend won't start:**
```powershell
# Check database connection
docker-compose logs postgres
docker-compose logs backend

# Verify database is healthy
docker-compose exec postgres pg_isready -U postgres
```

**Port conflicts:**
```powershell
# Change ports in .env file
FRONTEND_PORT=3001
BACKEND_PORT=8089
POSTGRES_PORT=5433
NGINX_HTTP_PORT=81
```

**Out of memory:**
```powershell
# Increase Docker Desktop memory limit in Settings → Resources
# Or stop other running containers
docker ps
docker stop <container-id>
```

**Build cache issues:**
```powershell
# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Production Deployment

1. **Update `.env` with production values:**
   - Strong passwords
   - Production JWT secret
   - Production URLs in CORS_ALLOWED_ORIGINS

2. **Enable HTTPS in nginx:**
   - Uncomment SSL volume mount in `docker-compose.yml`
   - Add SSL certificates to `nginx/ssl/`
   - Update `nginx/conf.d/default.conf` with SSL configuration

3. **Restrict actuator endpoints:**
   - Uncomment IP whitelist in `nginx/conf.d/default.conf`

4. **Enable logging:**
   - Add volume mounts for logs in `docker-compose.yml`

5. **Backup strategy:**
   ```powershell
   # Backup PostgreSQL
   docker-compose exec postgres pg_dump -U postgres gestionrh > backup.sql
   
   # Restore
   docker-compose exec -T postgres psql -U postgres gestionrh < backup.sql
   ```

### Development vs Production

**Development (current setup):**
- All services on localhost
- Frontend on port 3000
- Database exposed on 5432

**Production (recommended):**
- Nginx on port 80/443 only
- Backend and database internal only
- Use external PostgreSQL service (managed)
- Enable SSL/TLS
- Set up monitoring and alerting

### Next Steps

- [ ] Configure SSL certificates for HTTPS
- [ ] Set up automated backups
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Set up CI/CD pipeline
- [ ] Load testing and performance tuning
