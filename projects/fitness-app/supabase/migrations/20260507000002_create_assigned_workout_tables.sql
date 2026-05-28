-- Migration: T-02-03
-- Creates workout assignment snapshot tables in FK dependency order.
-- No RLS. RLS is applied in Slice 4.

-- ============================================================
-- 1. assigned_workouts
-- Depends on: organizations, users (from T-02-01)
-- source_template_id is a plain uuid with no FK — templates
-- can be deleted without affecting assignment history.
-- ============================================================

CREATE TABLE assigned_workouts (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             uuid        NOT NULL REFERENCES organizations (id),
  coach_id           uuid        NOT NULL REFERENCES users (id),
  client_id          uuid        NOT NULL REFERENCES users (id),
  source_template_id uuid,
  label              text,
  assigned_date      date        NOT NULL,
  title              text        NOT NULL,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assigned_workouts_org_id    ON assigned_workouts (org_id);
CREATE INDEX idx_assigned_workouts_coach_id  ON assigned_workouts (coach_id);
CREATE INDEX idx_assigned_workouts_client_id ON assigned_workouts (client_id);

-- ============================================================
-- 2. assigned_workout_exercises
-- Depends on: assigned_workouts
-- All exercise fields are denormalized text snapshots — they
-- preserve the workout as assigned, independent of any later
-- edits to the source exercise library.
-- position is integer (ordering field, not a flexible field).
-- completed_at is nullable; null means not yet completed.
-- Deleting an assigned_workout cascades to its exercise rows.
-- ============================================================

CREATE TABLE assigned_workout_exercises (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_workout_id  uuid        NOT NULL REFERENCES assigned_workouts (id) ON DELETE CASCADE,
  exercise_name        text,
  exercise_description text,
  video_url            text,
  position             integer     NOT NULL,
  sets                 text,
  reps                 text,
  weight               text,
  rest                 text,
  rpe                  text,
  tempo                text,
  notes                text,
  completed_at         timestamptz
);

CREATE INDEX idx_awe_assigned_workout_id ON assigned_workout_exercises (assigned_workout_id);
