import dotenv from "dotenv";
import { app, prisma } from "./app.js";

dotenv.config();
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing server and DB connection...");
  await prisma.$disconnect();
  process.exit(0);
});