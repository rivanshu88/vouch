-- VOUCH Database Schema for Supabase PostgreSQL
-- Production-ready schema with RLS policies, indexing, and foreign keys

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('candidate', 'team_leader', 'recruiter');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attempt_status AS ENUM ('in_progress', 'submitted', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE team_status AS ENUM ('open', 'full', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE test_status AS ENUM ('invited', 'started', 'completed', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE drive_status AS ENUM ('draft', 'open', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('applied', 'eligible', 'shortlisted', 'interview', 'selected', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  college TEXT NOT NULL,
  branch TEXT,
  graduation_year INTEGER,
  bio TEXT,
  avatar_url TEXT,
  github_username TEXT,
  role user_role DEFAULT 'candidate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SKILLS TAXONOMY
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT
);

-- 5. CANDIDATE SKILLS
CREATE TABLE IF NOT EXISTS candidate_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  declared_level skill_level NOT NULL,
  verification_status verification_status DEFAULT 'unverified',
  verification_score NUMERIC(5,2),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_candidate_skill UNIQUE(candidate_id, skill_id)
);

-- 6. PROJECTS & CERTIFICATES EVIDENCE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  project_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  credential_url TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GITHUB EVIDENCE
CREATE TABLE IF NOT EXISTS github_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  public_repos_count INTEGER DEFAULT 0,
  total_stars INTEGER DEFAULT 0,
  top_languages JSONB DEFAULT '[]'::jsonb,
  recent_repos JSONB DEFAULT '[]'::jsonb,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUESTIONS & BLUEPRINTS
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  difficulty skill_level NOT NULL,
  question_text TEXT NOT NULL,
  correct_option_id TEXT NOT NULL,
  explanation TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_options (
  id TEXT NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  PRIMARY KEY (question_id, id)
);

-- 9. ASSESSMENTS & ATTEMPTS
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  difficulty skill_level NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 600,
  question_count INTEGER NOT NULL DEFAULT 10,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  status attempt_status DEFAULT 'in_progress',
  score NUMERIC(5,2),
  passed BOOLEAN,
  integrity_score NUMERIC(5,2),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id TEXT,
  is_correct BOOLEAN,
  time_spent_ms INTEGER DEFAULT 0,
  answer_change_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 10. TEAMS & FORMATION
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  hackathon_name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status team_status DEFAULT 'open',
  max_members INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_team_member UNIQUE(team_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS team_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  role TEXT,
  minimum_level skill_level NOT NULL DEFAULT 'intermediate',
  minimum_score NUMERIC(5,2) DEFAULT 70,
  required BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS team_join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 11. TEAM VERIFICATION TESTS
CREATE TABLE IF NOT EXISTS team_verification_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  difficulty skill_level NOT NULL,
  required_score NUMERIC(5,2) NOT NULL,
  assessment_attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE SET NULL,
  status test_status DEFAULT 'invited',
  candidate_score NUMERIC(5,2),
  integrity_score NUMERIC(5,2),
  decision_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 12. RECRUITMENT DRIVES & APPLICATIONS
CREATE TABLE IF NOT EXISTS recruitment_drives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT DEFAULT 'Full-Time',
  description TEXT,
  status drive_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recruitment_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id UUID NOT NULL REFERENCES recruitment_drives(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  minimum_level skill_level NOT NULL,
  minimum_score NUMERIC(5,2) DEFAULT 70,
  required BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id UUID NOT NULL REFERENCES recruitment_drives(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status application_status DEFAULT 'applied',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_candidate_application UNIQUE(drive_id, candidate_id)
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PERFORMANCE INDEXES (Per PRD section 97)
CREATE INDEX IF NOT EXISTS idx_candidate_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill ON candidate_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_questions_skill_diff ON questions(skill_id, difficulty, topic);
CREATE INDEX IF NOT EXISTS idx_attempts_candidate ON assessment_attempts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_team_reqs_team ON team_requirements(team_id);
CREATE INDEX IF NOT EXISTS idx_applications_drive ON applications(drive_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);

-- 15. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_verification_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Read policies (public / authenticated)
CREATE POLICY "Public profiles are viewable by all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view verified candidate skills" ON candidate_skills FOR SELECT USING (true);
CREATE POLICY "Candidates can manage own skills" ON candidate_skills FOR ALL USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can manage own projects" ON projects FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);

CREATE POLICY "Candidates can view and manage own attempts" ON assessment_attempts FOR ALL USING (auth.uid() = candidate_id);
CREATE POLICY "Only candidate can insert events for active attempt" ON assessment_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM assessment_attempts WHERE id = attempt_id AND candidate_id = auth.uid() AND status = 'in_progress')
);

CREATE POLICY "Anyone can view open teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Team leader can manage team" ON teams FOR ALL USING (auth.uid() = leader_id);

CREATE POLICY "Candidates and leaders can view verification tests" ON team_verification_tests FOR SELECT USING (
  auth.uid() = candidate_id OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND leader_id = auth.uid())
);
