-- Migration: T-02-04
-- Creates check-in and progress photo tables in FK dependency order.
-- No RLS. RLS is applied in Slice 4.

-- ============================================================
-- 1. check_ins
-- Depends on: organizations, users (from T-02-01)
-- weight is numeric — a quantitative body measurement.
-- mood (1–5) and adherence (0–100) are integers; range
-- constraints are enforced by application logic, not the DB.
-- ============================================================

CREATE TABLE check_ins (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL REFERENCES organizations (id),
  coach_id    uuid        NOT NULL REFERENCES users (id),
  client_id   uuid        NOT NULL REFERENCES users (id),
  weight      numeric,
  mood        integer,
  adherence   integer,
  comments    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_check_ins_org_id    ON check_ins (org_id);
CREATE INDEX idx_check_ins_coach_id  ON check_ins (coach_id);
CREATE INDEX idx_check_ins_client_id ON check_ins (client_id);

-- ============================================================
-- 2. progress_photos
-- Depends on: check_ins, users (from T-02-01)
-- storage_path is NOT NULL — a row with no path is invalid.
-- Deleting a check_in cascades to its photos.
-- No Storage bucket is configured at this stage (Slice 11).
-- ============================================================

CREATE TABLE progress_photos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id  uuid        NOT NULL REFERENCES check_ins (id) ON DELETE CASCADE,
  client_id    uuid        NOT NULL REFERENCES users (id),
  coach_id     uuid        NOT NULL REFERENCES users (id),
  storage_path text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_progress_photos_check_in_id ON progress_photos (check_in_id);
CREATE INDEX idx_progress_photos_client_id   ON progress_photos (client_id);
CREATE INDEX idx_progress_photos_coach_id    ON progress_photos (coach_id);
