-- CreateTable
CREATE TABLE "StoryChapter" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "photo" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryChapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryChapter_weddingId_idx" ON "StoryChapter"("weddingId");

-- AddForeignKey
ALTER TABLE "StoryChapter" ADD CONSTRAINT "StoryChapter_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
