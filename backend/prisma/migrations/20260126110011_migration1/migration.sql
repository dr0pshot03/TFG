-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "clerkId" TEXT NOT NULL,
    "nombre" TEXT,
    "apellidos" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_clerkId_key" ON "Usuario"("clerkId");
