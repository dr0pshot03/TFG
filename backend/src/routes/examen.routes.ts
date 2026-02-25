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

// Actualizar convocatoria examen
router.put("/convocatoria/:id", /*requireAuth,*/  examenController.updateConvocatoriaExamen);

// Actualizar tiempo de examen
router.put("/tiempo/:id", /*requireAuth,*/  examenController.updateTiempoExamen);

// Actualizar estado finalizado de examen
router.put("/finalizado/:id", /*requireAuth,*/  examenController.updateEstadoExamen);

// Actualizar examen
router.patch("/:id", /*requireAuth,*/  examenController.updateExamen);

// Eliminar examen
router.delete("/:id", /*requireAuth,*/  examenController.deleteExamen);

export default router;