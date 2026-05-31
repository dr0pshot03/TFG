import { clerkMiddleware } from "@clerk/express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import asignaturasRoutes from "./routes/asignaturas.routes.js"
import clerkWebhookRoutes from "./routes/clerkWebhook.routes.js"
import examenRoutes from "./routes/examen.routes.js"
import partesExamenRoutes from "./routes/partesExamen.routes.js"
import usuarioRoutes from "./routes/user.routes.js"
import historicoRoutes from "./routes/historico.routes"
import sesionRoutes from "./routes/sesion.routes"
import prediccionRoutes from "./routes/prediccion.routes"
import eventoRoutes from "./routes/evento.routes"

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

app.use("/api/webhooks", clerkWebhookRoutes);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(clerkMiddleware());

// Rutas
app.use("/api/usuario", usuarioRoutes);
app.use("/api/asignaturas", asignaturasRoutes);
app.use("/api/examen", examenRoutes);
app.use("/api/partesExamen", partesExamenRoutes);
app.use("/api/sesion", sesionRoutes);
app.use("/api/historico", historicoRoutes);
app.use("/api/evento", eventoRoutes);
app.use("/api/prediccion", prediccionRoutes);


// Manejo de errores globales
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Detailed error information:");
  console.error("Error name:", err.name);
  console.error("Error message:", err.message);
  console.error("Error stack:", err.stack);
  console.error("Request path:", req.path);
  console.error("Request method:", req.method);

  // Enviar una respuesta de error más informativa en desarrollo
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

// Manejo de apagado ordenado
process.on("SIGTERM", async () => {
  console.log(
    "SIGTERM received. Closing HTTP server and database connection...",
  );
  await prisma.$disconnect();
  process.exit(0);
});

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
