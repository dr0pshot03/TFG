/*
  Warnings:

  - Added the required column `finalizado` to the `Examen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_aprobados` to the `Examen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_esperados` to the `Examen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Examen" ADD COLUMN     "finalizado" BOOLEAN NOT NULL,
ADD COLUMN     "n_aprobados" INTEGER NOT NULL,
ADD COLUMN     "n_esperados" INTEGER NOT NULL;
