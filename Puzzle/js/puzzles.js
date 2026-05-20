/**
 * Puzzle family:
 * - id, category, title — used in the puzzle picker (optgroup by category)
 * - variants: { easy, medium?, hard? } — each key present is offered in the UI
 *
 * Variant:
 * - layout / solution: same dimensions; every row string has the same length (rectangular OK)
 * - '.' blocked, '#' editable, letter = given (letter must match solution)
 * - clues, slots — same as before
 *
 * Adding a category: PUZZLE_CATEGORIES + category on each family.
 * Adding a difficulty: add variants.medium (or hard) on a family; register id in DIFFICULTIES.
 */

/** @type {{ id: string, label: string }[]} */
export const DIFFICULTIES = [
  { id: "easy", label: "Easy (cross)" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

/** @type {{ id: string, label: string }[]} */
export const PUZZLE_CATEGORIES = [
  { id: "nature", label: "Nature" },
  { id: "science", label: "Science & mind" },
];

export const PUZZLES = [
  {
    id: "cross-beach",
    category: "nature",
    title: "Crossing: shore",
    variants: {
      easy: {
        layout: [
          "..#..",
          "..#..",
          "#####",
          "..#..",
          "..#..",
        ],
        solution: [
          "..B..",
          "..E..",
          "CRANE",
          "..C..",
          "..H..",
        ],
        clues: [
          { label: "Across (row 3)", text: "A wading bird; also a machine for lifting." },
          { label: "Down (column 3)", text: "Sand and surf; five letters, third letter is A." },
        ],
        slots: [
          { id: "across-mid", label: "Across word", cells: [
            [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
          ]},
          { id: "down-mid", label: "Down word", cells: [
            [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
          ]},
        ],
      },
      medium: {
        layout: [
          "..B..",
          "..R..",
          "#####",
          "..N..",
          "#####",
          "..H..",
        ],
        solution: [
          "..B..",
          "..R..",
          "CRANE",
          "..N..",
          "LOCAL",
          "..H..",
        ],
        clues: [
          { label: "Across (row 3)", text: "A wading bird; also a machine for lifting." },
          { label: "Across (row 5)", text: "Nearby; not distant; five letters, middle letter matches the down word." },
          { label: "Down (column 3)", text: "Tree limb or river fork; six letters." },
        ],
        slots: [
          { id: "across-2", label: "Across (row 3)", cells: [
            [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
          ]},
          { id: "across-4", label: "Across (row 5)", cells: [
            [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
          ]},
          { id: "down-mid", label: "Down word", cells: [
            [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2],
          ]},
        ],
      },
    },
  },
  {
    id: "cross-stone",
    category: "nature",
    title: "Crossing: rock & face paint",
    variants: {
      easy: {
        layout: [
          "..#..",
          "..#..",
          "#####",
          "..#..",
          "..#..",
        ],
        solution: [
          "..C..",
          "..L..",
          "STONE",
          "..W..",
          "..N..",
        ],
        clues: [
          { label: "Across (row 3)", text: "Rock or gem material; five letters." },
          { label: "Down (column 3)", text: "Circus character with a red nose; five letters, shares the middle letter with across." },
        ],
        slots: [
          { id: "across-mid", label: "Across word", cells: [
            [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
          ]},
          { id: "down-mid", label: "Down word", cells: [
            [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
          ]},
        ],
      },
    },
  },
  {
    id: "cross-phase",
    category: "science",
    title: "Crossing: light",
    variants: {
      easy: {
        layout: [
          "..#..",
          "..#..",
          "#####",
          "..#..",
          "..#..",
        ],
        solution: [
          "..R..",
          "..E..",
          "PHASE",
          "..C..",
          "..T..",
        ],
        clues: [
          { label: "Across (row 3)", text: "Stage or part of a cycle; five letters." },
          { label: "Down (column 3)", text: "Respond to a stimulus; five letters, third letter matches the across word." },
        ],
        slots: [
          { id: "across-mid", label: "Across word", cells: [
            [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
          ]},
          { id: "down-mid", label: "Down word", cells: [
            [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
          ]},
        ],
      },
    },
  },
];
