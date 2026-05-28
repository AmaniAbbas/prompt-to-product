-- Migration: T-02-02
-- Creates exercise library and workout template tables in FK dependency order.
-- No RLS. RLS is applied in Slice 4.

-- ============================================================
-- 1. exercises
-- Depends on: organizations, users (from T-02-01)
-- is_global is a schema-only field; no UI references it in v1.
-- ============================================================

CREATE TABLE exercises (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations (id),
  created_by  uuid        NOT NULL REFERENCES users (id),
  name        text        NOT NULL,
  description text,
  video_url   text,
  is_global   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_org_id     ON exercises (org_id);
CREATE INDEX idx_exercises_created_by ON exercises (created_by);

-- ============================================================
-- 2. workout_templates
-- Depends on: organizations, users (from T-02-01)
-- updated_at is set on insert only; an update trigger is out
-- of scope for this slice.
-- ============================================================

CREATE TABLE workout_templates (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations (id),
  coach_id    uuid        NOT NULL REFERENCES users (id),
  name        text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workout_templates_org_id   ON workout_templates (org_id);
CREATE INDEX idx_workout_templates_coach_id ON workout_templates (coach_id);

-- ============================================================
-- 3. workout_template_exercises
-- Depends on: workout_templates, exercises
-- position is integer (ordering field, not a flexible workout
-- field). Flexible fields — sets, reps, weight, rest, rpe,
-- tempo, notes — are text to support any format a coach uses.
-- Deleting a template cascades to its exercise rows.
-- Deleting an exercise is blocked while referenced (NO ACTION).
-- ============================================================

CREATE TABLE workout_template_exercises (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid    NOT NULL REFERENCES workout_templates (id) ON DELETE CASCADE,
  exercise_id uuid    NOT NULL REFERENCES exercises (id),
  position    integer NOT NULL,
  sets        text,
  reps        text,
  weight      text,
  rest        text,
  rpe         text,
  tempo       text,
  notes       text
);

CREATE INDEX idx_wte_template_id ON workout_template_exercises (template_id);
CREATE INDEX idx_wte_exercise_id ON workout_template_exercises (exercise_id);
