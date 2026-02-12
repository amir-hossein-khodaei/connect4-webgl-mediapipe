import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Sparkles, Cloud, Float } from '@react-three/drei';

const SkyWorld = () => {
  const groupRef = useRef();
  
  // FIX: Define baseUrl here
  const baseUrl = import.meta.env.BASE_URL;
  
  // FIX: Use baseUrl for the texture path
  const CLOUD_URL = `${baseUrl}assets/cloud.png`;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.01; 
    }
  });

  return (
    <group>
      <Sky 
        distance={450000} 
        sunPosition={[100, 20, 100]} 
        inclination={0.6} 
        azimuth={0.1} 
        rayleigh={0.5} 
        turbidity={10} 
        exposure={0.5} 
      />
      
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 30, 90]} />

      <ambientLight intensity={1.5} color="#ccccff" /> 
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      <Sparkles 
        count={300} 
        scale={30} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color="#ffffff" 
      />

      <group ref={groupRef}>
        <Float speed={1} rotationIntensity={0.1} floatIntensity={1}>
          <group position={[-40, 10, -60]} scale={10}>
            {/* If the image doesn't exist, we remove the texture prop to prevent errors */}
            <Cloud opacity={0.5} speed={0.2} width={20} depth={5} segments={20} color="#ffffff" />
          </group>
        </Float>

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={1}>
          <group position={[50, 5, -50]} scale={12}>
            <Cloud opacity={0.5} speed={0.2} width={20} depth={5} segments={20} color="#eefeff" />
          </group>
        </Float>

        <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.5}>
          <group position={[0, 50, -80]} scale={15}>
             <Cloud opacity={0.4} speed={0.1} width={30} depth={5} segments={30} color="#ffffff" />
          </group>
        </Float>
      </group>
    </group>
  );
};

export default SkyWorld;