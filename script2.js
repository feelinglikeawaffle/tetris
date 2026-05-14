// Basic Tetris implementation

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

const boardElement = document.getElementById("board");
const nextBoardElement = document.getElementById("nextBoard");
const scoreElement = document.getElementById("score");
const linesElement = document.getElementById("lines");
const levelElement = document.getElementById("level");
const gameOverElement = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const restartBtn = document.getElementById("restartBtn");

let board = [];
let nextBoard = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 800;
let lastDropTime = 0;
let isRunning = false;
let isPaused = false;
let animationFrameId = null;

// Tetromino definitions (4x4 matrices)
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

const TETROMINO_KEYS = Object.keys(TETROMINOES);

// Piece factory
function createPiece() {
  const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  const def = TETROMINOES[key];
  return {
    type: key,
    x: 3,
    y: 0,
    rotationIndex: 0,
    shape: def.shapes[0],
    colorClass: def.colorClass
  };
}

// Board setup
function initBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(null);
    }
    board.push(row);
  }
}

function initNextBoard() {
  nextBoard = [];
  for (let r = 0; r < 4; r++) {
    const row = [];
    for (let c = 0; c < 4; c++) {
      row.push(null);
    }
    nextBoard.push(row);
  }
}

// DOM grid creation
function createBoardDOM() {
  boardElement.innerHTML = "";
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    boardElement.appendChild(cell);
  }
}

function createNextBoardDOM() {
  nextBoardElement.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.classList.add("next-cell");
    nextBoardElement.appendChild(cell);
  }
}

// Rendering
function drawBoard() {
  const cells = boardElement.children;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const cell = cells[idx];
      cell.className = "cell";
      const value = board[r][c];
      if (value) {
        cell.classList.add("filled", value.colorClass);
      }
    }
  }

  if (currentPiece) {
    const { shape, x, y, colorClass } = currentPiece;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (shape[r][c]) {
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
}

function drawNextPiece() {
  const cells = nextBoardElement.children;
  for (let i = 0; i < 16; i++) {
    cells[i].className = "next-cell";
  }
  if (!nextPiece) return;

  const { shape, colorClass } = nextPiece;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (shape[r][c]) {
        const idx = r * 4 + c;
        const cell = cells[idx];
        cell.classList.add("filled", colorClass);
      }
    }
  }
}

// Collision detection
function isValidPosition(piece, offsetX = 0, offsetY = 0, newShape = null) {
  const shape = newShape || piece.shape;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!shape[r][c]) continue;
      const newX = piece.x + c + offsetX;
      const newY = piece.y + r + offsetY;

      if (newX < 0 || newX >= COLS || newY >= ROWS) {
        return false;
      }
      if (newY >= 0 && board[newY][newX]) {
        return false;
      }
    }
  }
  return true;
}

// Lock piece into board
function lockPiece() {
  const { shape, x, y, colorClass } = currentPiece;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (shape[r][c]) {
        const br = y + r;
        const bc = x + c;
        if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
          board[br][bc] = { colorClass };
        }
      }
    }
  }
  clearLines();
  spawnNextPiece();
}

// Line clearing and scoring
function clearLines() {
  let linesCleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== null)) {
      board.splice(r, 1);
      const newRow = new Array(COLS).fill(null);
      board.unshift(newRow);
      linesCleared++;
      r++;
    }
  }

  if (linesCleared > 0) {
    lines += linesCleared;
    const lineScores = [0, 40, 100, 300, 1200];
    score += lineScores[linesCleared] * level;
    level = 1 + Math.floor(lines / 10);
    dropInterval = Math.max(120, 800 - (level - 1) * 60);
    updateInfo();
  }
}

function updateInfo() {
  scoreElement.textContent = score;
  linesElement.textContent = lines;
  levelElement.textContent = level;
}

// Piece movement
function movePiece(dx, dy) {
  if (!currentPiece) return;
  if (isValidPosition(currentPiece, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    drawBoard();
  } else if (dy === 1) {
    lockPiece();
  }
}

function rotatePiece(clockwise = true) {
  if (!currentPiece) return;
  const def = TETROMINOES[currentPiece.type];
  const shapes = def.shapes;
  let newIndex = currentPiece.rotationIndex + (clockwise ? 1 : -1);
  if (newIndex < 0) newIndex = shapes.length - 1;
  if (newIndex >= shapes.length) newIndex = 0;
  const newShape = shapes[newIndex];

  if (isValidPosition(currentPiece, 0, 0, newShape)) {
    currentPiece.rotationIndex = newIndex;
    currentPiece.shape = newShape;
    drawBoard();
  } else {
    // simple wall kicks: try left and right
    if (isValidPosition(currentPiece, -1, 0, newShape)) {
      currentPiece.x -= 1;
      currentPiece.rotationIndex = newIndex;
      currentPiece.shape = newShape;
      drawBoard();
    } else if (isValidPosition(currentPiece, 1, 0, newShape)) {
      currentPiece.x += 1;
      currentPiece.rotationIndex = newIndex;
      currentPiece.shape = newShape;
      drawBoard();
    }
  }
}

function hardDrop() {
  if (!currentPiece) return;
  let dropDistance = 0;
  while (isValidPosition(currentPiece, 0, dropDistance + 1)) {
    dropDistance++;
  }
  currentPiece.y += dropDistance;
  drawBoard();
  lockPiece();
}

// Game loop
function gameLoop(timestamp) {
  if (!isRunning || isPaused) {
    return;
  }

  if (!lastDropTime) lastDropTime = timestamp;
  const delta = timestamp - lastDropTime;

  if (delta > dropInterval) {
    movePiece(0, 1);
    lastDropTime = timestamp;
  }

  drawBoard();
  animationFrameId = requestAnimationFrame(gameLoop);
}

// Spawning
function spawnNextPiece() {
  if (!nextPiece) {
    currentPiece = createPiece();
    nextPiece = createPiece();
  } else {
    currentPiece = nextPiece;
    nextPiece = createPiece();
  }

  currentPiece.x = 3;
  currentPiece.y = 0;

  if (!isValidPosition(currentPiece, 0, 0)) {
    endGame();
    return;
  }

  drawNextPiece();
  drawBoard();
}

// Game state
function startGame() {
  if (isRunning) return;
  isRunning = true;
  isPaused = false;
  gameOverElement.classList.add("hidden");
  lastDropTime = 0;
  animationFrameId = requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (!isRunning) return;
  isPaused = !isPaused;
  if (!isPaused) {
    lastDropTime = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
  }
}

function resetGame() {
  cancelAnimationFrame(animationFrameId);
  isRunning = false;
  isPaused = false;
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 800;
  currentPiece = null;
  nextPiece = null;
  gameOverElement.classList.add("hidden");
  initBoard();
  initNextBoard();
  createBoardDOM();
  createNextBoardDOM();
  updateInfo();
  spawnNextPiece();
  drawBoard();
  drawNextPiece();
}

function endGame() {
  isRunning = false;
  isPaused = false;
  cancelAnimationFrame(animationFrameId);
  finalScoreElement.textContent = score;
  gameOverElement.classList.remove("hidden");
}

// Input
function handleKeyDown(e) {
  if (!isRunning || isPaused) return;

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      movePiece(-1, 0);
      break;
    case "ArrowRight":
      e.preventDefault();
      movePiece(1, 0);
      break;
    case "ArrowDown":
      e.preventDefault();
      movePiece(0, 1);
      break;
    case "ArrowUp":
    case "x":
    case "X":
      e.preventDefault();
      rotatePiece(true);
      break;
    case "z":
    case "Z":
      e.preventDefault();
      rotatePiece(false);
      break;
    case " ":
      e.preventDefault();
      hardDrop();
      break;
  }
}

// Event listeners
startBtn.addEventListener("click", () => {
  if (!isRunning) {
    startGame();
  }
});

pauseBtn.addEventListener("click", () => {
  pauseGame();
});

resetBtn.addEventListener("click", () => {
  resetGame();
});

restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

window.addEventListener("keydown", handleKeyDown);

// Init
(function init() {
  initBoard();
  initNextBoard();
  createBoardDOM();
  createNextBoardDOM();
  updateInfo();
  spawnNextPiece();
  drawBoard();
  drawNextPiece();
})();
