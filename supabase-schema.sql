-- ============================================================
-- Agency Platform V1 - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── project_types ───────────────────────────────────────────
CREATE TABLE project_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  default_duration_hours INTEGER NOT NULL DEFAULT 24,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── editors ─────────────────────────────────────────────────
CREATE TABLE editors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'both'
    CHECK (specialty IN ('talking_head', 'motion', 'both')),
  contact_info TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── projects ────────────────────────────────────────────────
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  project_type_id UUID REFERENCES project_types(id) ON DELETE SET NULL,
  deal_price DECIMAL(12, 2) DEFAULT 0,
  deadline DATE,
  stage TEXT NOT NULL DEFAULT 'incoming'
    CHECK (stage IN ('incoming', 'pre-production', 'shooting', 'editing', 'delivered')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── project_stakeholders ────────────────────────────────────
CREATE TABLE project_stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL
    CHECK (role IN ('filmmaker', 'media_face', 'voiceover', 'editor')),
  name TEXT NOT NULL DEFAULT '',
  editor_id UUID REFERENCES editors(id) ON DELETE SET NULL,
  cost DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── editor_assignments ──────────────────────────────────────
CREATE TABLE editor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  editor_id UUID NOT NULL REFERENCES editors(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Seed default project types ──────────────────────────────
INSERT INTO project_types (name, default_duration_hours, color) VALUES
  ('Talking Head', 24, '#3B82F6'),
  ('Motion Design', 72, '#8B5CF6'),
  ('Video Representative', 48, '#F97316');

-- ─── Disable RLS for V1 (no auth) ───────────────────────────
ALTER TABLE project_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE editors DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_stakeholders DISABLE ROW LEVEL SECURITY;
ALTER TABLE editor_assignments DISABLE ROW LEVEL SECURITY;
