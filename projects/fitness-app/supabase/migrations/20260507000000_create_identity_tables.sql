-- Migration: T-02-01
-- Creates the four core identity tables in FK dependency order.
-- No RLS. RLS is applied in Slice 4.

-- ============================================================
-- 1. organizations
-- ============================================================

CREATE TABLE organizations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_id ON organizations (id);

-- ============================================================
-- 2. users
-- Depends on: organizations
-- ============================================================

CREATE TYPE user_role AS ENUM ('coach', 'client', 'admin');

CREATE TABLE users (
  id         uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  org_id     uuid        NOT NULL REFERENCES organizations (id),
  role       user_role   NOT NULL,
  email      text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_org_id ON users (org_id);

-- ============================================================
-- 3. coach_profiles
-- Depends on: users
-- trial_started_at, trial_ends_at, subscription_status are
-- future-proofing columns only — no logic or UI in v1.
-- ============================================================

CREATE TABLE coach_profiles (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid        NOT NULL REFERENCES users (id),
  display_name             text,
  business_name            text,
  default_payment_link_url text,
  trial_started_at         timestamptz,
  trial_ends_at            timestamptz,
  subscription_status      text,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_profiles_user_id ON coach_profiles (user_id);

-- ============================================================
-- 4. client_profiles
-- Depends on: users (user_id), users (coach_id)
-- coach_id references users.id — consistent with coach_id
-- semantics used across the full schema.
-- ============================================================

CREATE TABLE client_profiles (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid        NOT NULL REFERENCES users (id),
  coach_id                  uuid        NOT NULL REFERENCES users (id),
  display_name              text,
  email                     text,
  consented_health_data     boolean     NOT NULL DEFAULT false,
  consented_progress_photos boolean     NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_profiles_user_id  ON client_profiles (user_id);
CREATE INDEX idx_client_profiles_coach_id ON client_profiles (coach_id);
