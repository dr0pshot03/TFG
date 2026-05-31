/*
  Warnings:

  - Added the required column `updated_at` to the `Prediccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prediccion" ADD COLUMN     "convocatoria" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "curso" TEXT,
ADD COLUMN     "id_asignatura" UUID,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id_sesion" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Prediccion_id_sesion_idx" ON "Prediccion"("id_sesion");

-- CreateIndex
CREATE INDEX "Prediccion_id_asignatura_idx" ON "Prediccion"("id_asignatura");

-- AddForeignKey
ALTER TABLE "Prediccion" ADD CONSTRAINT "Prediccion_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
