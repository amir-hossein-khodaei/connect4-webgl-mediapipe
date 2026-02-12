import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import SkyWorld from './World/SkyWorld';
import FloatingIsland from './World/FloatingIsland';
import RuneBoard from './Board/RuneBoard';
import SpellCursor from './Interaction/SpellCursor';
import TurnManager from './Interaction/TurnManager';
import ErrorBoundary from '../utils/ErrorBoundary';

const Scene = () => {
  // --- FIX: This line defines baseUrl. Without it, the app crashes. ---
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
      <ErrorBoundary>
        <Canvas 
          shadows 
          dpr={[1, 1.5]}
          gl={{ 
            antialias: false, 
            toneMapping: THREE.ACESFilmicToneMapping, 
            toneMappingExposure: 0.6,
            powerPreference: "high-performance"
          }}
        >
          <Suspense fallback={null}>
            
            <PerspectiveCamera 
              makeDefault 
              position={[0, -0.14, 15]} 
              fov={67} 
              rotation={[-0.15, 0, 0]} 
            />
            
            <SkyWorld />
            <color attach="background" args={['#87CEEB']} />

            {/* --- FIX: using baseUrl here requires the definition above --- */}
            <Environment 
              files={`${baseUrl}assets/venice_sunset_1k.hdr`} 
              blur={0.8} 
              background={false} 
            />
            
            <TurnManager />

            <group position={[0, -0.5, 0]}>
               <RuneBoard />
               <FloatingIsland />
               <SpellCursor />
            </group>

            <EffectComposer disableNormalPass multisampling={0}>
              <SMAA /> 
              <Bloom 
                luminanceThreshold={1.1} 
                mipmapBlur 
                intensity={0.4} 
                radius={0.5}
              />
              <Noise opacity={0.02} />
              <Vignette eskil={false} offset={0.1} darkness={0.4} />
            </EffectComposer>

          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default Scene;