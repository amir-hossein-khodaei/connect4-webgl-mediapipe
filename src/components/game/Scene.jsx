import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTexture, useEnvironment } from '@react-three/drei';
import SkyWorld from './World/SkyWorld';
import FloatingIsland from './World/FloatingIsland';
import RuneBoard from './Board/RuneBoard';
import SpellCursor from './Interaction/SpellCursor';
import TurnManager from './Interaction/TurnManager';
import ErrorBoundary from '../utils/ErrorBoundary';

const Scene = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
      <ErrorBoundary>
        <Canvas 
          shadows 
          dpr={[1, 1.5]} /* Optimization: Cap DPR at 1.5 (2.0 is heavy for post-processing) */
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
            {/* Fallback background in case HDR fails to load */}
<color attach="background" args={['#87CEEB']} />

<Environment 
  files="/assets/venice_sunset_1k.hdr" 
  blur={0.8} 
  background={false} 
  // If the file is missing, this prevents a crash:
  fallback={null} 
/>
            {/* Optimization: Use preset if local file fails, or ensure file exists */}
            <Environment 
              files="/assets/venice_sunset_1k.hdr" 
              blur={0.8} 
              background={false} 
            />
            <TurnManager />

            <group position={[0, -0.5, 0]}>
               <RuneBoard />
               <FloatingIsland />
               <SpellCursor />
            </group>

            {/* Optimization: Disable MultiSampling for Bloom performance */}
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