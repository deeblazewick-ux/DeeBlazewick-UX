import { PUZZLES } from "./puzzles.js";

/** @type {typeof PUZZLES[0] | null} */
let current = null;
/** @type {string[][]} */
let grid = [];
/** @type {("blocked"|"given"|"editable")[][]} */
let types = [];

const $grid = document.getElementById("grid");
const $clues = document.getElementById("clues");
const $status = document.getElementById("status");
const $title = document.getElementById("puzzle-title");
const $select = document.getElementById("puzzle-select");

function parseLayout(puzzle) {
  const { size, layout, solution } = puzzle;
  types = [];
  grid = [];
  for (let r = 0; r < size; r++) {
    const tRow = [];
    const gRow = [];
    for (let c = 0; c < size; c++) {
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

function renderClues(puzzle) {
  $clues.innerHTML = "";
  for (const clue of puzzle.clues) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${clue.label}:</strong> ${clue.text}`;
    $clues.appendChild(li);
  }
}

function cellIndex(r, c) {
  return r * current.size + c;
}

function nextEditable(r, c, dr, dc) {
  const n = current.size;
  let rr = r + dr;
  let cc = c + dc;
  let guard = 0;
  while (guard++ < n * n + 5) {
    if (rr < 0) rr = n - 1;
    if (rr >= n) rr = 0;
    if (cc < 0) cc = n - 1;
    if (cc >= n) cc = 0;
    if (types[rr][cc] !== "blocked") {
      if (types[rr][cc] === "editable") return [rr, cc];
    }
    rr += dr;
    cc += dc;
  }
  return [r, c];
}

function renderGrid() {
  $grid.innerHTML = "";
  $grid.style.gridTemplateColumns = `repeat(${current.size}, 1fr)`;
  for (let r = 0; r < current.size; r++) {
    for (let c = 0; c < current.size; c++) {
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
  const cells = $grid.querySelectorAll(".cell");
  let i = 0;
  for (let r = 0; r < current.size; r++) {
    for (let c = 0; c < current.size; c++) {
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
  return current.solution[r][c].toUpperCase();
}

function check() {
  readGridFromDom();
  clearErrors();
  const cells = $grid.querySelectorAll(".cell");
  let complete = true;
  const wrong = new Set();

  for (let r = 0; r < current.size; r++) {
    for (let c = 0; c < current.size; c++) {
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

function loadPuzzle(id) {
  const puzzle = PUZZLES.find((p) => p.id === id) || PUZZLES[0];
  current = puzzle;
  $title.textContent = puzzle.title;
  parseLayout(puzzle);
  renderClues(puzzle);
  renderGrid();
  setStatus("Fill the grid, then tap Check.", "");
  const first = document.querySelector(".cell.editable");
  if (first) first.focus();
}

function init() {
  for (const p of PUZZLES) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.title;
    $select.appendChild(opt);
  }
  $select.addEventListener("change", () => loadPuzzle($select.value));
  document.getElementById("btn-check").addEventListener("click", check);
  document.getElementById("btn-clear").addEventListener("click", () => {
    for (let r = 0; r < current.size; r++) {
      for (let c = 0; c < current.size; c++) {
        if (types[r][c] === "editable") grid[r][c] = "";
      }
    }
    renderGrid();
    setStatus("Cleared editable cells.", "");
    const first = document.querySelector(".cell.editable");
    if (first) first.focus();
  });

  loadPuzzle(PUZZLES[0].id);
}

init();
