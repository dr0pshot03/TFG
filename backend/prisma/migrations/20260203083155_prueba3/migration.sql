/*
  Warnings:

  - Added the required column `num_parte` to the `partesExamen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "partesExamen" ADD COLUMN     "num_parte" TEXT NOT NULL;
