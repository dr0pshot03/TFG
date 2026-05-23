/*
  Warnings:

  - The values [Ordinaria,Extraordinaria] on the enum `Tipo_Convocatoria` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Tipo_Convocatoria_new" AS ENUM ('Ordinario', 'Especial');
ALTER TABLE "public"."Examen" ALTER COLUMN "tipo_convocatoria" DROP DEFAULT;
ALTER TABLE "Examen" ALTER COLUMN "tipo_convocatoria" TYPE "Tipo_Convocatoria_new" USING ("tipo_convocatoria"::text::"Tipo_Convocatoria_new");
ALTER TYPE "Tipo_Convocatoria" RENAME TO "Tipo_Convocatoria_old";
ALTER TYPE "Tipo_Convocatoria_new" RENAME TO "Tipo_Convocatoria";
DROP TYPE "public"."Tipo_Convocatoria_old";
ALTER TABLE "Examen" ALTER COLUMN "tipo_convocatoria" SET DEFAULT 'Ordinario';
COMMIT;

-- AlterTable
ALTER TABLE "Examen" ALTER COLUMN "tipo_convocatoria" SET DEFAULT 'Ordinario';
