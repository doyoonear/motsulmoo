-- Create User table
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_email_idx" ON "User"("email");

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
  ON "User" FOR SELECT
  USING (auth.uid()::text = "id");

CREATE POLICY "Users can update their own data"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = "id");

CREATE TRIGGER update_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
