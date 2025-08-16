import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/history.css";
import { ACCESS_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [history, setHistory] = useState([]);
  const [w, setW] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/history/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      })
      .then((response) => {
        setHistory(response.data);
        if (response.data.length > 0 && response.data[0].weight) {
          setW(response.data[0].weight);
        }
      })
      .catch((error) => {
        console.error("Error fetching history:", error);
      });
  }, []);

  const handleRetry = (sessionId) => {
    navigate(`/session/${sessionId}`, { state: { fromHistory: true } });
  };

  return (
    <section className="history-section">
      <input
        type="number"
        placeholder="weight"
        className="input-weight"
        value={history.length > 0 ? w : ""}
        onChange={(e) => setW(e.target.value)}
        readOnly
      />

      {history.length === 0 ? (
        <p>No history available yet.</p>
      ) : (
        <div className="history-grid">
          {history.map((h) => (
            <div key={h.id} className="history-card">
              <h3>{h.session_title}</h3>

              <video width="100%" height="140" controls loop autoPlay muted>
                <source
                  src={`${import.meta.env.VITE_API_URL}${h.session_video}`}
                  type="video/mp4"
                />
                Your browser does not support HTML5 video.
              </video>
              <p>{h.session_description}</p>
              <div className="history-card-footer">
                <button className="Retry" onClick={() => handleRetry(h.session)}>
                  Retry
                </button>
              </div>
              <div className="history-accuracy">
                <strong style={{ color: "#fff" }}>Latest Accuracy Score:</strong> {h.accuracy_score.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
