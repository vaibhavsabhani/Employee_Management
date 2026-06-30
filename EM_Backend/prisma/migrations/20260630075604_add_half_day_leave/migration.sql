-- AlterTable
ALTER TABLE "leaves" ADD COLUMN     "half_day_session" TEXT,
ADD COLUMN     "is_half_day" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "total_days" SET DATA TYPE DOUBLE PRECISION;
