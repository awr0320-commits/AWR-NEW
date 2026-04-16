import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Upload, RefreshCw, Sliders, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface FBXMannequinProps {
  onModelLoaded?: (model: THREE.Group) => void;
}

const ModelRenderer = ({ fileUrl, heightScale, widthScale }: { fileUrl: string; heightScale: number; widthScale: number }) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (!fileUrl) return;

    const loader = new FBXLoader();
    loader.load(fileUrl, (object) => {
      // 1. Force White Ceramic Material
      const whiteMaterial = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.1,
        metalness: 0.1,
        side: THREE.DoubleSide
      });

      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = whiteMaterial;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // 2. Auto-Focus Logic
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Reset position to center
      object.position.x += (object.position.x - center.x);
      object.position.y += (object.position.y - center.y);
      object.position.z += (object.position.z - center.z);
      
      // Move to ground level
      const newBox = new THREE.Box3().setFromObject(object);
      const newMin = newBox.min;
      object.position.y -= newMin.y;

      // Adjust Camera
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.8; // Add some padding

      camera.position.set(0, size.y / 2, cameraZ);
      camera.lookAt(0, size.y / 2, 0);
      camera.updateProjectionMatrix();

      setModel(object);
    });
  }, [fileUrl, camera]);

  if (!model) return null;

  return (
    <primitive 
      object={model} 
      scale={[widthScale, heightScale, widthScale]} 
    />
  );
};

const FBXMannequin: React.FC<FBXMannequinProps> = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [heightScale, setHeightScale] = useState(1.0);
  const [widthScale, setWidthScale] = useState(1.0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-stone-50/30 rounded-[40px] overflow-hidden border border-black/5 shadow-inner relative">
      {/* Header / Upload Button */}
      <div className="absolute top-6 left-0 right-0 z-10 flex justify-center px-6">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-white/20">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".fbx" 
            className="hidden" 
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-xl active:scale-95"
          >
            <Upload size={12} />
            選擇 FBX 檔案
          </button>
          
          {fileUrl && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setHeightScale(1.0);
                setWidthScale(1.0);
              }}
              className="p-3 bg-stone-100 hover:bg-stone-200 text-black/40 hover:text-black rounded-xl transition-all"
              title="重置比例"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows dpr={[1, 2]} gl={{ alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={45} />
          
          {/* Strong Professional Lighting */}
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, 5, -10]} intensity={1} />
          <directionalLight position={[0, 5, 5]} intensity={1.5} />
          
          <Suspense fallback={null}>
            {fileUrl && (
              <ModelRenderer 
                fileUrl={fileUrl} 
                heightScale={heightScale} 
                widthScale={widthScale} 
              />
            )}
          </Suspense>
          
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          <Environment preset="city" />
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            minDistance={1} 
            maxDistance={20}
            target={[0, 1, 0]}
          />
        </Canvas>

        {!fileUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-black/20 pointer-events-none">
            <User size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">等待上傳 FBX 檔案...</p>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      {fileUrl && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-10">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white/20 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Sliders size={14} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60">身形控制</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-black/40">
                  <span>身高 (Height)</span>
                  <span className="text-black/80">{heightScale.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.01" 
                  value={heightScale} 
                  onChange={(e) => setHeightScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-black/40">
                  <span>胖瘦 (Body Shape)</span>
                  <span className="text-black/80">{widthScale.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.01" 
                  value={widthScale} 
                  onChange={(e) => setWidthScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FBXMannequin;
