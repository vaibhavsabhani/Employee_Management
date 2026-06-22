/*
  Warnings:

  - A unique constraint covering the columns `[pan_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aadhaar_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aadhaar_number" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "pan_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_pan_number_key" ON "users"("pan_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_aadhaar_number_key" ON "users"("aadhaar_number");
