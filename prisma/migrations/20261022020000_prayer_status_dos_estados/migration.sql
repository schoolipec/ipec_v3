-- Solo dos estados: NEW (Recibida) y DOWNLOADED (Descargada).
-- Cualquier estado anterior distinto de NEW pasa a DOWNLOADED (ya fue atendido).
CREATE TYPE "PrayerStatus_new" AS ENUM ('NEW', 'DOWNLOADED');
ALTER TABLE "PrayerRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PrayerRequest" ALTER COLUMN "status" TYPE "PrayerStatus_new"
  USING (CASE WHEN "status"::text = 'NEW' THEN 'NEW' ELSE 'DOWNLOADED' END)::"PrayerStatus_new";
DROP TYPE "PrayerStatus";
ALTER TYPE "PrayerStatus_new" RENAME TO "PrayerStatus";
ALTER TABLE "PrayerRequest" ALTER COLUMN "status" SET DEFAULT 'NEW';
