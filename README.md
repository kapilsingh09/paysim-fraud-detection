# Fraud Detection System - PaySim Dataset

## Overview

FraudGuard AI is a machine learning-based fraud detection system that analyzes financial transactions to identify potential fraudulent activities. The system uses a pre-trained classification model to assess transaction risk and provide real-time fraud predictions with confidence scores.

## Technologies Used

### Backend
- **Flask** - Web framework for REST API endpoints
- **Pandas** - Data manipulation and feature engineering
- **Joblib** - Model and feature serialization/deserialization
- **Python 3** - Core programming language

### Frontend
- **HTML5** - Markup structure
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Font Awesome** - Icon library for UI elements
- **Vanilla JavaScript** - Client-side form handling and API communication

### Machine Learning
- **Scikit-learn** - Model training (XGBoost, Random Forest, or similar)
- **PaySim Dataset** - Simulated financial transaction data for training

## Project Structure

```
Fraud_detection_paysim/
├── flask_server.py              # Main Flask application
├── fraud_detection_PaySim.ipynb  # Jupyter notebook with model training pipeline
├── model.pkl                     # Pre-trained model (binary classification)
├── model_features.pkl            # Feature column names for alignment
├── templates/
│   └── index.html               # Web interface
└── README.md                    # Project documentation
```

## System Architecture & Data Flow

### 1. Model Training Phase (Jupyter Notebook)
```
Raw PaySim Data
    |
    v
Data Preprocessing & Cleaning
    |
    v
Feature Engineering (8+ derived features)
    |
    v
One-hot Encoding (Transaction Type)
    |
    v
Model Training (XGBoost/Random Forest)
    |
    v
Save: model.pkl + model_features.pkl
```

### 2. Real-Time Prediction Flow
```
User Input (HTML Form)
    |
    v
JavaScript POST to /predict endpoint
    |
    v
Flask receives transaction data
    |
    v
Feature Engineering Pipeline (same as training)
    |
    v
Column Alignment (ensure feature consistency)
    |
    v
Model Prediction
    |
    v
Return: Fraud Classification + Risk Score
    |
    v
Frontend displays results
```

## Features Implemented

### Feature Engineering (8 Derived Features)
1. **orig_zero_after** - Whether origin account balance becomes zero
2. **orig_diff** - Balance difference validation for origin account
3. **dest_diff** - Balance difference validation for destination account
4. **dest_zero_before** - Whether destination account had zero balance initially
5. **amount_balance_ratio** - Transaction amount relative to origin balance
6. **account_drained** - Indicator if account is completely drained
7. **day** - Day component from simulation step
8. **hour** - Hour component from simulation step

### Input Parameters
- **Step** - Time step in the simulation (hour)
- **Type** - Transaction type (TRANSFER, CASH_OUT, PAYMENT, DEBIT, CASH_IN)
- **Amount** - Transaction amount in currency
- **oldbalanceOrg** - Original balance before transaction
- **newbalanceOrig** - Balance after transaction (origin)
- **oldbalanceDest** - Original balance (destination)
- **newbalanceDest** - Balance after transaction (destination)

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip package manager

### Step 1: Install Dependencies
```bash
pip install -r requriment.txt
```

Note: Update the requirements.txt file to include:
```
flask
pandas
joblib
scikit-learn
```

### Step 2: Model Files
Ensure these files exist in the project directory:
- `model.pkl` - Trained model file
- `model_features.pkl` - Feature column names list

### Step 3: Run the Application
```bash
python flask_server.py
```

The application will start on `http://localhost:5000` (default Flask port).

## API Endpoints

### 1. GET `/`
Returns the web interface (index.html)

### 2. POST `/predict`
**Request Body (Form Data):**
```
step: integer (1-744)
type: string (TRANSFER, CASH_OUT, PAYMENT, DEBIT, CASH_IN)
amount: float
oldbalanceOrg: float
newbalanceOrig: float
oldbalanceDest: float
newbalanceDest: float
```

**Response (JSON):**
```json
{
  "success": true,
  "is_fraud": false,
  "risk_score": 23.45
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message details"
}
```

## How the Model Makes Predictions

1. **Data Validation** - Ensures all input parameters are correctly typed
2. **Feature Engineering** - Creates derived features matching training data
3. **Type Encoding** - One-hot encodes transaction type (TRANSFER, CASH_OUT, etc.)
4. **Column Alignment** - Ensures input dataframe matches training feature order
5. **Missing Features** - Adds zero-valued columns for any missing types
6. **Type Conversion** - Converts data types to match training (int32, float32)
7. **Prediction** - Model returns binary classification + probability
8. **Result Formatting** - Outputs fraud flag and risk percentage (0-100%)

## How to Extend This Project

### 1. Add More Features
- Modify the `predict_fraud()` function in flask_server.py
- Add new feature engineering logic before the `drop` operation
- Retrain model with new features in the Jupyter notebook
- Update `model_features.pkl` with new column names

Example:
```python
df_processed['velocity_check'] = df_processed['amount'] / df_processed['step']
df_processed['large_transaction_flag'] = (df_processed['amount'] > 100000).astype(int)
```

### 2. Improve Model Performance
- Use different algorithms (Gradient Boosting, Neural Networks)
- Apply feature scaling and normalization
- Implement cross-validation and hyperparameter tuning
- Handle class imbalance with SMOTE or weighted classes
- Add ensemble methods combining multiple models

### 3. Add User Authentication
- Implement login/logout functionality
- Store prediction history per user
- Add role-based access control

Example addition to flask_server.py:
```python
from flask_login import LoginManager, login_required

@app.route('/predict', methods=['POST'])
@login_required
def predict():
    # Save prediction to database with user_id
    pass
```

### 4. Database Integration
- Store predictions in SQLite, PostgreSQL, or MongoDB
- Track prediction history
- Generate analytics and reports
- Build audit logs for compliance

Example:
```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
prediction = Prediction(user_id=user_id, transaction_data=input_data, 
                       is_fraud=is_fraud, risk_score=prob)
db.session.add(prediction)
db.session.commit()
```

### 5. Real-Time Monitoring Dashboard
- Add visualization of fraud statistics
- Display prediction trends over time
- Show model performance metrics
- Create alert system for high-risk transactions

Technologies: Chart.js, D3.js, or Plotly

### 6. Advanced Features
- **Batch Processing** - Accept CSV files for bulk predictions
- **Model Explainability** - Use SHAP or LIME to explain predictions
- **Model Versioning** - Track and switch between different model versions
- **API Rate Limiting** - Prevent abuse with request throttling
- **Caching** - Cache repeated predictions for performance

Example batch endpoint:
```python
@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    file = request.files['file']
    df = pd.read_csv(file)
    predictions = df.apply(lambda row: predict_fraud(row, model), axis=1)
    return jsonify(predictions.tolist())
```

### 7. Model Retraining Pipeline
- Implement automated model retraining on new data
- Add scheduled retraining jobs (weekly/monthly)
- Implement A/B testing for new models
- Monitor model drift and performance degradation

### 8. Deployment Enhancements
- Containerize with Docker for consistent environments
- Deploy to cloud platforms (AWS, GCP, Azure)
- Implement CI/CD pipelines
- Add logging and monitoring

## Docker Setup & Deployment

### Prerequisites
- Docker installed on your system ([Install Docker](https://docs.docker.com/get-docker/))

### Project Structure for Docker
```
Fraud_detection_paysim/
├── Dockerfile                   # Docker configuration file
├── flask_server.py              # Main Flask application
├── fraud_detection_PaySim.ipynb  # Jupyter notebook with model training pipeline
├── model.pkl                     # Pre-trained model (binary classification)
├── model_features.pkl            # Feature column names for alignment
├── requriment.txt                # Python dependencies
├── templates/
│   └── index.html               # Web interface
└── README.md                    # Project documentation
```

### Building the Docker Image

Navigate to the project directory and build the Docker image:

```bash
docker build -t fraud-detection:latest .
```

**Build Output:**
- Image name: `fraud-detection`
- Tag: `latest`
- Size: ~800-900 MB (includes Python 3.10 slim base)

### Running the Docker Container

#### Option 1: Basic Run
```bash
docker run -p 5000:5000 fraud-detection:latest
```

#### Option 2: Detached Mode (Background)
```bash
docker run -d -p 5000:5000 --name fraud-app fraud-detection:latest
```

#### Option 3: With Volume Mounting (for development)
```bash
docker run -p 5000:5000 -v $(pwd):/app fraud-detection:latest
```

After running, access the application at: **http://localhost:5000**

### Verifying the Container

Check if the container is running:
```bash
docker ps
```

View container logs:
```bash
docker logs fraud-app
```

### Stopping & Removing the Container

Stop the container:
```bash
docker stop fraud-app
```

Remove the container:
```bash
docker rm fraud-app
```

### Dockerfile Details

The Dockerfile includes:
- **Base Image:** `python:3.10-slim` (lightweight Python environment)
- **Working Directory:** `/app` (all files copied here)
- **Dependencies Installation:** Installs system dependencies and Python packages
- **Port Exposure:** Port 5000 for Flask application
- **Environment Variables:** 
  - `FLASK_APP=flask_server.py`
  - `FLASK_ENV=production`
- **Entry Point:** Runs `python flask_server.py` on container start

### Troubleshooting Docker Issues

**Issue:** "Cannot find model.pkl or model_features.pkl"
- **Solution:** Ensure both files are in the project directory before building
- Verify with: `ls model.pkl model_features.pkl`

**Issue:** "Port 5000 already in use"
- **Solution:** Map to a different port
```bash
docker run -p 8000:5000 fraud-detection:latest
# Access at http://localhost:8000
```

**Issue:** "ModuleNotFoundError"
- **Solution:** Rebuild the image if requirements.txt was updated
```bash
docker build --no-cache -t fraud-detection:latest .
```

**Issue:** Container exits immediately
- **Solution:** Check logs for errors
```bash
docker logs fraud-app
```

### Docker Compose (Optional)

For multi-container setups or easier management, create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fraud-detection:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./model.pkl:/app/model.pkl:ro
      - ./model_features.pkl:/app/model_features.pkl:ro
    restart: unless-stopped
```

Run with Docker Compose:
```bash
docker-compose up -d
```

Stop with Docker Compose:
```bash
docker-compose down
```

### Deployment to Cloud Platforms

#### AWS (ECS or EC2)
1. Push image to Amazon ECR
2. Create ECS task definition
3. Launch service with auto-scaling

#### Google Cloud (Cloud Run)
```bash
docker tag fraud-detection:latest gcr.io/PROJECT_ID/fraud-detection:latest
docker push gcr.io/PROJECT_ID/fraud-detection:latest
gcloud run deploy fraud-detection --image gcr.io/PROJECT_ID/fraud-detection:latest
```

#### Azure (Container Instances)
```bash
docker tag fraud-detection:latest yourregistry.azurecr.io/fraud-detection:latest
docker push yourregistry.azurecr.io/fraud-detection:latest
```

## Performance Considerations

- Model uses efficient data type conversions (int8, int32, float32)
- Feature engineering is optimized for single-row predictions
- Column alignment uses dynamic feature list loading
- Error handling prevents crashes from invalid input

## Security Recommendations

1. Validate all user inputs
2. Implement HTTPS/SSL encryption
3. Add CORS configuration for cross-origin requests
4. Rate limit API endpoints
5. Store sensitive model files securely
6. Implement authentication for production

## Troubleshooting

**Model Loading Error:**
- Ensure `model.pkl` and `model_features.pkl` exist in project directory
- Verify files aren't corrupted (regenerate from notebook if needed)

**Prediction Errors:**
- Check all form inputs are valid numbers
- Verify transaction type is from the allowed list
- Ensure balance values are non-negative

**Port Already in Use:**
```bash
python flask_server.py --port 5001
```

## Future Improvements

1. Implement real-time data pipeline for continuous learning
2. Add multi-model ensemble for better accuracy
3. Create mobile app for on-the-go fraud detection
4. Integrate with banking systems for live transaction monitoring
5. Implement federated learning for privacy-preserving predictions
6. Add explainable AI features for regulatory compliance

## License

No license

## Contact & Support

For questions or issues, please contact the project maintainer.
You can create issues ..
---

**Last Updated:** 2026-06-22
**Version:** 1.0.0
