-- Create RecipeIngredient table
CREATE TABLE "RecipeIngredient" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "recipeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "amount" DOUBLE PRECISION,
  "unit" "IngredientUnit",
  "category" "IngredientCategory",
  "isMainIngredient" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId")
    REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");
CREATE INDEX "RecipeIngredient_category_idx" ON "RecipeIngredient"("category");
CREATE INDEX "RecipeIngredient_isMainIngredient_idx" ON "RecipeIngredient"("isMainIngredient");

ALTER TABLE "RecipeIngredient" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipe ingredients for their own recipes"
  ON "RecipeIngredient" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeIngredient"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can insert recipe ingredients for their own recipes"
  ON "RecipeIngredient" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeIngredient"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can update recipe ingredients for their own recipes"
  ON "RecipeIngredient" FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeIngredient"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can delete recipe ingredients for their own recipes"
  ON "RecipeIngredient" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeIngredient"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE TRIGGER update_recipe_ingredient_updated_at
  BEFORE UPDATE ON "RecipeIngredient"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
