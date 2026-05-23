# Stage 1: Build
FROM node:22-bookworm-slim AS builder

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
FROM node:22-bookworm-slim

WORKDIR /app

ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Instalar Python y utilidades necesarias para la predicción
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip python3-venv netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv "$VIRTUAL_ENV" \
  && pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir pandas numpy scikit-learn openpyxl

# Copiar dependencias del builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json .

# Copiar artefactos necesarios para la predicción desde Python
COPY prediccion_api.py ./prediccion_api.py
COPY prediccion.py ./prediccion.py
COPY Calificaciones.xlsx ./Calificaciones.xlsx
COPY models ./models

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
