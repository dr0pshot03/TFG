import { Router } from "express";
import * as userController from "../controllers/user.controller.ts";

const router = Router();

// Crea un nuevo usuario
router.post("/", userController.createUser);

// Obtener un usuario
router.get("/:idClerk", userController.getUser);

// Actualizar un usuario
router.put("/:idClerk", userController.updateUser);

// Eliminar un usuario
router.delete("/:idClerk", userController.deleteUser);

export default router;