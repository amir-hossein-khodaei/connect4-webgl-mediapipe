import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Sparkles, Cloud, Float } from '@react-three/drei';
import * as THREE from 'three';

const SkyWorld = () => {
  const groupRef = useRef();
  
  // Point to local texture
  const CLOUD_URL = `${baseUrl}assets/cloud.png`; 

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.01; 
    }
  });

  return (
    <group>
      {/* 1. ANIME SKY DOME */}
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

      {/* 2. LIGHTING */}
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

      {/* 3. ATMOSPHERIC PARTICLES */}
      <Sparkles 
        count={300} 
        scale={30} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color="#ffffff" 
      />

      {/* 4. PROCEDURAL CLOUDS - FIXED: LOCAL TEXTURE */}
      <group ref={groupRef}>
        
        <Float speed={1} rotationIntensity={0.1} floatIntensity={1}>
          <group position={[-40, 10, -60]} scale={10}>
            {/* Added texture prop */}
            <Cloud texture={CLOUD_URL} opacity={0.5} speed={0.2} width={20} depth={5} segments={20} color="#ffffff" />
          </group>
        </Float>

        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={1}>
          <group position={[50, 5, -50]} scale={12}>
            <Cloud texture={CLOUD_URL} opacity={0.5} speed={0.2} width={20} depth={5} segments={20} color="#eefeff" />
          </group>
        </Float>

        <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.5}>
          <group position={[0, 50, -80]} scale={15}>
             <Cloud texture={CLOUD_URL} opacity={0.4} speed={0.1} width={30} depth={5} segments={30} color="#ffffff" />
          </group>
        </Float>
      </group>
    </group>
  );
};

export default SkyWorld;