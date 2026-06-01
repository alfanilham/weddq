-- AlterTable: Wedding salutations + WA template
ALTER TABLE "Wedding"
  ADD COLUMN "openingSalutation" TEXT,
  ADD COLUMN "closingSalutation" TEXT,
  ADD COLUMN "waMessageTemplate" TEXT;

-- AlterTable: Guest slug + WA status
ALTER TABLE "Guest"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "waStatus" TEXT,
  ADD COLUMN "waSentAt" TIMESTAMP(3),
  ADD COLUMN "waError" TEXT;

-- CreateIndex: composite unique for slug per wedding (NULLs allowed multiple times in Postgres)
CREATE UNIQUE INDEX "Guest_weddingId_slug_key" ON "Guest"("weddingId", "slug");
