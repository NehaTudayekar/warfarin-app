# 🚀 Complete Deployment Guide – INRPredict
## GitHub → Render (Backend) + Netlify (Frontend)

---

## ✅ PREREQUISITES (Install These First)

1. **Git** → https://git-scm.com/download/win
   - During install: check "Add to PATH"
   - Verify: open CMD → type `git --version`

2. **Node.js (v20)** → https://nodejs.org/en (download LTS)
   - Verify: `node --version` and `npm --version`

3. **Python 3.11** → https://www.python.org/downloads/
   - During install: ✅ check "Add Python to PATH"
   - Verify: `python --version`

4. **VS Code** → https://code.visualstudio.com/

---

## PHASE 1: TEST LOCALLY (Do This Before Deploying)

### Step 1 – Open your project folder in VS Code
```
File → Open Folder → select warfarin-app folder
```

### Step 2 – Test the Backend
Open a NEW terminal in VS Code (Ctrl+`) and run:
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python src/app.py
```
You should see: `Running on http://0.0.0.0:5000`
✅ Keep this terminal running. Open a SECOND terminal.

### Step 3 – Test the Frontend
In the second terminal:
```cmd
cd frontend
npm install
npm run dev
```
Open browser → http://localhost:3000
✅ You should see the INRPredict app working locally.

---

## PHASE 2: PUSH TO GITHUB

### Step 4 – Create a GitHub Account
1. Go to https://github.com
2. Click "Sign up"
3. Enter: username, email, password
4. Verify email → click link in inbox

### Step 5 – Create a New Repository
1. Click the ➕ button (top right) → "New repository"
2. Repository name: `warfarin-app`
3. Description: `Warfarin dosage prediction web app`
4. Set to: **Public**
5. ❌ Do NOT check "Initialize with README" (we already have one)
6. Click **"Create repository"**

### Step 6 – Configure Git (Run Once on Your PC)
Open CMD (not VS Code terminal) and run:
```cmd
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```
Replace with your actual name and the email used for GitHub.

### Step 7 – Initialize and Push Your Code
In CMD, navigate to the project folder:
```cmd
cd C:\path\to\warfarin-app
```
(Replace `C:\path\to\` with your actual path, e.g. `C:\Users\YourName\Desktop\warfarin-app`)

Then run these commands ONE BY ONE:
```cmd
git init
git add .
git commit -m "Initial commit: warfarin dosage prediction app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/warfarin-app.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

⚠️ It will ask for GitHub username & password.
For password: use a **Personal Access Token** (not your GitHub password):
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → check "repo" scope → Generate
3. Copy the token and paste it as the password

✅ Refresh GitHub page → you should see your files uploaded!

---

## PHASE 3: DEPLOY BACKEND ON RENDER (Free, Always Live)

Render keeps your backend running 24/7 even when your laptop is off.

### Step 8 – Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your **GitHub account** (recommended)

### Step 9 – Deploy the Flask API
1. In Render dashboard → click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find `warfarin-app` → click **"Connect"**

### Step 10 – Configure the Web Service
Fill in these exact settings:

| Field | Value |
|-------|-------|
| **Name** | `warfarin-api` |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn src.app:app --bind 0.0.0.0:$PORT --workers 2` |
| **Instance Type** | `Free` |

5. Click **"Create Web Service"**

### Step 11 – Wait for Deployment
- Takes 3–5 minutes first time
- Watch the logs – you'll see "Your service is live"
- Copy the URL shown: `https://warfarin-api.onrender.com`
  (yours will have a different subdomain)

✅ Test it: open `https://your-url.onrender.com` in browser → you should see:
```json
{"message": "Warfarin Dosage Prediction API", "status": "ok"}
```

---

## PHASE 4: DEPLOY FRONTEND ON NETLIFY (Free, Always Live)

### Step 12 – Create Netlify Account
1. Go to https://www.netlify.com
2. Click "Sign up" → sign up with **GitHub**

### Step 13 – Update Frontend API URL (IMPORTANT!)
Before deploying, update the environment variable with your Render URL:

In VS Code, open `frontend/.env` and change:
```
VITE_API_URL=https://your-actual-render-url.onrender.com
```
Save the file, then:
```cmd
git add .
git commit -m "Update API URL for production"
git push
```

### Step 14 – Deploy on Netlify
1. Netlify dashboard → click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Authorize Netlify → find `warfarin-app` → click it

### Step 15 – Configure Build Settings

| Field | Value |
|-------|-------|
| **Branch** | `main` |
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` |

Click **"Deploy site"**

### Step 16 – Add Environment Variable in Netlify
1. Site settings → **Environment variables**
2. Click "Add a variable"
3. Key: `VITE_API_URL`
4. Value: `https://your-render-url.onrender.com`
5. Save → **Trigger deploy** (Deploys → Trigger deploy → Deploy site)

### Step 17 – Get Your Live URL
Netlify will give you a URL like: `https://amazing-name-123456.netlify.app`

You can customize it:
1. Site settings → Domain management → Options → Edit site name
2. Change to something like `inrpredict` → `https://inrpredict.netlify.app`

---

## PHASE 5: VERIFY EVERYTHING IS LIVE

### Test Checklist
- [ ] Open your Netlify URL in browser
- [ ] The form loads correctly
- [ ] Enter test values: Age=55, Gender=Male, Old INR=2.8, New INR=2.9, Dose=3, MVR, Warfarin
- [ ] Click "Predict Dosage"
- [ ] See the weekly schedule result
- [ ] Close your laptop → open on phone → still works ✅

---

## PHASE 6: AUTOMATIC UPDATES (Future Changes)

When you make changes to your code:
```cmd
cd C:\path\to\warfarin-app
git add .
git commit -m "Describe what you changed"
git push
```
✅ Both Render and Netlify automatically redeploy when you push to GitHub!
You never need to manually deploy again.

---

## ⚠️ RENDER FREE TIER NOTE

Render's free tier **spins down** after 15 minutes of inactivity.
The FIRST request after idle takes 30–60 seconds (cold start).

**Fix (keep it always warm):** Use UptimeRobot (free):
1. Go to https://uptimerobot.com → Sign up free
2. Add New Monitor → HTTP(S)
3. URL: `https://your-render-url.onrender.com`
4. Monitoring Interval: **5 minutes**
5. Create Monitor

This pings your server every 5 minutes, keeping it warm and responsive.

---

## 📋 QUICK REFERENCE: Your Live URLs

After deployment, save these:
- **Frontend (user-facing):** `https://YOUR_NAME.netlify.app`
- **Backend API:** `https://warfarin-api.onrender.com`
- **GitHub repo:** `https://github.com/YOUR_USERNAME/warfarin-app`

---

## 🔧 TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Render build fails | Check that `backend/requirements.txt` exists |
| Netlify shows blank page | Check Environment variable `VITE_API_URL` is set |
| "Cannot reach server" error | Add UptimeRobot to prevent cold starts |
| Git push rejected | Run `git pull origin main --rebase` first |
| Python not found | Re-install Python, check "Add to PATH" during install |
| CORS error in browser | Already handled in `app.py` with flask-cors |

---

## 📁 USING YOUR REAL DATASET

When you have the actual `INR_dataset_v1.csv`:

1. Place it in `backend/src/INR_dataset_v1.csv`
2. In `app.py`, replace the `generate_training_data()` call with:

```python
import pandas as pd

def load_real_data():
    df = pd.read_csv('src/INR_dataset_v1.csv')
    # Map your column names:
    X = df[['age', 'gender_male', 'gender_female', 
            'Previous_INR', 'Current_INR', 'old_dosage',
            'proc_mvr', 'proc_avr', 'proc_dvr', 'proc_af']].values
    y = df['new_dosage'].values
    return X, y
```

3. Commit and push → Render auto-redeploys with real data.
