import React, { useMemo, useRef } from 'react';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const FloatingIsland = () => {
  const ringRef = useRef();

  // 1. THE PLANETARY RING (Organized Circle)
  const ringDebris = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 15 + Math.random() * 2; // Wide ring (14-16)
      return {
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 1, // Flat plane
        z: Math.sin(angle) * radius,
        scale: 0.7 + Math.random() * 0.7, // BIGGER ROCKS
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      };
    });
  }, []);

  // 2. THE ASTEROID FIELD (Random Scattered)
  const scatteredDebris = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      x: (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 10), // Further out
      y: (Math.random() * 10) - 5, 
      z: (Math.random() - 0.5) * 20,
      scale: 1 + Math.random() * 2, // Huge chunks
      speed: 0.2 + Math.random() * 0.5,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
    }));
  }, []);

  // Rotate the ring slowly
  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group position={[0, -0.6, -3]}> 
      <Float 
        speed={1.5} 
        rotationIntensity={0.05} 
        floatIntensity={0.5} 
        floatingRange={[-0.2, 0.2]}
      >
        
        {/* 1. THE PLATFORM TOP (White Marble) */}
        {/* Placed at -4.5. Top surface is at -4.2. Bottom is at -4.8 */}
        <mesh receiveShadow position={[0, -4.5, 0]}>
          <cylinderGeometry args={[11, 8, 0.6, 32]} /> 
          <meshStandardMaterial 
            color="#f0f0f0" 
            roughness={0.1} 
            metalness={0.1}
          />
        </mesh>

        {/* 1b. GOLD RIM */}
        <mesh position={[0, -4.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[10.5, 0.15, 16, 64]} /> 
          <meshStandardMaterial 
            color="#ffd700" 
            emissive="#ffd700"
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.1} 
          />
        </mesh>

        {/* 2. THE MASSIVE WIDE CORE (Lowered to fix clipping) */}
        <group position={[0, -5.5, 0]}> {/* Starts strictly below the floor */}
            
            {/* Main Anchor Rock */}
            <mesh position={[0, -4, 0]}>
                {/* Wider Cone: Radius 12 */}
                <coneGeometry args={[10, 10, 7]} />
                <MeshDistortMaterial
                    color="#25262b" 
                    roughness={1.0}
                    metalness={0.1}
                    distort={0.3} 
                    speed={0.2}   
                    flatShading={true} 
                />
            </mesh>

            {/* Jagged Chunks sticking out side */}
            <mesh position={[6, -3, 0]} rotation={[0, 0, 0.5]}>
                <dodecahedronGeometry args={[5, 0]} />
                <meshStandardMaterial color="#222222" roughness={1} flatShading />
            </mesh>
            <mesh position={[-6, -4, 2]} rotation={[0, 0, -0.5]}>
                <dodecahedronGeometry args={[6, 0]} />
                <meshStandardMaterial color="#222222" roughness={1} flatShading />
            </mesh>
            <mesh position={[0, -5, -6]} rotation={[0.5, 0, 0]}>
                <dodecahedronGeometry args={[5, 0]} />
                <meshStandardMaterial color="#222222" roughness={1} flatShading />
            </mesh>
        </group>

        {/* 3. THE PLANETARY RING (Organized) */}
        <group ref={ringRef} position={[0, -6, 0]}> {/* Orbiting the core */}
            {ringDebris.map((rock, i) => (
                <mesh 
                    key={`ring-${i}`}
                    position={[rock.x, rock.y, rock.z]} 
                    rotation={rock.rotation} 
                    scale={rock.scale}
                    castShadow 
                    receiveShadow
                >
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial 
                        color="#4a4a4a" 
                        roughness={0.9} 
                        flatShading 
                    />
                </mesh>
            ))}
        </group>

        {/* 4. THE ASTEROID FIELD (Scattered) */}
        {scatteredDebris.map((rock, i) => (
          <FloatingRock 
            key={`scatter-${i}`}
            position={[rock.x, rock.y, rock.z]} 
            scale={rock.scale} 
            speed={rock.speed}
            rotation={rock.rotation}
          />
        ))}

      </Float>
    </group>
  );
};

const FloatingRock = ({ position, scale, speed, rotation }) => {
  return (
    <Float 
      speed={speed} 
      rotationIntensity={1.5} 
      floatIntensity={1.5} 
      position={position}
    >
      <mesh rotation={rotation} scale={scale} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={1.0} 
            flatShading={true}
        />
      </mesh>
    </Float>
  );
};

export default FloatingIsland;