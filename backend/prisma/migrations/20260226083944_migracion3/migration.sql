/*
  Warnings:

  - Changed the type of `examenId` on the `AulaAlumnos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."AulaAlumnos" DROP CONSTRAINT "AulaAlumnos_id_fkey";

-- AlterTable
ALTER TABLE "AulaAlumnos" DROP COLUMN "examenId",
ADD COLUMN     "examenId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "AulaAlumnos" ADD CONSTRAINT "AulaAlumnos_id_fkey" FOREIGN KEY ("id") REFERENCES "Examen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
