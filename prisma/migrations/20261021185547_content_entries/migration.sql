-- CreateTable
CREATE TABLE "ContentEntry" (
    "id" TEXT NOT NULL,
    "section" VARCHAR(40) NOT NULL,
    "key" VARCHAR(80) NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" VARCHAR(120),

    CONSTRAINT "ContentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "changedBy" VARCHAR(120),
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentEntry_locale_idx" ON "ContentEntry"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ContentEntry_section_key_locale_key" ON "ContentEntry"("section", "key", "locale");

-- CreateIndex
CREATE INDEX "ContentRevision_entryId_changedAt_idx" ON "ContentRevision"("entryId", "changedAt" DESC);

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
