# Etapa 1: Construcción de la aplicación
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios
COPY package*.json ./

# Instalar dependencias sin ejecutar scripts (más seguro)
RUN npm install --ignore-scripts

# Copiar solo los archivos y carpetas necesarios
COPY src ./src
COPY public ./public

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Eliminar archivos por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos generados por el build al directorio público de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx si tienes una (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Usar el usuario no-root de nginx por seguridad
USER nginx

# Exponer el puerto
EXPOSE 80

# Comando por defecto para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
