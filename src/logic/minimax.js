// Board dimensions
const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1; 
const AI = 2;     

const DIFFICULTY_SETTINGS = {
  easy: { depth: 2, randomness: 0.4 },
  medium: { depth: 4, randomness: 0.1 },
  hard: { depth: 6, randomness: 0 }
};

export const getBestMove = (board, difficulty = 'medium') => {
  const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.medium;
  const validMoves = getValidLocations(board);
  
  // Random blunder
  if (Math.random() < settings.randomness) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  // 1. Instant Win
  for (let col of validMoves) {
    const row = getNextOpenRow(board, col);
    const tempBoard = board.map(r => [...r]);
    tempBoard[row][col] = AI;
    if (checkWin(tempBoard, AI)) return col;
  }

  // 2. Instant Block
  for (let col of validMoves) {
    const row = getNextOpenRow(board, col);
    const tempBoard = board.map(r => [...r]);
    tempBoard[row][col] = PLAYER;
    if (checkWin(tempBoard, PLAYER)) return col;
  }

  // 3. Minimax
  let bestScore = -Infinity;
  let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];

  for (let col of validMoves) {
    const row = getNextOpenRow(board, col);
    const tempBoard = board.map(r => [...r]);
    tempBoard[row][col] = AI;

    const score = minimax(tempBoard, settings.depth, -Infinity, Infinity, false);

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
};

const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
  const validLocations = getValidLocations(board);
  const isTerminal = isTerminalNode(board);

  if (depth === 0 || isTerminal) {
    if (isTerminal) {
      if (checkWin(board, AI)) return 1000000;
      if (checkWin(board, PLAYER)) return -1000000;
      return 0; 
    } else {
      return scorePosition(board, AI); 
    }
  }

  if (maximizingPlayer) {
    let value = -Infinity;
    for (let col of validLocations) {
      const row = getNextOpenRow(board, col);
      const tempBoard = board.map(r => [...r]);
      tempBoard[row][col] = AI;
      const newScore = minimax(tempBoard, depth - 1, alpha, beta, false);
      value = Math.max(value, newScore);
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (let col of validLocations) {
      const row = getNextOpenRow(board, col);
      const tempBoard = board.map(r => [...r]);
      tempBoard[row][col] = PLAYER;
      const newScore = minimax(tempBoard, depth - 1, alpha, beta, true);
      value = Math.min(value, newScore);
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }
};

// --- HELPERS ---

const getValidLocations = (board) => {
  const locations = [];
  for (let c = 0; c < COLS; c++) {
    // Check Top Row (5)
    if (board[ROWS - 1][c] === EMPTY) {
      locations.push(c);
    }
  }
  return locations;
};

const getNextOpenRow = (board, col) => {
  // Check from Bottom (0) up
  for (let r = 0; r < ROWS; r++) {
    if (board[r][col] === EMPTY) {
      return r;
    }
  }
  return -1;
};

const isTerminalNode = (board) => {
  return checkWin(board, PLAYER) || checkWin(board, AI) || getValidLocations(board).length === 0;
};

const scorePosition = (board, piece) => {
  let score = 0;
  // Center Column Preference
  const centerArray = board.map(row => row[3]);
  const centerCount = centerArray.filter(x => x === piece).length;
  score += centerCount * 3;

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    const rowArray = board[r];
    for (let c = 0; c < COLS - 3; c++) {
      const window = rowArray.slice(c, c + 4);
      score += evaluateWindow(window, piece);
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    const colArray = board.map(row => row[c]);
    for (let r = 0; r < ROWS - 3; r++) {
      const window = colArray.slice(r, r + 4);
      score += evaluateWindow(window, piece);
    }
  }
  // Diagonal /
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }
  // Diagonal \
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r + 3][c], board[r + 2][c + 1], board[r + 1][c + 2], board[r][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }
  return score;
};

const evaluateWindow = (window, piece) => {
  let score = 0;
  const oppPiece = piece === PLAYER ? AI : PLAYER;
  const pieceCount = window.filter(cell => cell === piece).length;
  const emptyCount = window.filter(cell => cell === EMPTY).length;
  const oppCount = window.filter(cell => cell === oppPiece).length;

  if (pieceCount === 4) score += 100;
  else if (pieceCount === 3 && emptyCount === 1) score += 5;
  else if (pieceCount === 2 && emptyCount === 2) score += 2;
  if (oppCount === 3 && emptyCount === 1) score -= 4; 
  return score;
};

export const checkWin = (board, piece) => {
  // Horizontal
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c] === piece && board[r][c + 1] === piece && board[r][c + 2] === piece && board[r][c + 3] === piece) return true;
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (board[r][c] === piece && board[r + 1][c] === piece && board[r + 2][c] === piece && board[r + 3][c] === piece) return true;
    }
  }
  // Positive Diag
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (board[r][c] === piece && board[r + 1][c + 1] === piece && board[r + 2][c + 2] === piece && board[r + 3][c + 3] === piece) return true;
    }
  }
  // Negative Diag
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 3; r < ROWS; r++) {
      if (board[r][c] === piece && board[r - 1][c + 1] === piece && board[r - 2][c + 2] === piece && board[r - 3][c + 3] === piece) return true;
    }
  }
  return false;
};

/**
 * NEW: Returns the array of [r, c] coordinates for the winning line.
 * Returns null if no win.
 */
export const getWinningLine = (board, piece) => {
  // Horizontal
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (board[r][c] === piece && board[r][c + 1] === piece && board[r][c + 2] === piece && board[r][c + 3] === piece) {
        return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
      }
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (board[r][c] === piece && board[r + 1][c] === piece && board[r + 2][c] === piece && board[r + 3][c] === piece) {
        return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
      }
    }
  }
  // Positive Diag
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (board[r][c] === piece && board[r + 1][c + 1] === piece && board[r + 2][c + 2] === piece && board[r + 3][c + 3] === piece) {
        return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
      }
    }
  }
  // Negative Diag
  for (let c = 0; c < COLS - 3; c++) {
    for (let r = 3; r < ROWS; r++) {
      if (board[r][c] === piece && board[r - 1][c + 1] === piece && board[r - 2][c + 2] === piece && board[r - 3][c + 3] === piece) {
        return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
      }
    }
  }
  return null;
};