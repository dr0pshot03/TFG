-- Drop incorrect foreign key based on id
ALTER TABLE "AulaAlumnos" DROP CONSTRAINT IF EXISTS "AulaAlumnos_id_fkey";

-- Create the correct foreign key using examenId -> Examen.id
ALTER TABLE "AulaAlumnos"
ADD CONSTRAINT "AulaAlumnos_examenId_fkey"
FOREIGN KEY ("examenId") REFERENCES "Examen"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
