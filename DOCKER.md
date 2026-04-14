# 🐳 Guía de Docker para TimeExam

## Requisitos Previos

- Docker instalado ([descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido en Docker Desktop)
- Variables de entorno configuradas (ver `.env.example`)

## Estructura

```
.
├── docker-compose.yml       # Orquestación de servicios
├── backend/
│   ├── Dockerfile          # Build del API Express
│   └── .dockerignore        # Archivos a ignorar
├── frontend/
│   ├── Dockerfile          # Build de React + Nginx
│   ├── .docker/
│   │   └── nginx.conf      # Configuración de proxy
│   └── .dockerignore        # Archivos a ignorar
└── .env.example             # Variables de entorno
```

## Pasos Iniciales

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Clerk
# Necesitas:
# - CLERK_SECRET_KEY
# - VITE_CLERK_PUBLISHABLE_KEY (para frontend)
```

### 2. Iniciar la Aplicación Completa

```bash
# Construir imágenes y iniciar servicios (sin ngrok)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 3. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5433 (desde dentro del contenedor: `postgres:5432`)

## Ngrok - Exponer Aplicación a Internet

Ngrok ahora está integrado en docker-compose y se levanta automáticamente.

### Ver URLs públicas de ngrok

```bash
# Los logs mostrarán algo como:
# https://abc123def.ngrok-free.dev -> backend:3000
# https://xyz789uvw.ngrok-free.dev -> frontend:80
docker-compose logs ngrok

# O acceder al panel de control interactivo de ngrok
# http://localhost:4040
```

### Controlar ngrok

```bash
# Ver estado (debe estar "running" o con estado verde)
docker-compose ps ngrok

# Detener solo ngrok (otros servicios siguen corriendo)
docker-compose stop ngrok

# Reiniciar ngrok
docker-compose start ngrok
docker-compose restart ngrok

# Ver logs en tiempo real
docker-compose logs -f ngrok

# Si necesitas eliminarlo completamente
docker-compose rm ngrok
```

### Configurar ngrok.yml

Edita `ngrok.yml` en la raíz con tu token:

```yaml
version: 3
agent:
  authtoken: 39kGWZTiDBusBJ4yge4giMGywlX_9GMH4mumtThTh9WAByRB # Obtener token en https://dashboard.ngrok.com/auth
tunnels:
  backend:
    proto: http
    addr: backend:3000      # Apunta al contenedor backend
  frontend:
    proto: http
    addr: frontend:80       # Apunta al contenedor frontend (Nginx interno)
```

Para obtener tu token gratis:
1. Ir a https://dashboard.ngrok.com/
2. Sign up / Log in
3. Copiar tu authtoken
4. Pegarlo en `ngrok.yml` en `agent.authtoken`
5. Guardar y reiniciar: `docker-compose restart ngrok`

## Comandos Útiles

### Gestión General

```bash
# Ver estado de servicios
docker-compose ps

# Detener servicios
docker-compose stop

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Limpiar volúmenes (advertencia: borra datos de BD)
docker-compose down -v
```

### Base de Datos

```bash
# Ejecutar migraciones de Prisma
docker-compose exec backend npx prisma migrate deploy

# Abrir Prisma Studio
docker-compose exec backend npx prisma studio

# Reset de BD (solo desarrollo)
docker-compose exec backend npx prisma migrate reset
```

### Logs y Debugging

```bash
# Ver logs de un contenedor
docker-compose logs backend -f

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend npm run test

# Acceder a shell del backend
docker-compose exec backend sh

# Acceder a psql
docker-compose exec postgres psql -U postgres -d timeexam
```

### Reconstruir Imágenes

```bash
# Reconstruir una imagen específica
docker-compose build backend

# Reconstruir todo sin caché
docker-compose build --no-cache

# Reconstruir e iniciar
docker-compose up -d --build
```

## Estructura de Servicios

### PostgreSQL
- **Puerto**: 5432 (interno) → 5433 (host)
- **Usuario**: postgres
- **Contraseña**: postgres
- **Base de datos**: timeexam
- **Volumen**: `postgres-data` (persistencia)

### Backend
- **Puerto**: 3000 → 3000
- **Imagen**: Node 22 Alpine
- **Hot reload**: Sí (volumen en src)
- **Dependencias**: PostgreSQL

### Frontend
- **Puerto**: 80 (interno) → 5173 (host)
- **Servidor**: Nginx (reverse proxy)
- **Proxy de API**: `/api` → `backend:3000`
- **SPA Routing**: Configurado con `try_files`

## Troubleshooting

### Error: "port 5173 is already in use"
```bash
# Cambiar puerto en docker-compose.yml
# De: "5173:80"
# A: "5174:80"
```

### Error de conexión a BD
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs
docker-compose logs postgres

# Esperar a que PostgreSQL esté listo (healthcheck)
docker-compose up postgres -d
sleep 5
docker-compose up backend -d
```

### Limpiar todo y empezar de nuevo
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Problemas con tipos de TypeScript en Frontend
```bash
# Reconstruir dentro del contenedor
docker-compose exec frontend npm run build
```

## Desarrollo Local vs Contenedores

### Si prefieres desarrollar sin Docker:
```bash
# Backend (terminal 1)
cd backend
npm install
npm run dev

# Frontend (terminal 2)
cd frontend
npm install
npm run dev

# PostgreSQL con Docker solo
docker run -d \
  -p 5433:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=timeexam \
  postgres:16-alpine
```

## Variables de Entorno

Copia `.env.example` a `.env` y rellena:

```env
# Obligatorio
CLERK_SECRET_KEY=sk_test_xxx...

# Opcional (para frontend con Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx...

# Configuración automática en Docker
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/timeexam
```

## Networking

- Red interna: `app-network` (bridge)
- Backend accede a BD como: `postgres:5432`
- Frontend accede a Backend a través de Nginx proxy: `/api` → `backend:3000`
- El host puede acceder directamente en: 
  - localhost:5173 (frontend)
  - localhost:3000 (backend)
  - localhost:5433 (postgres)

## Performance

Para producción, considera:

```bash
# Backend: usar tsx en desarrollo, compilar para producción
# Frontend: hacer build estático con Nginx

# Ver uso de recursos
docker stats
```

## CI/CD

Los Dockerfiles están preparados para:
- Multi-stage builds (reducen tamaño)
- Health checks integrados
- Logs estructurados
- Fácil integración con GitHub Actions, GitLab CI, etc.

---

¿Necesitas ayuda con algún paso específico?
