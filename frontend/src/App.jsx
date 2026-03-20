import { useState } from "react";
import PredictPage from "./pages/PredictPage";
import ResultPage from "./pages/ResultPage";
import AboutPage from "./pages/AboutPage";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("predict");
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleResult = (res, form) => {
    setResult(res);
    setFormData(form);
    setPage("result");
  };

  const handleReset = () => {
    setResult(null);
    setFormData(null);
    setPage("predict");
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-icon">♥</span>
          <span className="nav-title">INR<span className="accent">Predict</span></span>
        </div>
        <div className="nav-links">
          <button className={page === "predict" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("predict")}>Predict</button>
          <button className={page === "about" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("about")}>About</button>
        </div>
      </nav>

      <main className="main-content">
        {page === "predict" && <PredictPage onResult={handleResult} />}
        {page === "result" && <ResultPage result={result} formData={formData} onReset={handleReset} />}
        {page === "about" && <AboutPage />}
      </main>

      <footer className="footer">
        <p>Based on: <em>Amruthlal et al., Indian Heart Journal 74 (2022) 469–473</em></p>
        <p className="disclaimer">⚠️ For informational use only. Always consult your cardiologist.</p>
      </footer>
    </div>
  );
}
