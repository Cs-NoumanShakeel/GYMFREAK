// components/TutorialSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/tutorial.css"; // Make this to style cards
import { useColor } from "../context/ColorContext";

function Tutorial() {
  const [tutorials, setTutorials] = useState([]);
   const { color, setColor } = useColor();

  useEffect(() => {
    axios.get("http://localhost:8000/api/tutorials/")
      .then(res => setTutorials(res.data))
      .catch(err => console.error(err));
  }, []);
  
     const dynamicBackground = color 
    ? "#042447ff  "
    : "#0F172A";
  return (
    <div className="tutorial-container" style={{background:dynamicBackground}}>
      {tutorials.map((tut) => (
        
        <a key={tut.id} href={tut.exercise_link} className="tutorial-card" >
          <h3>{tut.title}</h3>
          <video width="100%" height="140" controls loop autoPlay muted>
            <source src={`http://localhost:8000${tut.video}`} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
         
      
        </a>
      ))}
    </div>
  );
}

export default Tutorial;
