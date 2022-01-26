/*
  Warnings:

  - The primary key for the `Check` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Check` table. All the data in the column will be lost.
  - Added the required column `name` to the `Logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Check" DROP CONSTRAINT "Check_pkey",
DROP COLUMN "id",
ADD COLUMN     "checkId" SERIAL NOT NULL,
ADD CONSTRAINT "Check_pkey" PRIMARY KEY ("checkId");

-- AlterTable
ALTER TABLE "Logs" ADD COLUMN     "creation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "name" TEXT NOT NULL;
