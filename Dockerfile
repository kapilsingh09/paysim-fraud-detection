# Use official Python runtime as base image
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requriment.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY flask_server.py .
COPY model.pkl .
COPY model_features.pkl .
COPY templates/ ./templates/

EXPOSE 5000

ENV FLASK_APP=flask_server.py
ENV FLASK_ENV=production
CMD ["python", "flask_server.py"]
