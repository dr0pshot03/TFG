/*
  Warnings:

  - You are about to drop the column `n_aprobados` on the `Examen` table. All the data in the column will be lost.
  - You are about to drop the column `n_esperados` on the `Examen` table. All the data in the column will be lost.
  - You are about to drop the column `n_present` on the `Examen` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Examen" DROP COLUMN "n_aprobados",
DROP COLUMN "n_esperados",
DROP COLUMN "n_present";

-- CreateTable
CREATE TABLE "Historico" (
    "id" UUID NOT NULL,
    "id_asignatura" UUID NOT NULL,
    "curso" TEXT NOT NULL,
    "n_matriculados" INTEGER NOT NULL,
    "n_presentados" INTEGER NOT NULL,
    "porcentaje_aprobados" DECIMAL(65,30) NOT NULL,
    "tipo_convocatoria" TEXT NOT NULL,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" UUID NOT NULL,
    "id_examen" UUID NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,
    "n_present" INTEGER NOT NULL DEFAULT 0,
    "n_esperados" INTEGER NOT NULL DEFAULT 0,
    "n_aprobados" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" UUID NOT NULL,
    "id_sesion" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tipo_evento" TEXT NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediccion" (
    "id" UUID NOT NULL,
    "id_sesion" UUID NOT NULL,
    "asistencia_estimada" INTEGER NOT NULL,
    "aulas_necesarias" INTEGER NOT NULL,
    "nivel_confianza" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Prediccion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Historico" ADD CONSTRAINT "Historico_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_id_examen_fkey" FOREIGN KEY ("id_examen") REFERENCES "Examen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_id_sesion_fkey" FOREIGN KEY ("id_sesion") REFERENCES "Sesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediccion" ADD CONSTRAINT "Prediccion_id_sesion_fkey" FOREIGN KEY ("id_sesion") REFERENCES "Sesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
