# INRPredict – Warfarin Dosage Prediction Web App

Based on: *Amruthlal et al., Indian Heart Journal 74 (2022) 469–473*

## Project Structure

```
warfarin-app/
├── backend/
│   ├── src/
│   │   └── app.py          ← Flask API + SVR model
│   ├── requirements.txt
│   └── render.yaml         ← Render deployment config
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── pages/
│   │       ├── PredictPage.jsx
│   │       ├── ResultPage.jsx
│   │       └── AboutPage.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── netlify.toml            ← Netlify deployment config
```

## Local Development

### Backend (Flask API)
```bash
cd backend
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
python src/app.py
# Runs on http://localhost:5000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## Deployment
- **Backend**: Render.com (free tier)
- **Frontend**: Netlify (free tier)

See full step-by-step guide in `docs/DEPLOYMENT_GUIDE.md`
