# Anti-Wordle

A small static **word puzzle** that inverts the usual Wordle feedback loop:

- You always see the solution’s **consonant / vowel pattern** (A, E, I, O, U count as vowels).
- There are **no** green / yellow / gray tiles for your guesses.
- After each **wrong** valid guess, the game reveals the **leftmost** letter of the true word that was not yet revealed.

**Daily mode:** one shared word per UTC calendar day (deterministic seed).

**Practice:** `?practice=1` in the URL, or use **New random (practice)**.

## Run locally

From this folder:

```bash
python3 -m http.server 5174
```

Open [http://localhost:5174](http://localhost:5174).

## Deploy (this repo)

GitHub Pages is configured in the root workflow to publish **`puzzle/`** and **`antiwordle/`** together. After deploy, this app lives at:

**`https://<user>.github.io/<repo>/antiwordle/`**

## Customize

- Word pool: edit [`js/words.js`](js/words.js).
