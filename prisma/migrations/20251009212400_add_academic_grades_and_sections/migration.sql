-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "gradeId" TEXT,
ADD COLUMN     "sectionId" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "gradeId" TEXT,
ADD COLUMN     "sectionId" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "gradeId" TEXT,
ADD COLUMN     "sectionId" TEXT;

-- CreateTable
CREATE TABLE "academic_grades" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_sections" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "capacity" INTEGER NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_grades_name_key" ON "academic_grades"("name");

-- CreateIndex
CREATE UNIQUE INDEX "academic_grades_level_key" ON "academic_grades"("level");

-- CreateIndex
CREATE UNIQUE INDEX "sections_name_key" ON "sections"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grade_sections_gradeId_sectionId_key" ON "grade_sections"("gradeId", "sectionId");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_sections" ADD CONSTRAINT "grade_sections_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_sections" ADD CONSTRAINT "grade_sections_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
