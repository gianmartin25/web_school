/*
  Warnings:

  - You are about to drop the column `grade` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,gradeId,sectionId,academicYear]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - Made the column `gradeId` on table `classes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sectionId` on table `classes` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `academicPeriodId` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentId` to the `student_profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `gradeId` on table `student_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sectionId` on table `student_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_students" DROP CONSTRAINT "class_students_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."grades" DROP CONSTRAINT "grades_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."observations" DROP CONSTRAINT "observations_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_profiles" DROP CONSTRAINT "student_profiles_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_profiles" DROP CONSTRAINT "student_profiles_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_sectionId_fkey";

-- DropIndex
DROP INDEX "public"."classes_name_grade_section_academicYear_key";

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "academicPeriodId" TEXT;

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "grade",
DROP COLUMN "section",
ALTER COLUMN "gradeId" SET NOT NULL,
ALTER COLUMN "sectionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "academicPeriodId" TEXT NOT NULL,
ADD COLUMN     "isExtraCredit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reviewDate" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "rubricId" TEXT,
ADD COLUMN     "term" TEXT NOT NULL DEFAULT 'Q1',
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "isBroadcast" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "replyToId" TEXT,
ADD COLUMN     "targetRole" "UserRole",
ADD COLUMN     "threadId" TEXT,
ALTER COLUMN "receiverId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "grade",
DROP COLUMN "section",
ADD COLUMN     "academicStatus" TEXT NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "address" TEXT,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "attendanceRate" DOUBLE PRECISION,
ADD COLUMN     "behaviorScore" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "currentGPA" DOUBLE PRECISION,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "medicalNotes" TEXT,
ADD COLUMN     "parentContact" TEXT,
ADD COLUMN     "parentId" TEXT NOT NULL,
ADD COLUMN     "specialNeeds" TEXT,
ADD COLUMN     "totalCredits" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "gradeId" SET NOT NULL,
ALTER COLUMN "sectionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "totalClasses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalStudents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSubjects" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."students";

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "academicYear" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "gradesDueDate" TIMESTAMP(3),
    "reportCardDate" TIMESTAMP(3),
    "parentMeetingDate" TIMESTAMP(3),
    "minPassingGrade" DOUBLE PRECISION NOT NULL DEFAULT 11.0,
    "maxGrade" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "allowLateGrades" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalTeachers" INTEGER NOT NULL DEFAULT 0,
    "totalParents" INTEGER NOT NULL DEFAULT 0,
    "totalClasses" INTEGER NOT NULL DEFAULT 0,
    "activeClasses" INTEGER NOT NULL DEFAULT 0,
    "averageAttendance" DOUBLE PRECISION,
    "averageGrade" DOUBLE PRECISION,
    "systemUptime" DOUBLE PRECISION,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_metrics" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "averageGrade" DOUBLE PRECISION,
    "attendanceRate" DOUBLE PRECISION,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "activeStudents" INTEGER NOT NULL DEFAULT 0,
    "gradeDistribution" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "academicPeriodId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "type" TEXT NOT NULL DEFAULT 'HOMEWORK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "latePenalty" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_periods_academicYear_type_order_key" ON "academic_periods"("academicYear", "type", "order");

-- CreateIndex
CREATE UNIQUE INDEX "class_metrics_classId_key" ON "class_metrics"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_classId_dayOfWeek_startTime_key" ON "schedules"("classId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignmentId_studentId_key" ON "assignment_submissions"("assignmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_gradeId_sectionId_academicYear_key" ON "classes"("name", "gradeId", "sectionId", "academicYear");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_students" ADD CONSTRAINT "class_students_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_metrics" ADD CONSTRAINT "class_metrics_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
