# OASIS Platform

Monorepo para OASIS Digital - Backend y Frontend.

## Estructura

```
oasis-platform/
├── apps/
│   └── oasis-app/          # Frontend (Next.js)
├── backend/                # Backend (FastAPI microservices)
│   ├── services/           # Microservicios
│   │   ├── auth_service/
│   │   ├── journey_service/
│   │   └── webhook_service/
│   ├── common/             # Código compartido
│   ├── scripts/            # Scripts de utilidad
│   └── supabase/           # Migraciones y config
└── README.md
```

## Desarrollo Local

### Backend
```bash
cd backend
poetry install
# Configurar .env (ver backend/README.md)
uvicorn services.auth_service.main:app --reload --port 8001
```

### Frontend
```bash
cd apps/oasis-app
npm install
npm run dev
```

### Con Docker (todos los servicios backend)
```bash
cd backend
docker-compose up --build
```

## Actualizar Subtrees

### Traer cambios del backend
```bash
git subtree pull --prefix=backend https://github.com/fsotosa-ops/oasis-api.git main --squash
```

### Traer cambios del frontend
```bash
git subtree pull --prefix=apps/oasis-app https://github.com/fsotosa-ops/oasis-app.git main --squash
```

### Pushear cambios al backend (desde el monorepo)
```bash
git subtree push --prefix=backend https://github.com/fsotosa-ops/oasis-api.git main
```

### Pushear cambios al frontend (desde el monorepo)
```bash
git subtree push --prefix=apps/oasis-app https://github.com/fsotosa-ops/oasis-app.git main
```

## CI/CD

Los workflows de GitHub Actions están configurados en `backend/.github/workflows/`:
- `ci.yml` - Lint y tests en PRs
- `deploy-dev.yml` - Deploy a Cloud Run (dev)
- `deploy-prod.yml` - Deploy a Cloud Run (prod)

## Servicios

| Servicio | Puerto Local | Descripción |
|----------|--------------|-------------|
| auth_service | 8001 | Autenticación y usuarios |
| journey_service | 8002 | Experiencia y gamificación |
| webhook_service | 8004 | Gateway de webhooks externos |
| oasis-app | 3000 | Frontend Next.js |
