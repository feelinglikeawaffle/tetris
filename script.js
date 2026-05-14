// --- Constants ---
const COLS = 10;
const ROWS = 20;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const gameOverEl = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const restartBtn = document.getElementById("restartBtn");

// --- Game state ---
let board = [];
let currentPiece = null;
let nextDropTime = 0;
let dropInterval = 800;
let score = 0;
let lines = 0;
let level = 1;
let running = false;
let paused = false;
let frameId = null;

// --- Tetromino definitions ---
const TETROMINOES = {
  I: {
    colorClass: "color-I",
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
      ]
    ]
  },
  O: {
    colorClass: "color-O",
    shapes: [
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
      ]
    ]
  },
  T: {
    colorClass: "color-T",
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ]
    ]
  },
  S: {
    colorClass: "color-S",
    shapes: [
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ]
    ]
  },
  Z: {
    colorClass: "color-Z",
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    ]
  },
  J: {
    colorClass: "color-J",
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ]
    ]
  },
  L: {
    colorClass: "color-L",
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
      ]
    ]
  }
};

const T_KEYS = Object.keys(TETROMINOES);

// --- Helpers ---
function createBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = new Array(COLS).fill(null);
    board.push(row);
  }
}

function createBoardDOM() {
  boardEl.innerHTML = "";
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    boardEl.appendChild(cell);
  }
}

function spawnPiece() {
  const key = T_KEYS[Math.floor(Math.random() * T_KEYS.length)];
  const def = TETROMINOES[key];
  currentPiece = {
    type: key,
    x: 3,
    y: 0,
    rotationIndex: 0,
    shape: def.shapes[0],
    colorClass: def.colorClass
  };

  if (!isValidPosition(currentPiece, 0, 0, currentPiece.shape)) {
    endGame();
  }
}

function isValidPosition(piece, dx, dy, newShape) {
  const shape = newShape || piece.shape;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!shape[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;

      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

function draw() {
  const cells = boardEl.children;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const cell = cells[idx];
      cell.className = "cell";
      const val = board[r][c];
      if (val) {
        cell.classList.add("filled", val.colorClass);
      }
    }
  }

  if (currentPiece) {
    const { shape, x, y, colorClass } = currentPiece;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!shape[r][c]) continue;
        const br = y + r;
        const bc = x + c;
        if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
          const idx = br * COLS + bc;
          const cell = cells[idx];
          cell.classList.add("filled", colorClass);
        }
      }
    }
  }
}

function lockPiece() {
  const { shape, x, y, colorClass } = currentPiece;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!shape[r][c]) continue;
      const br = y + r;
      const bc = x + c;
      if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
        board[br][bc] = { colorClass };
      }
    }
  }
  clearLines();
  spawnPiece();
  draw();
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== null)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(null));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    const lineScores = [0, 40, 100, 300, 1200];
    score += lineScores[cleared] * level;
    lines += cleared;
    level = 1 + Math.floor(lines / 10);
    dropInterval = Math.max(120, 800 - (level - 1) * 60);
    updateInfo();
  }
}

function updateInfo() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function move(dx, dy) {
  if (!currentPiece) return;
  if (isValidPosition(currentPiece, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    draw();
  } else if (dy === 1) {
    lockPiece();
  }
}

function rotate() {
  if (!currentPiece) return;
  const def = TETROMINOES[currentPiece.type];
  const shapes = def.shapes;
  let newIndex = currentPiece.rotationIndex + 1;
  if (newIndex >= shapes.length) newIndex = 0;
  const newShape = shapes[newIndex];

  if (isValidPosition(currentPiece, 0, 0, newShape)) {
    currentPiece.rotationIndex = newIndex;
    currentPiece.shape = newShape;
    draw();
  } else if (isValidPosition(currentPiece, -1, 0, newShape)) {
    currentPiece.x -= 1;
    currentPiece.rotationIndex = newIndex;
    currentPiece.shape = newShape;
    draw();
  } else if (isValidPosition(currentPiece, 1, 0, newShape)) {
    currentPiece.x += 1;
    currentPiece.rotationIndex = newIndex;
    currentPiece.shape = newShape;
    draw();
  }
}

function hardDrop() {
  if (!currentPiece) return;
  let dist = 0;
  while (isValidPosition(currentPiece, 0, dist + 1)) {
    dist++;
  }
  currentPiece.y += dist;
  draw();
  lockPiece();
}

// --- Game loop ---
function loop(timestamp) {
  if (!running || paused) return;

  if (!nextDropTime) nextDropTime = timestamp;
  const delta = timestamp - nextDropTime;

  if (delta > dropInterval) {
    move(0, 1);
    nextDropTime = timestamp;
  }

  frameId = requestAnimationFrame(loop);
}

// --- Game control ---
function startGame() {
  if (running) return;
  running = true;
  paused = false;
  gameOverEl.classList.add("hidden");
  nextDropTime = 0;
  frameId = requestAnimationFrame(loop);
}

function pauseGame() {
  if (!running) return;
  paused = !paused;
  if (!paused) {
    nextDropTime = 0;
    frameId = requestAnimationFrame(loop);
  }
}

function resetGame() {
  cancelAnimationFrame(frameId);
  running = false;
  paused = false;
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 800;
  gameOverEl.classList.add("hidden");
  createBoard();
  createBoardDOM();
  updateInfo();
  spawnPiece();
  draw();
}

function endGame() {
  running = false;
  paused = false;
  cancelAnimationFrame(frameId);
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove("hidden");
}

// --- Input ---
window.addEventListener("keydown", e => {
  if (!running || paused) return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      move(-1, 0);
      break;
    case "ArrowRight":
      e.preventDefault();
      move(1, 0);
      break;
    case "ArrowDown":
      e.preventDefault();
      move(0, 1);
      break;
    case "ArrowUp":
      e.preventDefault();
      rotate();
      break;
    case " ":
      e.preventDefault();
      hardDrop();
      break;
  }
});

// --- Buttons ---
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resetBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

// --- Init ---
(function init() {
  createBoard();
  createBoardDOM();
  updateInfo();
  spawnPiece();
  draw();
})();
