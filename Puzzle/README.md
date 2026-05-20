# Constraint Cross — prototype

A small **word + grid** puzzle prototype: fill crossing words so every **active line** is a valid English word, matching **logic-style clues** (not dictionary definitions).

## Deploy on GitHub Pages (static site)

This repo includes a workflow [`.github/workflows/deploy-puzzle-github-pages.yml`](../.github/workflows/deploy-puzzle-github-pages.yml) that publishes **only** the `Puzzle/` folder on every push to `main`.

### One-time GitHub setup

1. Push `main` with the workflow and `Puzzle/` files (commit and `git push`).
2. On GitHub: **Settings → Pages → Build and deployment**.
3. Under **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
4. Open the **Actions** tab and confirm the “Deploy Puzzle to GitHub Pages” workflow completes (green).

Your game will be at:

`https://<your-username>.github.io/<repository-name>/`

(Replace with your GitHub user/org and repo slug — e.g. `https://dee.github.io/DeeBlazewick-UX/`.)

### Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Then open [http://localhost:5173](http://localhost:5173).

Or open `index.html` directly in a browser (some browsers restrict module imports on `file://`; the server method is preferred).

## Controls

- **Click** a cell, **type** letters (A–Z). **Backspace** clears.
- **Arrow keys** move between editable cells.
- **Check** compares your fill to the puzzle solution (prototype validation).

## Next steps (not in this prototype)

- AdMob / rewarded hints, puzzle packs, daily seed, larger dictionary validation.
