# =============================================================================
# PlagaControl ML Service - Multi-stage: Entrenamiento + Runtime ligero
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Entrenamiento con TensorFlow completo
# -----------------------------------------------------------------------------
FROM python:3.11-slim AS trainer

WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 y matplotlib
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Crear directorios necesarios
RUN mkdir -p static uploads

# Ejecutar el entrenamiento para generar modelos, curvas, métricas y TFLite
RUN python scripts/train.py

# -----------------------------------------------------------------------------
# Stage 2: Runtime ligero con TFLite (< 200MB RAM)
# -----------------------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-runtime.txt .
RUN pip install --no-cache-dir -r requirements-runtime.txt

# Copiar modelos y métricas generados en el entrenamiento
COPY --from=trainer /app/static ./static

# Copiar código de la aplicación
COPY app ./app

# Crear directorios necesarios
RUN mkdir -p uploads

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
