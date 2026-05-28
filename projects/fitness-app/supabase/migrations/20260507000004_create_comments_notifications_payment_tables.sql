-- Migration: T-02-05
-- Creates comments, notification_settings, and client_payment_links.
-- All three depend only on users/organizations from T-02-01.
-- No RLS. RLS is applied in Slice 4.

-- ============================================================
-- 1. comments
-- Depends on: organizations, users (from T-02-01)
-- context_type is constrained to the three allowed values via
-- CHECK — no enum type needed for a single-column constraint.
-- context_id is a plain uuid with no FK — comments can target
-- objects across multiple tables (polymorphic context).
-- ============================================================

CREATE TABLE comments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid        NOT NULL REFERENCES organizations (id),
  author_id    uuid        NOT NULL REFERENCES users (id),
  coach_id     uuid        NOT NULL REFERENCES users (id),
  client_id    uuid        NOT NULL REFERENCES users (id),
  context_type text        NOT NULL CHECK (context_type IN ('exercise', 'workout', 'checkin')),
  context_id   uuid        NOT NULL,
  body         text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_org_id    ON comments (org_id);
CREATE INDEX idx_comments_coach_id  ON comments (coach_id);
CREATE INDEX idx_comments_client_id ON comments (client_id);
CREATE INDEX idx_comments_context   ON comments (context_type, context_id);

-- ============================================================
-- 2. notification_settings
-- Depends on: users (from T-02-01)
-- One row per coach — UNIQUE on coach_id enforces the 1:1
-- relationship. All boolean columns default to true so a
-- newly created coach receives all notifications by default.
-- ============================================================

CREATE TABLE notification_settings (
  id                       uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id                 uuid    NOT NULL UNIQUE REFERENCES users (id),
  invite_emails            boolean NOT NULL DEFAULT true,
  plan_assigned_emails     boolean NOT NULL DEFAULT true,
  checkin_reminder_emails  boolean NOT NULL DEFAULT true,
  comment_emails           boolean NOT NULL DEFAULT true,
  payment_reminder_emails  boolean NOT NULL DEFAULT true
);

CREATE INDEX idx_notification_settings_coach_id ON notification_settings (coach_id);

-- ============================================================
-- 3. client_payment_links
-- Depends on: users (from T-02-01)
-- Future-proofing table — must not be referenced in any
-- Server Action, query, or UI component in v1.
-- payment_link_url is NOT NULL — a row without a URL is
-- invalid.
-- updated_at is set on insert only; an update trigger is out
-- of scope for this slice.
-- ============================================================

CREATE TABLE client_payment_links (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id         uuid        NOT NULL REFERENCES users (id),
  client_id        uuid        NOT NULL REFERENCES users (id),
  payment_link_url text        NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_payment_links_coach_id  ON client_payment_links (coach_id);
CREATE INDEX idx_client_payment_links_client_id ON client_payment_links (client_id);
