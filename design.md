VOUCH Design System Specification

Version: 3.0.0 (Senior UI/UX Production Spec — Full Rewrite) Core Thesis: Proof → Verified Skills → Trust → Opportunity Platform: Next.js (App Router), Tailwind CSS v4, TypeScript Design Concept: The Verification Ledger — evidence treated like a technical document, not a social-app badge

0. Why This Rewrite Exists

v2.0 was a competent, generic SaaS dashboard: sky-blue accents, zinc neutrals, rounded cards, soft grey shadows. It could be reskinned onto any B2B product with a find-and-replace. That's the problem — Vouch's entire value proposition is proof, and the UI didn't look like it was made by people who take proof seriously.

This version is grounded in one real, ownable idea already sitting in your own copy: you call your tests "Blueprint Assessments." Nobody is using that. This system builds the whole product around it — technical draftsman's linework, lab-specimen evidence tags, ink-stamp verification seals, case-file structure. A verified badge should look like something was checked, not like a decorative pill.

1. Product Philosophy & Design Direction

Vouch replaces inflated resume claims with standardized assessment integrity, normalized GitHub code evidence, live presence verification, and explainable compatibility matching for hackathon teams and campus recruitment.

Key Tenets
Evidence-First, Not Claim-First. Unverified claims are visually distinct from verified technical signals — not by color alone, but by structure: unverified claims sit unbordered and lowercase, verified ones get a stamped seal, a serial number, and a timestamp, the way a real certificate would.
The Draftsman's Light Theme. Canvas is a warm technical-paper white (
#FBFAF7), never sterile pure-white and never the sky-blue-tinted SaaS grey. Structure is carried by fine hairline rule work (like a blueprint's linework), not drop shadows. Shadows are used exactly once in the whole system — for the active/focused evidence card — so that depth means something instead of decorating everything.
Calibrated & Explainable. Every score shows its derivation. Evidence strength is weighted across 4 sources (45% Assessment, 25% GitHub, 20% Projects, 10% Certifications). Match scores disclose which required gaps are filled. This is stated once here and never contradicted anywhere in product copy.
Transparent, Non-Accusatory Integrity. Anti-cheating telemetry (tab transitions, clipboard events, answer revisions, and — new in this version — live camera presence signals) is presented as objective behavioral indicators, never as a verdict. The mandatory disclaimer in §4.3 and §4.8 is load-bearing product language, not legal boilerplate — keep it verbatim everywhere those signals appear.
2. Color System & Semantic Tokens

The old palette (sky-600 / zinc / emerald-600) is retired. It's the default palette an unbriefed designer reaches for on any trust-adjacent product — it's not wrong, it's just not yours.

Canvas & Surfaces — "Drafting Table"
Token	Hex	Purpose
canvas-bg	
#FBFAF7	Global backdrop — warm technical paper, not cold white
canvas-grid	
#EFEDE6	24px dot-grid, 4% opacity, used only behind hero and blueprint-assessment screens
surface-card	
#FFFFFF	Primary card container
surface-recessed	
#F3F1EA	Wells, inputs, code blocks
ink-hairline	
#D9D5C7	Standard divider / card outline — warm-grey, not cool-grey
ink-hairline-strong	
#B8B29D	Emphasis rules (section dividers, ledger table borders)
Verification Ink — Brand & Status
Token	Hex	Purpose
ink-primary	
#1B3A5C	Blueprint navy. Primary text, primary CTA fill, active states — replaces sky-600 everywhere
ink-primary-tint	
#E9EFF5	Selected-state fills, active tab underlay
seal-verified	
#2F6844	Stamp green, deeper and less minty than the old emerald — reads like real ink, not a UI accent
seal-verified-tint	
#EBF2EC	Verified badge backgrounds
seal-pending	
#9A6B1F	Amber ochre — warmer, more "aged document" than amber-600
seal-flagged	
#8C2F2F	Oxblood — for integrity flags and failed thresholds. Deliberately not a bright alert-red; this is a document annotation, not a browser error toast
signal-camera-live	
#1B3A5C	Active presence-verification indicator (reuses ink-primary — camera state is not a separate brand color, it's the same trust system)

Rule: no gradients anywhere in the product. Flat ink on paper. This is a hard constraint, not a starting preference — gradients are the fastest way back to generic-SaaS territory.

3. Typography & Hierarchy

Retiring Inter. Inter is the single most common "safe" choice for trust/fintech products right now — using it here means Vouch reads like every other Series-A dashboard screenshot on Twitter.

Typeface Roles
Display / Headings — Space Grotesk. A technical grotesk with slightly unusual proportions (notice the squared-off terminals on t and f) — reads as engineered, not corporate. Used for all headings and any large numeric hero statistic.
Body — IBM Plex Sans. Chosen specifically because Plex was designed by IBM as a technical documentation typeface family — it is the only body face that's actually on-concept for a verification product, not just legible.
Data, Scores, Serial Numbers, Timestamps — IBM Plex Mono. Same family as body copy (so the pairing feels designed, not assembled from two unrelated kits), used for every number that represents a measured fact: scores, percentages, timestamps, verification IDs.
Scale
Page Hero (h1): text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B3A5C] — Space Grotesk. Semibold, not extrabold — extrabold display type is another generic-AI tell.
Section Heading (h2): text-xl sm:text-2xl font-semibold tracking-tight — Space Grotesk.
Component Title (h3): text-sm sm:text-base font-medium text-[#1B3A5C] — Plex Sans.
Body Text: text-[13px] leading-relaxed text-[#3D3A31] — Plex Sans. Note the warm dark-brown-grey ink color, not pure zinc-600 — everything in this system is slightly warm, like paper and ink rather than screen-grey.
Data / Scores: font-mono text-sm font-medium text-[#1B3A5C] tabular-nums — Plex Mono.
Micro-labels: text-[10px] font-medium text-[#8A8571] in sentence case, not tracked-out uppercase. Uppercase tracked labels are a template tell (see frontend-design guidance) — use a small colored dot or hairline rule to mark a label as structural instead.
4. Signature Component Library
4.1 VerificationSeal (replaces VerifiedBadge)

Rebuilt as an actual stamp motif, not a colored pill.

Shape: a rectangular tag with one clipped corner (like a specimen or evidence tag), 1px ink-hairline-strong border, surface-card background — color appears only in a small left-edge flag (4px) and the icon, not as a full-pill fill. This is the single biggest visual differentiator from the old design: verification reads as attached evidence, not a UI chip.
Tier 1 (Advanced): seal-verified edge flag, ShieldCheck icon, serial number in Plex Mono below the skill name (e.g. VF-2026-08841), generated deterministically per verification event.
Tier 2 (Intermediate): ink-primary edge flag, CheckCircle2 icon.
Unverified: no edge flag, dashed ink-hairline border, HelpCircle icon, label reads lowercase "self-declared" rather than a badge word — reinforcing tenet #1 through typography, not just color.
Interactive tooltip: hover reveals verification timestamp, integrity score at time of test, and blueprint level — styled like a case-file annotation (Plex Mono, small, on surface-recessed).
4.2 EvidenceScoreCard
Weighted breakdown rendered as a horizontal stacked ledger bar — four segments (Assessment 45 / GitHub 25 / Projects 20 / Certs 10) in ink-primary at four opacity steps (100/70/45/25%), not four different hues. One color family, varied by weight — reinforces that this is one evidence system with graduated confidence, not four unrelated metrics competing for attention.
Explainable Rationale: an accordion styled like an unfolding case file — no shadow, just a hairline rule that appears on expand.
4.3 ConsistencyScoreCard
4-metric grid: tab switches, clipboard events, timing anomalies, answer change variance — each with a grace-threshold indicator (a small filled vs. hollow dot showing whether the first free occurrence has been used).
Behavioral Signals Log: rendered as a vertical timeline using the same hairline-and-tag visual language as VerificationSeal, each event a small evidence tag with timestamp in Plex Mono.
Mandatory Disclaimer (verbatim, every time this card renders): "These are assessment-behavior signals and should be considered alongside the candidate's result. They do not establish cheating."
4.4 SkillCoverageBar

Interactive matrix for hackathon team leads. Covered roles shown as filled ledger segments; "Gap to Fill" badges use the seal-pending ochre, not red — a gap is a fact to fill, not an error state.

4.5 CandidateMatchCard

Match score shown as a fraction with derivation on hover (e.g. "3 of 3 required skills verified" in Plex Mono), not just a percentage badge. Meter uses seal-verified (≥85%) / ink-primary (≥70%) — two-color system max, no traffic-light gradient of five colors.

4.6 AssessmentRunner
Countdown timer styled as a mechanical counter (Plex Mono, tabular numerals) rather than a circular progress ring — ties to the "measured, documented" concept rather than a generic app-timer feel.
Keyboard shortcuts (A/B/C/D) shown as small key-cap glyphs next to each option.
Question jump track: numbered ledger dots, not generic pagination.
Background uses canvas-grid dot-grid at very low opacity — the one place in the product where the blueprint metaphor is literal — during active assessment only, to reinforce "you are inside a measured instrument" without being loud about it.
4.7 EmptyState & Skeleton
EmptyState: icon rendered as a faint blueprint-style line drawing (not a filled icon), title in Plex Sans, one action button in ink-primary. Copy follows the writing principles in §7 — direction, not mood ("No teams match these skills yet — try removing a filter," not "Nothing here!").
Skeleton: shimmer uses surface-recessed → canvas-bg, slower and subtler than the default Tailwind pulse — motion should read as "processing," not "loading spinner."
4.8 PresenceVerificationPanel — NEW, Mandatory Camera Feature

This is the product's new core differentiator: live presence verification during every assessment, framed with the same restraint and transparency as the existing behavioral telemetry — not as surveillance software.

Concept: the camera feed is treated as one more piece of evidence being logged to the case file, not a security-camera overlay. No red recording dots, no "YOU ARE BEING MONITORED" banners.

Frame treatment: the live feed sits in a fixed corner panel (default: bottom-right, candidate can reposition), bordered with the same clipped-corner tag motif as VerificationSeal, labeled PRESENCE · LIVE in Plex Mono micro-label — not a chip, a document tag.
Reticle, not surveillance box: a thin crosshair/corner-bracket frame (like a technical camera viewfinder, not a face-detection bounding box) indicates the tracked region. No harsh red bounding rectangles — use ink-primary at low opacity, only visible on hover or when a signal fires.
Status states, same restrained language as §4.3:
Presence confirmed — small seal-verified dot, no further UI.
Face not detected — after a grace period (see below), amber dot + one line: "We can't confirm you're in frame — move back into view."
Additional person detected — amber dot, same tone: "More than one person is currently in frame."
Never a red "VIOLATION" state, never an auto-fail. Every signal feeds the same weighted ConsistencyScoreCard breakdown as tab switches and clipboard events, with its own grace threshold before any deduction applies.
Consent gate (required before the mandatory camera turns on): a dedicated full-screen step before the assessment begins — plain language, no dark patterns:
States plainly that camera access is required to take a Vouch Blueprint Assessment, why (presence verification, an integrity signal alongside behavioral telemetry), and what is not done with it (no video is stored or uploaded — all analysis happens locally in the browser; only derived events like "face not detected" are logged, not frames or recordings).
A single clear "Enable camera & begin" action. If the browser denies permission, show a direct explanation and a "camera required to continue" state — never fail silently, and never let the assessment start in an ambiguous state where the candidate doesn't know whether they're being observed.
Accessibility & failure tolerance: low light, glasses, headwear, or low-quality webcams can degrade detection confidence. The panel must show a distinct Low confidence — verify manually state rather than silently treating uncertain detection as a violation. This is stated here explicitly so it isn't lost during implementation: false positives cost real candidates real opportunities, and the system must visibly know the difference between "no face detected" and "not confident there's a problem."
5. Verification States & Progression
[Candidate Declares Skill]
       ↓ (Status: Self-Declared / Pending)
[Consent Gate → Camera & Behavioral Telemetry Enabled]
       ↓
[Randomized Blueprint Assessment (15 min)]
       ↓
[Server-Side Scoring + Consistency Score (behavioral + presence signals)]
       ├── Score ≥ 70% & Consistency High → [Seal Issued: Tier-1 / Tier-2]
       └── Score < 70% → [Unverified / Retake available in 7 days]
       ↓
[Automated Hackathon Gap-Matching & Recruiter Drive Shortlisting]
6. Accessibility & Motion Guidelines
Focus Visibility: custom focus rings in ink-primary at 2px, offset — not the default sky-blue Tailwind ring.
Contrast Ratios: WCAG 2.1 AA minimum everywhere (4.5:1 body, 3:1 large text/icons) — verify specifically against the new warm paper background, which is slightly darker than pure white and changes contrast math versus v2.0.
Reduced Motion: respects prefers-reduced-motion: reduce.
Camera feature accessibility: candidates who cannot use a camera (device limitation, accessibility need, connectivity) must have a documented manual-review fallback path — state this explicitly in product copy at the consent gate, don't let it be a silent dead end.
Screen Readers: semantic landmarks throughout; the PresenceVerificationPanel's live status changes should use aria-live="polite", not assertive — status updates, not alarms.
7. Writing in the Product
Say what happened and what to do next; never apologize, never editorialize ("Oops!", "Uh oh!").
Camera and integrity messaging in particular must stay factual and even-toned: "Face not detected — move back into view," not "Warning: suspicious activity detected."
Buttons name the action, not a generic verb: "Enable camera & begin," not "Continue" or "Next."
8. Do's and Don'ts
Do's
DO treat every verification surface as a piece of evidence with a timestamp and serial number, not a decorative badge.
DO keep the camera feature's tone identical to the existing behavioral-telemetry tone: transparent, factual, non-accusatory.
DO show your derivation — scores, weights, and match rationale are always inspectable.
DO use the warm paper/ink palette and hairline structure consistently; resist reaching for shadows, gradients, or saturated color as a default fix for "this looks flat."
Don'ts
DON'T style any integrity or presence signal as an alarm, violation, or red banner — every signal feeds an explainable weighted score.
DON'T store or upload camera frames/video anywhere — presence detection runs client-side; only derived events are logged.
DON'T let the camera consent gate be ambiguous, silent-fail, or dark-pattern-y — the candidate must always know their current monitoring state.
DON'T reach for sky-blue, zinc, emerald, rounded-card-with-shadow — that is the previous version and the generic default; this version's whole point is that it doesn't look like that anymore.
DON'T alter API endpoints, schemas, or data models during UI updates — this is a visual and interaction rewrite, not a backend change, except where §4.8 requires new fields to store presence verification event logs (same shape as existing behavioral events).