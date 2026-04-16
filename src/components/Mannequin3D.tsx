import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface MannequinProps {
  gender: 'male' | 'female';
  height: number;
  chest: number;
  waist: number;
  hips: number;
  weight?: number;
  rotation?: [number, number, number];
}

const Bone: React.FC<{ 
  position: [number, number, number], 
  rotation?: [number, number, number], 
  scale?: [number, number, number], 
  color: string,
  args?: any
}> = ({ position, rotation = [0, 0, 0], scale = [1, 1, 1], color, args = [0.08, 1, 4] }) => (
  <mesh position={position} rotation={rotation} scale={scale}>
    <coneGeometry args={args} />
    <meshStandardMaterial color={color} flatShading emissive={color} emissiveIntensity={0.2} />
  </mesh>
);

const MannequinModel: React.FC<MannequinProps> = ({ gender, height, chest, waist, hips, weight = 1.0 }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Colors from reference image
  const colors = {
    head: '#8099ff',
    neck: '#99ccff',
    upperTorso: '#4d4dff',
    midTorso: '#9966ff',
    lowerTorso: '#6600ff',
    pelvis: '#b366ff',
    upperArm: '#4d4dff',
    lowerArm: '#8099ff',
    upperLeg: '#6600ff',
    lowerLeg: '#9966ff',
    foot: '#4d4dff',
    hand: '#3399ff'
  };

  const isMale = gender === 'male';
  const baseScale = isMale ? 1.1 : 1.0;
  
  const shoulderWidth = (isMale ? 0.7 : 0.5) * weight;
  const hipWidth = (isMale ? 0.45 : 0.55) * weight;

  return (
    <group ref={groupRef} scale={[baseScale * weight, height, baseScale * weight]} position={[0, -0.7, 0]}>
      {/* Head / Crown - New Purple Triangles - Narrower */}
      <group position={[0, 1.9, 0]}>
        {/* Newest Top Triangle - Wider again */}
        <Bone position={[0, 0.15, 0]} scale={[0.6 * chest, 0.3, 0.6 * chest]} color={colors.lowerTorso} />
        {/* New Small Intermediate Triangle */}
        <Bone position={[0, -0.05, 0]} scale={[0.3 * chest, 0.1, 0.3 * chest]} color={colors.lowerTorso} />
        {/* Central Triangle - Vertical Up - Narrower - Moved down */}
        <Bone position={[0, -0.2, 0]} scale={[0.35, 0.08, 0.35]} color={colors.lowerTorso} />
      </group>

      {/* Side Triangles - Connecting crown to arms, tips pointing down - Moved further down */}
      <Bone position={[0.28, 1.68, 0]} rotation={[Math.PI, 0, -0.85]} scale={[0.3, 0.35, 0.3]} color={colors.head} />
      <Bone position={[-0.28, 1.68, 0]} rotation={[Math.PI, 0, 0.85]} scale={[0.3, 0.35, 0.3]} color={colors.head} />

      {/* New Triangle in the red range - Moved down to align with chest */}
      <Bone position={[0, 1.75, 0]} scale={[0.5, 0.2, 0.5]} color={colors.head} />

      {/* Trident Chest / Upper Torso */}
      <group position={[0, 1.7, 0]}>
        {/* Central base - Moved closer to center */}
        <Bone position={[0.1, 0.02, 0.02]} rotation={[0, 0, -0.4]} scale={[0.3, 0.2, 0.3]} color={colors.upperTorso} />
        <Bone position={[-0.1, 0.02, 0.02]} rotation={[0, 0, 0.4]} scale={[0.3, 0.2, 0.3]} color={colors.upperTorso} />
      </group>


      {/* Spine / Torso segments - Tapered cones pointing down */}
      <Bone position={[0, 1.45, 0]} rotation={[Math.PI, 0, 0]} scale={[waist * 1.2, 0.3, waist * 1.2]} color={colors.midTorso} />
      <Bone position={[0, 1.2, 0]} rotation={[Math.PI, 0, 0]} scale={[waist * 0.8, 0.25, waist * 0.8]} color={colors.lowerTorso} />
      
      {/* Pelvis - Flat Triangle shape */}
      <mesh position={[0, 1.0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[hipWidth * hips * 0.25, hipWidth * hips * 0.05, 0.1, 3]} />
        <meshStandardMaterial color={colors.pelvis} flatShading emissive={colors.pelvis} emissiveIntensity={0.2} />
      </mesh>

      {/* Arms */}
      <group position={[shoulderWidth / 2 + 0.15, 1.6, 0]}>
        <Bone position={[-0.05, -0.25, 0]} rotation={[Math.PI, 0, -0.03]} scale={[0.7, 0.5, 0.7]} color={colors.upperArm} />
        <group position={[0.0, -0.5, 0]}>
          <Bone position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0.03]} scale={[0.6, 0.45, 0.6]} color={colors.lowerArm} />
          {/* Hand cluster - Narrower */}
          <group position={[0, -0.45, 0]}>
            <Bone position={[0.03, -0.05, 0.02]} scale={[0.2, 0.15, 0.2]} color={colors.hand} />
            <Bone position={[-0.03, -0.05, -0.02]} scale={[0.2, 0.15, 0.2]} color={colors.hand} />
            <Bone position={[0, -0.08, 0]} scale={[0.3, 0.2, 0.3]} color={colors.hand} />
          </group>
        </group>
      </group>

      <group position={[-(shoulderWidth / 2 + 0.15), 1.6, 0]}>
        <Bone position={[0.05, -0.25, 0]} rotation={[Math.PI, 0, 0.03]} scale={[0.7, 0.5, 0.7]} color={colors.upperArm} />
        <group position={[0.0, -0.5, 0]}>
          <Bone position={[0, -0.22, 0]} rotation={[Math.PI, 0, -0.03]} scale={[0.6, 0.45, 0.6]} color={colors.lowerArm} />
          {/* Hand cluster - Narrower */}
          <group position={[0, -0.45, 0]}>
            <Bone position={[0.03, -0.05, 0.02]} scale={[0.2, 0.15, 0.2]} color={colors.hand} />
            <Bone position={[-0.03, -0.05, -0.02]} scale={[0.2, 0.15, 0.2]} color={colors.hand} />
            <Bone position={[0, -0.08, 0]} scale={[0.3, 0.2, 0.3]} color={colors.hand} />
          </group>
        </group>
      </group>

      {/* Legs */}
      <group position={[0.15, 1.0, 0]}>
        {/* Upper Leg (Thigh) - Pointing down - Narrower */}
        <Bone position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0.05]} scale={[0.8, 0.8, 0.8]} color={colors.upperLeg} />
        <group position={[0, -0.8, 0]}>
          {/* Lower Leg (Calf) - Pointing down - Narrower */}
          <Bone position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0.02]} scale={[0.7, 0.8, 0.7]} color={colors.lowerLeg} />
          {/* Foot - Two parts - Narrower - Connected */}
          <group position={[0, -0.8, 0]}>
            <Bone position={[0, -0.1, 0.15]} rotation={[Math.PI - (80 * Math.PI / 180), 0, 0]} scale={[0.6, 0.4, 0.6]} color={colors.upperTorso} />
          </group>
        </group>
      </group>

      <group position={[-0.15, 1.0, 0]}>
        {/* Upper Leg (Thigh) - Pointing down - Narrower */}
        <Bone position={[0, -0.4, 0]} rotation={[Math.PI, 0, -0.05]} scale={[0.8, 0.8, 0.8]} color={colors.upperLeg} />
        <group position={[0, -0.8, 0]}>
          {/* Lower Leg (Calf) - Pointing down - Narrower */}
          <Bone position={[0, -0.4, 0]} rotation={[Math.PI, 0, -0.02]} scale={[0.7, 0.8, 0.7]} color={colors.lowerLeg} />
          {/* Foot - Two parts - Narrower - Connected */}
          <group position={[0, -0.8, 0]}>
            <Bone position={[0, -0.1, 0.15]} rotation={[Math.PI - (80 * Math.PI / 180), 0, 0]} scale={[0.6, 0.4, 0.6]} color={colors.upperTorso} />
          </group>
        </group>
      </group>
    </group>
  );
};

const Mannequin3D: React.FC<MannequinProps> = (props) => {
  return (
    <div className="w-full h-full relative group">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <MannequinModel {...props} />
        
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <Environment preset="city" />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={2} 
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      
      {/* Interaction Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
          Drag to Rotate
        </span>
      </div>
    </div>
  );
};

export default Mannequin3D;
