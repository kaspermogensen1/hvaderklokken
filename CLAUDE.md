# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Klokkemester** ("Clock Master") is a Danish-language PWA that teaches children to tell time on analog clocks. It uses Danish time expressions (e.g., "halv tre", "kvart over fem", "20 minutter i syv") and progresses through 6 mission levels from basic hour/minute hand identification to translating between analog, digital, and spoken Danish time formats.

## Running the App

This is a vanilla JS app with no build step, no bundler, and no npm dependencies. Serve the root directory with any static HTTP server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

There are no tests, linters, or CI pipelines configured.

## Architecture

### Entry Flow
`index.html` loads `js/main.js` (ES module), which bootstraps the app:
1. Fetches mission definitions from `data/missions-levels-1-6.json` (falls back to hardcoded `data/taskPresets.js`)
2. Loads/migrates persisted state from `localStorage` (key: `klokkevaerk_state_v1`)
3. Initializes the hash-based router (`js/ui/router.js`)

### Key Layers

- **`js/engine/`** — Pure logic, no DOM access:
  - `timeModel.js` — Canonical time representation (total minutes 0–1439), conversion between analog angles, 12h/24h digital, and Danish phrases
  - `taskGenerator.js` — Seeded-random task generation per mission, answer evaluation, misconception classification
  - `progression.js` — Mission unlock logic, mastery scoring, streak tracking, review queue management
  - `storage.js` — localStorage persistence with migration support
  - `misconceptions.js` — Classifies incorrect answers into tagged misconception categories
  - `review.js` — Spaced review scheduling based on misconception history

- **`js/ui/screens/`** — Screen classes (HomeScreen, LearnScreen, PracticeScreen, TimeLabScreen, ReviewScreen), each with `render(root)` and `destroy()` methods
- **`js/ui/components/`** — Reusable UI: `ClockCanvas.js` (HTML5 Canvas analog clock), `FeedbackPanel.js`, `PromptCard.js`, `ProgressBar.js`, `Mascot.js`, `ThemeStore.js` (star-based reward shop)
- **`js/ui/`** — `router.js` (hash router), `audio.js` (Web Speech API TTS), `juice.js` (animations/confetti)

### State Model
All app state lives in a single object passed as `app.state`, persisted to localStorage on changes. Key sections: `missions` (per-mission progress), `skills` (per-skill mastery), `misconceptions` (error pattern tracking), `rewards` (stars/badges/themes), `reviewQueue`, `streaks`.

### Routing
Hash-based: `#/` (home), `#/learn`, `#/practice`, `#/lab`, `#/review`. Routes defined in `js/config.js`.

## Domain Concepts

- **Missions (m1–m6)**: Progressive difficulty levels, each with required mastery percentage to unlock the next
- **Task types**: `read_clock`, `set_clock`, `match_representation`, `error_detective`, `missing_piece`, `quick_review`, `boss_mission`
- **Danish time phrasing**: "halv" refers to the *next* hour (e.g., "halv tre" = 2:30), "kvart i" means quarter *to*. This is a core domain complexity — the `toDanishPhrase`/`parseDanishPhrase` functions in `timeModel.js` encode these rules
- **Misconception tags**: Named error patterns (e.g., `minute-hour-confusion`, `halv_to_misread`, `num8means40`) that drive the review system

## Important Details

- All UI text is in Danish — `js/copy.js` contains all user-facing strings
- The service worker (`sw.js`) caches assets for offline use; update `CACHE_NAME` version when changing cached files
- Task generation uses seeded RNG for reproducibility — seed is derived from mission ID + task counter
- No framework: all DOM manipulation is imperative vanilla JS
- The app targets iPad/tablet form factor with a native-app-like shell (header, content area, bottom tab bar)
