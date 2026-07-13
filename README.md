# 🌍 Smart AQI Prediction System

An end-to-end Machine Learning web application that predicts the **Air Quality Index (AQI)** using environmental and weather parameters and provides **health recommendations** based on the predicted air quality.

The project uses **Gradient Boosting Regressor** for AQI prediction and is built with a **React + Vite frontend** and a **Flask backend**, deployed using **Vercel** and **Render**.

---

## 🚀 Live Demo

### 🌐 Frontend (Vercel)

smart-aqi-prediction-system.vercel.app

### ⚙️ Backend API (Render)

https://smart-aqi-prediction-system.onrender.com

###  Health Check

https://smart-aqi-prediction-system.onrender.com/health

---

# 📸 Screenshots

### Home Page

<img src="screenshots/home.png" width="800">

### Prediction Result

<img src="screenshots/prediction.png" width="800">

---

# ✨ Features

- 🌍 Predict Air Quality Index (AQI)
- 🤖 Machine Learning based prediction
- 📊 Uses real environmental parameters
- 💚 Health recommendations based on AQI
- 📈 Feature Importance Visualization
- 📱 Responsive UI
- ⚡ Fast Flask REST API
- ☁️ Cloud deployment using Render & Vercel

---

# 🧠 Machine Learning

The model is trained using multiple regression algorithms:

- Random Forest Regressor
- Gradient Boosting Regressor ✅ (Best Model)
- XGBoost Regressor (Evaluation)

The best-performing model is automatically selected based on **R² Score**.

### Input Features

- Temperature
- Humidity
- Wind Speed
- PM2.5
- PM10
- NO₂
- SO₂
- CO
- O₃

### Output

- Predicted AQI
- AQI Category
- Health Recommendation
- Dominant Pollutant Information

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- Axios
- CSS

## Backend

- Flask
- Flask-CORS
- Scikit-learn
- Pandas
- NumPy
- Joblib

## Machine Learning

- Gradient Boosting Regressor
- Random Forest Regressor
- XGBoost (Model Comparison)
- StandardScaler

## Deployment

- Vercel (Frontend)
- Render (Backend)

---

# 📂 Project Structure

```
Smart-AQI-System/
│
├── backend/
│   ├── app.py
│   ├── model.pkl
│   ├── scaler.pkl
│   ├── model_metadata.json
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   └── aqi_dataset.csv
│
├── notebooks/
│   └── train_model.py
│
├── outputs/
│   ├── eda_overview.png
│   └── feature_importance.png
│
└── README.md
```

---

# 📊 Model Performance

| Model | MAE | RMSE | R² Score |
|------|------:|------:|------:|
| Random Forest | 4.1016 | 5.9651 | 0.9968 |
| **Gradient Boosting** ✅ | **4.2946** | **5.8854** | **0.9968** |
| XGBoost | 4.7720 | 7.9857 | 0.9942 |

### Feature Importance

| Feature | Importance |
|---------|-----------:|
| PM2.5 | 0.9465 |
| PM10 | 0.0372 |
| O₃ | 0.0150 |
| CO | 0.0007 |
| NO₂ | 0.0002 |
| Wind Speed | 0.0001 |
| Humidity | 0.0001 |
| Temperature | 0.0001 |
| SO₂ | 0.0000 |

---

# 🔌 API Endpoints

## Base URL

```
https://smart-aqi-prediction-system.onrender.com
```

---

### Predict AQI

```
POST /predict
```

Sample Request

```json
{
  "temperature": 30,
  "humidity": 60,
  "wind_speed": 5,
  "pm25": 80,
  "pm10": 120,
  "no2": 40,
  "so2": 20,
  "co": 0.8,
  "o3": 50
}
```

---

### Get Model Metadata

```
GET /metadata
```

---

### Health Check

```
GET /health
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/riasingh1234/smart-aqi-prediction-system.git
cd smart-aqi-prediction-system
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

python app.py
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Train the Model

```bash
cd notebooks

python train_model.py
```

This generates:

- model.pkl
- scaler.pkl
- model_metadata.json

---

# 📈 Future Improvements

- Live AQI data integration using public APIs
- AQI forecasting for future dates
- Interactive map visualization
- User authentication
- Historical AQI trends
- Email/SMS health alerts
- Mobile application

---

# 👩‍💻 Author

**Ria Singh**

GitHub: https://github.com/riasingh1234

# ⭐ Support

If you found this project helpful:

⭐ Star this repository

🍴 Fork it

💡 Contribute improvements

---

## 📜 License

This project is licensed under the MIT License.
