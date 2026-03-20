export default function AboutPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">About This Tool</h1>
        <p className="page-subtitle">Built on peer-reviewed machine learning research</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📄 Research Paper</h2>
        </div>
        <div className="about-section">
          <p><strong>Title:</strong> Development and validation of a mobile application based on a machine learning
          model to aid in predicting dosage of vitamin K antagonists among Indian patients post
          mechanical heart valve replacement</p>
          <p><strong>Authors:</strong> M. Amruthlal, S. Devika, Vignesh Krishnan et al.</p>
          <p><strong>Published in:</strong> Indian Heart Journal 74 (2022) 469–473</p>
          <p><strong>Institutions:</strong> NIT Calicut & SCTIMST Thiruvananthapuram</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>🤖 ML Model Details</h2>
        </div>
        <div className="model-stats">
          <div className="stat-item">
            <div className="stat-label">Algorithm</div>
            <div className="stat-value">SVR (Linear Kernel)</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">R² Score</div>
            <div className="stat-value">0.955</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">MSE</div>
            <div className="stat-value">0.41</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Validated On</div>
            <div className="stat-value">1,092 patients</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Dose Accuracy &lt;3mg</div>
            <div className="stat-value">89.4%</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Dose Accuracy &lt;5mg</div>
            <div className="stat-value">93.5%</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>⚙️ How It Works</h2>
        </div>
        <div className="steps-list">
          <div className="step-item">
            <span className="step-num">1</span>
            <span>Patient enters current and previous INR values along with demographic info</span>
          </div>
          <div className="step-item">
            <span className="step-num">2</span>
            <span>SVR model predicts optimal daily warfarin/acitrom dose</span>
          </div>
          <div className="step-item">
            <span className="step-num">3</span>
            <span>Weekly dosage sequence is generated using available tablet strengths (1, 2, 3, 5mg)</span>
          </div>
          <div className="step-item">
            <span className="step-num">4</span>
            <span>Next PT-INR test date is recommended based on INR stability</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📊 Dataset Parameters</h2>
        </div>
        <table className="params-table">
          <thead>
            <tr><th>Parameter</th><th>Description</th></tr>
          </thead>
          <tbody>
            {[
              ["Age", "12–94 years"],
              ["Gender", "Male / Female (one-hot encoded)"],
              ["Old INR", "Previous INR value (1.7–5.5)"],
              ["New INR", "Current INR value (2.0–4.0 for prediction)"],
              ["Old Dosage", "Previous daily warfarin dose (mg)"],
              ["Procedure", "MVR / AVR / DVR / AF (one-hot encoded)"],
              ["New Dosage", "Target: predicted daily dose (mg)"],
            ].map(([p, d]) => (
              <tr key={p}><td>{p}</td><td>{d}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="disclaimer-card">
        <strong>⚕️ Disclaimer:</strong> This application predicts warfarin maintenance dosage for
        patients with stable INR (2.0–4.0). It is not a substitute for physician advice.
        INR values outside 2.0–4.0 require immediate physician consultation.
      </div>
    </div>
  );
}
