# Ladder Day

A static **word ladder** puzzle:

1. You start on the **start** word (shown at the top).
2. Type a **next** word that is in the game’s word list and differs from the last word by **exactly one letter** (same length, same positions otherwise).
3. Repeat until you land on the **goal** word.

**Today’s ladder:** same start/goal for everyone (UTC calendar day).

**Practice:** `?practice=1` or **Random (practice)**.

**Finished UI preview:** `?demo=won` — solved state for screenshots.

**Shortest length:** use **Show shortest length**, or it appears automatically after your first valid step.

**Copy result:** after you win, **Copy result** puts a shareable text block on the clipboard.

## Run locally

```bash
cd ladderday && python3 -m http.server 5176
```

Open [http://localhost:5176](http://localhost:5176) on your phone (same Wi‑Fi as your computer) or deploy to Pages.

The layout uses safe areas, flexible letter tiles, and a keyboard that scales on narrow screens.

## Customize

- **Word list:** [`js/words.js`](js/words.js)
- **Puzzle pairs** (start, goal, shortest length `par`): [`js/puzzles.js`](js/puzzles.js) — regenerate if you change the word list so every pair stays solvable.

## Deploy

Published with the repo’s GitHub Pages workflow at **`/ladderday/`** on the project site.
