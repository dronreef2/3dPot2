/**
 * Three.js 3D Viewer para Simulações Físicas
 * Visualização interativa de modelos 3D e resultados de simulação
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Download,
  Eye,
  EyeOff,
  Settings,
  Camera,
  Box
} from 'lucide-react';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Stats } from 'three/examples/jsm/libs/stats.module.js';

interface ThreeJSViewerProps {
  modelUrl?: string;
  simulationData?: any;
  isRunning?: boolean;
  showControls?: boolean;
  className?: string;
  onModelLoad?: (model: THREE.Object3D) => void;
  onSimulationUpdate?: (data: any) => void;
}

interface ViewerState {
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  isFullscreen: boolean;
  wireframe: boolean;
  showAxes: boolean;
  showGrid: boolean;
  cameraPosition: THREE.Vector3;
}

export const ThreeJSViewer: React.FC<ThreeJSViewerProps> = ({
  modelUrl,
  simulationData,
  isRunning = false,
  showControls = true,
  className = '',
  onModelLoad,
  onSimulationUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const statsRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  
  const [viewerState, setViewerState] = useState<ViewerState>({
    isPlaying: false,
    currentFrame: 0,
    totalFrames: 100,
    isFullscreen: false,
    wireframe: false,
    showAxes: true,
    showGrid: true,
    cameraPosition: new THREE.Vector3(5, 5, 5)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerStats, setViewerStats] = useState({
    fps: 0,
    triangles: 0,
    vertices: 0
  });

  // ========== INICIALIZAÇÃO DO THREE.JS ==========

  const initializeScene = useCallback(() => {
    if (!containerRef.current) return;

    try {
      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(5, 5, 5);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 1;
      controls.maxDistance = 100;
      controlsRef.current = controls;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
      pointLight.position.set(-10, 10, -10);
      scene.add(pointLight);

      // Grid
      const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
      scene.add(gridHelper);

      // Axes Helper
      const axesHelper = new THREE.AxesHelper(2);
      scene.add(axesHelper);

      // Stats
      if (typeof Stats !== 'undefined') {
        const stats = new Stats();
        stats.dom.style.position = 'absolute';
        stats.dom.style.top = '0px';
        stats.dom.style.right = '0px';
        containerRef.current.appendChild(stats.dom);
        statsRef.current = stats;
      }

      // Add to container
      containerRef.current.appendChild(renderer.domElement);

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current || !camera || !renderer) return;
        
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      return { scene, camera, renderer, controls };

    } catch (err) {
      setError(`Erro ao inicializar Three.js: ${err}`);
      return null;
    }
  }, []);

  // ========== CARREGAMENTO DE MODELOS ==========

  const loadModel = useCallback(async (url: string) => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const fileExtension = url.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'stl') {
        await loadSTL(url);
      } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
        await loadGLTF(url);
      } else {
        // Criar geometria simples para demonstração
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }
        
        modelRef.current = cube;
        sceneRef.current.add(cube);
      }

      // Calcular estatísticas do modelo
      if (modelRef.current) {
        updateModelStats();
        onModelLoad?.(modelRef.current);
      }

    } catch (err) {
      setError(`Erro ao carregar modelo: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [onModelLoad]);

  const loadSTL = async (url: string) => {
    return new Promise<void>((resolve, reject) => {
      const loader = new STLLoader();
      
      loader.load(
        url,
        (geometry) => {
          try {
            // Calcular normais
            geometry.computeVertexNormals();
            
            // Centrar geometria
            geometry.center();
            
            const material = new THREE.MeshLambertMaterial({ 
              color: 0x0088ff,
              transparent: true,
              opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Escalar para um tamanho razoável
            geometry.computeBoundingBox();
            const boundingBox = geometry.boundingBox;
            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const maxSize = Math.max(size.x, size.y, size.z);
            
            if (maxSize > 0) {
              const scale = 4 / maxSize;
              mesh.scale.setScalar(scale);
            }
            
            if (modelRef.current) {
              sceneRef.current!.remove(modelRef.current);
            }
            
            modelRef.current = mesh;
            sceneRef.current!.add(mesh);
            
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        (progress) => {
          // Progress callback
          console.log('Loading STL:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const loadGLTF = async (url: string) => {
    return new Promise<void>((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        url,
        (gltf) => {
          try {
            const model = gltf.scene;
            
            // Configurar sombras
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            if (modelRef.current) {
              sceneRef.current!.remove(modelRef.current);
            }
            
            modelRef.current = model;
            sceneRef.current!.add(model);
            
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        (progress) => {
          console.log('Loading GLTF:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // ========== CONTROLES DE VISUALIZAÇÃO ==========

  const togglePlay = useCallback(() => {
    setViewerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  }, []);

  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(5, 5, 5);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.reset();
      controlsRef.current.update();
    }
  }, []);

  const toggleWireframe = useCallback(() => {
    if (!modelRef.current) return;
    
    setViewerState(prev => {
      const newWireframe = !prev.wireframe;
      
      modelRef.current!.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if ('wireframe' in mat) {
                mat.wireframe = newWireframe;
              }
            });
          } else if ('wireframe' in child.material) {
            child.material.wireframe = newWireframe;
          }
        }
      });
      
      return { ...prev, wireframe: newWireframe };
    });
  }, []);

  const toggleAxes = useCallback(() => {
    if (!sceneRef.current) return;
    
    setViewerState(prev => {
      const show = !prev.showAxes;
      
      const axesHelper = sceneRef.current!.getObjectByName('axesHelper');
      if (axesHelper) {
        axesHelper.visible = show;
      } else if (show) {
        const newAxesHelper = new THREE.AxesHelper(2);
        newAxesHelper.name = 'axesHelper';
        sceneRef.current!.add(newAxesHelper);
      }
      
      return { ...prev, showAxes: show };
    });
  }, []);

  const toggleGrid = useCallback(() => {
    if (!sceneRef.current) return;
    
    setViewerState(prev => {
      const show = !prev.showGrid;
      
      const gridHelper = sceneRef.current!.getObjectByName('gridHelper');
      if (gridHelper) {
        gridHelper.visible = show;
      } else if (show) {
        const newGridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
        newGridHelper.name = 'gridHelper';
        sceneRef.current!.add(newGridHelper);
      }
      
      return { ...prev, showGrid: show };
    });
  }, []);

  const takeScreenshot = useCallback(() => {
    if (!rendererRef.current) return;
    
    rendererRef.current.render(sceneRef.current!, cameraRef.current!);
    
    // Criar link para download
    const canvas = rendererRef.current.domElement;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulation-viewer-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }, []);

  // ========== ANIMAÇÃO ==========

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    requestAnimationFrame(animate);

    // Atualizar controles
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // Atualizar estatísticas
    if (statsRef.current) {
      statsRef.current.update();
      setViewerStats(prev => ({
        ...prev,
        fps: Math.round(statsRef.current.getFPS ? statsRef.current.getFPS() : 60)
      }));
    }

    // Animar simulação se estiver rodando
    if (viewerState.isPlaying && simulationData && modelRef.current) {
      animateSimulation();
    }

    // Renderizar
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [viewerState.isPlaying, simulationData]);

  const animateSimulation = useCallback(() => {
    if (!modelRef.current || !simulationData) return;

    // Exemplo de animação baseada nos dados da simulação
    const time = Date.now() * 0.001;
    const frame = Math.floor((time * 30) % viewerState.totalFrames); // 30 FPS
    
    setViewerState(prev => ({
      ...prev,
      currentFrame: frame
    }));

    // Aplicar transformações baseadas nos dados da simulação
    const simulationType = simulationData.tipo;
    
    if (simulationType === 'drop_test') {
      // Animar queda
      const dropProgress = frame / viewerState.totalFrames;
      const height = 5 * (1 - dropProgress); // Cair de 5 para 0
      modelRef.current.position.y = height;
    } else if (simulationType === 'stress_test') {
      // Animar deformação
      const stressProgress = frame / viewerState.totalFrames;
      const scaleY = 1 - (stressProgress * 0.3); // Comprimir até 70%
      modelRef.current.scale.y = scaleY;
    }

    // Callback para atualização dos dados
    onSimulationUpdate?.({
      frame,
      totalFrames: viewerState.totalFrames,
      progress: frame / viewerState.totalFrames
    });
  }, [simulationData, viewerState.totalFrames, onSimulationUpdate]);

  // ========== ESTATÍSTICAS DO MODELO ==========

  const updateModelStats = useCallback(() => {
    if (!modelRef.current) return;

    let triangles = 0;
    let vertices = 0;

    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        if (child.geometry.index) {
          triangles += child.geometry.index.count / 3;
        } else {
          triangles += child.geometry.attributes.position.count / 3;
        }
        vertices += child.geometry.attributes.position.count;
      }
    });

    setViewerStats(prev => ({
      ...prev,
      triangles: Math.round(triangles),
      vertices: Math.round(vertices)
    }));
  }, []);

  // ========== EFFECTS ==========

  useEffect(() => {
    initializeScene();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initializeScene]);

  useEffect(() => {
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      animate();
    }
  }, [animate]);

  useEffect(() => {
    if (modelUrl) {
      loadModel(modelUrl);
    }
  }, [modelUrl, loadModel]);

  // ========== RENDER ==========

  return (
    <div className={`threejs-viewer ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Box className="w-5 h-5" />
              <span>Visualizador 3D</span>
              {isLoading && <Badge variant="secondary">Carregando...</Badge>}
              {error && <Badge variant="destructive">Erro</Badge>}
            </div>
            
            {showControls && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={takeScreenshot}
                  disabled={!rendererRef.current}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCamera}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Bar */}
      {showControls && (
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-4">
            <span>FPS: {viewerStats.fps}</span>
            <span>Triângulos: {viewerStats.triangles.toLocaleString()}</span>
            <span>Vértices: {viewerStats.vertices.toLocaleString()}</span>
            {simulationData && (
              <span>Frame: {viewerState.currentFrame}/{viewerState.totalFrames}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewerState.wireframe ? "default" : "outline"}
              size="sm"
              onClick={toggleWireframe}
            >
              Wireframe
            </Button>
            
            <Button
              variant={viewerState.showAxes ? "default" : "outline"}
              size="sm"
              onClick={toggleAxes}
            >
              {viewerState.showAxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Eixos
            </Button>
            
            <Button
              variant={viewerState.showGrid ? "default" : "outline"}
              size="sm"
              onClick={toggleGrid}
            >
              Grade
            </Button>
          </div>
        </div>
      )}

      {/* Main Viewer */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div 
              ref={containerRef}
              className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden"
              style={{ minHeight: '400px' }}
            />
            
            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 rounded-lg">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Erro ao carregar visualização</p>
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => {
                      setError(null);
                      if (modelUrl) loadModel(modelUrl);
                    }}
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            )}
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando modelo 3D...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      {showControls && simulationData && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={viewerState.isPlaying ? "destructive" : "default"}
                onClick={togglePlay}
                disabled={isLoading || !!error}
              >
                {viewerState.isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Reproduzir
                  </>
                )}
              </Button>
              
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">
                  Progresso da Simulação
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(viewerState.currentFrame / viewerState.totalFrames) * 100}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                {Math.round((viewerState.currentFrame / viewerState.totalFrames) * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ThreeJSViewer;