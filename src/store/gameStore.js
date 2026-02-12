import { create } from 'zustand';
import { checkWin, getBestMove, getWinningLine } from '../logic/minimax';

const ROWS = 6;
const COLS = 7;

export const useGameStore = create((set, get) => ({
  board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)), 
  currentPlayer: 1, 
  winner: null,
  gameStatus: 'menu', 
  difficulty: 'medium',
  inputMode: 'mouse',
  hoverColumn: 3, 
  winningLine: null,
  isAiming: false, 

  setHoverColumn: (col) => set({ hoverColumn: col }),
  setDifficulty: (level) => set({ difficulty: level }),
  setInputMode: (mode) => set({ inputMode: mode }),
  setIsAiming: (aiming) => set({ isAiming: aiming }),
  
  startGame: () => set({ 
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)), 
    currentPlayer: 1, 
    winner: null, 
    gameStatus: 'playing',
    winningLine: null,
    isAiming: false
  }),

  toMenu: () => set({ gameStatus: 'menu' }),

  playMove: (col) => {
    const { board, currentPlayer, winner, gameStatus, difficulty } = get();
    
    if (winner || gameStatus !== 'playing' || currentPlayer !== 1) return;

    // 1. Find placement row (Bottom Up)
    let rowToPlace = -1;
    for (let r = 0; r < ROWS; r++) {
      if (board[r][col] === 0) {
        rowToPlace = r;
        break; 
      }
    }

    if (rowToPlace === -1) return;

    // 2. Place Player Piece
    const newBoard = board.map(row => [...row]);
    newBoard[rowToPlace][col] = 1; 
    
    // 3. CHECK PLAYER WIN
    if (checkWin(newBoard, 1)) {
      const line = getWinningLine(newBoard, 1);
      set({ board: newBoard, winner: 1, winningLine: line });
      
      setTimeout(() => {
        set({ gameStatus: 'gameover' });
      }, 1500);
      return;
    }

    // Switch to AI
    set({ board: newBoard, currentPlayer: 2 });

    // 4. AI TURN
    // DELAY INCREASED: 600ms -> 1200ms
    // This allows the player's piece to fully drop and bounce before AI acts.
    setTimeout(() => {
      const { board: currentBoard, winner: currentWinner } = get();
      if (currentWinner) return; 

      const aiCol = getBestMove(currentBoard, difficulty);
      
      let aiRow = -1;
      for (let r = 0; r < ROWS; r++) {
        if (currentBoard[r][aiCol] === 0) {
          aiRow = r;
          break;
        }
      }

      if (aiRow !== -1) {
        const aiBoard = currentBoard.map(row => [...row]);
        aiBoard[aiRow][aiCol] = 2; 
        
        // 5. CHECK AI WIN
        if (checkWin(aiBoard, 2)) {
          const line = getWinningLine(aiBoard, 2);
          set({ board: aiBoard, winner: 2, currentPlayer: 1, winningLine: line });
          
          setTimeout(() => {
             set({ gameStatus: 'gameover' });
          }, 1500);

        } else if (aiBoard.every(row => row.every(cell => cell !== 0))) {
          set({ board: aiBoard, currentPlayer: 1, winner: 'draw' });
          setTimeout(() => {
             set({ gameStatus: 'gameover' });
          }, 1500);
        } else {
          set({ board: aiBoard, currentPlayer: 1 });
        }
      }
    }, 1200); // <--- UPDATED DELAY
  },
}));