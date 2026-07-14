# PaySim Fraud Detection

A comprehensive machine learning project for detecting fraudulent transactions in a mobile money transfer system (PaySim).

## 🚀 Features

- **End-to-End Solution**: From data preprocessing to model deployment
- **Advanced Machine Learning**: Implements Random Forest, XGBoost, and Logistic Regression
- **Interactive Dashboard**: Real-time fraud detection with visualization
- **Containerized Deployment**: Ready to run with Docker

## 📋 Prerequisites

- **Python** 3.8 or higher
- **Docker** (optional, for containerized deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Fraud_detection_paysim
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv .van
   .\.van\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## 🏃 Usage

### Run the Application

```bash
python flask_server.py
```

Access the dashboard at: [http://127.0.0.1:5000](http://127.0.0.1:5000)

### Docker Deployment

Build the Docker image:
```bash
docker build -t paysim-fraud .
```

Run the container:
```bash
docker run -p 5000:5000 paysim-fraud
```

### Train the Model

To retrain the machine learning model with the full dataset:
```bash
python train_model.py
```

## 📊 Features

### Interactive Dashboard
- **Transaction Simulation**: Test the system with custom transaction data
- **Real-time Detection**: Instant fraud probability scores
- **Visualization**: Visual comparison of fraudulent vs. legitimate transactions

### Machine Learning Models
- **Random Forest**: Optimized with GridSearchCV for best performance
- **XGBoost**: Gradient boosting for high accuracy
- **Logistic Regression**: Baseline model for comparison

## 📂 Project Structure

```
Fraud_detection_paysim/
├── app/
│   ├── static/
│   │   └── css/             # CSS stylesheets
│   ├── templates/
│   │   └── index.html       # Main dashboard template
│   ├── main.py              # Flask application
│   └── ml_model.py          # Machine learning model
├── data/
│   └── PS_2017421_2017521_small.csv
│                              # Dataset (approx. 500k transactions)
├── .venv/
│   └── ...                  # Virtual environment
├── .gitignore
├── Dockerfile
├── README.md
└── requirements.txt
```

## Dataset

The project uses the **PaySim dataset**, a collection of simulated mobile money transactions.

- **File**: `data/PS_2017421_2017521_small.csv`
- **Size**: ~500,000 transactions
- **Features**: 10 features including transaction type, amount, and customer details
- **Target**: `isFraud` (binary classification)

## 💻 Development

### Adding New Features

To add new features to the model:

1. **Update data preprocessing** in `ml_model.py`
2. **Retrain the model** using `python train_model.py`
3. **Update the dashboard** in `templates/index.html` to display new results

### Testing

To run the application tests:
```bash
python -m unittest test_*.py
```

## 🔐 Security

- **Do not commit** `.venv` or `__pycache__` directories
- **Credentials**: Keep sensitive information out of version control

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/AmazingFeature`
2. Commit your changes: `git commit -m 'Add some AmazingFeature'`
3. Push to the branch: `git push origin feature/AmazingFeature`
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For support or questions:
- **Email**: [EMAIL_ADDRESS]`
- **GitHub**: [@kapilsingh09](https://github.com/kapilsingh09)

---

*Built with ❤️ using Python, Flask, and Machine Learning*