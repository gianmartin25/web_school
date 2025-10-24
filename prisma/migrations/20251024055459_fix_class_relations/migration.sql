/*
  Warnings:

  - You are about to drop the column `isActive` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `schedules` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `schedules` table. All the data in the column will be lost.
  - Changed the type of `startTime` on the `schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `schedules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `academicPeriodId` on table `schedules` required. This step will fail if there are existing NULL values in that column.

*/
-- Backup existing data
CREATE TABLE schedules_backup AS TABLE schedules;

-- Handle NULL values in academicPeriodId
UPDATE schedules SET "academicPeriodId" = (SELECT id FROM academic_periods LIMIT 1) WHERE "academicPeriodId" IS NULL;

-- DropForeignKey
ALTER TABLE "public"."schedules" DROP CONSTRAINT "schedules_academicPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."schedules" DROP CONSTRAINT "schedules_classId_fkey";

-- DropIndex
DROP INDEX "public"."classes_name_gradeId_sectionId_academicYear_key";

-- DropIndex
DROP INDEX "public"."schedules_classId_dayOfWeek_startTime_key";

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "isActive",
DROP COLUMN "notes",
DROP COLUMN "room",
ALTER COLUMN "dayOfWeek" SET DATA TYPE TEXT,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "academicPeriodId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
