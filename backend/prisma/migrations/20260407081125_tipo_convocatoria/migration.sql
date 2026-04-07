-- CreateEnum
CREATE TYPE "Tipo_Convocatoria" AS ENUM ('Ordinaria', 'Extraordinaria');

-- AlterTable
ALTER TABLE "Examen" ADD COLUMN     "tipo_convocatoria" "Tipo_Convocatoria" NOT NULL DEFAULT 'Ordinaria';
