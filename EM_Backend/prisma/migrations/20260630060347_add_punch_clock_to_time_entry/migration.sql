-- AlterTable
ALTER TABLE "time_entries" ADD COLUMN     "lunch_in_at" TIMESTAMP(3),
ADD COLUMN     "lunch_out_at" TIMESTAMP(3),
ALTER COLUMN "end_time" DROP NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 0;
