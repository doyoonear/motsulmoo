-- Create Enum Types for Ingredients
DO $$ BEGIN
    CREATE TYPE "IngredientCategory" AS ENUM (
        'VEGETABLE',
        'MEAT',
        'SEAFOOD',
        'MUSHROOM',
        'EGG_PROTEIN',
        'GRAIN_NOODLE',
        'DAIRY',
        'PROCESSED',
        'SEASONING',
        'SNACK_ETC'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "IngredientUnit" AS ENUM (
        'G',
        'ML'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to automatically update updatedAt column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';
