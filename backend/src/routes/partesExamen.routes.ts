import { Router } from "express";
import * as partesExamenController from "../controllers/partesExamen.controller.ts";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea una parte de examen
router.post("/", /*requireAuth,*/ partesExamenController.createParte);

// Obtener todas las partes de un examenes
router.get("/:idExamen", /*requireAuth,*/ partesExamenController.getAllPartes);

// Obtener una parte de un examen
router.get("/parte/:idParte", /*requireAuth,*/partesExamenController.getParte);

// Actualizar parte de un examen
router.put("/:idParte", /*requireAuth,*/ partesExamenController.updateParte);

// Mover hacia arriba de orden una parte de un examen
router.put("/:idParte/moveUp", /*requireAuth,*/ partesExamenController.moveUpParte);

// Mover hacia abajo de orden una parte de un examen
router.put("/:idParte/moveDown", /*requireAuth,*/ partesExamenController.moveDownParte);

// Eliminar una parte de un examen
router.delete("/:idParte", /*requireAuth,*/ partesExamenController.deleteParte);

export default router;