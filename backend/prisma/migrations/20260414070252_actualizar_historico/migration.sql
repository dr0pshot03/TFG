/*
  Warnings:

  - Added the required column `convocatoria` to the `Historico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Historico" ADD COLUMN     "convocatoria" "Convocatoria" NOT NULL;
