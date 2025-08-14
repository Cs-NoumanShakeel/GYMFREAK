import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/Sidebar.css"; 
import menuIcon from '../assets/menu.png';
import LoginIcon from '../assets/login.png';
import settingsIcon from '../assets/settings.png';
import LogoutIcon from '../assets/logout.png';
import LogoIcon from '../assets/gym.png';
import sessionsIcon from '../assets/sessions.png';
import historyIcon from '../assets/history.png';
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Sidebar() {
    const { user, setUser } = useUser();
  const [extended, setExtended] = useState(true);

  const handleLogout = () => {
  
    localStorage.clear();
    setUser('Guest')
 
  }

  return (
    <div className={`sidebar ${extended ? "extended" : ""}`}>
 
      <div className="top">
  <div>
    <img
      onClick={() => setExtended((prev) => !prev)}
      src={menuIcon}
      className="menu"
      alt="menu toggle"
    />
    {extended && <h3>GymFreak</h3>}
  </div>
  <div>
    <img src={LogoIcon} className="logo_icon" alt="logo" />
    {extended && <h3>Dashboard</h3>}
  </div>
</div>

   
      <div className="middle">
        <div className={`middle-item ${extended ? "active" : ""}`}>
          <img src={LoginIcon} alt="login" />
          {extended && <Link to="/login">Login</Link>}
        </div>

        <div className={`middle-item ${extended ? "active" : ""}`}>
          <img src={LoginIcon} alt="signup" />
          {extended && <Link to="/register">Signup</Link>}
        </div>

        <div className={`middle-item ${extended ? "active" : ""}`}>
          <img src={sessionsIcon} alt="sessions" />
          {extended && <Link to="/sessions">Sessions</Link>}
        </div>

        <div className={`middle-item ${extended ? "active" : ""}`}>
          <img src={historyIcon} alt="history" />
          {extended && <Link to="/history">History</Link>}
        </div>

      
      </div>

  
      <div className="bottom">
        <div className={`bottom-item ${extended ? "active" : ""}`}>
          <img src={LogoutIcon} alt="logout" />
          {extended && <Link to="/login" onClick={handleLogout}>Logout</Link>}
        </div>
      </div>
    </div>
  );
}
