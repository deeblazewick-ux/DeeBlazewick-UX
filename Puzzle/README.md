# Constraint Cross — prototype

A small **word + grid** puzzle prototype: fill crossing words so every **active line** is a valid English word, matching **logic-style clues** (not dictionary definitions).

## Run locally

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
