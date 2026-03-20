from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle, os, warnings
warnings.filterwarnings('ignore')
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

app = Flask(__name__)
CORS(app, origins=["*"])

MODEL_DIR   = os.path.dirname(os.path.abspath(__file__))
SVR_PATH    = os.path.join(MODEL_DIR, "model_svr.pkl")
RF_PATH     = os.path.join(MODEL_DIR, "model_rf.pkl")
GB_PATH     = os.path.join(MODEL_DIR, "model_gb.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

DIAGNOSIS_MAP = {
    'valve replacement':0,'valve repl':0,'mvr':0,'mitral valve replacement':0,
    'avr':1,'aortic valve replacement':1,
    'dvr':2,'double valve replacement':2,
    'af':3,'atrial fibrillation':3,
    'dvt':4,'deep vein thrombosis':4,
}
SYMPTOMS_MAP = {'none':0, 'clot risk':1, 'bleeding':2}
GENDER_MAP   = {'male':0, 'female':1}


def generate_dataset(n=3000):
    """
    Realistic dataset matching INR_dataset_v1 columns.
    Features: age, gender, prev_inr, curr_inr, target_low, target_high,
              old_dose, diagnosis, symptoms
    Target: new daily dose (mg)
    """
    np.random.seed(42)
    ages       = np.random.randint(12, 94, n).astype(float)
    genders    = np.random.randint(0, 2, n).astype(float)
    diagnosis  = np.random.randint(0, 5, n).astype(float)
    symptoms   = np.random.randint(0, 3, n).astype(float)
    target_low = np.random.choice([2.0, 2.5], n).astype(float)
    target_high= np.where(target_low == 2.0, 3.0, 3.5)
    prev_inr   = np.random.uniform(1.7, 5.5, n)
    old_dose   = np.random.uniform(1.0, 10.0, n)
    curr_inr   = np.clip(prev_inr + np.random.normal(0, 0.5, n), 1.5, 6.0)

    target_mid = (target_low + target_high) / 2.0
    inr_error  = curr_inr - target_mid
    sensitivity= np.random.uniform(0.7, 1.3, n)
    adjustment = -inr_error * sensitivity * np.random.uniform(0.6, 1.0, n)

    age_factor     = np.where(ages > 65, -0.4, np.where(ages < 30, 0.25, 0.0))
    diag_factor    = np.array([0.0, 0.15, 0.2, -0.15, 0.3])[diagnosis.astype(int)]
    symptom_factor = np.array([0.0, 0.5, -0.6])[symptoms.astype(int)]
    gender_factor  = np.where(genders == 1, -0.2, 0.1)
    noise          = np.random.normal(0, 0.2, n)

    new_dose = np.clip(
        old_dose + adjustment + age_factor + diag_factor + symptom_factor + gender_factor + noise,
        0.5, 15.0
    )

    X = np.column_stack([ages, genders, prev_inr, curr_inr,
                         target_low, target_high, old_dose, diagnosis, symptoms])
    return X, new_dose


def train_all():
    print("\n" + "="*55)
    print("  Training Ensemble: SVR + Random Forest + GradBoost")
    print("="*55)

    X, y = generate_dataset(3000)
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.30, random_state=42)

    sc = StandardScaler()
    Xtr_s = sc.fit_transform(Xtr)
    Xte_s = sc.transform(Xte)

    print("[1/3] SVR  (linear kernel — paper model)...")
    svr = SVR(kernel='linear', C=1.5, epsilon=0.08)
    svr.fit(Xtr_s, ytr)
    p1 = svr.predict(Xte_s)
    print(f"      R²={r2_score(yte,p1):.4f}  MSE={mean_squared_error(yte,p1):.4f}")

    print("[2/3] Random Forest (200 trees)...")
    rf = RandomForestRegressor(n_estimators=200, max_depth=14,
                               min_samples_split=3, random_state=42, n_jobs=-1)
    rf.fit(Xtr_s, ytr)
    p2 = rf.predict(Xte_s)
    print(f"      R²={r2_score(yte,p2):.4f}  MSE={mean_squared_error(yte,p2):.4f}")

    print("[3/3] Gradient Boosting (LSTM-equivalent for tabular)...")
    gb = GradientBoostingRegressor(n_estimators=300, learning_rate=0.05,
                                   max_depth=4, subsample=0.8, random_state=42)
    gb.fit(Xtr_s, ytr)
    p3 = gb.predict(Xte_s)
    print(f"      R²={r2_score(yte,p3):.4f}  MSE={mean_squared_error(yte,p3):.4f}")

    ens = 0.40*p1 + 0.35*p2 + 0.25*p3
    print(f"\n  [★] Ensemble → R²={r2_score(yte,ens):.4f}  MSE={mean_squared_error(yte,ens):.4f}")
    print("="*55 + "\n")

    for path, obj in [(SVR_PATH,svr),(RF_PATH,rf),(GB_PATH,gb),(SCALER_PATH,sc)]:
        with open(path,'wb') as f: pickle.dump(obj, f)

    return svr, rf, gb, sc


def load_models():
    if all(os.path.exists(p) for p in [SVR_PATH,RF_PATH,GB_PATH,SCALER_PATH]):
        with open(SVR_PATH,'rb')    as f: svr = pickle.load(f)
        with open(RF_PATH,'rb')     as f: rf  = pickle.load(f)
        with open(GB_PATH,'rb')     as f: gb  = pickle.load(f)
        with open(SCALER_PATH,'rb') as f: sc  = pickle.load(f)
        print("Loaded saved ensemble models.")
        return svr, rf, gb, sc
    return train_all()


svr_m, rf_m, gb_m, scaler = load_models()


def predict_dose(age, gender, prev_inr, curr_inr,
                 target_low, target_high, old_dose, diagnosis, symptoms):
    g = GENDER_MAP.get(gender.lower(), 0)
    d = DIAGNOSIS_MAP.get(diagnosis.lower(), 0)
    s = SYMPTOMS_MAP.get(symptoms.lower(), 0)
    X = np.array([[age, g, prev_inr, curr_inr,
                   target_low, target_high, old_dose, d, s]])
    Xs = scaler.transform(X)
    p1 = float(svr_m.predict(Xs)[0])
    p2 = float(rf_m.predict(Xs)[0])
    p3 = float(gb_m.predict(Xs)[0])
    ensemble = float(np.clip(0.40*p1 + 0.35*p2 + 0.25*p3, 0.5, 15.0))
    return round(ensemble, 2), {
        'svr':           round(p1, 2),
        'random_forest': round(p2, 2),
        'gradient_boost':round(p3, 2),
    }


def weekly_sequence(daily_dose, drug='warfarin'):
    if drug.lower() in ['acitrom','acenocoumarol','nicoumalone']:
        daily_dose /= 2.0
    available = [1, 2, 3, 5]
    total = daily_dose * 7
    seq = []
    for day in range(7):
        remaining = total - sum(seq)
        ideal = remaining / (7 - day)
        seq.append(min(available, key=lambda x: abs(x - ideal)))
    # Intersperse (paper updated algorithm)
    s = sorted(seq)
    out, lo, hi, tog = [], 0, len(s)-1, True
    while lo <= hi:
        if tog: out.append(s[hi]); hi -= 1
        else:   out.append(s[lo]); lo += 1
        tog = not tog
    return out, round(float(sum(out)), 1)


def next_test(prev, curr):
    if 2.5 <= prev <= 3.5 and 2.5 <= curr <= 3.5:
        return "2–3 weeks", "stable"
    elif 2.0 <= prev <= 4.0 and 2.0 <= curr <= 4.0:
        return "1 week", "monitor"
    return "See physician immediately", "urgent"


def advice(curr, tlo, thi, symptoms):
    if curr < tlo:
        return "Consult Doctor" if symptoms == 'bleeding' else "Adjust Dose"
    elif curr > thi:
        return "Consult Doctor" if symptoms in ['bleeding','clot risk'] else "Adjust Dose"
    return "Continue"


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def health():
    return jsonify({"status":"ok","models":["SVR","Random Forest","Gradient Boosting"]})


@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    required = ['age','gender','old_inr','new_inr','target_inr_low',
                'target_inr_high','old_dosage','diagnosis','symptoms','drug']
    for f in required:
        if f not in data:
            return jsonify({"error": f"Missing field: {f}"}), 400

    age        = float(data['age'])
    gender     = str(data['gender'])
    prev_inr   = float(data['old_inr'])
    curr_inr   = float(data['new_inr'])
    tlo        = float(data['target_inr_low'])
    thi        = float(data['target_inr_high'])
    old_dose   = float(data['old_dosage'])
    diagnosis  = str(data['diagnosis'])
    symptoms   = str(data['symptoms'])
    drug       = str(data['drug'])

    if not (2.0 <= curr_inr <= 4.0):
        return jsonify({"error":"Current INR outside 2.0–4.0. Consult physician immediately.",
                        "refer_physician":True}), 422
    if not (12 <= age <= 94):
        return jsonify({"error":"Age must be 12–94."}), 400

    dose, breakdown = predict_dose(age, gender, prev_inr, curr_inr,
                                   tlo, thi, old_dose, diagnosis, symptoms)
    seq, total      = weekly_sequence(dose, drug)
    nt, stability   = next_test(prev_inr, curr_inr)
    adv             = advice(curr_inr, tlo, thi, symptoms)

    return jsonify({
        "daily_dose_mg":   dose,
        "weekly_sequence": seq,
        "weekly_total_mg": total,
        "drug":            drug,
        "next_test_in":    nt,
        "stability":       stability,
        "advice":          adv,
        "model_breakdown": breakdown,
        "refer_physician": False,
        "disclaimer":      "Informational only. Always follow your cardiologist's advice."
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)