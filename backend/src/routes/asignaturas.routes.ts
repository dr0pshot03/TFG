import { Router } from "express";
import * as asignaturasController from "../controllers/asignaturas.controller.ts";
//import { requireAuth } from "@clerk/express";

const router = Router();

// Crea una asignatura
router.post("/", /*requireAuth,*/ asignaturasController.createAsignatura);

// Obtener todas las asignaturas
router.get("/usuario/:userId", /*requireAuth,*/ asignaturasController.getAllAsignaturas);

// Obtener una asignatura
router.get("/:id", /*requireAuth,*/ asignaturasController.getAsignatura);

// Actualizar asignatura
router.put("/:id", /*requireAuth,*/ asignaturasController.updateAsignatura);

// Eliminar asignatura
router.delete("/:id", /*requireAuth,*/ asignaturasController.deleteAsignatura);

export default router;