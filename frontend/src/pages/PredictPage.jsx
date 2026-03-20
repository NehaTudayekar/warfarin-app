import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DIAGNOSIS_OPTIONS = [
  { value: "mvr",  label: "MVR",  full: "Mitral Valve Replacement" },
  { value: "avr",  label: "AVR",  full: "Aortic Valve Replacement" },
  { value: "dvr",  label: "DVR",  full: "Double Valve Replacement" },
  { value: "af",   label: "AF",   full: "Atrial Fibrillation" },
  { value: "dvt",  label: "DVT",  full: "Deep Vein Thrombosis" },
];
const SYMPTOMS_OPTIONS = [
  { value: "none",       label: "None" },
  { value: "clot risk",  label: "Clot Risk" },
  { value: "bleeding",   label: "Bleeding" },
];
const TARGET_RANGES = [
  { low: 2.0, high: 3.0, label: "2.0 – 3.0" },
  { low: 2.5, high: 3.5, label: "2.5 – 3.5" },
  { low: 3.0, high: 4.0, label: "3.0 – 4.0" },
];

export default function PredictPage({ onResult }) {
  const [form, setForm] = useState({
    age: "", gender: "male", old_inr: "", new_inr: "",
    target_inr_low: 2.5, target_inr_high: 3.5,
    old_dosage: "", diagnosis: "mvr",
    symptoms: "none", drug: "warfarin",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const { age, old_inr, new_inr, old_dosage } = form;
    if (!age || !old_inr || !new_inr || !old_dosage) return "All fields are required.";
    if (age < 12 || age > 94)        return "Age must be 12–94.";
    if (old_inr < 1.0 || old_inr > 6.0) return "Previous INR must be 1.0–6.0.";
    if (new_inr < 1.0 || new_inr > 6.0) return "Current INR must be 1.0–6.0.";
    if (old_dosage < 0.5 || old_dosage > 20) return "Previous dosage must be 0.5–20 mg.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age:            Number(form.age),
          gender:         form.gender,
          old_inr:        Number(form.old_inr),
          new_inr:        Number(form.new_inr),
          target_inr_low: Number(form.target_inr_low),
          target_inr_high:Number(form.target_inr_high),
          old_dosage:     Number(form.old_dosage),
          diagnosis:      form.diagnosis,
          symptoms:       form.symptoms,
          drug:           form.drug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.refer_physician
          ? "⚠️ INR outside safe range (2.0–4.0). Please consult your physician immediately."
          : (data.error || "Prediction failed."));
        return;
      }
      onResult(data, form);
    } catch {
      setError("Cannot reach prediction server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Warfarin Dosage Predictor</h1>
        <p className="page-subtitle">
          Ensemble AI model (SVR + Random Forest + Gradient Boosting) — based on Amruthlal et al., 2022
        </p>
      </div>

      <div className="card form-card">
        <div className="card-header">
          <span className="step-badge">Patient Details</span>
          <h2>Enter Visit Information</h2>
        </div>
        <form onSubmit={handleSubmit} className="predict-form">

          {/* Age & Gender */}
          <div className="form-row">
            <div className="form-group">
              <label>Age (years)</label>
              <input type="number" min="12" max="94" placeholder="e.g. 55"
                value={form.age} onChange={e => set("age", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <div className="radio-group">
                {["male","female"].map(g => (
                  <label key={g} className={`radio-btn ${form.gender===g?"selected":""}`}>
                    <input type="radio" name="gender" value={g} checked={form.gender===g}
                      onChange={() => set("gender", g)} />
                    {g==="male" ? "♂ Male" : "♀ Female"}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* INR Values */}
          <div className="form-row">
            <div className="form-group">
              <label>Previous INR</label>
              <input type="number" step="0.01" min="1" max="6" placeholder="e.g. 2.62"
                value={form.old_inr} onChange={e => set("old_inr", e.target.value)} required />
              <span className="field-hint">Last visit INR value</span>
            </div>
            <div className="form-group">
              <label>Current INR</label>
              <input type="number" step="0.01" min="1" max="6" placeholder="e.g. 3.09"
                value={form.new_inr} onChange={e => set("new_inr", e.target.value)} required />
              <span className="field-hint">Today's PT-INR result (must be 2.0–4.0)</span>
            </div>
          </div>

          {/* Target INR Range */}
          <div className="form-group full-width">
            <label>Target INR Range</label>
            <div className="radio-group">
              {TARGET_RANGES.map(r => (
                <label key={r.label}
                  className={`radio-btn ${form.target_inr_low===r.low&&form.target_inr_high===r.high?"selected":""}`}>
                  <input type="radio" name="target" checked={form.target_inr_low===r.low}
                    onChange={() => { set("target_inr_low", r.low); set("target_inr_high", r.high); }} />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          {/* Old dosage & drug */}
          <div className="form-row">
            <div className="form-group">
              <label>Previous Daily Dosage (mg)</label>
              <input type="number" step="0.5" min="0.5" max="20" placeholder="e.g. 3.0"
                value={form.old_dosage} onChange={e => set("old_dosage", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Drug</label>
              <div className="radio-group">
                {[{v:"warfarin",l:"Warfarin"},{v:"acitrom",l:"Acitrom"}].map(d => (
                  <label key={d.v} className={`radio-btn ${form.drug===d.v?"selected":""}`}>
                    <input type="radio" name="drug" value={d.v} checked={form.drug===d.v}
                      onChange={() => set("drug", d.v)} />
                    {d.l}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="form-group full-width">
            <label>Diagnosis / Procedure</label>
            <div className="procedure-grid">
              {DIAGNOSIS_OPTIONS.map(p => (
                <label key={p.value} className={`procedure-btn ${form.diagnosis===p.value?"selected":""}`}>
                  <input type="radio" name="diagnosis" value={p.value}
                    checked={form.diagnosis===p.value}
                    onChange={() => set("diagnosis", p.value)} />
                  <span className="proc-code">{p.label}</span>
                  <span className="proc-label">{p.full}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="form-group full-width">
            <label>Current Symptoms</label>
            <div className="radio-group">
              {SYMPTOMS_OPTIONS.map(s => (
                <label key={s.value} className={`radio-btn ${form.symptoms===s.value?"selected":""}`}>
                  <input type="radio" name="symptoms" value={s.value}
                    checked={form.symptoms===s.value}
                    onChange={() => set("symptoms", s.value)} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="info-box">
            <span className="info-icon">🤖</span>
            <span>Ensemble prediction: SVR (40%) + Random Forest (35%) + Gradient Boosting (25%)</span>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="predict-btn" disabled={loading}>
            {loading
              ? <span className="loading-spinner"><span className="spinner" /> Running ensemble models...</span>
              : <span>⚡ Predict Dosage</span>}
          </button>
        </form>
      </div>

      <div className="disclaimer-card">
        <strong>⚕️ Medical Disclaimer:</strong> For informational use only. This does not replace
        physician advice. Based on SVR + RF + GB ensemble validated on 1,092 Indian patients.
      </div>
    </div>
  );
}
