import { Router } from "express";
import * as userController from "../controllers/user.controller.ts";
import { requireAuth } from "@clerk/express";

const router = Router();

// Crea un nuevo usuario
router.post("/", /*requireAuth,*/ userController.createUser);

// Obtener un usuario
router.get("/:idClerk", /*requireAuth,*/userController.getUser);

// Actualizar un usuario
router.put("/:idClerk", /*requireAuth,*/ userController.updateUser);

// Eliminar un usuario
router.delete("/:idClerk", /*requireAuth,*/ userController.deleteUser);

export default router;