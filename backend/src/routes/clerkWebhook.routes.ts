import express, { Router } from "express";
import * as userController from "../controllers/user.controller.ts";

const router = Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  userController.handleClerkWebhook,
);

export default router;
