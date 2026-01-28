import { Navigate, Route, Routes } from "react-router-dom";
//import { navLinks } from "@constants/navLinks";
import { Text } from "@chakra-ui/react";

import Helloworld from "./helloworld/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={"/"}>
        <Route path="/" element={<Helloworld />} />
        <Route path="/hello" element={<Helloworld />} />
      </Route>
    </Routes>
  )
}