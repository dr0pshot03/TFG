import { Router } from "express";
import * as partesExamenController from "../controllers/partesExamen.controller";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea una parte de examen
router.post("/", requireAuth, partesExamenController.createExamen);

// Obtener todas las partes de un examenes
router.get("/:idExamen", requireAuth, partesExamenController.getAllExamenes);

// Obtener una parte de un examen
router.get("/:idExamen/:idParte", requireAuth, partesExamenController.getExamen);

// Actualizar parte de un examen
router.put("/:idExamen/:idParte", requireAuth, partesExamenController.updateExamen);

// Eliminar una parte de un examen
router.delete("/:idExamen/:idParte", requireAuth, partesExamenController.deleteExamen);

export default router;