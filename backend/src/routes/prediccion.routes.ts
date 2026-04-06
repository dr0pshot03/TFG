import { Router } from "express";
import * as prediccionController from "../controllers/prediccion.controller.js";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea predicción
router.post("/", prediccionController.createPrediccion);

// Obtener todas las predicciones
router.get("/sesion/:idSesion", prediccionController.getAllPredicciones);

// Obtener una prediccion
router.get("/:id", prediccionController.getPrediccion);

// Actualizar predicción
router.put("/:id", prediccionController.updatePrediccion);

// Eliminar prediccion
router.delete("/:id", prediccionController.deletePrediccion);

export default router;