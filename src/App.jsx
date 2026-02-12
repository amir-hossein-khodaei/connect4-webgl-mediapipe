import React, { Suspense, lazy } from 'react';
import MainMenu from './components/ui/MainMenu';
import GameOverlay from './components/ui/GameOverlay';
import HandController from './components/vision/HandController';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy load the 3D scene (Splits the bundle)
const Scene = lazy(() => import('./components/game/Scene'));

function App() {
  return (
    <div className="relative w-full h-screen bg-[#0a1a2a] overflow-hidden font-serif">
      
      {/* 1. NEW LOADING OVERLAY */}
      <LoadingScreen />

      {/* 2. Layer 1: The 3D Fantasy World */}
      {/* We keep Suspense here to handle the lazy load wait */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      {/* 3. Layer 2: UI */}
      <MainMenu />
      <GameOverlay />

      {/* 4. Layer 3: Hand Tracking */}
      <HandController />
    </div>
  );
}

export default App;