import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  Center,
  Bounds
} from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Download, RotateCcw, ZoomIn, ZoomOut, Settings, Eye } from 'lucide-react';

import { useModelStore } from '../../store/modelStore';

interface Model3DViewerProps {
  modelUrl?: string;
  modelPath?: string;
  className?: string;
  showControls?: boolean;
  onModelLoad?: (model: THREE.Object3D) => void;
}

function LoadingProgress() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <div className="text-center">
          <div className="w-32 h-2 bg-gray-200 rounded-full mb-2">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">Carregando modelo 3D... {Math.round(progress)}%</p>
        </div>
      </div>
    </Html>
  );
}

function Model({ url, onLoad }: { url: string; onLoad?: (model: THREE.Object3D) => void }) {
  const gltf = useLoader(GLTFLoader, url);
  
  useEffect(() => {
    if (onLoad && gltf) {
      onLoad(gltf.scene);
    }
  }, [gltf, onLoad]);

  return <primitive object={gltf.scene} />;
}

function STLModel({ url, onLoad }: { url: string; onLoad?: (model: THREE.Object3D) => void }) {
  const geometry = useLoader(STLLoader, url);
  
  useEffect(() => {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ 
        color: '#3B82F6',
        metalness: 0.1,
        roughness: 0.8 
      })
    );
    
    if (onLoad) {
      onLoad(mesh);
    }
  }, [geometry, onLoad]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#3B82F6" metalness={0.1} roughness={0.8} />
    </mesh>
  );
}

function RotatingModel({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>();
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={ref}>
      {children}
    </group>
  );
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelUrl,
  modelPath,
  className = '',
  showControls = true,
  onModelLoad,
}) => {
  const [controlsRef, setControlsRef] = useState<any>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [modelInfo, setModelInfo] = useState<{
    vertices: number;
    faces: number;
    volume?: number;
    area?: number;
  } | null>(null);
  
  const { setLoadedModel } = useModelStore();

  const handleModelLoad = (model: THREE.Object3D) => {
    // Calculate model metrics
    const geometry = new THREE.Box3().setFromObject(model);
    const size = geometry.getSize(new THREE.Vector3());
    
    // Count vertices and faces
    let vertices = 0;
    let faces = 0;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geom = child.geometry;
        if (geom.attributes.position) {
          vertices += geom.attributes.position.count;
        }
        if (geom.index) {
          faces += geom.index.count / 3;
        } else if (geom.attributes.position) {
          faces += geom.attributes.position.count / 3;
        }
      }
    });

    setModelInfo({
      vertices,
      faces,
      volume: size.x * size.y * size.z,
      area: 2 * (size.x * size.y + size.y * size.z + size.z * size.x),
    });

    // Update store
    if (onModelLoad) {
      onModelLoad(model);
    }
    setLoadedModel({
      geometry: model,
      metrics: {
        vertices,
        faces,
        volume: size.x * size.y * size.z,
        area: 2 * (size.x * size.y + size.y * size.z + size.z * size.x),
        bounds: {
          min: geometry.min.toArray(),
          max: geometry.max.toArray(),
        },
      },
    });
  };

  const resetCamera = () => {
    if (controlsRef) {
      controlsRef.reset();
    }
  };

  const zoomIn = () => {
    if (controlsRef) {
      controlsRef.dollyIn(1.2);
      controlsRef.update();
    }
  };

  const zoomOut = () => {
    if (controlsRef) {
      controlsRef.dollyOut(1.2);
      controlsRef.update();
    }
  };

  const downloadModel = async () => {
    if (modelPath) {
      try {
        const response = await fetch(modelPath);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `modelo-3d.${modelPath.split('.').pop()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Erro ao download:', error);
      }
    }
  };

  if (!modelUrl && !modelPath) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum modelo carregado</p>
        </div>
      </div>
    );
  }

  const actualModelUrl = modelUrl || modelPath;

  return (
    <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={<LoadingProgress />}>
          {actualModelUrl?.endsWith('.gltf') || actualModelUrl?.endsWith('.glb') ? (
            <Bounds fit clip observe margin={1.2}>
              <Center>
                <Model url={actualModelUrl} onLoad={handleModelLoad} />
              </Center>
            </Bounds>
          ) : (
            <Bounds fit clip observe margin={1.2}>
              <Center>
                <STLModel url={actualModelUrl} onLoad={handleModelLoad} />
              </Center>
            </Bounds>
          )}
        </Suspense>

        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.25} 
          scale={10} 
          blur={2} 
          far={4.5} 
        />

        <OrbitControls 
          ref={setControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          maxDistance={20}
          minDistance={1}
        />
      </Canvas>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute top-4 right-4 space-y-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="flex flex-col gap-1">
              <button
                onClick={resetCamera}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Resetar câmera"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Aproximar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Afastar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2 rounded transition-colors ${
                  autoRotate ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
                title={autoRotate ? 'Parar rotação automática' : 'Rotação automática'}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Download */}
          {modelPath && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <button
                onClick={downloadModel}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Download do modelo"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Model Info */}
      {modelInfo && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h4 className="font-semibold text-sm mb-2">Informações do Modelo</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Vértices: {modelInfo.vertices.toLocaleString()}</div>
            <div>Faces: {modelInfo.faces.toLocaleString()}</div>
            {modelInfo.volume && (
              <div>Volume: {(modelInfo.volume / 1000).toFixed(2)} cm³</div>
            )}
            {modelInfo.area && (
              <div>Área: {(modelInfo.area / 100).toFixed(2)} cm²</div>
            )}
          </div>
        </div>
      )}

      {/* Performance Indicator */}
      <div className="absolute top-4 left-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black/50 text-white px-2 py-1 rounded text-xs"
        >
          3D Viewer • React Three Fiber
        </motion.div>
      </div>
    </div>
  );
};