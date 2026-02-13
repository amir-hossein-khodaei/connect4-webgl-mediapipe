import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles } from '@react-three/drei';

const ElementalDisc = ({ position, type, isWinningPiece, ...props }) => {
  const groupRef = useRef();
  
  // PHYSICS CONSTANTS
  const targetY = position[1]; 
  const startY = 8; 
  
  const physics = useRef({
    y: startY,
    velocity: 0,
    gravity: -40, 
    bounce: 0.3, // Slightly bouncier for better feel
    settled: false,
  });

  useFrame((state, delta) => {
    if (!groupRef.current || physics.current.settled) return;

    // --- FIX: CLAMP DELTA ---
    // If the computer lagged (due to AI thinking), delta might be huge (e.g., 0.5s).
    // We cap it at 0.05s (approx 20fps) to ensure the physics simulation 
    // takes small steps instead of teleporting the piece.
    const safeDelta = Math.min(delta, 0.05); 

    const p = physics.current;
    
    // Apply Gravity
    p.velocity += p.gravity * safeDelta;
    p.y += p.velocity * safeDelta;

    // Floor Collision / Bounce Logic
    if (p.y <= targetY) {
      p.y = targetY;
      // If moving fast enough, bounce
      if (Math.abs(p.velocity) > 2) {
        p.velocity = -p.velocity * p.bounce;
      } else {
        // Stop completely
        p.velocity = 0;
        p.y = targetY;
        p.settled = true;
      }
    }

    // Apply Position
    groupRef.current.position.set(position[0], p.y, 0);
    
    // Rotation Animation
    if (type === 'fire') {
      groupRef.current.rotation.y += safeDelta * 2;
    } else {
      // Ice rotation
      groupRef.current.rotation.x += safeDelta * 0.5;
      groupRef.current.rotation.z += safeDelta * 0.5;
    }
    
    // Win Animation
    if (isWinningPiece) {
       groupRef.current.rotation.y += safeDelta * 10;
       groupRef.current.rotation.x += safeDelta * 5;
    }
  });

  // --- COLORS ---
  // Fire: Orange/Red | Ice: Cyan/Blue | Win: Gold/White
  const baseColor = isWinningPiece ? "#ffffff" : (type === 'fire' ? "#ff4500" : "#00ffff");
  const emissiveColor = isWinningPiece ? "#ffdd00" : (type === 'fire' ? "#ff0000" : "#0088ff");
  const glowIntensity = isWinningPiece ? 5.0 : (type === 'fire' ? 2 : 1.5);

  return (
    <group 
      ref={groupRef} 
      position={[position[0], startY, 0]} 
      {...props}
    >
      <mesh castShadow>
        {type === 'fire' ? <sphereGeometry args={[0.45, 32, 24]} /> : <icosahedronGeometry args={[0.45, 1]} />}
        
        {type === 'fire' || isWinningPiece ? (
            <MeshDistortMaterial
              color={baseColor}
              emissive={emissiveColor}
              emissiveIntensity={glowIntensity}
              roughness={isWinningPiece ? 0 : 0.4}
              metalness={isWinningPiece ? 1 : 0.1}
              distort={0.4} 
              speed={isWinningPiece ? 10 : 3}  
            />
        ) : (
            <meshStandardMaterial 
              color={baseColor}
              emissive={emissiveColor}
              emissiveIntensity={glowIntensity}
              roughness={0.2}
              metalness={0.8}
            />
        )}
      </mesh>

      <Sparkles 
        count={isWinningPiece ? 100 : 25} 
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