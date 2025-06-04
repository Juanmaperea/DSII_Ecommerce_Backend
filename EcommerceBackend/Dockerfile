# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ejecuta pruebas (si falla, se detiene)
RUN pytest --reuse-db --cov=EcommerceBackend --cov-report=xml

CMD ["gunicorn", "EcommerceBackend.wsgi:application", "--bind", "0.0.0.0:8000"]