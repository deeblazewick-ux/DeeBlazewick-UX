import { PUZZLES, PUZZLE_CATEGORIES, DIFFICULTIES } from "./puzzles.js";

/** @type {(typeof PUZZLES)[number] | null} */
let currentFamily = null;
/** @type {string} */
let currentDifficultyId = "easy";
/**
 * Active play state: flat variant + dimensions
 * @type {null | {
 *   layout: string[],
 *   solution: string[],
 *   clues: { label: string, text: string }[],
 *   slots: { id: string, label: string, cells: [number, number][] }[],
 *   numRows: number,
 *   numCols: number,
 * }}
 */
let current = null;

/** @type {string[][]} */
let grid = [];
/** @type {("blocked"|"given"|"editable")[][]} */
let types = [];

const $grid = document.getElementById("grid");
const $clues = document.getElementById("clues");
const $status = document.getElementById("status");
const $title = document.getElementById("puzzle-title");
const $subtitle = document.getElementById("puzzle-subtitle");
const $select = document.getElementById("puzzle-select");
const $difficulty = document.getElementById("difficulty-select");

/**
 * @param {typeof PUZZLES[number]} family
 */
function variantIdsForFamily(family) {
  return DIFFICULTIES.map((d) => d.id).filter((id) => family.variants[id]);
}

/**
 * @param {typeof PUZZLES[number]} family
 * @param {string} preferredDifficulty
 */
function resolveActiveVariant(family, preferredDifficulty) {
  const keys = variantIdsForFamily(family);
  const use = keys.includes(preferredDifficulty) ? preferredDifficulty : keys[0];
  const v = family.variants[use];
  const numRows = v.layout.length;
  const numCols = v.layout[0].length;
  for (let r = 0; r < numRows; r++) {
    if (v.layout[r].length !== numCols) {
      throw new Error(`Puzzle ${family.id}: row ${r} width must match (${numCols}).`);
    }
    if (v.solution[r].length !== numCols) {
      throw new Error(`Puzzle ${family.id}: solution row ${r} width must match.`);
    }
  }
  return {
    layout: v.layout,
    solution: v.solution,
    clues: v.clues,
    slots: v.slots,
    numRows,
    numCols,
    difficultyId: use,
  };
}

function parseLayout() {
  if (!current) return;
  const { layout, solution, numRows, numCols } = current;
  types = [];
  grid = [];
  for (let r = 0; r < numRows; r++) {
    const tRow = [];
    const gRow = [];
    for (let c = 0; c < numCols; c++) {
      const ch = layout[r][c];
      const sol = solution[r][c];
      if (ch === ".") {
        tRow.push("blocked");
        gRow.push("");
      } else if (ch === "#") {
        tRow.push("editable");
        gRow.push("");
      } else {
        tRow.push("given");
        gRow.push(sol.toUpperCase());
      }
    }
    types.push(tRow);
    grid.push(gRow);
  }
}

function renderClues() {
  if (!current) return;
  $clues.innerHTML = "";
  for (const clue of current.clues) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${clue.label}:</strong> ${clue.text}`;
    $clues.appendChild(li);
  }
}

function cellIndex(r, c) {
  if (!current) return 0;
  return r * current.numCols + c;
}

function nextEditable(r, c, dr, dc) {
  if (!current) return [r, c];
  const { numRows, numCols } = current;
  let rr = r + dr;
  let cc = c + dc;
  let guard = 0;
  while (guard++ < numRows * numCols + 5) {
    if (rr < 0) rr = numRows - 1;
    if (rr >= numRows) rr = 0;
    if (cc < 0) cc = numCols - 1;
    if (cc >= numCols) cc = 0;
    if (types[rr][cc] !== "blocked") {
      if (types[rr][cc] === "editable") return [rr, cc];
    }
    rr += dr;
    cc += dc;
  }
  return [r, c];
}

function renderGrid() {
  if (!current) return;
  const { numRows, numCols } = current;
  $grid.innerHTML = "";
  $grid.dataset.cols = String(numCols);
  $grid.dataset.rows = String(numRows);
  $grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const type = types[r][c];
      const el = document.createElement("div");
      el.className = `cell ${type}`;
      el.dataset.r = String(r);
      el.dataset.c = String(c);
      el.tabIndex = type === "editable" ? 0 : -1;
      el.textContent = grid[r][c] || "";
      if (type === "editable") {
        el.addEventListener("keydown", (e) => onKeydown(e, r, c));
        el.addEventListener("focus", () => clearErrors());
      }
      $grid.appendChild(el);
    }
  }
}

function clearErrors() {
  document.querySelectorAll(".cell.error").forEach((n) => n.classList.remove("error"));
}

/**
 * @param {KeyboardEvent} e
 */
function onKeydown(e, r, c) {
  const el = e.currentTarget;
  if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
    grid[r][c] = "";
    el.textContent = "";
    if (e.key === "Backspace") {
      const [pr, pc] = nextEditable(r, c, 0, -1);
      if (pr !== r || pc !== c) focusCell(pr, pc);
    }
    return;
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    const [nr, nc] = nextEditable(r, c, 0, -1);
    focusCell(nr, nc);
    return;
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    const [nr, nc] = nextEditable(r, c, 0, 1);
    focusCell(nr, nc);
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    const [nr, nc] = nextEditable(r, c, -1, 0);
    focusCell(nr, nc);
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const [nr, nc] = nextEditable(r, c, 1, 0);
    focusCell(nr, nc);
    return;
  }
  if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
    e.preventDefault();
    const letter = e.key.toUpperCase();
    grid[r][c] = letter;
    el.textContent = letter;
    const [nr, nc] = nextEditable(r, c, 0, 1);
    if (nr !== r || nc !== c) focusCell(nr, nc);
  }
}

function focusCell(r, c) {
  const idx = cellIndex(r, c);
  const cells = $grid.querySelectorAll(".cell");
  const el = cells[idx];
  if (el && el.classList.contains("editable")) el.focus();
}

function readGridFromDom() {
  if (!current) return;
  const { numRows, numCols } = current;
  const cells = $grid.querySelectorAll(".cell");
  let i = 0;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const el = cells[i++];
      const t = types[r][c];
      if (t === "editable") grid[r][c] = (el.textContent || "").trim().toUpperCase().slice(0, 1);
    }
  }
}

function letterAt(r, c) {
  return (grid[r][c] || "").toUpperCase();
}

function solutionAt(r, c) {
  if (!current) return "";
  return current.solution[r][c].toUpperCase();
}

function check() {
  if (!current) return;
  readGridFromDom();
  clearErrors();
  const cells = $grid.querySelectorAll(".cell");
  let complete = true;
  const wrong = new Set();
  const { numRows, numCols } = current;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (types[r][c] === "blocked") continue;
      const got = letterAt(r, c);
      const want = solutionAt(r, c);
      if (!got) complete = false;
      if (got && got !== want) wrong.add(cellIndex(r, c));
    }
  }

  wrong.forEach((idx) => {
    cells[idx].classList.add("error");
  });

  if (!complete) {
    setStatus("Fill every letter first.", "bad");
    return;
  }
  if (wrong.size > 0) {
    setStatus(`${wrong.size} letter(s) do not match. Try again.`, "bad");
    return;
  }
  setStatus("Perfect — puzzle solved.", "ok");
}

function setStatus(msg, cls) {
  $status.textContent = msg;
  $status.className = `status ${cls || ""}`;
}

/**
 * @param {typeof PUZZLES[number]} family
 */
function buildDifficultySelect(family) {
  $difficulty.innerHTML = "";
  const ids = variantIdsForFamily(family);
  for (const id of ids) {
    const meta = DIFFICULTIES.find((d) => d.id === id);
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = meta ? meta.label : id;
    $difficulty.appendChild(opt);
  }
  const preferred = ids.includes(currentDifficultyId) ? currentDifficultyId : ids[0];
  currentDifficultyId = preferred;
  $difficulty.value = preferred;
}

/**
 * @param {string} familyId
 * @param {{ resetDifficulty?: boolean }} [opts]
 */
function loadPuzzle(familyId, opts = {}) {
  const { resetDifficulty = false } = opts;
  const family = PUZZLES.find((p) => p.id === familyId) || PUZZLES[0];
  currentFamily = family;
  if (resetDifficulty) {
    const first = variantIdsForFamily(family)[0];
    currentDifficultyId = first || "easy";
  }
  buildDifficultySelect(family);
  const resolved = resolveActiveVariant(family, currentDifficultyId);
  currentDifficultyId = resolved.difficultyId;
  $difficulty.value = resolved.difficultyId;
  current = {
    layout: resolved.layout,
    solution: resolved.solution,
    clues: resolved.clues,
    slots: resolved.slots,
    numRows: resolved.numRows,
    numCols: resolved.numCols,
  };
  $title.textContent = family.title;
  if ($subtitle) {
    $subtitle.textContent = `${resolved.numRows}×${resolved.numCols} · ${DIFFICULTIES.find((d) => d.id === resolved.difficultyId)?.label || resolved.difficultyId}`;
  }
  parseLayout();
  renderClues();
  renderGrid();
  setStatus("Fill the grid, then tap Check.", "");
  const first = document.querySelector(".cell.editable");
  if (first) first.focus();
}

function buildPuzzleSelect() {
  $select.innerHTML = "";
  const grouped = new Map();
  for (const c of PUZZLE_CATEGORIES) grouped.set(c.id, []);
  const fallback = [];
  for (const p of PUZZLES) {
    const bucket = grouped.get(p.category);
    if (bucket) bucket.push(p);
    else fallback.push(p);
  }
  for (const cat of PUZZLE_CATEGORIES) {
    const list = grouped.get(cat.id) || [];
    if (list.length === 0) continue;
    const og = document.createElement("optgroup");
    og.label = cat.label;
    for (const p of list) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.title;
      og.appendChild(opt);
    }
    $select.appendChild(og);
  }
  if (fallback.length > 0) {
    const og = document.createElement("optgroup");
    og.label = "Other";
    for (const p of fallback) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.title;
      og.appendChild(opt);
    }
    $select.appendChild(og);
  }
}

function init() {
  buildPuzzleSelect();
  $select.addEventListener("change", () => {
    loadPuzzle($select.value, { resetDifficulty: true });
  });
  $difficulty.addEventListener("change", () => {
    currentDifficultyId = $difficulty.value;
    if (currentFamily) loadPuzzle(currentFamily.id, { resetDifficulty: false });
  });
  document.getElementById("btn-check").addEventListener("click", check);
  document.getElementById("btn-clear").addEventListener("click", () => {
    if (!current) return;
    const { numRows, numCols } = current;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (types[r][c] === "editable") grid[r][c] = "";
      }
    }
    renderGrid();
    setStatus("Cleared editable cells.", "");
    const first = document.querySelector(".cell.editable");
    if (first) first.focus();
  });

  loadPuzzle(PUZZLES[0].id, { resetDifficulty: true });
}

init();
