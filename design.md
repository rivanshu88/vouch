# VOUCH Design System Specification

**Version:** 2.0.0 (Senior UI/UX Production Spec)  
**Core Thesis:** *Proof → Verified Skills → Trust → Opportunity*  
**Platform:** Next.js (App Router), Tailwind CSS v4, TypeScript

---

## 1. Product Philosophy & Design Direction

Vouch replaces inflated resume claims with standardized assessment integrity, normalized GitHub code evidence, and explainable compatibility matching for hackathon teams and campus recruitment.

### Key Tenets
1. **Evidence-First, Not Claim-First:** Unverified claims are visually distinct from verified technical signals. Every verified badge carries demonstrable proof (score, timestamp, blueprint level).
2. **Senior-Engineered Light Theme:** The UI is anchored on crisp white and subtle warm-neutral surfaces (`bg-zinc-50/50`, `bg-white`) with fine borders (`border-zinc-200`, `#E2E8F0`) and restrained micro-shadows (`shadow-2xs`, `shadow-xs`). It explicitly rejects generic dark-mode AI gradient clichés.
3. **Calibrated & Explainable:** Scores are not arbitrary numbers. Evidence strength is weighted across 4 sources (45% Assessment, 25% GitHub, 20% Projects, 10% Certifications). Match scores explicitly disclose which required gaps are filled.
4. **Transparent, Non-Accusatory Integrity:** Anti-cheating telemetry (tab transitions, clipboard events, answer revisions) is presented objectively as behavioral indicators without accusatory phrasing or invasive proctoring software.

---

## 2. Color System & Semantic Tokens

### Canvas & Surfaces
| Token | Hex / Class | Purpose |
|---|---|---|
| `canvas-bg` | `#FAFAFA` (`zinc-50/50`) | Global page backdrop |
| `surface-card` | `#FFFFFF` (`bg-white`) | Primary card container |
| `surface-subtle` | `#F4F4F5` (`bg-zinc-100`) | Secondary wells, inputs, and chips |
| `border-subtle` | `#E4E4E7` (`border-zinc-200`) | Standard divider and card outline |
| `border-hover` | `#D4D4D8` (`hover:border-zinc-300`) | Interactive card hover border |

### Verification & Brand Accents
| Token | Hex / Class | Purpose |
|---|---|---|
| `brand-accent` | `#0284C7` (`sky-600`) | Interactive focus, links, primary CTA accents |
| `brand-surface` | `#F0F9FF` (`sky-50`) | Active selection card fill, blueprint specs |
| `verified-emerald` | `#059669` (`emerald-600`) | Signature verification seals & high-integrity pills |
| `verified-surface` | `#ECFDF5` (`emerald-50`) | Verified badge backgrounds |
| `warning-amber` | `#D97706` (`amber-600`) | Pending review, unverified warnings |
| `danger-rose` | `#E11D48` (`rose-600`) | Integrity flags, failed score thresholds |

---

## 3. Typography & Hierarchy

The interface uses standard system-ui and modern sans fonts (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`) optimized for legibility and density.

- **Page Hero Heading (`h1`):** `text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950`
- **Section Heading (`h2`):** `text-xl sm:text-2xl font-bold tracking-tight text-zinc-950`
- **Component Title (`h3`):** `text-sm sm:text-base font-bold text-zinc-900`
- **Body Text:** `text-xs leading-relaxed text-zinc-600`
- **Metadata & Subtext:** `text-[11px] font-medium text-zinc-500`
- **Micro-labels & Overlines:** `text-[10px] font-bold uppercase tracking-wider text-zinc-400`
- **Code & Numeric Values:** `font-mono text-xs font-semibold text-zinc-800`

---

## 4. Signature Component Library

### 4.1 `VerifiedBadge`
The authoritative verification visual for candidate skills and identities.
- **`tier_1` (Advanced):** Emerald pill with `ShieldCheck` icon, border `#A7F3D0`, background `#ECFDF5`, text `#065F46`.
- **`tier_2` (Intermediate):** Sky pill with `CheckCircle2` icon, border `#BAE6FD`, background `#F0F9FF`, text `#075985`.
- **`unverified` (Self-Declared):** Zinc badge with `HelpCircle` icon, dashed border `#E4E4E7`, background `#FAFAFA`, text `#71717A`.
- **Interactive Tooltip:** Hover reveals exact verification timestamp, proctoring integrity score, and blueprint level.

### 4.2 `EvidenceScoreCard`
Visualizes multi-source candidate evidence strength.
- **Normalized Breakdown:** 
  - Adaptive Assessment: **45%** weight
  - GitHub Code Activity: **25%** weight
  - Technical Projects: **20%** weight
  - Industry Certifications: **10%** weight
- **Explainable Rationale:** Accordion drawer explains how the weighted composite score is computed.

### 4.3 `ConsistencyScoreCard`
Presents assessment integrity behavior objectively.
- **4-Metric Grid:** Tab switches, clipboard events, timing anomalies, answer change variance.
- **Behavioral Signals Log:** Event-by-event timeline (e.g., "Window focus maintained", "Normal keystroke pacing").
- **Mandatory Disclaimer:** *"These are assessment-behavior signals and should be considered alongside the candidate's result. They do not establish cheating."*

### 4.4 `SkillCoverageBar`
Interactive matrix for hackathon team leads to spot technical deficits.
- Displays covered roles (Frontend, Backend, ML, DevOps) with member attribution.
- Highlights missing critical gaps with explicit "Gap to Fill" badges.

### 4.5 `CandidateMatchCard`
Algorithmic recommendation card connecting candidates to teams or recruitment drives.
- **Match Score Meter:** Colored badge (emerald for 85%+, sky for 70%+).
- **Gap-Filling Indicators:** Shows exact skills the candidate provides to complete the team.
- **Explainable Fit Drawer:** Expands to show overlap rationale.

### 4.6 `AssessmentRunner`
Distraction-free environment for timed blueprint testing.
- Accessible countdown timer with visual warning under 60 seconds.
- Keyboard shortcuts (`A`, `B`, `C`, `D`) for rapid answering.
- Question jump navigation track with reviewed/answered status dots.
- Real-time client-side event tracking without intrusive webcams or spyware.

### 4.7 `EmptyState` & `Skeleton`
- **`EmptyState`:** Reusable card with subtle icon, title, contextual description, and primary action button.
- **`Skeleton`:** Shimmer loading state with smooth pulse for async data fetching.

---

## 5. Verification States & Progression

```
[Candidate Declares Skill] 
       ↓ (Status: Unverified / Pending)
[Randomized Blueprint Test (15 min)]
       ↓
[Server-Side Validation + Behavioral Scoring]
       ├── Score ≥ 70% & Integrity High → [Verified Badge Issued: Tier-1 / Tier-2]
       └── Score < 70% → [Unverified / Retake Blueprint Available in 7 days]
       ↓
[Automated Hackathon Gap-Matching & Recruiter Drive Shortlisting]
```

---

## 6. Accessibility & Motion Guidelines

- **Focus Visibility:** Custom sky focus rings (`focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500`) across all interactive elements.
- **Contrast Ratios:** Text meets WCAG 2.1 AA contrast requirements (minimum 4.5:1 for body text, 3:1 for large text and icons).
- **Reduced Motion:** Respects `prefers-reduced-motion: reduce` by dampening transitions in `globals.css`.
- **Screen Readers:** Semantic `<header>`, `<main>`, `<nav>`, `<button>`, and ARIA labels on icon-only buttons.

---

## 7. Do's and Don'ts

### Do's
- **DO** use clean light surfaces (`#FFFFFF` and `#FAFAFA`) with fine borders (`#E2E8F0`).
- **DO** show explainable percentages and metrics instead of vague status words.
- **DO** distinguish self-declared claims from evidence-verified signals everywhere.
- **DO** keep forms and modals clean, with subtle input backgrounds and clear focus rings.

### Don'ts
- **DON'T** use heavy neon AI glows, dark mode gradients, or purple cyberpunk aesthetics.
- **DON'T** label candidate integrity anomalies as "Cheated" or "Guilty" — use non-accusatory behavioral terminology.
- **DON'T** alter API endpoints, schemas, or data models during UI updates.
- **DON'T** hide scores or formulas; transparency builds employer and student trust.
