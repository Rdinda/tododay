/*
  Warnings:

  - You are about to drop the column `isMain` on the `Task` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'LOW');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "isMain",
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'HIGH';
