CREATE TABLE IF NOT EXISTS "training_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "workout_id" UUID,
  "date" DATE NOT NULL,
  "training_type" TEXT NOT NULL,
  "notes" TEXT,
  "duration_min" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "training_session_exercises" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "exercise_id" UUID,
  "name" TEXT NOT NULL,
  "sets_done" INTEGER NOT NULL,
  "reps_done" INTEGER NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "order_index" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "training_sessions"
  ADD COLUMN IF NOT EXISTS "workout_id" UUID,
  ADD COLUMN IF NOT EXISTS "duration_min" INTEGER,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "training_session_exercises"
  ADD COLUMN IF NOT EXISTS "exercise_id" UUID,
  ADD COLUMN IF NOT EXISTS "order_index" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'training_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE "training_sessions"
      ADD CONSTRAINT "training_sessions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'training_session_exercises_session_id_fkey'
  ) THEN
    ALTER TABLE "training_session_exercises"
      ADD CONSTRAINT "training_session_exercises_session_id_fkey"
      FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'training_session_exercises_exercise_id_fkey'
  ) THEN
    ALTER TABLE "training_session_exercises"
      ADD CONSTRAINT "training_session_exercises_exercise_id_fkey"
      FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
