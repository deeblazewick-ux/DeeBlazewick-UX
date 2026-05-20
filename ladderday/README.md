# Ladder Day

Line up five-letter words from **Start** to **Goal**—only **one letter** may change from the previous word each time. Static HTML, CSS, and JavaScript.

**Single page:** [`index.html`](index.html) is the game. A **welcome `<dialog>`** opens on first load (unless the URL has a **query string** or **hash**, e.g. `?practice=1`, `?strict=1`, `?demo=won`) with the short intro, example ladder, optional screen recording, and **Play** to dismiss it. Refresh with a plain URL to see the welcome again.

**`play.html`:** redirects to `index.html` with the same search string and hash (for old links).

**Optional screen recording** in the welcome dialog: add **`how-to.webm`** and/or **`how-to.mp4`** under [`ladderday/media/`](media/) — the dialog shows the player when a file loads.

**Legacy URL:** [`intro.html`](intro.html) redirects to `index.html`.

**Today’s ladder:** same start/goal for everyone (UTC calendar day).

**Practice:** `?practice=1` or **Random (practice)**.

**Difficult mode:** turn on **Difficult mode** to cap your ladder at this puzzle’s shortest solution length (same limit for everyone on that day’s puzzle). Turn it off for unlimited steps. Optional URL: `?strict=1` to start with difficult mode on.

**Finished UI preview:** `?demo=won` — solved state for screenshots.

**Copy result:** after you win, **Copy result** puts a shareable text block on the clipboard.

## Run locally

```bash
cd ladderday && python3 -m http.server 5176
```

Open [http://localhost:5176](http://localhost:5176). Use query params on that URL to skip the welcome dialog and match production deep links (for example `http://localhost:5176/?practice=1`).

The layout uses safe areas, flexible letter tiles, and an on-screen QWERTY that scales on narrow screens. You can also use a physical keyboard when available.

## Customize

- **Word list:** [`js/words.js`](js/words.js)
- **Puzzle pairs** (start, goal, shortest length `par`): [`js/puzzles.js`](js/puzzles.js) — regenerate if you change the word list so every pair stays solvable.

## Deploy

Published with the repo’s GitHub Pages workflow at **`/ladderday/`** on the project site.
