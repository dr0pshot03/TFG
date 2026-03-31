import { Router } from "express";
import * as sesionController from "../controllers/sesion.controller.ts";

const router = Router();

// Crea el historico
router.post("/", sesionController.createSesion);

// Obtener el historico
router.get("/:i", sesionController.getSesion);

// Obtener un historico por su id
router.get("/historico/:id",  historicoController.getOneHistorico);

// Actualizar historico
router.put("/:id", historicoController.updateHistorico);

// Eliminar historico
router.delete("/:id", historicoController.deleteHistorico);

export default router;