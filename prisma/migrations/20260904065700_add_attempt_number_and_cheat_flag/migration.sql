-- AddColumn: attemptNumber (default 1 for existing rows)
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "attemptNumber" INTEGER NOT NULL DEFAULT 1;

-- AddColumn: submittedByCheat (default false)
ALTER TABLE "Attempt" ADD COLUMN IF NOT EXISTS "submittedByCheat" BOOLEAN NOT NULL DEFAULT false;

-- AddUniqueConstraint: studentId + testId + attemptNumber
-- (ถ้ามี existing data ที่ซ้ำกัน migration นี้จะ fail — ดูเอกสาร plan)
CREATE UNIQUE INDEX IF NOT EXISTS "Attempt_studentId_testId_attemptNumber_key"
    ON "Attempt"("studentId", "testId", "attemptNumber");
