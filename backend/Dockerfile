# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiamos archivos de configuración para instalar dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código fuente del backend
COPY . .

# Generamos el cliente de Prisma basado en tu schema.prisma
RUN npx prisma generate

# Compilamos el código TypeScript
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]