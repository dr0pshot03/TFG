-- DropForeignKey
ALTER TABLE "public"."Examen" DROP CONSTRAINT "Examen_id_asign_fkey";

-- DropForeignKey
ALTER TABLE "public"."partesExamen" DROP CONSTRAINT "partesExamen_id_examen_fkey";

-- AlterTable
ALTER TABLE "Asignatura" ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "descripcion" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "Examen_id_asign_fkey" FOREIGN KEY ("id_asign") REFERENCES "Asignatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partesExamen" ADD CONSTRAINT "partesExamen_id_examen_fkey" FOREIGN KEY ("id_examen") REFERENCES "Examen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
