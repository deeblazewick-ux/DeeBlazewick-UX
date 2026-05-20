import { WORDS, WORD_SET } from "./words.js";

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/** @returns {string} */
function patternForWord(word) {
  return [...word.toLowerCase()]
    .map((ch) => (VOWELS.has(ch) ? "V" : "C"))
    .join("");
}

/** Days since Unix epoch (UTC midnight). */
function utcDayNumber() {
  const d = new Date();
  const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor(utc / 86400000);
}

/** Mulberry32 PRNG */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDailyAnswer() {
  const rng = mulberry32(utcDayNumber() >>> 0);
  const idx = Math.floor(rng() * WORDS.length);
  return WORDS[idx];
}

function pickRandomAnswer() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

const $pattern = document.getElementById("pattern-strip");
const $revealed = document.getElementById("revealed-row");
const $current = document.getElementById("current-row");
const $history = document.getElementById("guess-history");
const $status = document.getElementById("status");
const $mode = document.getElementById("mode-label");
const $kbd = document.getElementById("keyboard");
const $btnNew = document.getElementById("btn-new-random");
const $btnToday = document.getElementById("btn-today");

/** @type {boolean} */
let practiceMode = false;
/** @type {string} */
let answer = "";
/** @type {string} */
let pattern = "";
/** @type {(string | null)[]} */
let revealed = [];
/** @type {string[]} */
let guesses = [];
/** @type {string} */
let buffer = "";
/** @type {boolean} */
let won = false;

function isPracticeFromUrl() {
  const q = new URLSearchParams(window.location.search);
  return q.has("practice");
}

function setPractice(on) {
  practiceMode = on;
  const url = new URL(window.location.href);
  if (on) url.searchParams.set("practice", "1");
  else url.searchParams.delete("practice");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function renderPattern() {
  $pattern.innerHTML = "";
  for (let i = 0; i < pattern.length; i++) {
    const span = document.createElement("span");
    span.className = "pattern-chip";
    span.textContent = pattern[i];
    span.title =
      pattern[i] === "V" ? "Vowel position (A, E, I, O, U)" : "Consonant position";
    $pattern.appendChild(span);
  }
}

function renderRevealed() {
  $revealed.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const cell = document.createElement("div");
    cell.className = "cell revealed";
    const ch = revealed[i];
    cell.textContent = ch ?? "";
    cell.setAttribute("aria-label", ch ? `Position ${i + 1}: ${ch.toUpperCase()}` : `Position ${i + 1}: unknown`);
    if (!ch) cell.classList.add("empty");
    $revealed.appendChild(cell);
  }
}

function renderCurrent() {
  $current.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const cell = document.createElement("div");
    cell.className = "cell current";
    const ch = buffer[i] ?? "";
    cell.textContent = ch;
    if (!ch) cell.classList.add("empty");
    $current.appendChild(cell);
  }
}

function renderHistory() {
  $history.innerHTML = "";
  for (const g of guesses) {
    const li = document.createElement("li");
    li.textContent = g.toUpperCase();
    $history.appendChild(li);
  }
}

function announce(msg) {
  $status.textContent = msg;
}

function startGame() {
  answer = practiceMode ? pickRandomAnswer() : pickDailyAnswer();
  pattern = patternForWord(answer);
  revealed = [null, null, null, null, null];
  guesses = [];
  buffer = "";
  won = false;
  $mode.textContent = practiceMode ? "Practice (random word)" : "Today’s puzzle (UTC)";
  renderPattern();
  renderRevealed();
  renderCurrent();
  renderHistory();
  announce(practiceMode ? "Guess any valid word. Wrong guesses reveal one true letter." : "Same rules — one shared word for everyone today.");
  document.body.classList.toggle("game-won", false);
}

function submitGuess() {
  if (won) return;
  const word = buffer.toLowerCase();
  if (word.length !== 5) {
    announce("Type five letters first.");
    return;
  }
  if (!WORD_SET.has(word)) {
    announce("Not in the word list.");
    return;
  }

  if (word === answer) {
    guesses.push(word);
    buffer = "";
    won = true;
    revealed = [...answer];
    renderRevealed();
    renderCurrent();
    renderHistory();
    announce("You got it.");
    document.body.classList.add("game-won");
    return;
  }

  guesses.push(word);
  let revealIdx = -1;
  for (let i = 0; i < 5; i++) {
    if (revealed[i] === null) {
      revealIdx = i;
      break;
    }
  }
  if (revealIdx >= 0) {
    revealed[revealIdx] = answer[revealIdx];
    announce(`Not quite. Revealed position ${revealIdx + 1}: ${answer[revealIdx].toUpperCase()}.`);
  } else {
    announce("Not the word (all positions were already revealed).");
  }
  buffer = "";
  renderRevealed();
  renderCurrent();
  renderHistory();
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
  submitGuess();
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

$btnNew.addEventListener("click", () => {
  setPractice(true);
  startGame();
});

$btnToday.addEventListener("click", () => {
  setPractice(false);
  startGame();
});

practiceMode = isPracticeFromUrl();
buildKeyboard();
startGame();
