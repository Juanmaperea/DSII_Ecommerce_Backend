# Etapa 1: construir la app con Vite
FROM node:20-alpine AS build

WORKDIR /app
COPY . .
RUN npm install && npm run build

# Etapa 2: servir los archivos estáticos
FROM nginx:alpine

# Copia los archivos construidos a la carpeta que Nginx sirve
COPY --from=build /app/dist /usr/share/nginx/html

# Copia tu configuración de Nginx si tienes una
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]