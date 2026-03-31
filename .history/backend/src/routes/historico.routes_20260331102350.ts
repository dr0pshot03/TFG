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

// Actualizar tiempo de examen
router.put("/tiempo/:id", /*requireAuth,*/  examenController.updateTiempoExamen);

// Actualizar estado finalizado de examen
router.put("/finalizado/:id", /*requireAuth,*/  examenController.updateEstadoExamen);

// Actualizar examen
router.patch("/:id", /*requireAuth,*/  examenController.updateExamen);

// Eliminar examen
router.delete("/:id", /*requireAuth,*/  examenController.deleteExamen);

export default router;