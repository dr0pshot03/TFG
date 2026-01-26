import { Router } from "express";
import * as examenController from "../controllers/examen.controller.ts";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea una examen
router.post("/", /*requireAuth,*/  examenController.createExamen);

// Obtener todas las examenes
router.get("/asignatura/:idAsign", /*requireAuth,*/  examenController.getAllExamenes);

// Obtener una examen
router.get("/:id", /*requireAuth,*/  examenController.getExamen);

// Actualizar examen
router.put("/:id", /*requireAuth,*/  examenController.updateExamen);

// Eliminar examen
router.delete("/:id", /*requireAuth,*/  examenController.deleteExamen);

export default router;