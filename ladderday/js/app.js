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
const $anchors = document.getElementById("puzzle-anchors");
const $current = document.getElementById("current-row");
const $status = document.getElementById("status");
const $kbd = document.getElementById("keyboard");
const $btnUndo = document.getElementById("btn-undo");
const $btnToday = document.getElementById("btn-today");
const $btnPractice = document.getElementById("btn-practice");
const $btnCopy = document.getElementById("btn-copy");
const $parNote = document.getElementById("par-note");
const $typingHeading = document.getElementById("typing-heading");
const $strictToggle = /** @type {HTMLInputElement | null} */ (document.getElementById("strict-shortest"));

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
let strictShortest = false;
/** @type {number[] | null} */
let diffHighlightIndices = null;
/** @type {number} */
let progressMsgCount = 0;

function isPracticeFromUrl() {
  return new URLSearchParams(window.location.search).has("practice");
}

function strictFromUrl() {
  const q = new URLSearchParams(window.location.search);
  return q.get("strict") === "1" || q.get("shortest") === "1";
}

function setPractice(on) {
  practiceMode = on;
  const url = new URL(window.location.href);
  if (on) url.searchParams.set("practice", "1");
  else url.searchParams.delete("practice");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function setStrictUrl(on) {
  const url = new URL(window.location.href);
  if (on) url.searchParams.set("strict", "1");
  else {
    url.searchParams.delete("strict");
    url.searchParams.delete("shortest");
  }
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

function renderStrictNote() {
  if (won) return;
  if (!strictShortest) {
    $parNote.textContent = "";
    return;
  }
  const maxEdges = puzzle.par;
  const used = chain.length - 1;
  const left = maxEdges - used;
  if (left <= 0) {
    $parNote.textContent =
      "Shortest-path mode: your next word must be the goal — no extra rungs left after the start.";
    return;
  }
  $parNote.textContent = `Shortest-path mode: at most ${maxEdges} one-letter steps after the start for this puzzle. You’ve used ${used}; ${left} step${left === 1 ? "" : "s"} left before you enter the next word.`;
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
  progressMsgCount = 0;
  clearDiffHighlight();
  $parNote.textContent = "";
  $btnCopy.classList.add("hidden");
  document.body.classList.toggle("game-won", false);
  setStatusTone("neutral");
  renderAll();
  announce("Type a word that changes one letter from the last row, then press Enter.");
}

function renderPuzzleAnchors() {
  $anchors.className = "puzzle-anchors" + (won ? " puzzle-anchors--won" : "");
  $anchors.innerHTML = "";

  const startCol = document.createElement("div");
  startCol.className = "puzzle-anchor puzzle-anchor--start";
  const startLab = document.createElement("span");
  startLab.className = "puzzle-anchor-label";
  startLab.textContent = "Start";
  const startWord = document.createElement("span");
  startWord.className = "puzzle-anchor-word";
  startWord.textContent = puzzle.start.toUpperCase();
  startCol.append(startLab, startWord);

  const goalCol = document.createElement("div");
  goalCol.className = "puzzle-anchor puzzle-anchor--goal";
  const goalLab = document.createElement("span");
  goalLab.className = "puzzle-anchor-label";
  goalLab.textContent = won ? "Goal reached" : "Goal";
  const goalWord = document.createElement("span");
  goalWord.className = "puzzle-anchor-word";
  goalWord.textContent = puzzle.goal.toUpperCase();
  goalCol.append(goalLab, goalWord);

  $anchors.append(startCol, goalCol);
}

function renderLadder() {
  $ladder.innerHTML = "";
  if (chain.length <= 1) {
    const empty = document.createElement("p");
    empty.className = "ladder-empty";
    empty.textContent = "Your next words will show here after you press Enter.";
    $ladder.appendChild(empty);
    return;
  }
  for (let i = 1; i < chain.length; i++) {
    const row = document.createElement("div");
    row.className = "ladder-row";
    if (i === 1) row.classList.add("ladder-row--first-step");
    if (won && i === chain.length - 1 && chain[i] === puzzle.goal) {
      row.classList.add("ladder-row--goal-done");
    }
    const label = document.createElement("span");
    label.className = "row-label";
    label.textContent = String(i);
    const word = document.createElement("span");
    word.className = "row-word";
    word.textContent = chain[i].toUpperCase();
    row.appendChild(label);
    row.appendChild(word);
    $ladder.appendChild(row);
  }
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
  renderPuzzleAnchors();
  renderLadder();
  renderCurrent();
  renderKeyboard();
  $btnUndo.disabled = won || chain.length <= 1;
  if ($strictToggle) {
    $strictToggle.disabled = won;
    $strictToggle.checked = strictShortest;
  }
  renderStrictNote();
}

function renderKeyboard() {
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

  if (strictShortest && chain.length > puzzle.par) {
    announce(
      `Shortest-path mode allows only ${puzzle.par} one-letter steps after the start for this puzzle. Undo a step or turn the mode off.`,
      "error"
    );
    return;
  }

  clearDiffHighlight();
  chain.push(word);
  buffer = "";

  if (word === puzzle.goal) {
    won = true;
    const steps = chain.length - 1;
    if (strictShortest) {
      $parNote.textContent = `You reached the goal in ${steps} steps with shortest-path mode on.`;
      announce("You solved it within the shortest-path limit.", "success");
    } else {
      $parNote.textContent = `You reached the goal in ${steps} steps.`;
      announce(steps === puzzle.par ? "You reached the goal — and matched the minimum steps for this puzzle." : "You reached the goal.", "success");
    }
    document.body.classList.add("game-won");
    $btnCopy.classList.remove("hidden");
  } else {
    progressMsgCount += 1;
    if (progressMsgCount === 1) {
      announce("Nice — keep going toward the goal.", "progress");
    } else {
      announce("OK — next.", "progress");
    }
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
  const mode = strictShortest ? " · shortest-path mode" : "";
  return `${head}\n${line}\n${steps} steps${mode}`;
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

$strictToggle?.addEventListener("change", () => {
  if (!$strictToggle) return;
  const on = $strictToggle.checked;
  if (on && chain.length > 1) {
    if (
      !window.confirm(
        "Turning on shortest-path mode clears your ladder back to the start word for this puzzle. Continue?"
      )
    ) {
      $strictToggle.checked = false;
      return;
    }
    chain = [puzzle.start];
    buffer = "";
    clearDiffHighlight();
    progressMsgCount = 0;
  }
  strictShortest = on;
  setStrictUrl(on);
  announce(
    strictShortest
      ? "Shortest-path mode is on — extra rungs past the limit are blocked."
      : "Shortest-path mode is off — you can use as many steps as you like.",
    "neutral"
  );
  renderAll();
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
  strictShortest = false;
  clearDiffHighlight();
  $parNote.textContent = "You reached the goal in 4 steps.";
  $btnCopy.classList.remove("hidden");
  document.body.classList.add("game-won");
  if ($strictToggle) {
    $strictToggle.checked = false;
    $strictToggle.disabled = true;
  }
  renderAll();
  announce("You reached the goal — and matched the minimum steps for this puzzle.", "success");
  scrollLadderToBottom();
}

practiceMode = isPracticeFromUrl();
strictShortest = strictFromUrl();
if ($strictToggle) $strictToggle.checked = strictShortest;

if (isDemoWonFromUrl()) {
  loadDemoWon();
} else {
  startGame();
}
