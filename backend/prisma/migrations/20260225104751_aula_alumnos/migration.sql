-- CreateTable
CREATE TABLE "AulaAlumnos" (
    "id" UUID NOT NULL,
    "aula" TEXT NOT NULL,
    "n_esperados" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "examenId" INTEGER NOT NULL,

    CONSTRAINT "AulaAlumnos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AulaAlumnos" ADD CONSTRAINT "AulaAlumnos_id_fkey" FOREIGN KEY ("id") REFERENCES "Examen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
