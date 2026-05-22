-- CreateTable
CREATE TABLE "apods" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "explanation" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "service_version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apods_pkey" PRIMARY KEY ("id")
);
