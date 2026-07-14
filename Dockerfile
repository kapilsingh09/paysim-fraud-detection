FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requriment.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY flask_server.py .
COPY fraud_model.pkl .
COPY feature_columns.pkl .
COPY templates/ ./templates/

EXPOSE 5000

ENV FLASK_APP=flask_server.py
ENV FLASK_ENV=production

# Run with flask to bind to 0.0.0.0 so it's accessible from outside the container
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
