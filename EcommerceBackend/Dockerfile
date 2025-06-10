# backend/Dockerfile
FROM python:3.10-slim

# Create a non-root user
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

# Copy and install dependencies first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary application files
COPY manage.py .
COPY pytest.ini .
COPY EcommerceBackend/ ./EcommerceBackend/
COPY users/ ./users/

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Ejecuta pruebas (si falla, se detiene)
RUN pytest --reuse-db --cov=EcommerceBackend --cov-report=xml

CMD ["gunicorn", "EcommerceBackend.wsgi:application", "--bind", "0.0.0.0:8000"]