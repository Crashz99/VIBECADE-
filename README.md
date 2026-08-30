# VIBECADE V4 — Rooms, Mascots & Focus Arcade

VIBECADE is a local-first interactive place for music, focus, quick notes, scheduling and short arcade breaks. V4 moves the product away from one saturated customization screen and turns it into a small set of distinct rooms.

## Main flow

`ENTER VIBECADE → LOBBY → PICK A ROOM`

The rooms are now the main experience:

1. **Music Room** — local playlists, playback, reactive visuals and ambience.
2. **Study Hall** — focus modes, Inspector Dog, tasks and study levels.
3. **Scratchpad** — quick notes, pinned notes and writing.
4. **Arcade** — short break-sized mini-games.
5. **Schedule** — local study/focus planning with optional browser notifications.

**Tune the world** is now a secondary modal instead of the main flow. It contains cartridge, weather, photo, photo style, intensity and desk-object controls.

## Opening gag

The first trip into the lobby opens with a black-and-white staircase. A piano falls down it, crashes, and a whistle-carrying duck crawls out from underneath and waddles away. The duck later reappears as the Schedule mascot.

## Mascots

- **Cat** — chaos, procrastination and unhelpful commentary.
- **Inspector Dog** — focus enforcement, task-counting, moustache, clipboard and baton.
- **Whistle Duck** — scheduling, timing and transitions.

The mascots are intentionally theatrical. VIBECADE does not monitor other tabs or applications; Inspector Dog only reacts to activity/visibility signals available to the current page.

## Study levels

Completed focus sessions earn XP from focus minutes and completed shifts. Study Hall shows rank progression through deliberately bureaucratic levels such as:

- Unsupervised Intern
- Desk Occupant
- Provisional Student
- Inspector Noticed You
- Focus License Holder
- Certified Lock-In
- Academic Menace
- Barkley Approved
- Library Boss
- Absurdly Employable

## Scheduling

Schedule stores entries locally. Each entry can point to Pomodoro, Deep Work, Boss Focus, Reading, Writing, Exam, or a custom countdown. Pressing **START** takes the user directly into Study Hall and opens the requested focus mode.

Optional browser notifications can be enabled by the user. They depend on browser permission and work while VIBECADE is available to the browser; the local schedule itself is always persisted.

## Music & playlists

Users can add multiple local audio files, reorder/remove them, move previous/next and allow tracks to auto-advance. Playlist metadata is saved locally and audio blobs are stored in IndexedDB, so tracks can survive a normal page reload without being uploaded anywhere.

## Existing V3 systems retained

- Pomodoro, Deep Work, Boss Focus, Reading, Writing, Exam, Countdown, Stopwatch
- visible/minimal/hidden timer
- local focus/session history
- notes + pinned notes
- local stats and JSON export
- ambient Rain/Cafe/Fire/Vinyl mixer
- weather overlays
- presets
- six mini-games
- high scores
- secret CRT cartridge via Konami code
- Zen mode and command palette

## Run

```bash
npm install
npm run dev
```

Vite normally serves the app at `http://localhost:5173`.

## Production

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` directory to Vercel.

## V5 final-lap additions

- Seven optional color packs plus the cartridge-native palette.
- Six room finishes: arcade, glass, paper, chrome, soft and brutalist terminal.
- Extra scene objects: disco ball, aquarium, melting clock, suspicious trophy and duck lamp.
- Behavior-driven curios and character incidents. Build playlists, write notes, focus, schedule and play to make odd residents appear.
- Hidden room secrets can be clicked and added to the Lobby Lost + Found shelf.
- Persistent curio/encounter data is included in local JSON export.
- Persistent footer credit links to Prerak's portfolio: https://prerak-tanwer.vercel.app/
