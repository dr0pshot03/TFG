/*
  Warnings:

  - Added the required column `apellidos_p` to the `Historico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_p` to the `Historico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Historico" ADD COLUMN     "apellidos_p" TEXT NOT NULL,
ADD COLUMN     "nombre_p" TEXT NOT NULL;
