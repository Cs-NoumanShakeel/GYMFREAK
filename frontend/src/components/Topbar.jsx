import { useUser } from "../context/UserContext";
import notificationIcon from '../assets/notification-bell.png';
import profileIcon from '../assets/user.png';
import brightIcon from '../assets/brightness.png';
import "../styles/Topbar.css"; 
import { useColor } from "../context/ColorContext";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Topbar() {
  const { user } = useUser();
  const { color, setColor } = useColor();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/sessions/`)
      .then((res) => setSessions(res.data))
      .catch(() => {
        console.log('An error occurred while fetching sessions');
      });
  }, []);

  const handleBackground = () => {
    setColor(!color);
  };

  const handleSearch = () => {
    if (!query.trim()) return;

    // Find the session by title (case-insensitive)
    const matchedSession = sessions.find(
      (s) => s.title.toLowerCase().includes(query.toLowerCase())
    );
    
    if (matchedSession) {
      // Navigate with state indicating this is from search
      navigate(`/session/${matchedSession.id}`, {
        state: { fromSearch: true }
      });
      setQuery(""); // Clear search after successful search
    } else {
      alert("Session not found");
    }
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div style={{ position: "relative", display: "inline-block" }}>
          <input
            className="searchbar"
            placeholder="Search Exercise Tutorials"
            style={{ paddingRight: "5rem" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <FaSearch
            style={{
              position: "absolute",
              top: "50%",
              left: "245px",
              transform: "translateY(-50%)",
              color: "#888",
              cursor: 'pointer'
            }}
            onClick={handleSearch}
          />
        </div>
      </div>
      <div className="topbar-middle">
        <h2>Welcome {user || "Guest"}</h2>
      </div>
      <div className="topbar-right">
        <img src={brightIcon} alt="bright" className="bright-icon" onClick={handleBackground}/>
        <img src={notificationIcon} alt="notification" className="notification-icon" />
        <img src={profileIcon} alt="Profile" className="profile-icon" />
      </div>
    </div>
  );
}
