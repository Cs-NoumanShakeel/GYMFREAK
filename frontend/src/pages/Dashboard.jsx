import axios from "axios";
import MetricsSection from "../components/MetricsSection";
import Overview from "../components/Overview";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Tutorial from "../components/Tutorial";
import "../styles/Dashboard.css"; 
import { useEffect, useState } from "react";
import { ACCESS_TOKEN } from "../constants";
import { useColor } from "../context/ColorContext";

export default function Dashboard() {
  const [calories, setCalories] = useState(null);
  const [duration, setDuration] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const token = localStorage.getItem(ACCESS_TOKEN);
  const { color } = useColor();

  useEffect(() => {
    getMetrics();
  }, []);

  const getMetrics = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/usersessionresult/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const results = res.data; // Array of session results

      if (Array.isArray(results) && results.length > 0) {
        const totalCalories = parseFloat(
          results.reduce((sum, r) => sum + (r.calories || 0), 0)
        ).toFixed(2);

        const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

        const bestAccuracy = parseFloat(
          Math.max(...res.data.map((r) => r.accuracy_score))
        ).toFixed(2);

        setCalories(totalCalories);
        setDuration(parseFloat(totalDuration).toFixed(2));
        setAccuracy(bestAccuracy);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="dashboard-container"
      style={{ background: color ? "#042447ff" : "#0F172A" }}
    >
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="content-wrapper">
          <div className="overview-container">
            <Overview title="Total Calories Burned" value={(calories || 0) + " Kcal"} />
            <Overview title="Duration" value={(duration || 0) + " Mins"} />
            <Overview title="Best Accuracy" value={(accuracy || 0) + " %"} />
          </div>

          <MetricsSection />
          <Tutorial />
        </div>
      </div>
    </div>
  );
}
