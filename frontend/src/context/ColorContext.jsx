import { createContext, useContext, useState, useEffect } from "react";

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [color, setColor] = useState(() => {
    const storedColor = localStorage.getItem("color");
    return storedColor ? JSON.parse(storedColor) : false;
  });

  useEffect(() => {
    if (color !== false) {
      localStorage.setItem("color", JSON.stringify(color));
    } else {
      localStorage.removeItem("color");
    }
  }, [color]);

  return (
    <ColorContext.Provider value={{ color, setColor }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColor = () => useContext(ColorContext);