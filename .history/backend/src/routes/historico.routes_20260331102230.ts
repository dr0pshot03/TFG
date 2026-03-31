import { Router } from "express";
import * as historicoController from "../controllers/historico.controller.ts";

const router = Router();

// Crea el historico
router.post("/", historicoController.createHistorico);

// Obtener el histórico
router.get("/:idAsign", examenController.getHistorico);

// Obtener una examen
router.get("/:id", /*requireAuth,*/  examenController.getExamen);

// Actualizar convocatoria examen
router.put("/convocatoria/:id", /*requireAuth,*/  examenController.updateConvocatoriaExamen);

// Actualizar tiempo de examen
router.put("/tiempo/:id", /*requireAuth,*/  examenController.updateTiempoExamen);

// Actualizar estado finalizado de examen
router.put("/finalizado/:id", /*requireAuth,*/  examenController.updateEstadoExamen);

// Actualizar examen
router.patch("/:id", /*requireAuth,*/  examenController.updateExamen);

// Eliminar examen
router.delete("/:id", /*requireAuth,*/  examenController.deleteExamen);

export default router;