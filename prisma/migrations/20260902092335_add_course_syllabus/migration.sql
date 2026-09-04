-- CreateTable
CREATE TABLE "CourseSyllabus" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSyllabus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseSyllabus_courseId_week_key" ON "CourseSyllabus"("courseId", "week");

-- AddForeignKey
ALTER TABLE "CourseSyllabus" ADD CONSTRAINT "CourseSyllabus_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
