# Russian_Rollete_Game- Hotseat Party Game

> A browser-based multiplayer tension game built for hotseat play. No backend, no installs — open and play.

---

## Overview

Virtual Roulette simulates a fictional roulette game in the browser. Players pass the device between turns, each pressing the trigger to test their luck. The game tracks player status in real time, handles cylinder resets, and ends when one player remains.

Built as a pure client-side web application — no frameworks, no dependencies, no server required.

---

## Game Rules

1. **Setup** — Choose the number of players (2–6) and optionally enter player names. Select how many chambers are loaded (1–3). Choose whether the cylinder auto-spins each turn or is manually spun.
2. **Taking a turn** — The active player presses **Trigger**. The cylinder fires one chamber. If it's a loaded chamber, that player is eliminated.
3. **Spinning** — Pressing **Spin Cylinder** resets the cylinder position randomly, independent of the previous state. This preserves true per-pull probability.
4. **Elimination** — Eliminated players are marked and skipped. The game continues until one player remains.
5. **Winning** — The last active player wins. Press **New Game** to reset with the same configuration.

> **Probability note:** With 1 bullet in 6 chambers, each pull has a 1-in-6 chance regardless of prior results — the spin resets guarantee this mathematically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (transitions, animations) |
| Logic | Vanilla JavaScript (ES6+) |
| State management | In-memory JS object (no localStorage) |
| Dependencies | None |

No build tools, no bundler, no npm. A single HTML file with embedded CSS and JS runs the entire application.

---

## How It Works

The core game state is a plain JavaScript object tracking:
- Active players and their status
- Current cylinder position
- Loaded chamber positions (randomized on spin)
- Turn order

Each trigger pull checks whether the current chamber position is loaded. If yes, the player is eliminated and the UI updates immediately. Cylinder spin independently randomizes the loaded positions, ensuring no state carries over from the previous pull.

---

## Disclaimer

This is a fictional simulation for entertainment only. It does not represent, instruct, or encourage any real-world actions.

---

## Author

**Tanmay Agarwal**
[github.com/Tanmay-Agarwal2312](https://github.com/Tanmay-Agarwal2312) · [t.agarwal2312@gmail.com](mailto:t.agarwal2312@gmail.com)
