# Constraint Cross — prototype

A small **word + grid** puzzle prototype: fill crossing words so every **active line** is a valid English word, matching **logic-style clues** (not dictionary definitions).

## Deploy on GitHub Pages (static site)

This repo includes a workflow [`.github/workflows/deploy-puzzle-github-pages.yml`](../.github/workflows/deploy-puzzle-github-pages.yml) that publishes static apps under **`/puzzle/`** and **`/antiwordle/`** on GitHub Pages (plus a small hub at the site root).

### One-time GitHub setup

1. Push `main` with the workflow and app folders (`Puzzle/`, `antiwordle/`).
2. On GitHub: **Settings → Pages → Build and deployment**.
3. Under **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
4. Open the **Actions** tab and confirm the “Deploy prototypes to GitHub Pages” workflow completes (green).

Your games will be at:

**`https://<your-username>.github.io/<repository-name>/puzzle/`** and **`…/antiwordle/`**

For this org/repo, that is: **https://deeblazewick-ux.github.io/DeeBlazewick-UX/puzzle/** and **https://deeblazewick-ux.github.io/DeeBlazewick-UX/antiwordle/**

The site root (`…/DeeBlazewick-UX/`) lists prototypes: **`puzzle/`** (Constraint Cross) and **`antiwordle/`** (Anti-Wordle).

### Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Then open [http://localhost:5173](http://localhost:5173).

Or open `index.html` directly in a browser (some browsers restrict module imports on `file://`; the server method is preferred).

## Puzzle categories

Categories are defined in [`js/puzzles.js`](js/puzzles.js):

1. Add an entry to **`PUZZLE_CATEGORIES`** (use a short `id` and a human `label`).
2. On each puzzle object, set **`category: "your-id"`** so it appears under that group in the menu.

Puzzles with an unknown `category` show under **Other**.

## Difficulty (per-puzzle variants)

Each puzzle **family** in [`js/puzzles.js`](js/puzzles.js) has a **`variants`** object: `easy`, optional `medium`, optional `hard`. The **Difficulty** menu only lists keys that exist for the selected puzzle.

1. Keep **`DIFFICULTIES`** in sync if you add a new tier id (ordered labels for the UI).
2. Under a family, add e.g. **`variants.medium`** with the same shape as **`variants.easy`**: `layout`, `solution`, `clues`, `slots`.
3. **Grid shape:** every row in `layout` / `solution` must be the **same length** (rectangular grids are OK, e.g. `6` rows × `5` columns). The app derives size from the strings—there is no separate `size` field.

Switching **Puzzle** resets difficulty to the first available tier (usually Easy). Switching **Difficulty** keeps the same puzzle and reloads the variant.

## Controls

- **Click** a cell, **type** letters (A–Z). **Backspace** clears.
- **Arrow keys** move between editable cells.
- **Check** compares your fill to the puzzle solution (prototype validation).

## Next steps (not in this prototype)

- AdMob / rewarded hints, puzzle packs, daily seed, larger dictionary validation.
