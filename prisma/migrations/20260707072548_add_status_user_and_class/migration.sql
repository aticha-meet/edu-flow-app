-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "statusClass" AS ENUM ('active', 'upcoming', 'complete');

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "status" "statusClass" NOT NULL DEFAULT 'upcoming';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "userStatus" NOT NULL DEFAULT 'active';
