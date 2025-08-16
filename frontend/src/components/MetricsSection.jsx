import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/metrics.css";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from "recharts";
import { ACCESS_TOKEN } from "../constants";
import { useColor } from "../context/ColorContext";

export default function MetricsSection() {
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const token = localStorage.getItem(ACCESS_TOKEN);
  const { color } = useColor();
  const COLORS = ["#051130ff", "#001f86ff", "#00B8D9", "#36B37E", "#FF6B6B"];

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/usersessionresult/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      if (!data || data.length === 0) {
        setPieData([]);
        setBarData([]);
        setLineData([]);
        return;
      }

      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const last5Entries = sortedData.slice(0, 5);

      const pie = last5Entries.map((item) => ({
        name: `${item.session_title}`,
        value: Number(parseFloat(item.accuracy_score).toFixed(2)),
      }));

      const counts = {};
      data.forEach((item) => {
        const sessionName = item.session_title;
        counts[sessionName] = (counts[sessionName] || 0) + 1;
      });
      const bar = Object.keys(counts).map((name) => ({
        name,
        value: counts[name],
      }));

      const line = data.map((item) => ({
        name: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        uv: item.calories,
      }));

      setPieData(pie);
      setBarData(bar);
      setLineData(line);
    } catch (err) {
      console.error(err);
      setPieData([]);
      setBarData([]);
      setLineData([]);
    }
  };

  const dynamicBackground = color ? " #042447ff " : "#0F172A";

  const cardStyle = {
    background: "#1E293B",
    borderRadius: "12px",
    padding: "16px",
    height: "280px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "1020px",
  };

  const titleStyle = {
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "8px",
    color: "#E2E8F0",
  };

  const NoDataMessage = () => (
    <div style={{ color: "#94A3B8", fontSize: "16px", fontWeight: "500" }}>
      No data yet
    </div>
  );

  return (
    <div
      className="metrics-container"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "25px",
        padding: "100px 24px",
        margin: "0 auto",
        maxWidth: "1225px",
        height: "400px",
        boxSizing: "border-box",
        marginLeft: "275px",
        background: dynamicBackground,
        borderRadius: "12px",
        marginTop: "-300px",
      }}
    >
      {/* Donut Chart */}
      <div className="metrics-card" style={cardStyle}>
        <h2 style={titleStyle}>Recent Accuracy by Session (Last 5)</h2>
        {pieData.length === 0 ? (
          <NoDataMessage />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "none", color: "#000" }} />
              <Legend
                wrapperStyle={{ color: "#fff" }}
                formatter={(value) => <span style={{ color: "#fff" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Horizontal Bar Chart */}
      <div className="metrics-card" style={cardStyle}>
        <h2 style={titleStyle}>Attempts per Session</h2>
        {barData.length === 0 ? (
          <NoDataMessage />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94A3B8" />
              <YAxis dataKey="name" type="category" stroke="#94A3B8" />
              <Tooltip contentStyle={{ background: "#1E293B", border: "none", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Bar dataKey="value" fill="#00B8D9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line Chart */}
      <div className="metrics-card" style={cardStyle}>
        <h2 style={titleStyle}>Calories Burned Over Time</h2>
        {lineData.length === 0 ? (
          <NoDataMessage />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ background: "#1E293B", border: "none", color: "#fff" }} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line type="monotone" dataKey="uv" stroke="#36B37E" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
