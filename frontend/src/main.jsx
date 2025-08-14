import { createRoot } from "react-dom/client";
import { UserProvider } from "./context/UserContext";
import { ColorProvider } from "./context/ColorContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <ColorProvider>
      <App />
    </ColorProvider>
  </UserProvider>
);
