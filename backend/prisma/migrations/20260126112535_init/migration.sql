-- CreateEnum
CREATE TYPE "Convocatoria" AS ENUM ('Febrero', 'Junio', 'Septiembre', 'Diciembre');

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

-- CreateTable
CREATE TABLE "Asignatura" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asignatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Examen" (
    "id" UUID NOT NULL,
    "id_asign" UUID NOT NULL,
    "partes" INTEGER NOT NULL,
    "convocatoria" "Convocatoria" NOT NULL,
    "anno" INTEGER NOT NULL,
    "duracion_h" INTEGER NOT NULL,
    "duracion_m" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Examen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partesExamen" (
    "id" UUID NOT NULL,
    "id_examen" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "duracion_h" INTEGER NOT NULL,
    "duracion_m" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partesExamen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_clerkId_key" ON "Usuario"("clerkId");

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "Examen_id_asign_fkey" FOREIGN KEY ("id_asign") REFERENCES "Asignatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partesExamen" ADD CONSTRAINT "partesExamen_id_examen_fkey" FOREIGN KEY ("id_examen") REFERENCES "Examen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
