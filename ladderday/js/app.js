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

/** Letters that appear in at least one valid one-step neighbor of `prev`. */
function lettersPossibleFromPrev(prev) {
  const letters = new Set();
  const arr = [...prev];
  for (let i = 0; i < 5; i++) {
    const orig = arr[i];
    for (let c = 97; c <= 122; c++) {
      const ch = String.fromCharCode(c);
      if (ch === orig) continue;
      arr[i] = ch;
      if (WORD_SET.has(arr.join(""))) letters.add(ch);
      arr[i] = orig;
    }
  }
  return letters;
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
const $btnParHint = document.getElementById("btn-par-hint");
const $btnCopy = document.getElementById("btn-copy");
const $parNote = document.getElementById("par-note");
const $typingHeading = document.getElementById("typing-heading");

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
/** @type {boolean} */
let shortestHintShown = false;
/** @type {number[] | null} */
let diffHighlightIndices = null;
/** @type {number} */
let progressMsgCount = 0;

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

/** @param {'neutral' | 'error' | 'success' | 'progress'} tone */
function setStatusTone(tone) {
  $status.classList.remove("status--error", "status--success", "status--progress");
  if (tone === "error") $status.classList.add("status--error");
  else if (tone === "success") $status.classList.add("status--success");
  else if (tone === "progress") $status.classList.add("status--progress");
}

/** @param {'neutral' | 'error' | 'success' | 'progress'} [tone] */
function announce(msg, tone = "neutral") {
  $status.textContent = msg;
  setStatusTone(tone);
}

function clearDiffHighlight() {
  diffHighlightIndices = null;
}

function showShortestHintLine() {
  $parNote.textContent = `Shortest solution length: ${puzzle.par} steps (with this word list).`;
  shortestHintShown = true;
  $btnParHint.disabled = true;
  $btnParHint.textContent = "Shortest length shown";
}

function maybeRevealShortestAfterStep() {
  if (shortestHintShown) return;
  if (chain.length >= 2) {
    showShortestHintLine();
  }
}

function scrollLadderToBottom() {
  requestAnimationFrame(() => {
    $ladder.scrollTop = $ladder.scrollHeight;
  });
}

function startGame() {
  puzzle = practiceMode ? pickRandomPuzzle() : pickDailyPuzzle();
  chain = [puzzle.start];
  buffer = "";
  won = false;
  shortestHintShown = false;
  progressMsgCount = 0;
  clearDiffHighlight();
  $mode.textContent = practiceMode ? "Practice · random start & goal" : "Daily puzzle · same for everyone (UTC)";
  $parNote.textContent = "";
  $btnParHint.disabled = false;
  $btnParHint.textContent = "Show shortest length";
  $btnCopy.classList.add("hidden");
  document.body.classList.toggle("game-won", false);
  setStatusTone("neutral");
  renderAll();
  announce("Type a word that changes one letter from the last row, then press Enter.");
}

function renderLadder() {
  $ladder.innerHTML = "";
  for (let i = 0; i < chain.length; i++) {
    const row = document.createElement("div");
    row.className = "ladder-row" + (i === 0 ? " start-row" : "");
    if (won && i === chain.length - 1 && chain[i] === puzzle.goal) {
      row.classList.add("ladder-row--goal-done");
    }
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
    $goalBanner.classList.remove("hidden");
    $goalBanner.classList.add("goal-banner--done");
    $goalBanner.innerHTML = "";
    const lab = document.createElement("span");
    lab.className = "goal-label";
    lab.textContent = "Goal reached";
    const w = document.createElement("span");
    w.className = "goal-word";
    w.textContent = puzzle.goal.toUpperCase();
    $goalBanner.appendChild(lab);
    $goalBanner.appendChild(w);
    return;
  }
  $goalBanner.classList.remove("goal-banner--done");
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
    if (ch) {
      cell.textContent = ch.toUpperCase();
      if (diffHighlightIndices && diffHighlightIndices.includes(i)) {
        cell.classList.add("cell--diff");
      }
    } else {
      cell.classList.add("empty");
    }
    $current.appendChild(cell);
  }
}

function renderAll() {
  renderLadder();
  renderGoalBanner();
  renderCurrent();
  renderKeyboard();
  $btnUndo.disabled = won || chain.length <= 1;
}

function renderKeyboard() {
  const prev = chain.length ? chain[chain.length - 1] : puzzle.start;
  const possible = won || prev.length !== 5 ? null : lettersPossibleFromPrev(prev);

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
        btn.dataset.letter = key;
        if (possible && buffer.length === 0 && !possible.has(key)) {
          btn.classList.add("kbd-key--dim");
          btn.setAttribute("aria-label", `${key.toUpperCase()} (no one-step word from last row uses this letter)`);
        }
        btn.addEventListener("click", () => onKeyLetter(key));
      }
      div.appendChild(btn);
    }
    $kbd.appendChild(div);
  }
}

function submitWord() {
  if (won) return;
  const word = buffer.toLowerCase();
  if (word.length !== 5) {
    clearDiffHighlight();
    announce("Enter a full five-letter word.", "error");
    return;
  }
  if (!WORD_SET.has(word)) {
    clearDiffHighlight();
    announce("That word is not in the game’s word list.", "error");
    return;
  }
  if (chain.includes(word)) {
    clearDiffHighlight();
    announce("You already used that word in this ladder.", "error");
    return;
  }
  const prev = chain[chain.length - 1];
  const h = hamming(prev, word);
  if (h !== 1) {
    diffHighlightIndices = [];
    for (let i = 0; i < 5; i++) {
      if (prev[i] !== word[i]) diffHighlightIndices.push(i);
    }
    announce(
      h === 0
        ? "That’s the same word as the last step — change exactly one letter."
        : `Change exactly one letter from ${prev.toUpperCase()} (you changed ${h}).`,
      "error"
    );
    $status.setAttribute("aria-live", "assertive");
    setTimeout(() => $status.setAttribute("aria-live", "polite"), 100);
    renderCurrent();
    return;
  }

  clearDiffHighlight();
  chain.push(word);
  buffer = "";

  if (word === puzzle.goal) {
    won = true;
    const steps = chain.length - 1;
    $parNote.textContent = `Your steps: ${steps}. Shortest possible (with this word list): ${puzzle.par}.`;
    announce(steps === puzzle.par ? "Perfect — shortest ladder!" : "You reached the goal.", "success");
    document.body.classList.add("game-won");
    shortestHintShown = true;
    $btnParHint.disabled = true;
    $btnParHint.textContent = "Shortest length shown";
    $btnCopy.classList.remove("hidden");
  } else {
    progressMsgCount += 1;
    if (progressMsgCount === 1) {
      announce("Nice — keep going toward the goal.", "progress");
    } else {
      announce("OK — next.", "progress");
    }
    maybeRevealShortestAfterStep();
  }
  renderAll();
  scrollLadderToBottom();
}

function undoStep() {
  if (won) return;
  if (chain.length <= 1) return;
  chain.pop();
  clearDiffHighlight();
  renderAll();
  scrollLadderToBottom();
  announce("Undid last step.", "neutral");
  $typingHeading?.focus({ preventScroll: true });
}

function onKeyLetter(letter) {
  if (won) return;
  if (buffer.length >= 5) return;
  clearDiffHighlight();
  buffer += letter.toLowerCase();
  renderCurrent();
  renderKeyboard();
}

function onKeyBackspace() {
  if (won) return;
  clearDiffHighlight();
  buffer = buffer.slice(0, -1);
  renderCurrent();
  renderKeyboard();
}

function onKeyEnter() {
  submitWord();
}

function confirmReset() {
  if (chain.length <= 1) return true;
  return window.confirm("Start a new ladder? Your current progress will be cleared.");
}

function buildShareText() {
  const line = chain.map((w) => w.toUpperCase()).join(" → ");
  const steps = chain.length - 1;
  let head;
  if (practiceMode) {
    head = "Ladder Day (practice)";
  } else {
    const d = new Date();
    const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    head = `Ladder Day ${iso} (UTC)`;
  }
  return `${head}\n${line}\n${steps} steps · shortest: ${puzzle.par}`;
}

async function copyResult() {
  const text = buildShareText();
  try {
    await navigator.clipboard.writeText(text);
    announce("Copied to clipboard.", "success");
  } catch {
    announce("Could not copy — try selecting the result text manually.", "error");
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
  if (!confirmReset()) return;
  setPractice(false);
  startGame();
});
$btnPractice.addEventListener("click", () => {
  if (!confirmReset()) return;
  setPractice(true);
  startGame();
});

$btnParHint.addEventListener("click", () => {
  if (shortestHintShown) return;
  showShortestHintLine();
});

$btnCopy.addEventListener("click", () => {
  void copyResult();
});

function isDemoWonFromUrl() {
  return new URLSearchParams(window.location.search).get("demo") === "won";
}

/** Preview a solved ladder (for screenshots / UX checks). Path is valid in `words.js`. */
function loadDemoWon() {
  puzzle = { start: "plate", goal: "scare", par: 4 };
  chain = ["plate", "slate", "state", "stare", "scare"];
  buffer = "";
  won = true;
  practiceMode = false;
  shortestHintShown = true;
  clearDiffHighlight();
  $mode.textContent = "Demo · finished puzzle (?demo=won)";
  $parNote.textContent = `Your steps: ${chain.length - 1}. Shortest possible (with this word list): ${puzzle.par}.`;
  $btnParHint.disabled = true;
  $btnParHint.textContent = "Shortest length shown";
  $btnCopy.classList.remove("hidden");
  document.body.classList.add("game-won");
  renderAll();
  announce("Perfect — shortest ladder!", "success");
  scrollLadderToBottom();
}

practiceMode = isPracticeFromUrl();
if (isDemoWonFromUrl()) {
  loadDemoWon();
} else {
  startGame();
}
