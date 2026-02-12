import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/gameStore';
import * as THREE from 'three';

const TurnManager = () => {
  const { currentPlayer, winner } = useGameStore();
  
  // Refs to store current color values for smooth transition
  const targetColor = useRef(new THREE.Color('#ffddaa'));
  const currentColor = useRef(new THREE.Color('#ffddaa'));

  useEffect(() => {
    // 1. Determine Target Mood based on Turn
    if (winner) {
      if (winner === 1) targetColor.current.set('#ffaa00'); // VICTORY GOLD
      else if (winner === 2) targetColor.current.set('#0000ff'); // DEFEAT BLUE
      else targetColor.current.set('#888888'); // DRAW GREY
    } else {
      if (currentPlayer === 1) {
        targetColor.current.set('#ffddaa'); // Player Turn (Warm)
      } else {
        targetColor.current.set('#88ccff'); // AI Turn (Cold)
      }
    }
  }, [currentPlayer, winner]);

  useFrame((state, delta) => {
    // 2. Smoothly LERP (Transition) the global light color
    currentColor.current.lerp(targetColor.current, delta * 2);

    // --- SAFETY CHECKS (FIX FOR CRASH) ---
    // We must check if background exists and is a Color object before animating it
    if (state.scene.background && state.scene.background.isColor) {
      state.scene.background.lerp(currentColor.current, delta * 2);
    }

    // Check if fog exists
    if (state.scene.fog && state.scene.fog.color) {
      state.scene.fog.color.lerp(currentColor.current, delta * 2);
    }
  });

  return null;
};

export default TurnManager;