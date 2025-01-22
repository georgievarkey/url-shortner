-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_mappings" (
    "id" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "longUrl" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "url_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_analytics" (
    "id" TEXT NOT NULL,
    "urlMappingId" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "url_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "url_mappings_shortUrl_key" ON "url_mappings"("shortUrl");

-- AddForeignKey
ALTER TABLE "url_mappings" ADD CONSTRAINT "url_mappings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "url_analytics" ADD CONSTRAINT "url_analytics_urlMappingId_fkey" FOREIGN KEY ("urlMappingId") REFERENCES "url_mappings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
