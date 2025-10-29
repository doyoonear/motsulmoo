-- Create RecipeStep table
CREATE TABLE "RecipeStep" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "recipeId" TEXT NOT NULL,
  "stepNumber" INTEGER NOT NULL,
  "instruction" TEXT NOT NULL,
  "imageUrl" TEXT,
  "durationMinutes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId")
    REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RecipeStep_stepNumber_unique" UNIQUE ("recipeId", "stepNumber")
);

CREATE INDEX "RecipeStep_recipeId_idx" ON "RecipeStep"("recipeId");
CREATE INDEX "RecipeStep_stepNumber_idx" ON "RecipeStep"("recipeId", "stepNumber");

ALTER TABLE "RecipeStep" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipe steps for their own recipes"
  ON "RecipeStep" FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeStep"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can insert recipe steps for their own recipes"
  ON "RecipeStep" FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeStep"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can update recipe steps for their own recipes"
  ON "RecipeStep" FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeStep"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE POLICY "Users can delete recipe steps for their own recipes"
  ON "RecipeStep" FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM "Recipe"
    WHERE "Recipe"."id" = "RecipeStep"."recipeId"
    AND "Recipe"."userId" = auth.uid()::text
  ));

CREATE TRIGGER update_recipe_step_updated_at
  BEFORE UPDATE ON "RecipeStep"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
