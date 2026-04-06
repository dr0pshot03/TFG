import { Router } from "express";
import * as eventoController from "../controllers/evento.controller.ts";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea un evento
router.post("/", eventoController.createEvento);

// Obtener todas los eventos
router.get("/evento/:idSesion", eventoController.getAllEventos);

// Obtener una evento
router.get("/:id", eventoController.getEvento);

// Eliminar evento
router.delete("/:id", eventoController.deleteEvento);

export default router;