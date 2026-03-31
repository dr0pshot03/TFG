import { Router } from "express";
import * as historicoController from "../controllers/historico.controller.ts";

const router = Router();

// Crea el historico
router.post("/", historicoController.createHistorico);

// Obtener el historico
router.get("/:idAsign", historicoController.getHistorico);

// Obtener un historico por su id
router.get("/historico/:id",  historicoController.getOneHistorico);

// Actualizar historico
router.put("/:id", historicoController.updateHistorico);

// Eliminar historico
router.delete("/:id", historicoController.deleteHistorico);

export default router;