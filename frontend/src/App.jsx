import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Session from "./pages/Sessions";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register  />} />
        <Route path="/login" element={<Login  />} />
        <Route path="/" element={
       <ProtectedRoute>
       <Dashboard/>
       </ProtectedRoute>
        } />
        
        <Route path="/sessions" element={<Session  />} />
        <Route path="/history" element={<History  />} />
          <Route path="/session/:id" element={<Session />} />

      </Routes>
    </BrowserRouter>
  );
}
