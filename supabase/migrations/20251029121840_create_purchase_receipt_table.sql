-- Create PurchaseReceipt table
CREATE TABLE "PurchaseReceipt" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "purchaseDate" TIMESTAMP(3),
  "storeName" TEXT,
  "ocrRawText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PurchaseReceipt_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "PurchaseReceipt_userId_idx" ON "PurchaseReceipt"("userId");
CREATE INDEX "PurchaseReceipt_createdAt_idx" ON "PurchaseReceipt"("createdAt" DESC);
CREATE INDEX "PurchaseReceipt_purchaseDate_idx" ON "PurchaseReceipt"("purchaseDate");

-- Enable RLS
ALTER TABLE "PurchaseReceipt" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own purchase receipts"
  ON "PurchaseReceipt" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own purchase receipts"
  ON "PurchaseReceipt" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own purchase receipts"
  ON "PurchaseReceipt" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own purchase receipts"
  ON "PurchaseReceipt" FOR DELETE
  USING (auth.uid()::text = "userId");

-- Trigger for automatic updatedAt
CREATE TRIGGER update_purchase_receipt_updated_at
  BEFORE UPDATE ON "PurchaseReceipt"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
