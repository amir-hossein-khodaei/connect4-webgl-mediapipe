import React from 'react';
import { useGameStore } from '../../store/gameStore';

const GameOverlay = () => {
  const { gameStatus, currentPlayer, winner, startGame, toMenu } = useGameStore();

  if (gameStatus === 'menu') return null;

  // LOGIC FIX: If the game is over, we force the display to show the Winner, 
  // not whose turn it "technically" is next.
  let displayPlayer = currentPlayer;
  if (winner === 1) displayPlayer = 1; // Force Sun if Player won
  if (winner === 2) displayPlayer = 2; // Force Moon if AI won

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-8 font-serif">
      
      {/* 1. TOP HUD */}
      <div className="flex justify-between items-start w-full pointer-events-auto">
        
        {/* Retreat Button */}
        <button 
          onClick={toMenu}
          className="bg-[#050a15]/80 backdrop-blur border border-[#4a5a7a] text-[#aaccff] px-4 py-2 rounded hover:bg-[#1a2a4a] hover:border-[#ffd700] transition-all text-sm uppercase tracking-widest shadow-lg"
        >
          ← Retreat
        </button>

        {/* Turn Status Orb */}
        <div className={`
           relative px-8 py-3 rounded-full border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md transform transition-all duration-500
           ${displayPlayer === 1 
             ? 'bg-gradient-to-r from-[#5a3a1a] to-[#8a5a2a] border-[#ffd700] shadow-[0_0_20px_rgba(255,170,0,0.4)]' 
             : 'bg-gradient-to-r from-[#1a2a4a] to-[#2a4a7a] border-[#aaccff] shadow-[0_0_20px_rgba(0,170,255,0.4)]'
           }
        `}>
           <h2 className="text-xl font-bold flex items-center gap-4 text-white drop-shadow-md">
             {displayPlayer === 1 ? (
               <>
                 <span className="text-2xl animate-pulse">☀️</span>
                 <span className="tracking-widest text-[#ffd700]">YOUR TURN</span>
               </>
             ) : (
               <>
                 <span className="tracking-widest text-[#aaccff]">SPIRIT TURN</span>
                 <span className="text-2xl animate-pulse">🌙</span>
               </>
             )}
           </h2>
        </div>
        
      </div>

      {/* 2. VICTORY / DEFEAT MODAL */}
      {gameStatus === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050a15]/80 pointer-events-auto backdrop-blur-sm z-50 animate-bounce-in">
          
          <div className="bg-[#0a1a2a] border-4 border-[#ffd700] p-12 rounded-lg shadow-[0_0_50px_rgba(255,215,0,0.3)] text-center max-w-lg w-full relative overflow-hidden">
            
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-20 ${winner === 1 ? 'bg-[#ffd700]' : 'bg-[#0000ff]'}`}></div>

            <h2 className="text-6xl font-black mb-4 uppercase tracking-widest relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
              {winner === 1 && <span className="text-[#ffd700] text-glow">Victory!</span>}
              {winner === 2 && <span className="text-[#5555ff] text-glow">Defeated</span>}
              {winner === 'draw' && <span className="text-[#aaaaaa]">Stalemate</span>}
            </h2>
            
            <p className="text-[#aaccff] mb-10 text-lg relative z-10 italic border-t border-b border-[#aaccff]/20 py-4">
              {winner === 1 ? "The Rune Gate has opened." : "The Spirit has blocked your path."}
            </p>
            
            <div className="flex flex-col gap-4 relative z-10">
               <button
                onClick={startGame}
                className="magic-btn w-full py-4 text-xl font-bold rounded shadow-lg"
              >
                Replay Ritual 🔄
              </button>
              <button
                onClick={toMenu}
                className="w-full py-3 bg-transparent border border-[#4a5a7a] text-[#5a6a8a] hover:text-white hover:border-white rounded transition uppercase tracking-widest text-sm"
              >
                Return to Void
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GameOverlay;