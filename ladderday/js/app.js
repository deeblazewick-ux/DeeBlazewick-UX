import { WORD_SET } from "./words.js";
import { LADDER_PUZZLES } from "./puzzles.js";

/** Days since Unix epoch (UTC midnight). */
function utcDayNumber() {
  const d = new Date();
  const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor(utc / 86400000);
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function puzzleIndexForDay() {
  const rng = mulberry32((utcDayNumber() ^ 0xdeadbeef) >>> 0);
  return Math.floor(rng() * LADDER_PUZZLES.length);
}

function pickDailyPuzzle() {
  return LADDER_PUZZLES[puzzleIndexForDay()];
}

function pickRandomPuzzle() {
  return LADDER_PUZZLES[Math.floor(Math.random() * LADDER_PUZZLES.length)];
}

/** @param {string} a @param {string} b */
function hamming(a, b) {
  if (a.length !== b.length) return 99;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

const $ladder = document.getElementById("ladder-rows");
const $goalBanner = document.getElementById("goal-banner");
const $current = document.getElementById("current-row");
const $status = document.getElementById("status");
const $mode = document.getElementById("mode-label");
const $kbd = document.getElementById("keyboard");
const $btnUndo = document.getElementById("btn-undo");
const $btnToday = document.getElementById("btn-today");
const $btnPractice = document.getElementById("btn-practice");
const $parNote = document.getElementById("par-note");

/** @type {{ start: string, goal: string, par: number }} */
let puzzle = pickDailyPuzzle();
/** @type {string[]} */
let chain = [];
/** @type {string} */
let buffer = "";
/** @type {boolean} */
let won = false;
/** @type {boolean} */
let practiceMode = false;

function isPracticeFromUrl() {
  return new URLSearchParams(window.location.search).has("practice");
}

function setPractice(on) {
  practiceMode = on;
  const url = new URL(window.location.href);
  if (on) url.searchParams.set("practice", "1");
  else url.searchParams.delete("practice");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function startGame() {
  puzzle = practiceMode ? pickRandomPuzzle() : pickDailyPuzzle();
  chain = [puzzle.start];
  buffer = "";
  won = false;
  $mode.textContent = practiceMode ? "Practice (random ladder)" : "Today’s ladder (UTC)";
  $parNote.textContent = "";
  document.body.classList.toggle("game-won", false);
  renderAll();
  announce(
    "Change one letter at a time. Each step must be a valid word. Reach the goal."
  );
}

function announce(msg) {
  $status.textContent = msg;
}

function renderLadder() {
  $ladder.innerHTML = "";
  for (let i = 0; i < chain.length; i++) {
    const row = document.createElement("div");
    row.className = "ladder-row" + (i === 0 ? " start-row" : "");
    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = i === 0 ? "Start" : String(i);
    const word = document.createElement("span");
    word.className = "row-word";
    word.textContent = chain[i].toUpperCase();
    row.appendChild(label);
    row.appendChild(word);
    $ladder.appendChild(row);
  }
}

function renderGoalBanner() {
  const last = chain[chain.length - 1];
  if (last === puzzle.goal && won) {
    $goalBanner.innerHTML = "";
    $goalBanner.classList.add("hidden");
    return;
  }
  $goalBanner.classList.remove("hidden");
  $goalBanner.innerHTML = "";
  const lab = document.createElement("span");
  lab.className = "goal-label";
  lab.textContent = "Goal";
  const w = document.createElement("span");
  w.className = "goal-word";
  w.textContent = puzzle.goal.toUpperCase();
  $goalBanner.appendChild(lab);
  $goalBanner.appendChild(w);
}

function renderCurrent() {
  $current.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const ch = buffer[i] ?? "";
    cell.textContent = ch.toUpperCase();
    if (!ch) cell.classList.add("empty");
    $current.appendChild(cell);
  }
}

function renderAll() {
  renderLadder();
  renderGoalBanner();
  renderCurrent();
  $btnUndo.disabled = won || chain.length <= 1;
}

function submitWord() {
  if (won) return;
  const word = buffer.toLowerCase();
  if (word.length !== 5) {
    announce("Enter a full five-letter word.");
    return;
  }
  if (!WORD_SET.has(word)) {
    announce("That word is not in the game’s word list.");
    return;
  }
  if (chain.includes(word)) {
    announce("You already used that word in this ladder.");
    return;
  }
  const prev = chain[chain.length - 1];
  const h = hamming(prev, word);
  if (h !== 1) {
    announce(
      h === 0
        ? "That’s the same word as the last step — change exactly one letter."
        : `Change exactly one letter from ${prev.toUpperCase()} (you changed ${h}).`
    );
    return;
  }

  chain.push(word);
  buffer = "";

  if (word === puzzle.goal) {
    won = true;
    const steps = chain.length - 1;
    $parNote.textContent = `Your steps: ${steps}. Shortest possible (with this word list): ${puzzle.par}.`;
    announce(steps === puzzle.par ? "Perfect — shortest ladder!" : "You reached the goal.");
    document.body.classList.add("game-won");
  } else {
    announce("Nice — keep going toward the goal.");
  }
  renderAll();
}

function undoStep() {
  if (won) return;
  if (chain.length <= 1) return;
  chain.pop();
  renderAll();
  announce("Undid last step.");
}

function onKeyLetter(letter) {
  if (won) return;
  if (buffer.length >= 5) return;
  buffer += letter.toLowerCase();
  renderCurrent();
}

function onKeyBackspace() {
  if (won) return;
  buffer = buffer.slice(0, -1);
  renderCurrent();
}

function onKeyEnter() {
  submitWord();
}

function buildKeyboard() {
  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
  ];
  $kbd.innerHTML = "";
  for (const row of rows) {
    const div = document.createElement("div");
    div.className = "kbd-row";
    for (const key of row) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kbd-key";
      if (key === "enter") {
        btn.classList.add("wide");
        btn.textContent = "Enter";
        btn.addEventListener("click", () => onKeyEnter());
      } else if (key === "backspace") {
        btn.classList.add("wide");
        btn.textContent = "⌫";
        btn.setAttribute("aria-label", "Backspace");
        btn.addEventListener("click", () => onKeyBackspace());
      } else {
        btn.textContent = key.toUpperCase();
        btn.addEventListener("click", () => onKeyLetter(key));
      }
      div.appendChild(btn);
    }
    $kbd.appendChild(div);
  }
}

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "Enter") {
    e.preventDefault();
    onKeyEnter();
    return;
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    onKeyBackspace();
    return;
  }
  if (/^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
    onKeyLetter(e.key);
  }
});

$btnUndo.addEventListener("click", undoStep);
$btnToday.addEventListener("click", () => {
  setPractice(false);
  startGame();
});
$btnPractice.addEventListener("click", () => {
  setPractice(true);
  startGame();
});

practiceMode = isPracticeFromUrl();
buildKeyboard();
startGame();
