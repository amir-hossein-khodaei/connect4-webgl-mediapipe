import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import minimaxData from '../../data/minimaxContent.json'; 

const MainMenu = () => {
  const { 
    startGame, 
    difficulty, 
    setDifficulty, 
    inputMode, 
    setInputMode,
    gameStatus 
  } = useGameStore();

  const [showInfo, setShowInfo] = useState(false);
  const [lang, setLang] = useState('en'); // 'en' or 'fa'

  if (gameStatus !== 'menu') return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050a15]/90 backdrop-blur-sm text-white font-serif">
      
      {/* 1. TITLE (Fantasy Style) */}
      <div className="text-center mb-8 relative group">
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] via-[#ffaa00] to-[#b8860b] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-pulse cursor-default">
          MYSTIC CONNECT
        </h1>
        <p className="text-[#aaccff] mt-2 tracking-[0.3em] uppercase text-sm opacity-80 border-t border-b border-[#aaccff]/30 py-1 inline-block">
          The Ancient Ritual
        </p>
      </div>

      {/* 2. MENU SCROLL */}
      <div className="glass-panel p-10 w-[450px] space-y-8 relative border border-[#ffd700]/30 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        
        {/* Decorative Runes */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ffd700] rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ffd700] rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ffd700] rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ffd700] rounded-br-lg"></div>

        {/* INPUT SELECTION (Fantasy Terms) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#ffd700] uppercase tracking-widest text-center block">Choose Your Vessel</label>
          <div className="flex gap-4">
            <button
              onClick={() => setInputMode('mouse')}
              className={`flex-1 py-4 px-2 rounded-lg transition-all border border-[#4a5a7a] flex flex-col items-center gap-2 group
                ${inputMode === 'mouse' 
                  ? 'bg-[#1a3a6a] border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.2)]' 
                  : 'bg-[#0d1d3d] opacity-60 hover:opacity-100 hover:border-[#aaccff]'
                }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🖱️</span>
              <span className="text-[10px] uppercase font-bold text-[#aaccff]">Tactician</span>
            </button>
            <button
              onClick={() => setInputMode('hand')}
              className={`flex-1 py-4 px-2 rounded-lg transition-all border border-[#4a5a7a] flex flex-col items-center gap-2 group
                ${inputMode === 'hand' 
                  ? 'bg-[#3a1a6a] border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.3)]' 
                  : 'bg-[#1d0d3d] opacity-60 hover:opacity-100 hover:border-[#ebaaff]'
                }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
              <span className="text-[10px] uppercase font-bold text-[#ebaaff]">Fire Caster</span>
            </button>
          </div>
        </div>

        {/* DIFFICULTY SELECTION (Fantasy Terms) */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#ffd700] uppercase tracking-widest text-center block">Spirit Strength</label>
          <div className="flex justify-between gap-2 p-1 rounded bg-[#050a15]/50 border border-[#2a3a5a]">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-2 text-xs font-bold rounded transition-all capitalize ${
                  difficulty === level
                    ? 'bg-[#2a4a7a] text-[#ffd700] shadow-md border border-[#4a6a9a]'
                    : 'text-[#5a6a8a] hover:text-[#aaccff]'
                }`}
              >
                {level === 'easy' && "Novice"}
                {level === 'medium' && "Adept"}
                {level === 'hard' && "Master"}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-[#5a6a8a] text-center italic font-sans min-h-[1.5em]">
            {difficulty === 'easy' && "The spirit is playful and makes mistakes."}
            {difficulty === 'medium' && "A worthy opponent for a trained mage."}
            {difficulty === 'hard' && "The Ancient One sees all futures."}
          </div>
        </div>

        {/* START BUTTON */}
        <button
          onClick={startGame}
          className="magic-btn w-full py-4 text-xl font-bold tracking-widest rounded shadow-lg border-2 border-[#ffd700]"
        >
          Begin Ritual
        </button>

        {/* SECRET SCROLL BUTTON (Opens Technical Modal) */}
        <button
          onClick={() => setShowInfo(true)}
          className="w-full py-2 bg-transparent border border-[#aaccff]/30 text-[#aaccff]/60 hover:text-[#ffd700] hover:border-[#ffd700] rounded transition flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] group"
        >
          <span>📜 The Scroll of Logic</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
        </button>
      </div>
      
      {/* 3. CREATOR SIGNATURE */}
      <div className="absolute bottom-6 flex flex-col items-center gap-2 z-50">
        <a 
          href="https://github.com/Amkhodaei83" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#aaccff] opacity-60 hover:opacity-100 hover:text-[#ffd700] transition-all text-xs tracking-widest uppercase flex items-center gap-2 group"
        >
           <span>Forged by Amkhodaei83</span>
           <span className="text-lg group-hover:-translate-y-1 transition-transform">🔗</span>
        </a>
      </div>

      {/* 4. TECH MODAL (Technical Explanation) */}
      {showInfo && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-bounce-in">
            <div className="bg-[#0d1d3d] border border-[#ffd700] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-[0_0_50px_rgba(255,215,0,0.1)] relative flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-[#aaccff]/20 bg-[#050a15]">
                    <h2 className="text-xl font-bold text-[#ffd700] tracking-widest uppercase">
                        {lang === 'en' ? "Under the Hood: Minimax" : "زیر کاپوت: الگوریتم مینی‌مکس"}
                    </h2>
                    <div className="flex gap-2">
                        <button 
                           onClick={() => setLang('en')}
                           className={`px-3 py-1 rounded text-xs font-bold transition-colors ${lang === 'en' ? 'bg-[#ffd700] text-black' : 'bg-[#1a3a6a] text-gray-400'}`}
                        >
                            EN
                        </button>
                        <button 
                           onClick={() => setLang('fa')}
                           className={`px-3 py-1 rounded text-xs font-bold transition-colors ${lang === 'fa' ? 'bg-[#ffd700] text-black' : 'bg-[#1a3a6a] text-gray-400'}`}
                        >
                            FA
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-[#e0e0e0] space-y-8 leading-relaxed text-sm md:text-base font-sans" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                    
                    {/* Section 1: Core Concept */}
                    <div>
                        <h3 className="text-[#00ffff] font-bold text-lg mb-2 border-b border-[#00ffff]/30 pb-1 inline-block">
                            {minimaxData[lang].section1Title}
                        </h3>
                        <p className="opacity-90">{minimaxData[lang].section1Text}</p>
                    </div>

                    {/* Section 2: Heuristics */}
                    <div className="bg-[#050a15]/50 p-6 rounded border border-[#aaccff]/10">
                        <h3 className="text-[#ffd700] font-bold text-lg mb-2 border-b border-[#ffd700]/30 pb-1 inline-block">
                            {minimaxData[lang].section2Title}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 opacity-90 mt-2">
                            {minimaxData[lang].section2List.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Section 3: Optimization */}
                    <div>
                        <h3 className="text-[#ff00ff] font-bold text-lg mb-2 border-b border-[#ff00ff]/30 pb-1 inline-block">
                            {minimaxData[lang].section3Title}
                        </h3>
                        <p className="opacity-90">{minimaxData[lang].section3Text}</p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#aaccff]/20 bg-[#050a15] text-center sticky bottom-0">
                    <button 
                        onClick={() => setShowInfo(false)}
                        className="px-8 py-2 bg-[#aaccff]/10 hover:bg-[#aaccff]/20 text-[#aaccff] border border-[#aaccff]/50 rounded transition uppercase tracking-widest text-xs"
                    >
                        {lang === 'en' ? "Close Terminal" : "بستن ترمینال"}
                    </button>
                </div>

            </div>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div className="mt-8 text-[#aaccff] text-xs max-w-md text-center bg-[#050a15]/60 p-4 rounded border border-[#aaccff]/20">
        {inputMode === 'hand' 
          ? (
            <>
              Hold <span className="font-bold text-white">Fist ✊</span> to charge energy. <span className="font-bold text-white">Open Hand 🖐</span> to release spell.
            </>
          )
          : (
            <>
               <span className="font-bold text-white">Move cursor</span> to aim. <span className="font-bold text-white">Click</span> to summon orb.
            </>
          )
        }
      </div>

    </div>
  );
};

export default MainMenu;