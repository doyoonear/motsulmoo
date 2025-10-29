-- Create ShoppingListItem table
CREATE TABLE "ShoppingListItem" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "shoppingListId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "amount" DOUBLE PRECISION,
  "unit" "IngredientUnit",
  "category" "IngredientCategory",
  "isChecked" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ShoppingListItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId")
    REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ShoppingListItem_shoppingListId_idx" ON "ShoppingListItem"("shoppingListId");
CREATE INDEX "ShoppingListItem_category_idx" ON "ShoppingListItem"("category");
CREATE INDEX "ShoppingListItem_isChecked_idx" ON "ShoppingListItem"("isChecked");

ALTER TABLE "ShoppingListItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shopping list items for their own lists"
  ON "ShoppingListItem" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "ShoppingList"
    WHERE "ShoppingList"."id" = "ShoppingListItem"."shoppingListId"
    AND "ShoppingList"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can insert shopping list items for their own lists"
  ON "ShoppingListItem" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "ShoppingList"
    WHERE "ShoppingList"."id" = "ShoppingListItem"."shoppingListId"
    AND "ShoppingList"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can update shopping list items for their own lists"
  ON "ShoppingListItem" FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "ShoppingList"
    WHERE "ShoppingList"."id" = "ShoppingListItem"."shoppingListId"
    AND "ShoppingList"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can delete shopping list items for their own lists"
  ON "ShoppingListItem" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "ShoppingList"
    WHERE "ShoppingList"."id" = "ShoppingListItem"."shoppingListId"
    AND "ShoppingList"."userId" = auth.uid()::text
  ));

CREATE TRIGGER update_shopping_list_item_updated_at
  BEFORE UPDATE ON "ShoppingListItem"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
