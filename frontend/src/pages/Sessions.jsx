import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/session.css";
import { ACCESS_TOKEN } from "../constants";
import { useParams, useLocation } from "react-router-dom";

function Session() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRetry, setIsRetry] = useState(false);
  const token = localStorage.getItem(ACCESS_TOKEN);
  const [weight, setWeight] = useState(0);
  const sessionRefs = useRef({}); // store refs for each session

  const { id } = useParams();
  const location = useLocation();

  // Handle scrolling when ID changes (from search or direct navigation)
  useEffect(() => {
    if (id && sessions.length > 0 && sessionRefs.current[id]) {
      // Add a small delay to ensure the component is fully rendered
      setTimeout(() => {
        sessionRefs.current[id].scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }, 100);
    }
  }, [id, sessions]);

  // Handle navigation from URL params
  useEffect(() => {
    if (id) {
      const isFromHistory = location.state?.fromHistory;
      const isFromSearch = location.state?.fromSearch;
      
      // Only open modal if it's from history (retry), not from search
      if (isFromHistory) {
        setIsRetry(true);
        handleTryClick(Number(id), false);
      } else {
        // If from search, just scroll without opening modal
        setIsRetry(false);
      }
    }
  }, [id, location]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/sessions/")
      .then((res) => setSessions(res.data))
      .catch(() => {
        setErrorMessage("Failed to load sessions");
        setShowErrorModal(true);
      });
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem("currentSession");
    if (savedSession) {
      setSelectedSession(JSON.parse(savedSession));
    }
    const savedResults = localStorage.getItem("sessionResults");
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    }
    const userweight = localStorage.getItem("weight");
    if (userweight) {
      setWeight(JSON.parse(userweight));
    }
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchUserResults();
    }
  }, [selectedSession]);

  useEffect(() => {
    localStorage.setItem("sessionResults", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem("weight", JSON.stringify(weight));
  }, [weight]);

  const handleTryClick = (sessionId, clearFile = true) => {
    setSelectedSession(sessionId);
    localStorage.setItem("currentSession", JSON.stringify(sessionId));
    setShowModal(true);
    setError(null);
    if (clearFile) setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleHistoryCreateOrUpdate = async (data) => {
    try {
      const response = await axios.post("http://localhost:8000/api/history/", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data.message || "History processed successfully");
      return response.data;
    } catch (err) {
      console.log("Error processing history:", err);
      throw err;
    }
  };

  const fetchUserResults = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/usersessionresult/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessionResults = res.data.filter((r) => r.session === selectedSession);
      if (sessionResults.length > 0) {
        const latest = sessionResults.reduce((prev, current) =>
          new Date(prev.created_at) > new Date(current.created_at) ? prev : current
        );
        setResults((prevResults) => ({
          ...prevResults,
          [latest.session]: latest,
        }));
        return latest; // Return the latest result
      }
      return null;
    } catch (err) {
      setErrorMessage("Failed to fetch results");
      setShowErrorModal(true);
      throw err;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedSession) {
      setErrorMessage("Please select a file to upload");
      setShowErrorModal(true);
      return;
    }

    const selectedSessionObj = sessions.find((s) => s.id === selectedSession);
    const sessionTitle = selectedSessionObj ? selectedSessionObj.title : "";

    const formData = new FormData();
    formData.append("uploaded_video", selectedFile);
    formData.append("session", selectedSession);
    formData.append("title", sessionTitle);
    formData.append("weight", weight);

    setLoading(true);
    setError(null);
    setStatusModal(true);
    setStatusMessage("Calculating keypoints...");

    try {
      // 1. Process video
      const processResponse = await axios.post("http://localhost:8000/api/process_video/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // 2. Get the accuracy score directly from the response and round to 1 decimal place
      const accuracy = parseFloat(processResponse.data.accuracy_score || 0).toFixed(1);

      setStatusMessage("Updating results...");
      
      // 3. Fetch and update results state
      await fetchUserResults();

      // 4. Prepare history data with the correctly formatted accuracy
      const historyData = {
        session: selectedSession,
        weight: weight,
        accuracy_score: parseFloat(accuracy), // Ensure it's a number with 1 decimal place
      };

      // 5. Handle history creation/update (now unified)
      setStatusMessage(isRetry ? "Updating history..." : "Creating history...");
      await handleHistoryCreateOrUpdate(historyData);

      setStatusMessage("Done!");
      setTimeout(() => {
        setLoading(false);
        setShowModal(false);
        setStatusModal(false);
        setSelectedFile(null);
        setSelectedSession(null);
        setIsRetry(false);
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(
        err.response?.data?.error || 
        err.response?.data?.message ||
        "Error processing video. Make sure you have entered your weight. Please try again."
      );
      setShowErrorModal(true);
      setLoading(false);
      setStatusModal(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
    setError(null);
  };

  const closeUploadModal = () => {
    if (!loading) {
      setShowModal(false);
      setSelectedFile(null);
      setSelectedSession(null);
      setIsRetry(false);
    }
  };

  return (
    <div className="session-container">
      <input
        type="number"
        placeholder="Weight (Kg)"
        className="input-weight"
        onChange={(e) => setWeight(e.target.value)}
        value={weight || ""}
      />

      {sessions.map((s) => (
        <div
          key={s.id}
          ref={(el) => (sessionRefs.current[s.id] = el)}
          className={`session-card ${s.id === Number(id) ? "highlighted" : ""}`}
        >
          <h3>{s.title}</h3>
          <video width="100%" height="140" controls loop autoPlay muted>
            <source src={`http://localhost:8000${s.video}`} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          <p>{s.description}</p>
          <div className="session-card-footer">
            <button className="try" onClick={() => handleTryClick(s.id)}>
              Try
            </button>
            {results[s.id] && (
              <div className="accuracy-display latest-accuracy">
                <strong>Latest Accuracy Score:</strong>{" "}
                {parseFloat(results[s.id].accuracy_score || 0).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {isRetry ? "Retry Exercise Video" : "Upload Your Exercise Video"}
            </h2>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={loading}
            />
            <div className="modal-buttons">
              <button onClick={handleUpload} disabled={loading || !selectedFile}>
                {loading ? (
                  <>
                    Processing...
                    <span className="loading-spinner"></span>
                  </>
                ) : isRetry ? (
                  "Retry"
                ) : (
                  "Upload"
                )}
              </button>
              <button onClick={closeUploadModal} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModal && (
        <div className="modal-overlay status-modal">
          <div className="modal-content">
            <div className="status-spinner"></div>
            <h3>{statusMessage}</h3>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay error-modal">
          <div className="modal-content">
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <button onClick={closeErrorModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Session;