import { Navigate, Route, Routes } from "react-router-dom";
//import { navLinks } from "@constants/navLinks";
import { Text } from "@chakra-ui/react";
import Dashboard from "./Dashboard/Dashboard";
import Subject from "./Dashboard/Subject";
import Parts from "./Dashboard/ExamParts";
import ExamParts from "./Dashboard/ExamGraphics";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/asignatura/:id" element={<Subject />} />
      <Route path="/asignatura/:idAsign/examen/:id" element={<Parts />} />
      <Route path="/asignatura/:idAsign/grafica/" element={<ExamParts />} />
    </Routes>
  );
}