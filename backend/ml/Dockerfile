FROM python:3.11-slim

WORKDIR /app

# Evitar prompts y asegurar pip actualizado
ENV DEBIAN_FRONTEND=noninteractive
RUN pip install --no-cache-dir --upgrade pip

# Copiar fichero de dependencias e instalarlas
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt || true

# Copiar código ML
COPY . /app

EXPOSE 8000

# Mantener contenedor en ejecución (servicio ML pendiente de implementación HTTP)
CMD ["tail", "-f", "/dev/null"]
