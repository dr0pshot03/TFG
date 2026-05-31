import { Router } from "express";
import * as partesExamenController from "../controllers/partesExamen.controller.ts";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea una parte de examen
router.post("/", partesExamenController.createParte);

// Obtener todas las partes de un examenes
router.get("/:idExamen", partesExamenController.getAllPartes);

// Obtener una parte de un examen
router.get("/parte/:idParte", partesExamenController.getParte);

// Actualizar parte de un examen
router.put("/:idParte", partesExamenController.updateParte);

// Actualizar el tiempo de una parte de un examen
router.put("/:idParte/sumarTiempo", partesExamenController.updateTiempoParte);

// Mover hacia arriba de orden una parte de un examen
router.put("/:idParte/moveUp", partesExamenController.moveUpParte);

// Mover hacia abajo de orden una parte de un examen
router.put("/:idParte/moveDown", partesExamenController.moveDownParte);

// Eliminar una parte de un examen
router.delete("/:idParte", partesExamenController.deleteParte);

export default router;