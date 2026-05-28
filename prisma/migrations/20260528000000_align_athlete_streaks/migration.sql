ALTER TABLE "athlete_streaks"
  ADD COLUMN IF NOT EXISTS "current_streak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "longest_streak" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "last_trained_at" DATE;

UPDATE "athlete_streaks"
SET
  "current_streak" = GREATEST("current_streak", "streak_count"),
  "longest_streak" = GREATEST("longest_streak", "streak_count"),
  "last_trained_at" = COALESCE("last_trained_at", "last_training_date");
