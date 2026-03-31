import { Router } from "express";
import * as sesionController from "../controllers/sesion.controller.ts";

const router = Router();

// Crea el historico
router.post("/", sesionController.createSesion);

// Obtener el historico por examen
router.get("/examen/:idExamen", sesionController.getSesionbyExamen);

// Obtener el historico por usuario
router.get("/usuario/:idUser", sesionController.getSesionbyUsuario);

// Actualizar historico
router.put("/:id", historicoController.updateHistorico);

// Eliminar historico
router.delete("/:id", historicoController.deleteHistorico);

export default router;