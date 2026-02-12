import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles } from '@react-three/drei';

const ElementalDisc = ({ position, type, isWinningPiece, ...props }) => {
  const groupRef = useRef();
  
  // PHYSICS
  const targetY = position[1]; 
  const startY = 8; 
  
  const physics = useRef({
    y: startY,
    velocity: 0,
    gravity: -40, 
    bounce: 0.2, 
    settled: false,
  });

  useFrame((state, delta) => {
    if (!groupRef.current || physics.current.settled) return;

    const p = physics.current;
    p.velocity += p.gravity * delta;
    p.y += p.velocity * delta;

    if (p.y <= targetY) {
      p.y = targetY;
      if (Math.abs(p.velocity) > 0.5) {
        p.velocity = -p.velocity * p.bounce;
      } else {
        p.velocity = 0;
        p.y = targetY;
        p.settled = true;
      }
    }
    groupRef.current.position.set(position[0], p.y, 0);
    
    // Rotation
    if (type === 'fire') {
      groupRef.current.rotation.y += delta * 2;
    } else {
      groupRef.current.rotation.x += delta * 0.5;
      groupRef.current.rotation.z += delta * 0.5;
    }
    
    // IF WINNING: Spin faster!
    if (isWinningPiece) {
       groupRef.current.rotation.y += delta * 10;
       groupRef.current.rotation.x += delta * 5;
    }
  });

  // --- WINNING COLOR LOGIC ---
  // If winning, override color to White Gold
  const baseColor = isWinningPiece ? "#ffffff" : (type === 'fire' ? "#ff4500" : "#00ffff");
  const emissiveColor = isWinningPiece ? "#ffdd00" : (type === 'fire' ? "#ff0000" : "#0088ff");
  const glowIntensity = isWinningPiece ? 5.0 : (type === 'fire' ? 2 : 1.5);

  return (
    <group 
      ref={groupRef} 
      position={[position[0], startY, 0]} 
      {...props}
    >
      {/* 
        SHARED GEOMETRY LOGIC
        We swap geometry based on type, but material logic is similar
      */}
      <mesh castShadow>
        {type === 'fire' ? <sphereGeometry args={[0.45, 32, 24]} /> : <icosahedronGeometry args={[0.45, 1]} />}
        
        {/* If winning, use a super bright material */}
        {type === 'fire' || isWinningPiece ? (
            <MeshDistortMaterial
              color={baseColor}
              emissive={emissiveColor}
              emissiveIntensity={glowIntensity}
              roughness={isWinningPiece ? 0 : 0.4}
              metalness={isWinningPiece ? 1 : 0.1}
              distort={0.4} 
              speed={isWinningPiece ? 10 : 3} // Winning pieces wobble fast!    
            />
        ) : (
            // Ice Material (Standard)
            <meshStandardMaterial 
              color={baseColor}
              emissive={emissiveColor}
              emissiveIntensity={glowIntensity}
              roughness={0.2}
              metalness={0.8}
            />
        )}
      </mesh>

      {/* PARTICLES */}
      <Sparkles 
        count={isWinningPiece ? 100 : 25} // EXPLOSION of particles if winning
        scale={isWinningPiece ? 2.5 : 1.4} 
        size={isWinningPiece ? 5 : (type === 'fire' ? 2 : 3)} 
        speed={isWinningPiece ? 2 : 0.4} 
        opacity={1} 
        color={isWinningPiece ? "#ffdd00" : (type === 'fire' ? "#ffff00" : "#ffffff")} 
      />

    </group>
  );
};

export default ElementalDisc;