import { Router } from "express";
import * as examenController from "../controllers/examen.controller.ts";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea una examen
router.post("/", examenController.createExamen);

// Obtener todas los exámenes
router.get("/asignatura/:idAsign", examenController.getAllExamenes);

// Obtener un examen
router.get("/:id", examenController.getExamen);

// Actualizar convocatoria examen
router.put("/convocatoria/:id", examenController.updateConvocatoriaExamen);

// Actualizar tiempo de examen
router.put("/tiempo/:id", examenController.updateTiempoExamen);

// Actualizar estado finalizado de examen
router.put("/finalizado/:id", examenController.updateEstadoExamen);

// Actualizar examen
router.patch("/:id", examenController.updateExamen);

// Eliminar examen
router.delete("/:id", examenController.deleteExamen);

export default router;