# Usa una imagen base de Python
FROM python:3.11-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del backend al contenedor
COPY . .

# Instala las dependencias
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Expone el puerto en que corre Django (por default: 8000)
EXPOSE 8000

# Comando para correr el servidor
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]