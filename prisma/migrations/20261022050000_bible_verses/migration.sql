-- CreateTable
CREATE TABLE "BibleVerse" (
    "id" TEXT NOT NULL,
    "book" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "translation" VARCHAR(20) NOT NULL,
    "reference" VARCHAR(80) NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BibleVerse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BibleVerse_locale_idx" ON "BibleVerse"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "BibleVerse_book_chapter_verse_locale_key" ON "BibleVerse"("book", "chapter", "verse", "locale");

