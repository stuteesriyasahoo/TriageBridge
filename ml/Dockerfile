# =====================================================================
# TriageBridge Containerized ML Urgency Prediction Microservice
# =====================================================================
# Usage:
#   docker build -t triagebridge-ml-service -f ml/Dockerfile ml/
#   docker run -d -p 8001:8001 -e TRIAGE_ML_SERVICE_SECRET=your_secret triagebridge-ml-service
# =====================================================================

FROM python:3.11-slim

WORKDIR /app

# Ensure security updates and clean environment
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model artifacts and service code
COPY models/ ./models/
COPY service.py .

# Create non-root user for security
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Start authenticated HTTP microservice
CMD ["python", "service.py", "--serve", "--port", "8001"]
