# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./
COPY prisma ./prisma

# Instalar dependencias
RUN npm ci

# Generar cliente Prisma
RUN npm run prisma:generate

# Copiar código fuente
COPY src ./src
COPY tsconfig.json .
COPY jest.config.cjs .

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Instalar netcat para health checks
RUN apk add --no-cache netcat-openbsd

# Copiar dependencias del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json .

# Copiar script de entrada
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Exponemos puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD nc -z localhost 3000 || exit 1

# Usar script de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]
