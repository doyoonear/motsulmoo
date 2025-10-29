-- Create ShoppingList table
CREATE TABLE "ShoppingList" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isCompleted" BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShoppingList_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ShoppingList_userId_idx" ON "ShoppingList"("userId");
CREATE INDEX "ShoppingList_isCompleted_idx" ON "ShoppingList"("isCompleted");
CREATE INDEX "ShoppingList_createdAt_idx" ON "ShoppingList"("createdAt" DESC);

ALTER TABLE "ShoppingList" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping lists"
  ON "ShoppingList" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own shopping lists"
  ON "ShoppingList" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own shopping lists"
  ON "ShoppingList" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own shopping lists"
  ON "ShoppingList" FOR DELETE
  USING (auth.uid()::text = "userId");

CREATE TRIGGER update_shopping_list_updated_at
  BEFORE UPDATE ON "ShoppingList"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
