/*
  Warnings:

  - The primary key for the `Check` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Check` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Check" DROP CONSTRAINT "Check_pkey",
DROP COLUMN "id",
ADD COLUMN     "checkId" SERIAL NOT NULL,
ADD CONSTRAINT "Check_pkey" PRIMARY KEY ("checkId");

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
