const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function ResultPage({ result, formData, onReset }) {
  if (!result) return null;
  const today = new Date();
  const sc = { stable:"#22c55e", monitor:"#f59e0b", urgent:"#ef4444" };
  const sl = { stable:"✓ Stable", monitor:"⚠ Monitor", urgent:"🚨 See Physician" };
  const stability = result.stability;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dosage Prediction Result</h1>
        <p className="page-subtitle">Ensemble model output — SVR + Random Forest + Gradient Boosting</p>
      </div>

      {/* Summary */}
      <div className="result-summary-row">
        {[
          { label:"Daily Dose",    value: result.daily_dose_mg,  unit:"mg" },
          { label:"Weekly Total",  value: result.weekly_total_mg, unit:"mg" },
          { label:"Drug",          value: result.drug,            unit:"" },
          { label:"Advice",        value: result.advice,          unit:"", color: result.advice==="Continue" ? "#22c55e" : result.advice==="Adjust Dose" ? "#f59e0b" : "#ef4444" },
        ].map(s => (
          <div key={s.label} className="summary-card" style={s.color ? {borderColor:s.color} : {}}>
            <div className="summary-label">{s.label}</div>
            <div className="summary-value" style={s.color ? {color:s.color, fontSize:"1.1rem"} : {}}>
              {s.value} <span className="unit">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Model Breakdown */}
      {result.model_breakdown && (
        <div className="card">
          <div className="card-header">
            <span className="step-badge">AI Models</span>
            <h2>Individual Model Predictions</h2>
          </div>
          <div className="model-breakdown">
            {[
              { name:"SVR (Linear)",        key:"svr",            weight:"40%", color:"#1565c0" },
              { name:"Random Forest",       key:"random_forest",  weight:"35%", color:"#2e7d32" },
              { name:"Gradient Boosting",   key:"gradient_boost", weight:"25%", color:"#6a1b9a" },
            ].map(m => {
              const val = result.model_breakdown[m.key];
              const pct = Math.min(100, (val / 15) * 100);
              return (
                <div key={m.key} className="model-row">
                  <div className="model-meta">
                    <span className="model-name">{m.name}</span>
                    <span className="model-weight">{m.weight}</span>
                  </div>
                  <div className="model-bar-wrap">
                    <div className="model-bar" style={{ width:`${pct}%`, background: m.color }} />
                  </div>
                  <span className="model-val">{val} mg</span>
                </div>
              );
            })}
            <div className="ensemble-result">
              <span>Ensemble Result (weighted avg)</span>
              <span className="ensemble-val">{result.daily_dose_mg} mg/day</span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="card">
        <div className="card-header">
          <span className="step-badge">Schedule</span>
          <h2>7-Day Dosage Plan</h2>
        </div>
        <div className="weekly-schedule">
          {result.weekly_sequence.map((dose, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return (
              <div key={i} className={`day-card ${i===0?"today":""}`}>
                <div className="day-name">{DAYS[i].slice(0,3)}</div>
                <div className="day-date">{date.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div>
                <div className="day-dose">{dose}</div>
                <div className="day-unit">mg</div>
                {i===0 && <div className="today-badge">Today</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Test */}
      <div className={`next-test-card ${stability}`}>
        <div className="next-test-icon">🔬</div>
        <div>
          <div className="next-test-title">Next PT-INR Test</div>
          <div className="next-test-value">in <strong>{result.next_test_in}</strong></div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div className="next-test-title">Status</div>
          <div className="next-test-value" style={{color:sc[stability]}}>{sl[stability]}</div>
        </div>
      </div>

      {/* Input Summary */}
      <div className="card input-summary">
        <div className="card-header"><h2>Input Summary</h2></div>
        <div className="summary-grid">
          <div><span>Age</span><strong>{formData?.age} yrs</strong></div>
          <div><span>Gender</span><strong className="capitalize">{formData?.gender}</strong></div>
          <div><span>Previous INR</span><strong>{formData?.old_inr}</strong></div>
          <div><span>Current INR</span><strong>{formData?.new_inr}</strong></div>
          <div><span>Target Range</span><strong>{formData?.target_inr_low}–{formData?.target_inr_high}</strong></div>
          <div><span>Previous Dose</span><strong>{formData?.old_dosage} mg/day</strong></div>
          <div><span>Diagnosis</span><strong>{formData?.diagnosis?.toUpperCase()}</strong></div>
          <div><span>Symptoms</span><strong className="capitalize">{formData?.symptoms}</strong></div>
        </div>
      </div>

      <div className="disclaimer-card">⚠️ {result.disclaimer}</div>
      <button className="predict-btn secondary" onClick={onReset}>← New Prediction</button>
    </div>
  );
}
