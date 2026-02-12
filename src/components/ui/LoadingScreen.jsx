import React from 'react';
import { useProgress } from '@react-three/drei';

const LoadingScreen = () => {
  const { progress, active } = useProgress();

  // If loading is done, disappear
  if (!active && progress === 100) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0a1a2a] transition-opacity duration-1000">
      <div className="text-center">
        {/* Fantasy Text */}
        <div className="text-[#ffd700] font-serif text-2xl tracking-[0.3em] animate-pulse mb-6 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          SUMMONING WORLD
        </div>
        
        {/* Magic Progress Bar */}
        <div className="w-64 h-2 bg-[#1a2a4a] rounded-full mx-auto overflow-hidden border border-[#4a5a7a] relative">
          <div 
            className="h-full bg-gradient-to-r from-[#b8860b] to-[#ffd700] shadow-[0_0_20px_#ffd700]"
            style={{ width: `${progress}%`, transition: 'width 0.2s ease-out' }}
          />
        </div>
        
        {/* Percentage */}
        <div className="mt-3 text-[#aaccff] text-xs font-mono opacity-70">
          {progress.toFixed(0)}% COMPLETE
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;