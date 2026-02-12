import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Html, MeshDistortMaterial } from '@react-three/drei';
import { useGameStore } from '../../../store/gameStore';
import * as THREE from 'three';

const SPACING = 1.2;
const COLS = 7;

const SpellCursor = () => {
  const { hoverColumn, currentPlayer, gameStatus, inputMode, isAiming } = useGameStore();
  const groupRef = useRef();
  const lightRef = useRef();
  const fireballRef = useRef();
  const ringsRef = useRef();

  // Mutable state for smooth animation values
  const animState = useRef({
    scale: 0,
    rotationSpeed: 0
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // --- 1. MOVEMENT PHYSICS ---
    // Calculate target X based on column
    const targetX = (hoverColumn - (COLS - 1) / 2) * SPACING;
    
    // Smoothly slide the cursor (Lerp)
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      delta * 10
    );

    // Hover Effect (Bobbing up and down)
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = 6.0 + Math.sin(t * 2.5) * 0.15;

    // --- 2. CHARGING ANIMATION LOGIC ---
    const targetScale = isAiming ? 0.9 : 0; 
    const targetRot = isAiming ? 6.0 : 0.5;

    // Smoothly transition scale and speed
    animState.current.scale = THREE.MathUtils.lerp(animState.current.scale, targetScale, delta * 5);
    animState.current.rotationSpeed = THREE.MathUtils.lerp(animState.current.rotationSpeed, targetRot, delta * 2);

    // Apply to Fireball Core
    if (fireballRef.current) {
        fireballRef.current.scale.setScalar(animState.current.scale);
        fireballRef.current.rotation.x += delta * 0.5;
        fireballRef.current.rotation.y += delta * 1.5;
    }

    // Apply to Magic Rings
    if (ringsRef.current) {
        ringsRef.current.rotation.z -= delta * animState.current.rotationSpeed;
        ringsRef.current.rotation.x = Math.sin(t * 0.5) * 0.15; // Gentle tilt
        // Rings expand slightly when charging
        const ringScale = 1 + (animState.current.scale * 0.3);
        ringsRef.current.scale.setScalar(ringScale);
    }

    // Apply to Light
    if (lightRef.current) {
        // Base intensity + Flicker
        const flicker = Math.random() * 0.5;
        lightRef.current.intensity = (isAiming ? 5 : 0) + flicker;
        lightRef.current.color.set(isAiming ? '#ffaa00' : '#ff4400');
    }
  });

  // Only show cursor if playing and it's Player 1's turn
  const isVisible = gameStatus === 'playing' && currentPlayer === 1;

  return (
    <group 
      ref={groupRef} 
      position={[0, 6.0, 0]} // Initial position (X will be updated by useFrame)
      visible={isVisible}
    >
      {/* 1. LIGHT SOURCE */}
      <pointLight 
        ref={lightRef}
        distance={6} 
        decay={2} 
        color="#ffaa00" 
      />

      {/* 2. MAGMA CORE (The Fireball) */}
      <mesh ref={fireballRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <MeshDistortMaterial
            color="#ff4500" 
            emissive="#ffaa00"
            emissiveIntensity={1.5}
            roughness={0}
            metalness={0.2}
            distort={0.5} 
            speed={3} 
        />
      </mesh>

      {/* 3. GOLDEN MANA RINGS */}
      <group ref={ringsRef} rotation={[Math.PI / 2, 0, 0]}>
        {/* Outer Ring */}
        <mesh>
          <torusGeometry args={[0.9, 0.03, 16, 64]} /> 
          <meshBasicMaterial color="#ffd700" transparent opacity={0.6} />
        </mesh>
        {/* Inner Ring (Offset) */}
        <mesh rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[0.7, 0.02, 16, 64]} /> 
          <meshBasicMaterial color="#ff4400" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* 4. PARTICLE EFFECTS */}
      {isAiming && (
        <group>
            {/* Center Heat */}
            <Sparkles 
                count={30} 
                scale={1} 
                size={4} 
                speed={0.2} 
                opacity={1} 
                color="#ffffff" 
            />
            {/* Suction Effect (Mana Gathering) */}
            <Sparkles 
                count={60} 
                scale={2.5} 
                size={3} 
                speed={-1.5} // Negative speed pulls particles inward
                opacity={0.6} 
                color="#ffaa00" 
                noise={0.5}
            />
        </group>
      )}

      {/* 5. AIMING LASER BEAM */}
      <mesh position={[0, -3, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 6, 8]} />
        <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={isAiming ? 0.3 : 0.05} // Dim when not charging, bright when charging
        />
      </mesh>
      
      {/* 6. STATUS TEXT */}
      {inputMode === 'hand' && (
        <Html position={[0, 1.4, 0]} center transform sprite>
           <div style={{ 
             color: isAiming ? '#ffffff' : '#ffaa00', 
             fontFamily: 'Cinzel, serif', // Matches the theme
             fontWeight: 'bold',
             fontSize: '12px',
             textShadow: '0 0 8px rgba(0,0,0,0.8)',
             whiteSpace: 'nowrap',
             letterSpacing: '2px',
             opacity: isAiming ? 1.0 : 0.6,
             pointerEvents: 'none'
           }}>
             {isAiming ? "⚡ RELEASE" : "✊ CHARGE"}
           </div>
        </Html>
      )}

    </group>
  );
};

export default SpellCursor;