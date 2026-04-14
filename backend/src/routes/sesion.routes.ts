import { Router } from "express";
import * as sesionController from "../controllers/sesion.controller.ts";

const router = Router();

// Crea la sesion
router.post("/", sesionController.createSesion);

// Obtener la sesion por id
router.get("/:id", sesionController.getSesionbyId);

// Obtener la sesion por examen
router.get("/examen/:idExamen", sesionController.getSesionbyExamen);

// Obtener la sesion por usuario
router.get("/usuario/:idUser", sesionController.getSesionbyUser);

// Actualizar sesion
router.put("/:id", sesionController.updateSesion);

// Eliminar sesion
router.delete("/:id", sesionController.deleteSesion);

export default router;