import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/useAuthStore";

import EmployeeLogin from "@/pages/login";
import RegisterFace from "@/pages/register-face";
import Dashboard from "@/pages/dashboard";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";

function RootRedirect() {
  const { isAuthenticated, role, faceRegistered } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  
  return faceRegistered ? <Navigate to="/dashboard" replace /> : <Navigate to="/register-face" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<EmployeeLogin />} />
        <Route path="/register-face" element={<RegisterFace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
