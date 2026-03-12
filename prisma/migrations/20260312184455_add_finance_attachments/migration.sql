-- CreateTable
CREATE TABLE "FinanceAttachment" (
    "id" TEXT NOT NULL,
    "financeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FinanceAttachment" ADD CONSTRAINT "FinanceAttachment_financeId_fkey" FOREIGN KEY ("financeId") REFERENCES "Finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
