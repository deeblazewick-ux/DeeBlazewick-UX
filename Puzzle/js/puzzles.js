/**
 * Puzzle format:
 * - size: grid dimension (square)
 * - layout: string rows, '.' = blocked, '#' = editable, letter = given
 * - solution: same shape, full letters (including givens)
 * - clues: short constraint-style hints for each word slot
 * - slots: { id, cells: [r,c][] } for validation messaging
 */

export const PUZZLES = [
  {
    id: "cross-beach",
    title: "Crossing: shore",
    size: 5,
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
  {
    id: "cross-phase",
    title: "Crossing: light",
    size: 5,
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
];
