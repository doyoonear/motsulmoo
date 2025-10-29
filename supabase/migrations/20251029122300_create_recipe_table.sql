-- Create Recipe table
CREATE TABLE "Recipe" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cookingTimeMinutes" INTEGER,
  "mainIngredients" TEXT[] NOT NULL,
  "additionalIngredients" TEXT[],
  "instructions" TEXT NOT NULL,
  "imageUrls" TEXT[] NOT NULL,
  "originalRecipeId" TEXT,
  "modificationNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Recipe_originalRecipeId_fkey" FOREIGN KEY ("originalRecipeId")
    REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");
CREATE INDEX "Recipe_originalRecipeId_idx" ON "Recipe"("originalRecipeId");
CREATE INDEX "Recipe_createdAt_idx" ON "Recipe"("createdAt" DESC);

ALTER TABLE "Recipe" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipes"
  ON "Recipe" FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own recipes"
  ON "Recipe" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own recipes"
  ON "Recipe" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own recipes"
  ON "Recipe" FOR DELETE
  USING (auth.uid()::text = "userId");

CREATE TRIGGER update_recipe_updated_at
  BEFORE UPDATE ON "Recipe"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
