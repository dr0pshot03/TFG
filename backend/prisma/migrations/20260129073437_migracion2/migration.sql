/*
  Warnings:

  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "id";

-- AddForeignKey
ALTER TABLE "Asignatura" ADD CONSTRAINT "Asignatura_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Usuario"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
