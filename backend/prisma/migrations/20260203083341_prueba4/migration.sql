/*
  Warnings:

  - Changed the type of `num_parte` on the `partesExamen` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "partesExamen" DROP COLUMN "num_parte",
ADD COLUMN     "num_parte" INTEGER NOT NULL;
