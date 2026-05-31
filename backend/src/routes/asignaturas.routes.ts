import { Router } from "express";
import * as asignaturasController from "../controllers/asignaturas.controller.ts";
//import { requireAuth } from "@clerk/express";

const router = Router();

// Crea una asignatura
router.post("/", asignaturasController.createAsignatura);

// Obtener todas las asignaturas
router.get("/usuario/:userId", asignaturasController.getAllAsignaturas);

// Obtener una asignatura
router.get("/:id", asignaturasController.getAsignatura);

// Actualizar asignatura
router.put("/:id", asignaturasController.updateAsignatura);

// Eliminar asignatura
router.delete("/:id", asignaturasController.deleteAsignatura);

export default router;