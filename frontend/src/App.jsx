import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
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
