# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el código y generamos la build de Vite
COPY . .
RUN npm run build

# Usamos Nginx para servir la aplicación en producción
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]