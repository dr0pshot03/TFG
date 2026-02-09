/*
  Warnings:

  - You are about to drop the column `anno` on the `Examen` table. All the data in the column will be lost.
  - You are about to drop the column `dia` on the `Examen` table. All the data in the column will be lost.
  - You are about to drop the column `mes` on the `Examen` table. All the data in the column will be lost.
  - Added the required column `fecha_examen` to the `Examen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Primero agregamos la columna con un valor por defecto temporal
ALTER TABLE "Examen" ADD COLUMN "fecha_examen" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Actualizamos la nueva columna con los datos de las columnas antiguas
-- Combinamos anno, mes, dia en una fecha
UPDATE "Examen" 
SET "fecha_examen" = make_date("anno", "mes", "dia");

-- Ahora eliminamos las columnas antiguas
ALTER TABLE "Examen" DROP COLUMN "anno",
DROP COLUMN "dia",
DROP COLUMN "mes";

-- Removemos el valor por defecto
ALTER TABLE "Examen" ALTER COLUMN "fecha_examen" DROP DEFAULT;
