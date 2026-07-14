import os
from pathlib import Path
import joblib
import pandas as pd
from flask import Flask, request, render_template, jsonify

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / 'fraud_model.pkl'
FEATURE_COLUMNS_PATH = BASE_DIR / 'feature_columns.pkl'

model = None
final_columns = []

try:
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
    else:
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    if FEATURE_COLUMNS_PATH.exists():
        final_columns = joblib.load(FEATURE_COLUMNS_PATH)
    else:
        raise FileNotFoundError(f"Feature columns file not found: {FEATURE_COLUMNS_PATH}")
except Exception as e:
    print(f"Error loading model files: {e}")
    model = None
    final_columns = []

def predict_fraud(new_data_df, model):
    df_processed = new_data_df.copy()

    # Feature Engineering
    df_processed['orig_zero_after'] = (df_processed['newbalanceOrig'] == 0).astype(int)
    df_processed['orig_diff'] = (df_processed['oldbalanceOrg'] - df_processed['amount']) - df_processed['newbalanceOrig']
    df_processed['dest_diff'] = (df_processed['oldbalanceDest'] + df_processed['amount']) - df_processed['newbalanceDest']
    df_processed['dest_zero_before'] = (df_processed['oldbalanceDest'] == 0).astype(int)
    df_processed['amount_balance_ratio'] = df_processed['amount'] / (df_processed['oldbalanceOrg'] + 1)
    df_processed['account_drained'] = ((df_processed['newbalanceOrig'] == 0) & (df_processed['oldbalanceOrg'] > 0)).astype(int)
    df_processed['day'] = df_processed['step'] // 24
    df_processed['hour'] = df_processed['step'] % 24

    df_processed.drop(
        ['step', 'nameOrig', 'nameDest', 'isFlaggedFraud'],
        axis=1,
        inplace=True,
        errors='ignore'
    )

    df_processed = pd.get_dummies(df_processed, columns=['type'], drop_first=True)

    expected_type_cols = ['type_CASH_OUT', 'type_DEBIT', 'type_PAYMENT', 'type_TRANSFER']
    for col in expected_type_cols:
        if col not in df_processed.columns:
            df_processed[col] = 0

    bool_cols_processed = df_processed.select_dtypes(include='bool').columns
    df_processed[bool_cols_processed] = df_processed[bool_cols_processed].astype('int8')

    float_cols_processed = df_processed.select_dtypes(include='float64').columns
    int_cols_processed = df_processed.select_dtypes(include='int64').columns
    df_processed[float_cols_processed] = df_processed[float_cols_processed].astype('float32')
    df_processed[int_cols_processed] = df_processed[int_cols_processed].astype('int32')

    # Align columns using the dynamically loaded feature list
    missing_cols = set(final_columns) - set(df_processed.columns)
    for c in missing_cols:
        df_processed[c] = 0

    df_processed = df_processed[final_columns]

    predictions = model.predict(df_processed)
    probabilities = model.predict_proba(df_processed)[:, 1]

    return predictions[0], probabilities[0]

@app.route('/')
def home():
    """Render the main dashboard page."""
    return render_template('alternative_index2.html')

@app.route('/predict', methods=['POST'])
def predict():
    """
    API endpoint to handle fraud prediction requests.
    Expects form data from the client, processes it, and returns the prediction result.
    """
    if model is None:
        return jsonify({'success': False, 'error': 'Model is not available. Check the project files.'}), 500

    try:
        # Extract inputs from form and parse types correctly
        input_data = {
            'step': int(request.form.get('step', 1)),
            'type': request.form.get('type'),
            'amount': float(request.form.get('amount', 0)),
            'oldbalanceOrg': float(request.form.get('oldbalanceOrg', 0)),
            'newbalanceOrig': float(request.form.get('newbalanceOrig', 0)),
            'oldbalanceDest': float(request.form.get('oldbalanceDest', 0)),
            'newbalanceDest': float(request.form.get('newbalanceDest', 0)),
        }
        
        # Convert dictionary to a Single-Row DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Run prediction pipeline
        pred, prob = predict_fraud(input_df, model)
        
        # Format results for display
        is_fraud = bool(pred == 1)
        risk_percentage = round(float(prob) * 100, 2)
        
        return jsonify({
            'success': True,
            'is_fraud': is_fraud,
            'risk_score': risk_percentage
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)