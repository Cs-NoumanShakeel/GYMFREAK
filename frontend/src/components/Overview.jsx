import "../styles/Overview.css"; 
export default function Overview({ title, value }) {
  return (
    <div className="overview-card">
      <h3>{title}</h3>
      <span>{value}</span>
    </div>
  );
}
