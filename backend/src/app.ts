import { clerkMiddleware } from "@clerk/express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import asignaturasRoutes from "./routes/asignaturas.routes";
import clerkWebhookRoutes from "./routes/clerkWebhook.routes";
import examenRoutes from "./routes/examen.routes";
import partesExamenRoutes from "./routes/partesExamen.routes";
import usuarioRoutes from "./routes/user.routes";


const prisma = new PrismaClient();

export const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

app.use("/api/webhooks", clerkWebhookRoutes);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(clerkMiddleware());

// Routes
app.use("/api/usuario", usuarioRoutes);
app.use("/api/asignaturas", asignaturasRoutes);
app.use("/api/examen", examenRoutes);
app.use("/api/partesExamen", partesExamenRoutes);


// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (process.env.NODE_ENV === "development") {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    res.status(500).json({ error: "Something went wrong!" });
  }
});

export { prisma };