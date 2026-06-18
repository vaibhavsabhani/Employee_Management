-- CreateTable
CREATE TABLE "time_entry_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "time_entry_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "break_duration" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "duration" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "approved_by_id" TEXT,
    "rejection_reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_entry_statuses_name_key" ON "time_entry_statuses"("name");

-- CreateIndex
CREATE INDEX "time_entries_employee_id_idx" ON "time_entries"("employee_id");

-- CreateIndex
CREATE INDEX "time_entries_approved_by_id_idx" ON "time_entries"("approved_by_id");

-- CreateIndex
CREATE INDEX "time_entries_status_id_idx" ON "time_entries"("status_id");

-- CreateIndex
CREATE INDEX "time_entries_date_idx" ON "time_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "time_entries_employee_id_date_key" ON "time_entries"("employee_id", "date");

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "time_entry_statuses"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;
