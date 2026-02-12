import React, { useMemo, memo } from 'react';
import { useGameStore } from '../../../store/gameStore'; 
import { Instance, Instances, Float } from '@react-three/drei';
import * as THREE from 'three';
import ElementalDisc from '../Pieces/ElementalDisc'; 

// CONSTANTS
const ROWS = 6;
const COLS = 7;
const SPACING = 1.2; 
const BOARD_WIDTH = COLS * SPACING; 
const BOARD_HEIGHT = ROWS * SPACING; 

// --- MATERIALS (Defined outside to prevent recreation) ---
const marbleMaterial = new THREE.MeshStandardMaterial({
  color: '#dbd9d0',
  roughness: 0.1, 
  metalness: 0.1,
});

const goldMaterial = new THREE.MeshStandardMaterial({
  color: '#ffcc00',
  roughness: 0.3,
  metalness: 1.0,
  emissive: '#ffaa00',
  emissiveIntensity: 0.3
});

// --- SUB-COMPONENTS (STATIC ARCHITECTURE) ---
// Wrapped in memo() so they NEVER re-render unless props change

const CelestialPillar = memo(({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, -4.2, 0]} castShadow receiveShadow material={marbleMaterial}>
        <boxGeometry args={[2, 1.8, 2]} />
      </mesh>
      <mesh position={[0, -3.2, 0]} material={goldMaterial}>
        <cylinderGeometry args={[0.9, 1.2, 0.4, 32]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={marbleMaterial}>
        <cylinderGeometry args={[0.8, 0.8, 7.5, 32]} />
      </mesh>
      <mesh position={[0, 4.4, 0]} material={goldMaterial}>
        <cylinderGeometry args={[1.2, 0.9, 0.4, 32]} />
      </mesh>
      <mesh position={[0, 5.0, 0]} castShadow receiveShadow material={marbleMaterial}>
        <boxGeometry args={[1.8, 1.2, 1.8]} />
      </mesh>
    </group>
  );
});

const CelestialHeader = memo(() => {
  return (
    <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.2}>
      <group position={[0, 5.2, 0]}>
        <mesh castShadow receiveShadow material={marbleMaterial}>
           <boxGeometry args={[BOARD_WIDTH + 5, 1.4, 1.2]} />
        </mesh>
        <mesh position={[0, -0.6, 0.65]} material={goldMaterial}>
           <boxGeometry args={[BOARD_WIDTH + 3, 0.3, 0.1]} />
        </mesh>
        <mesh position={[0, 0, 0.6]} rotation={[0, 0, Math.PI / 4]}>
           <boxGeometry args={[1.8, 1.8, 0.4]} />
           <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
});

const CelestialBase = memo(() => {
    return (
      <group position={[0, -4.5, 0]}>
          <mesh castShadow receiveShadow material={marbleMaterial}>
              <boxGeometry args={[BOARD_WIDTH + 4, 1.5, 2]} />
          </mesh>
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow material={marbleMaterial}>
              <boxGeometry args={[BOARD_WIDTH + 1, 0.8, 1.5]} />
          </mesh>
          <mesh position={[0, 1.41, 0]} material={goldMaterial}>
              <boxGeometry args={[BOARD_WIDTH, 0.1, 0.8]} />
          </mesh>
      </group>
    )
});

// --- DYNAMIC COMPONENTS ---

// 1. Cursor Layer (Updates Frequently)
const CursorGrid = () => {
  // SELECTOR OPTIMIZATION: Only fetch hoverColumn
  const hoverColumn = useGameStore(state => state.hoverColumn);
  
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.55, 0.06, 16, 32), []);
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffcc00',
    emissive: '#ffaa00',
    emissiveIntensity: 0.8,
    roughness: 0.4,
    metalness: 0.8
  }), []);

  const rings = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = (c - (COLS - 1) / 2) * SPACING;
      const y = (r - (ROWS - 1) / 2) * SPACING + 0.5;
      const isHovered = c === hoverColumn;
      
      rings.push(
        <Instance
          key={`${r}-${c}`}
          position={[x, y, 0]}
          scale={isHovered ? 1.15 : 1.0}
          color={isHovered ? "#ffffff" : "#ffcc00"} 
        />
      );
    }
  }

  return (
    <Instances range={42} material={ringMat} geometry={ringGeo}>
      {rings}
    </Instances>
  );
};

// 2. Piece Layer (Updates Slowly)
const ActivePieces = () => {
  // SELECTOR OPTIMIZATION: Only fetch board and winner info
  const board = useGameStore(state => state.board);
  const winningLine = useGameStore(state => state.winningLine);

  const getPosition = (r, c) => {
    const x = (c - (COLS - 1) / 2) * SPACING;
    const y = (r - (ROWS - 1) / 2) * SPACING + 0.5;
    return [x, y, 0];
  };

  return (
    <group>
      {board.map((row, r) =>
        row.map((cell, c) => {
          if (cell === 0) return null;
          const pos = getPosition(r, c);
          const isP1 = cell === 1;
          const isWinningPiece = winningLine?.some(([wr, wc]) => wr === r && wc === c);

          return (
            <ElementalDisc 
              key={`piece-${r}-${c}`} // Stable key
              position={[pos[0], pos[1], 0]} 
              type={isP1 ? 'fire' : 'ice'} 
              isWinningPiece={isWinningPiece} 
            />
          );
        })
      )}
    </group>
  );
};

// 3. Interaction Layer (Invisible Event Handler)
const InteractionPlane = () => {
    const inputMode = useGameStore(state => state.inputMode);
    const gameStatus = useGameStore(state => state.gameStatus);
    const setHoverColumn = useGameStore(state => state.setHoverColumn);
    const playMove = useGameStore(state => state.playMove);
    const hoverColumn = useGameStore(state => state.hoverColumn); // Needed for click

    const handlePointerMove = (e) => {
        if (inputMode !== 'mouse' || gameStatus !== 'playing') return;
        e.stopPropagation(); 
        const x = e.point.x;
        const colRaw = (x / SPACING) + ((COLS - 1) / 2);
        const safeCol = Math.max(0, Math.min(6, Math.round(colRaw)));
        // Avoid state thrashing
        if (safeCol !== useGameStore.getState().hoverColumn) {
            setHoverColumn(safeCol);
        }
    };

    return (
        <mesh 
            visible={false} 
            position={[0, 0.5, 1]} 
            scale={[1.2, 1.2, 1]} 
            onPointerMove={handlePointerMove}
            onClick={() => inputMode === 'mouse' && playMove(hoverColumn)}
        >
            <planeGeometry args={[BOARD_WIDTH + 1, BOARD_HEIGHT + 1]} />
        </mesh>
    );
};

// --- MAIN COMPONENT ---
const RuneBoard = () => {
  return (
    <group>
      {/* 1. Static Architecture (Memoized) */}
      <CelestialPillar position={[-(BOARD_WIDTH/2) - 1.5, 0, 0]} />
      <CelestialPillar position={[(BOARD_WIDTH/2) + 1.5, 0, 0]} />
      <CelestialHeader />
      <CelestialBase />

      {/* 2. Interactive Layers (Separated for Performance) */}
      <InteractionPlane />
      <CursorGrid />
      <ActivePieces />
    </group>
  );
};

export default RuneBoard;