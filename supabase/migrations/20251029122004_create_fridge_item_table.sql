-- Create FridgeItem table
CREATE TABLE "FridgeItem" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "purchaseReceiptId" TEXT,
  "name" TEXT NOT NULL,
  "category" "IngredientCategory" NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "unit" "IngredientUnit" NOT NULL,
  "purchasedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FridgeItem_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "FridgeItem_purchaseReceiptId_fkey" FOREIGN KEY ("purchaseReceiptId")
    REFERENCES "PurchaseReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "FridgeItem_userId_idx" ON "FridgeItem"("userId");
CREATE INDEX "FridgeItem_purchaseReceiptId_idx" ON "FridgeItem"("purchaseReceiptId");
CREATE INDEX "FridgeItem_category_idx" ON "FridgeItem"("category");
CREATE INDEX "FridgeItem_expiresAt_idx" ON "FridgeItem"("expiresAt");

ALTER TABLE "FridgeItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fridge items"
  ON "FridgeItem" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own fridge items"
  ON "FridgeItem" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own fridge items"
  ON "FridgeItem" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own fridge items"
  ON "FridgeItem" FOR DELETE
  USING (auth.uid()::text = "userId");

CREATE TRIGGER update_fridge_item_updated_at
  BEFORE UPDATE ON "FridgeItem"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
