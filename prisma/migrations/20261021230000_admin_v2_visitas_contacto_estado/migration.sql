-- CreateEnum
CREATE TYPE "PrayerStatus" AS ENUM ('NEW', 'PRAYING', 'ANSWERED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "PrayerRequest" ADD COLUMN     "status" "PrayerStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminLocale",
ADD COLUMN     "phone" VARCHAR(30),
ADD COLUMN     "telegramChatId" VARCHAR(40),
ADD COLUMN     "whatsapp" VARCHAR(30);

-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "path" VARCHAR(200) NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "country" VARCHAR(2),
    "device" VARCHAR(10) NOT NULL,
    "visitorHash" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageVisit_createdAt_idx" ON "PageVisit"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "PrayerRequest_status_createdAt_idx" ON "PrayerRequest"("status", "createdAt" DESC);

