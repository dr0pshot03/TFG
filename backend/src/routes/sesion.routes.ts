import { Router } from "express";
import * as sesionController from "../controllers/sesion.controller";

const router = Router();

// Crea una sesion
router.post("/", sesionController.createSesion);

// Obtener todas las sesiones
router.get("/asignatura/:idAsign",  sesionController.getAllSesiones);

// Obtener una sesión
router.get("/:id", sesionController.getSesion);

// Actualizar sesion
router.put("/:id", sesionController.updateSesion);

// Eliminar sesión
router.delete("/:id", sesionController.deleteSesion);

export default router;