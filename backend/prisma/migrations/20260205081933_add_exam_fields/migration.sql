/*
  Warnings:

  - Added the required column `aula` to the `Examen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dia` to the `Examen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mes` to the `Examen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_present` to the `Examen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Agregamos las columnas con valores por defecto temporales
ALTER TABLE "Examen" ADD COLUMN     "aula" TEXT NOT NULL DEFAULT 'Sin especificar',
ADD COLUMN     "dia" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "mes" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "n_present" INTEGER NOT NULL DEFAULT 0;

-- Removemos los valores por defecto después de agregar las columnas
ALTER TABLE "Examen" ALTER COLUMN "aula" DROP DEFAULT,
ALTER COLUMN "dia" DROP DEFAULT,
ALTER COLUMN "mes" DROP DEFAULT,
ALTER COLUMN "n_present" DROP DEFAULT;
