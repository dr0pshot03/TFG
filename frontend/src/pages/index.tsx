import { Navigate, Route, Routes } from "react-router-dom";
//import { navLinks } from "@constants/navLinks";
import { Text } from "@chakra-ui/react";
import Dashboard from "./Dashboard/Dashboard";
import Subject from "./Dashboard/Subject";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/asignatura/:id" element={<Subject />} />
    </Routes>
  );
}