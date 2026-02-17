import { Navigate, Route, Routes } from "react-router-dom";
//import { navLinks } from "@constants/navLinks";
import Dashboard from "./Dashboard/Dashboard";
import Subject from "./Dashboard/Subject";
import Parts from "./Dashboard/ExamParts";
import ExamGraphics from "./Dashboard/ExamGraphics";
import GlobalGraphics from "./Dashboard/GlobalGraphics";
import Countdown from "./Dashboard/Countdown";
import Login from "./Auth/Login";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // Evita que un usuario no logueado pueda acceder a la ruta
import { PublicRoute } from "@/components/PublicRoute"; // Al igual que el anterior, funciona a la inversa, un usuario logueado no podrá acceder a /login.

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
      <Route path="/asignatura/:id" element={<ProtectedRoute><Subject /></ProtectedRoute>} />
      <Route path="/asignatura/:idAsign/examen/:id" element={<ProtectedRoute><Parts /></ProtectedRoute>} />
      <Route path="/asignatura/:idAsign/grafica/" element={<ProtectedRoute><ExamGraphics /></ProtectedRoute>} />
      <Route path="/grafica/" element={<ProtectedRoute><GlobalGraphics /></ProtectedRoute>} />
      <Route path="/asignatura/:idAsign/examen/:idExamen/cuentaatras" element={<ProtectedRoute><Countdown /></ProtectedRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>}/>
    </Routes>
  );
}