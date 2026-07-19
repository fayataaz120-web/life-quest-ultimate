# Ultimate Quest — Master Build Brief (for Google Antigravity)

> **How to use this file:** Antigravity works best from a structured project brief it can keep referencing — not a single giant chat prompt. Drop this file into your project folder (e.g. `/docs/ULTIMATE_QUEST_BRIEF.md`), then open Antigravity and paste the short **Starter Prompt** at the very bottom. Tell it to read this file first. It will generate its own Task List / Implementation Plan from it — review that plan before letting it proceed.

---

## 1. Vision (do not simplify away)

Ultimate Quest is a **Life Operating System with RPG progression** — not a game, not a generic habit tracker. Real-life actions are the *only* source of progress. The player is always the hero; companions guide and encourage but never replace them.

## 2. Core Progression Engine (build this first, headless, no UI)

- **Event-log data model**: every completed task, XP gain, level-up, and milestone is an immutable, timestamped event. Current stats (Level, XP, Streak) are derived/cached views recomputed from the log — never the source of truth. This is the single architectural decision everything else depends on.
- **Task → Skill → XP pipeline**: every task has a Skill Category (Health, Reading, Knowledge, Fitness, Creator, Writing, Programming, Business, Finance, Faith, Life Skills, Languages, History, Projects — extensible) and a difficulty tier (Trivial/Easy/Moderate/Hard/Epic), each with a base XP value. Recurring daily tasks give diminishing-but-nonzero XP.
- **Journey XP** (resets per journey) vs **Lifetime XP** (never resets, feeds Book of Legends + permanent Rank). Coins earned separately from XP (streak bonuses, quest completion).
- **Streak Shields**: streaks soft-decay on a missed day rather than hard-resetting to zero; a small number of earned Shield tokens auto-protect a day. Longest Streak is permanent.
- **Leveling curve**: gentle/linear at low levels, exponential at high levels. Journey levels and Lifetime rank use *different* curves (Journey = fast/generous, Lifetime = slow/prestigious).
- **Milestones**: named target tied to a metric (XP, streak length, category task count, custom counter), optional deadline, optional reward.
- **Quests**: Daily/Weekly/Monthly, modeled with title, skill category, difficulty, recurrence rule, reset time, completion history, optional linked Milestone/Project.

## 3. Journey System

- Fields per journey: Name, Number, Goal, Start/End Date, Status (Active/Paused/Archived), Companion, Statistics, Timeline, Milestones, Books, Projects, Notes.
- Actions: Start, Pause, Resume, Archive, Start New, **Complete Rebirth** (archive current journey → keep Lifetime XP + Book of Legends entry → reset Journey stats → choose new Goal/Companion — this is the "New Game+" moment, give it its own celebratory flow).
- One primary active journey + optional lightweight side quests not tied to any journey.

## 4. Book of Legends + Chronicle

- Completed journeys become permanent chapters (Name, Dates, Highest Level/XP, Books Read, Projects Completed, Achievements, Milestones, Companion, Summary).
- Add a **weekly/monthly Chronicle**: auto-generated narrative retrospective from the event log (same treatment as Book of Legends, shorter cadence) — this is what makes raw stats feel like a story instead of a grind.

## 5. World & Headquarters

- Evolving locations: Library, Training Grounds, Creator Studio, Magic Hall, Observatory, Companion Room — each visually upgrades from real-category activity (Reading → Library, Fitness → Training Grounds, Creator → Studio, Knowledge → new areas unlocked).
- Player Avatar: customizable, evolves with long-term progress, always remains the visual "main hero" (companion never upstages it).

## 6. Companion System

### 6.1 Infinity Ascendant — canonical character spec
*(Consolidated from your two reference sheets — resolves the differences between them.)*

- **Role**: Guardian, Guide, Friend. Element: Infinity (all elements). Alignment: Light.
- **Personality** (merged list): Calm, Wise, Kind, Encouraging, Patient, Loyal, Supportive.
- **Voice**: Warm, calm, inspiring.
- **Color palette**: Emerald, gold, blue, violet magic; white/black base outfit.
- **Evolution — use the 5-stage version** (Sheet 2), since it gives more headroom for a companion that's meant to grow alongside a player over 10+ years:
  1. The Seeker — new journey, basic magic, small wings
  2. The Awakened — magic awakened, wings grow, new abilities
  3. The Ascendant — power rising, armor upgrade, more wisdom
  4. The Infinite — element mastery, celestial wings, legendary aura
  5. Infinity Ascendant (Ultimate/Awakened Form) — all elements, ultimate form, "legend born"
- **Required asset set**: full turnaround (front/side/back, cloak on/off), 50+ facial expressions, hand gestures, idle/walk/run poses, daily-action poses (reading, writing, meditating, training, praying), wing-state set (resting/half/full/flying/gliding/power-up/guarding/celebration), magic effects (circle, runes, book, orbs, gate, constellation, shield, teleport, guardian light), event poses (summon, victory, level-up, quest-complete), rest poses (sleeping, sitting, leaning, daydreaming).
- **Companion roster** (from Sheet 2 — carry forward): Zazu (jinn companion) plus four future category-companions — Celestial Knight (Discipline), Nature Guardian (Health), Library Sage (Knowledge), Cosmic Oracle (Mystery), Flame Sentinel (Courage). Map future skill categories to these as they launch.
- **Dialogue system**: 5–10+ line variant pool per trigger event, weighted random selection, exclude the last N lines used (prevents repetition). Hard tone rule: never guilt-based, never generic filler, always specific to what the player actually did.

### 6.2 Rendering / art-style direction for image generation
When generating or regenerating character art (in whatever image tool you're pairing with Antigravity), specify explicitly rather than just "anime style":
- **Style target**: semi-realistic anime — painterly lighting and real material shading, not flat cel-shading.
- **Consistent light source + rim-lighting** on the wings across every single pose/expression, so the set feels like one continuous character, not disconnected images.
- **Per-material shading logic**: cloth drapes and folds differently from metal armor, feathers, and magic energy — the "3D/4D" feel you want comes from *this*, not from higher detail density alone.
- **Fixed magic color-temperature rule**: emerald/gold/blue/violet only, consistent brightness/glow across all effect images.
- Keep face proportions and hair silhouette identical across all 50+ expressions (this is the hardest part to get consistent — lock it as a named reference sheet the generator must match every time, not regenerate from the text description alone).

## 7. UI/UX Requirements

- First-launch flow collects: Player Name, Journey Name, Main Goal, Theme, Time Zone, Daily Reset Time. No demo data, no sample content anywhere.
- Immediately after setup, companion suggests one small starter task so the player gets visible XP/level feedback within the first two minutes.
- Notifications: streak-risk (once, gentle), quest reset, milestone proximity — small daily cap, dismissible per category.
- Accessibility (non-negotiable): full keyboard navigation, screen-reader labels on all stat/progress elements, respect `prefers-reduced-motion` for companion animation, color-blind-safe skill-category palette, scalable text independent of decorative chrome.
- Responsive across desktop, tablet, mobile. Companion must never overlap important controls.

## 8. Technical Architecture

- Modular separation: **Progression Engine** (pure logic — XP/levels/streaks, no UI) / **Content Layer** (journeys, tasks, milestones — data) / **Presentation Layer** (companion, world, avatar rendering). Future modules (Finance, Travel, Calendar, etc.) plug into the Content Layer without touching the Progression Engine.
- Local-first storage (IndexedDB/SQLite) with a sync queue; since events are immutable and additive, conflicts are resolved per-event, not per-document.
- `schemaVersion` field on every event/record from day one, with a lightweight migration runner.
- Virtualize/paginate any list that grows unbounded (task history, journey timeline) from the start.
- Precompute stat rollups on write; retrospective screens (Book of Legends, Chronicle) read from rollups, never recompute live from the full log.
- Data export: player can export their full history in an open format at any time. Encrypt local data at rest; if cloud sync is added, encrypt in transit and at rest, no third-party analytics on task content.

## 9. Build Order (give this to Antigravity as your phase plan)

1. **Phase 1** — Event-log data model + Progression Engine (XP/levels/streaks), headless, fully unit-tested, no UI.
2. **Phase 2** — Task/Quest CRUD + Journey system on top of the engine.
3. **Phase 3** — Minimal companion (static art + text dialogue only, no animation) to validate the motivational loop end-to-end.
4. **Phase 4** — Book of Legends + Chronicle retrospectives (proves the event log pays off).
5. **Phase 5** — Full companion animation, world evolution, avatar system — the premium visual layer, built last on a proven foundation.

**Do not let the agent start with the companion/visual layer** — that's the most common way a project like this stalls. Make Phase 1 pass its own tests before Phase 3 begins.
