# GavixaCare — Brand Guidelines

## 1. Brand Story

GavixaCare is a product of **Gavixa**, an India-first company on a mission to rebuild trust between patients and the healthcare system. Where the market is opaque, we are radically transparent. Where AI can help patients, we build it — always with disclosure, disclaimers, and dignity.

**Tagline:** *Clarity in Healthcare. Confidence in Every Decision.*

**Voice attributes:** warm but not sycophantic · direct but not alarming · expert but not condescending · bilingual by default · honest about uncertainty · calm in emergencies.

## 2. Colors (Design Tokens)

### Light Theme

| Token | HSL | Hex approx | Usage |
|---|---|---|---|
| `--background` | 210 40% 98% | #F8FAFC | App background (never pure white) |
| `--foreground` | 222 47% 11% | #0F172A | Primary text |
| `--card` | 0 0% 100% | #FFFFFF | Cards, modals |
| `--primary` | 221 83% 48% | #1A56DB | Trust Blue — CTAs, links, brand |
| `--accent` | 173 85% 33% | #0D9E8B | Health Teal — wellness, positive |
| `--warning` | 38 92% 50% | #F59E0B | Clarity Orange — highlights, value callouts |
| `--destructive` | 0 84% 60% | #DC2626 | Emergency Red — emergencies ONLY |
| `--muted-foreground` | 215 16% 35% | #64748B | Secondary text |
| `--border` | 214 32% 91% | #E2E8F0 | Dividers |

### Dark Theme
- Background: `#0A0F1E` (surface 1) → `#141B2D` (cards) → `#1E293B` (borders)
- Primary lifts to `hsl(221 83% 60%)` for contrast
- Accent lifts to `hsl(173 85% 40%)`

### Emergency Red rule
Use `--destructive` (Emergency Red) **only** in emergency-specific components (Emergency page dial bar, emergency call buttons). **Never** use it for marketing, ads, or general error states.

## 3. Typography

| Purpose | Font | Weights | Notes |
|---|---|---|---|
| Latin display + body | Inter (variable) | 400–800 | Loaded from Google Fonts |
| Devanagari display + body | Mukta / Noto Sans Devanagari | 400, 700 | Bharat-native co-primary |
| Financial data | Inter tabular-nums | 500–700 | `.tabular` class enables `font-variant-numeric: tabular-nums` |
| Monospace | JetBrains Mono | 400–500 | For raw bill text, code |

Headline letter-spacing: `-0.01em`. Body line-height: `1.5–1.6`.

## 4. Iconography

- **Base library:** Lucide-react (installed).
- **Rule of restraint:** No decorative-only icons. Every icon must serve wayfinding, status, or affordance.
- **Sizes:** 14–5 (inline), 16–5 (buttons), 20–5 (cards), 24–5 (page headers), 32–plus for hero visuals.
- **Stroke:** Default 2px. Emergency icons may bump to 2.5px.

## 5. Motion

- **Durations:** 120ms (micro), 180ms (base), 260ms (deliberate).
- **Easings:** `cubic-bezier(0.2, 0.8, 0.2, 1)` (standard), `cubic-bezier(0.16, 1, 0.3, 1)` (emphasis).
- **Never:** aggressive bounces, floating decorations, autoplay video on landing.
- **Preferred:** in-view stagger for feature grids, pulse rings for live indicators, scale-up on tap (mobile).

## 6. Logo

The logo mark: a rounded plus (medical cross) inside a swoosh, in a navy → teal gradient. Wordmark: `Gavixa` in foreground colour + `Care` in primary blue. Available at `/app/frontend/src/components/brand/Logo.jsx` as a reusable component.

Minimum size (with wordmark): 96px wide. Icon-only allowed down to 24px.

## 7. Voice & Tone by Context

| Context | Tone | Example ✅ | Example ❌ |
|---|---|---|---|
| Emergency features | Calm, confident | "Nearest cardiac ER: 2.3 km. Tap to call." | "URGENT! Call now!!!" |
| Bill analysis | Empowering, factual | "Ask why ₹12,400 was billed under Miscellaneous." | "You have been ROBBED." |
| Cost estimation | Reassuring, ranges | "Expect ₹85k – ₹1.4L for private tier." | "It will cost exactly ₹1,25,000." |
| Onboarding | Warm, celebratory | "Welcome to GavixaCare, Anjali." | "CONGRATS!!! Sign up now!!!" |

## 8. Accessibility

- WCAG AA baseline; AAA target for emergency and dispute flows.
- Focus ring: `2px solid hsl(var(--ring))` with 2px offset.
- Touch targets: 44 × 44 px minimum.
- All interactive elements have `data-testid` (see `constants/testIds`).
- Colour is never the only channel for status (add icon + text label).
- Auto light/dark detection with manual override; preference saved to `localStorage['gavixa_theme']`.

## 9. Photography & Illustration

- **No hospital stock photos** in v1. They read as generic and untrustworthy.
- Prefer product visuals (real UI screenshots, dashboards, data tables).
- If illustrations added later: warm, inclusive, diverse Indian representation; flat with subtle depth; never cartoonish.

## 10. Do & Don't

✅ Do
- Use `--destructive` ONLY for emergency features.
- Show `confidence` for every AI output.
- Provide Hindi copy alongside English for critical flows (Phase 2 rollout).
- Use tabular numerals for every rupee figure.

❌ Don't
- Do not paint the entire app red because a bill is 20% overcharged; that's Emergency Red misuse.
- Do not claim precision the AI does not have.
- Do not use exclamation marks in emergency copy.
- Do not use pure white or pure black backgrounds.
