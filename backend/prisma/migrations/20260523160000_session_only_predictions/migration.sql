-- Backfill completed beforehand so all rows have a session.
-- Remove the subject relation from predictions and keep only session linkage.

ALTER TABLE "Prediccion" DROP CONSTRAINT IF EXISTS "Prediccion_id_asignatura_fkey";
DROP INDEX IF EXISTS "Prediccion_id_asignatura_idx";

ALTER TABLE "Prediccion"
  ALTER COLUMN "id_sesion" SET NOT NULL,
  DROP COLUMN IF EXISTS "id_asignatura";
