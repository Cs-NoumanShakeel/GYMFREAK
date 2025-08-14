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
  const [calories,setcalories] = useState(null)
  const [duration,setduration] = useState(null)
  const token = localStorage.getItem(ACCESS_TOKEN)
  const [accuracy,setaccuracy] = useState(null)
  const { color, setColor } = useColor();
  useEffect(()=>{
    getMetrics()
  },[])
  const getMetrics = async () => {
  try {
    const res = await axios.get("http://localhost:8000/api/usersessionresult/", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const results = res.data; // Array of session results

    if (Array.isArray(results) && results.length > 0) {
      const totalCalories = parseFloat(results.reduce((sum, r) => sum + (r.calories || 0), 0)).toFixed(2);
      const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
      const best_accuracy = parseFloat(Math.max(...res.data.map(r => r.accuracy_score))).toFixed(2);


      setcalories(totalCalories);
    
      setduration(parseFloat(totalDuration).toFixed(2)); 
      setaccuracy(best_accuracy)

    }
  } catch (err) {
    console.log(err);
  }
};

  return (
<div 
  className="dashboard-container" 
  style={{
    background: color 
      ? "#042447ff "
      : "#0F172A"
  }}
>
      <Sidebar />

      <div className="main-content">
        <Topbar  />

       
        <div className="content-wrapper">
          <div className="overview-container">
            <Overview title="Total Calories Burned" value={(calories || 0) + ' Kcal'} />

            <Overview title="Duration" value={(duration||0)+ ' Mins'} />
            <Overview title="Best Accuracy" value={(accuracy || 0) + ' %'} />
          </div>

          <MetricsSection/>
          <Tutorial />
        </div>
      </div>
    </div>
  );
}
