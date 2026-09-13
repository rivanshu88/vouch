-- =====================================================================
-- VOUCH DEMO DATA SEED SCRIPT (PostgreSQL / Supabase)
-- =====================================================================
-- Contains:
-- 1. Skills taxonomy (React, TypeScript, Python, SQL, Solidity, PyTorch, Go, Docker, Linux, Rust)
-- 2. Demo Personas (Arjun, Rohan, Sneha, Priya)
-- 3. Candidate Skills (Verified benchmarks & unverified claims)
-- 4. Teams with intentional gaps:
--    - Team 1 (ETHGlobal): Needs Solidity/Smart Contracts
--    - Team 2 (HackMIT): Needs ML/PyTorch
--    - Team 3 (PennApps): Needs Frontend Lead (React/Next.js)
-- 5. Campus Recruitment Drives:
--    - Stripe: Frontend/Full-stack (React >= 75%, TS >= 70%, SQL >= 65%)
--    - Datadog: Systems/Distributed (Go >= 80%, Docker >= 75%, Linux >= 70%)
-- =====================================================================

-- 1. SKILLS TAXONOMY
INSERT INTO skills (id, name, category, description)
VALUES
  ('react', 'React', 'frontend', 'Modern React architecture, hooks, concurrent features, and fiber reconciler'),
  ('typescript', 'TypeScript', 'languages', 'Advanced type gymnastics, generics, type-narrowing, and sound system design'),
  ('python', 'Python', 'backend', 'AsyncIO, data manipulation, FastAPI, and algorithm optimization'),
  ('sql', 'SQL', 'database', 'Query optimization, indexing strategies, normalization, and window functions'),
  ('solidity', 'Solidity', 'languages', 'Smart contracts, EVM execution, ERC standards, and gas optimization'),
  ('pytorch', 'PyTorch', 'backend', 'Tensor operations, neural architectures, training loops, and inference'),
  ('go', 'Go', 'languages', 'Concurrency primitives, channels, goroutines, and high-throughput networking'),
  ('docker', 'Docker', 'devops', 'Multi-stage container builds, orchestration, and volume networking'),
  ('linux', 'Linux', 'devops', 'POSIX system calls, eBPF telemetry, shell automation, and performance tuning'),
  ('rust', 'Rust', 'languages', 'Borrow checker, lifetimes, fearless concurrency, and zero-cost abstractions')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description;

-- 2. DEMO PERSONAS
-- Note: If running with Supabase Auth enabled, create corresponding auth.users entries or insert directly into profiles
INSERT INTO profiles (id, full_name, email, college, branch, graduation_year, bio, avatar_url, github_username, role)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Arjun Verma',
    'arjun@vouch.tech',
    'Indian Institute of Technology, Bombay',
    'Computer Science & Engineering',
    2025,
    'Systems and fullstack engineer focused on high-throughput distributed systems and React performance architecture.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'arjunv-code',
    'candidate'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Rohan Kulkarni',
    'rohan@hackers.io',
    'BITS Pilani',
    'Information Systems',
    2025,
    'Hackathon veteran and backend architect. Leading Team NeuralMesh for ETHGlobal.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'rohank-dev',
    'team_leader'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Sneha Patel',
    'sneha.patel@stripe.com',
    'Stanford University',
    NULL,
    NULL,
    'Technical Talent Partner hiring infrastructure and frontend systems engineers for Stripe.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    NULL,
    'recruiter'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Priya Sundaram',
    'priya@pes.edu',
    'PES University, Bengaluru',
    'Data Science',
    2026,
    'Data structures enthusiast and Python backend developer.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'priyasun',
    'candidate'
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  college = EXCLUDED.college,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role;

-- 3. CANDIDATE SKILLS
INSERT INTO candidate_skills (candidate_id, skill_id, declared_level, verification_status, verification_score, verified_at)
VALUES
  -- Arjun Verma: React 88%, TS 82%, unverified Rust & Docker
  ('00000000-0000-0000-0000-000000000001', 'react', 'advanced', 'verified', 88.00, NOW()),
  ('00000000-0000-0000-0000-000000000001', 'typescript', 'advanced', 'verified', 82.00, NOW()),
  ('00000000-0000-0000-0000-000000000001', 'rust', 'intermediate', 'unverified', NULL, NULL),
  ('00000000-0000-0000-0000-000000000001', 'docker', 'intermediate', 'unverified', NULL, NULL),
  -- Priya Sundaram: Python 84%, SQL 78%
  ('00000000-0000-0000-0000-000000000004', 'python', 'advanced', 'verified', 84.00, NOW()),
  ('00000000-0000-0000-0000-000000000004', 'sql', 'intermediate', 'verified', 78.00, NOW()),
  -- Rohan Kulkarni: Python 90%, SQL 82%
  ('00000000-0000-0000-0000-000000000002', 'python', 'advanced', 'verified', 90.00, NOW()),
  ('00000000-0000-0000-0000-000000000002', 'sql', 'intermediate', 'verified', 82.00, NOW())
ON CONFLICT (candidate_id, skill_id) DO UPDATE SET
  verification_status = EXCLUDED.verification_status,
  verification_score = EXCLUDED.verification_score,
  verified_at = EXCLUDED.verified_at;

-- 4. TEAMS WITH INTENTIONAL GAPS
INSERT INTO teams (id, name, description, hackathon_name, leader_id, status, max_members)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'NeuralMesh',
    'Decentralized AI inference network running verifiable neural execution environments.',
    'ETHGlobal New York',
    '00000000-0000-0000-0000-000000000002',
    'open',
    4
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'SentinelGuard',
    'Autonomous incident response agent using eBPF probes and streaming anomaly detection.',
    'HackMIT 2024',
    '00000000-0000-0000-0000-000000000001',
    'open',
    3
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'OmniChain Labs',
    'Decentralized automated oracle network verifying cross-chain data feeds with cryptographic proofs.',
    'PennApps XXV',
    '00000000-0000-0000-0000-000000000004',
    'open',
    4
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 5. TEAM REQUIREMENTS
INSERT INTO team_requirements (team_id, skill_id, role, minimum_level, minimum_score, required)
VALUES
  -- Team 1: Needs Solidity/Smart Contracts (Intentional Gap)
  ('10000000-0000-0000-0000-000000000001', 'solidity', 'Smart Contracts Architect', 'advanced', 80.00, true),
  ('10000000-0000-0000-0000-000000000001', 'typescript', 'Web3 Fullstack', 'intermediate', 75.00, true),
  -- Team 2: Needs ML/PyTorch (Intentional Gap)
  ('10000000-0000-0000-0000-000000000002', 'pytorch', 'ML / Anomaly Detection', 'advanced', 80.00, true),
  ('10000000-0000-0000-0000-000000000002', 'python', 'Backend Systems', 'intermediate', 70.00, false),
  -- Team 3: Needs Frontend Lead React/Next.js (Intentional Gap)
  ('10000000-0000-0000-0000-000000000003', 'react', 'Frontend Lead', 'advanced', 75.00, true),
  ('10000000-0000-0000-0000-000000000003', 'sql', 'Database Lead', 'intermediate', 65.00, true);

-- 6. RECRUITMENT DRIVES
INSERT INTO recruitment_drives (id, company_name, title, role, location, type, description, status)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Stripe',
    'Software Engineer — Frontend Infrastructure',
    'Frontend Systems Engineer',
    'Bengaluru, India / Remote',
    'Full-Time',
    'Design and build core merchant dashboards, payment flow performance optimizations, and design system components at scale.',
    'open'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Datadog',
    'Systems Engineer — Distributed Telemetry & Ingestion',
    'Systems / Distributed Engineer',
    'Hyderabad, India / Hybrid',
    'Full-Time',
    'Build distributed data ingestion pipelines handling millions of telemetry data points per second with Go, Docker containers, and Linux kernels.',
    'open'
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 7. RECRUITMENT REQUIREMENTS
INSERT INTO recruitment_requirements (drive_id, skill_id, minimum_level, minimum_score, required)
VALUES
  -- Stripe: React >= 75%, TS >= 70%, SQL >= 65%
  ('20000000-0000-0000-0000-000000000001', 'react', 'advanced', 75.00, true),
  ('20000000-0000-0000-0000-000000000001', 'typescript', 'intermediate', 70.00, true),
  ('20000000-0000-0000-0000-000000000001', 'sql', 'intermediate', 65.00, true),
  -- Datadog: Go >= 80%, Docker >= 75%, Linux >= 70%
  ('20000000-0000-0000-0000-000000000002', 'go', 'advanced', 80.00, true),
  ('20000000-0000-0000-0000-000000000002', 'docker', 'intermediate', 75.00, true),
  ('20000000-0000-0000-0000-000000000002', 'linux', 'intermediate', 70.00, true);
