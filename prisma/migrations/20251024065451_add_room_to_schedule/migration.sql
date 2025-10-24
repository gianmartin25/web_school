/*
  Warnings:

  - You are about to drop the `schedules_backup` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "room" TEXT;

-- DropTable
DROP TABLE "public"."schedules_backup";
