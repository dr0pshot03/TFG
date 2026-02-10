import { Navigate, Route, Routes } from "react-router-dom";
//import { navLinks } from "@constants/navLinks";
import Dashboard from "./Dashboard/Dashboard";
import Subject from "./Dashboard/Subject";
import Parts from "./Dashboard/ExamParts";
import ExamGraphics from "./Dashboard/ExamGraphics";
import GlobalGraphics from "./Dashboard/GlobalGraphics";
import Countdown from "./Dashboard/Countdown";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/asignatura/:id" element={<Subject />} />
      <Route path="/asignatura/:idAsign/examen/:id" element={<Parts />} />
      <Route path="/asignatura/:idAsign/grafica/" element={<ExamGraphics />} />
      <Route path="/grafica/" element={<GlobalGraphics />} />
      <Route path="/asignatura/:idAsign/examen/:idExamen/cuentaatras" element={<Countdown />} />
    </Routes>
  );
}