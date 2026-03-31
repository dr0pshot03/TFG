import { Router } from "express";
import * as historicoController from "../controllers/historico.controller";

const router = Router();

// Crea un historico
router.post("/", historicoController.createHistorico);

// Obtener el historico
router.get("/:idAsign",  historicoController.getHistorico);

// Actualizar historico
router.put("/:id", historicoController.updateHistorico);

// Eliminar historico
router.delete("/:id", historicoController.deleteHistorico);

export default router;