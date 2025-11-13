"""
3dPot v2.0 - Componente de Visualização 3D
==========================================

Este módulo implementa o componente React para visualização de modelos 3D
usando Three.js com controles interativos.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  ModelViewerProps,
  ViewerState,
  ViewerConfig,
  Model3DState
} from '../../types/modeling';

const defaultConfig: ViewerConfig = {
  backgroundColor: '#1a1a1a',
  gridVisible: true,
  axesVisible: true,
  wireframe: false,
  transparent: false,
  opacity: 1.0,
  autoRotate: false,
  showStats: false,
  camera: {
    position: [100, 100, 100],
    target: [0, 0, 0],
    fov: 75
  },
  lighting: {
    ambient: { intensity: 0.6, color: '#ffffff' },
    directional: { intensity: 0.8, color: '#ffffff', position: [100, 100, 100] }
  }
};

export const ModelViewer: React.FC<ModelViewerProps> = ({
  modelPath,
  fileUrl,
  onModelLoad,
  onModelError,
  onModelInteraction,
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const modelRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();
  
  const [viewerState, setViewerState] = useState<ViewerState>({
    isLoading: false,
    isError: false,
    errorMessage: '',
    modelLoaded: false,
    cameraPosition: [100, 100, 100],
    controlsEnabled: true
  });

  const [config, setConfig] = useState<ViewerConfig>(defaultConfig);
  const [modelState, setModelState] = useState<Model3DState | null>(null);

  // Inicializar Three.js
  const initThreeJS = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      config.camera.fov,
      rect.width / rect.height,
      0.1,
      1000
    );
    camera.position.set(...config.camera.position);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: config.transparent
    });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    if (config.transparent) {
      renderer.setClearColor(0x000000, 0);
    }
    
    rendererRef.current = renderer;

    // Controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.autoRotate = config.autoRotate;
    controlsRef.current = controls;

    // Iluminação
    const ambientLight = new THREE.AmbientLight(
      config.lighting.ambient.color,
      config.lighting.ambient.intensity
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      config.lighting.directional.color,
      config.lighting.directional.intensity
    );
    directionalLight.position.set(...config.lighting.directional.position);
    scene.add(directionalLight);

    // Grid
    if (config.gridVisible) {
      const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
      scene.add(gridHelper);
    }

    // Eixos
    if (config.axesVisible) {
      const axesHelper = new THREE.AxesHelper(50);
      scene.add(axesHelper);
    }

    // Adicionar renderer ao DOM
    container.appendChild(renderer.domElement);

    // Redimensionar
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      cameraRef.current.aspect = rect.width / rect.height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);

    // Animação
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      
      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [config]);

  // Carregar modelo 3D
  const loadModel = useCallback(async (url: string) => {
    if (!sceneRef.current) return;

    setViewerState(prev => ({ ...prev, isLoading: true, isError: false, errorMessage: '' }));

    try {
      // Remover modelo anterior
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
      }

      // Determinar tipo de arquivo e loader
      const fileExtension = url.split('.').pop()?.toLowerCase();
      let loader: any;
      let geometry: THREE.BufferGeometry;

      if (fileExtension === 'stl') {
        loader = new STLLoader();
        const loaderResult = await new Promise<ArrayBuffer>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        geometry = loader.parse(loaderResult);
      } else if (fileExtension === 'obj') {
        loader = new OBJLoader();
        const loaderResult = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        
        // Extrair geometria do grupo OBJ
        const objGeometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const faces: number[] = [];
        
        loaderResult.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry) {
            const geom = child.geometry as THREE.BufferGeometry;
            const pos = geom.attributes.position;
            if (pos) {
              vertices.push(...pos.array);
            }
          }
        });
        
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      } else {
        throw new Error(`Formato de arquivo não suportado: ${fileExtension}`);
      }

      // Criar material
      const material = new THREE.MeshPhongMaterial({
        color: config.transparent ? 0x4488ff : 0x888888,
        transparent: config.transparent,
        opacity: config.opacity,
        wireframe: config.wireframe,
        side: THREE.DoubleSide
      });

      // Criar mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Criar grupo para o modelo
      const modelGroup = new THREE.Group();
      modelGroup.add(mesh);
      modelRef.current = modelGroup;

      // Adicionar à cena
      sceneRef.current.add(modelGroup);

      // Calcular bounding box e posicionar câmera
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox;
      
      if (bbox) {
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        
        // Centralizar modelo
        mesh.position.sub(center);
        
        // Ajustar câmera para caber o modelo
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current?.fov || 75;
        const distance = Math.abs(maxDim / Math.sin((fov * Math.PI) / 360));
        
        if (cameraRef.current) {
          cameraRef.current.position.set(distance, distance, distance);
          cameraRef.current.lookAt(0, 0, 0);
          cameraRef.current.updateProjectionMatrix();
        }
      }

      // Extrair métricas do modelo
      const modelMetrics = extractModelMetrics(geometry);
      setModelState({
        geometry,
        material,
        boundingBox: bbox ? {
          min: [bbox.min.x, bbox.min.y, bbox.min.z],
          max: [bbox.max.x, bbox.max.y, bbox.max.z]
        } : { min: [0, 0, 0], max: [0, 0, 0] },
        metrics: modelMetrics,
        isValid: geometry.attributes.position && geometry.attributes.position.count > 0,
        warnings: [],
        errors: []
      });

      setViewerState(prev => ({
        ...prev,
        isLoading: false,
        modelLoaded: true,
        cameraPosition: cameraRef.current ? [
          cameraRef.current.position.x,
          cameraRef.current.position.y,
          cameraRef.current.position.z
        ] : [100, 100, 100]
      }));

      // Callback
      if (onModelLoad) {
        onModelLoad({
          geometry,
          material,
          bbox,
          metrics: modelMetrics
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setViewerState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        errorMessage
      }));

      if (onModelError) {
        onModelError(errorMessage);
      }
    }
  }, [config, onModelLoad, onModelError]);

  // Extrair métricas do modelo
  const extractModelMetrics = (geometry: THREE.BufferGeometry) => {
    const position = geometry.attributes.position;
    if (!position) {
      return {
        volume: 0,
        surfaceArea: 0,
        dimensions: { largura: 0, altura: 0, profundidade: 0 }
      };
    }

    // Calcular bounding box
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    
    const dimensions = bbox ? {
      largura: bbox.max.x - bbox.min.x,
      altura: bbox.max.y - bbox.min.y,
      profundidade: bbox.max.z - bbox.min.z
    } : { largura: 0, altura: 0, profundidade: 0 };

    // Volume aproximado (bounding box)
    const volume = dimensions.largura * dimensions.altura * dimensions.profundidade;
    
    // Área de superfície aproximada
    const surfaceArea = 2 * (
      dimensions.largura * dimensions.altura +
      dimensions.altura * profundidade +
      dimensions.largura * profundidade
    );

    return {
      volume,
      surfaceArea,
      dimensions
    };
  };

  // Controlar interação
  const handleInteraction = useCallback((event: string, data?: any) => {
    if (onModelInteraction) {
      onModelInteraction({ type: event, data });
    }
  }, [onModelInteraction]);

  // Configurar eventos dos controles
  useEffect(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    
    const handleStart = () => handleInteraction('control-start');
    const handleChange = () => handleInteraction('control-change', {
      camera: cameraRef.current?.position.toArray()
    });
    const handleEnd = () => handleInteraction('control-end');

    controls.addEventListener('start', handleStart);
    controls.addEventListener('change', handleChange);
    controls.addEventListener('end', handleEnd);

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('change', handleChange);
      controls.removeEventListener('end', handleEnd);
    };
  }, [handleInteraction]);

  // Inicializar Three.js
  useEffect(() => {
    const cleanup = initThreeJS();
    return cleanup;
  }, [initThreeJS]);

  // Carregar modelo quando URL mudar
  useEffect(() => {
    if (modelPath || fileUrl) {
      const url = modelPath || fileUrl;
      if (url) {
        loadModel(url);
      }
    }
  }, [modelPath, fileUrl, loadModel]);

  // Aplicar configurações
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    // Aplicar cor de fundo
    sceneRef.current.background = new THREE.Color(config.backgroundColor);

    // Atualizar material do modelo se existir
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.Material;
          if ('wireframe' in material) {
            (material as any).wireframe = config.wireframe;
          }
          if ('opacity' in material && 'transparent' in material) {
            (material as any).opacity = config.opacity;
            (material as any).transparent = config.transparent;
          }
        }
      });
    }

    // Atualizar controles
    if (controlsRef.current) {
      controlsRef.current.autoRotate = config.autoRotate;
    }

    rendererRef.current.setClearColor(config.transparent ? 0x000000 : parseInt(config.backgroundColor.slice(1), 16), config.transparent ? 0 : 1);
  }, [config]);

  // Limpar no unmount
  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`model-viewer ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style
      }}
    >
      {/* Indicador de carregamento */}
      {viewerState.isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '18px',
            zIndex: 10
          }}
        >
          Carregando modelo 3D...
        </div>
      )}

      {/* Indicador de erro */}
      {viewerState.isError && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ff6b6b',
            fontSize: '16px',
            textAlign: 'center',
            zIndex: 10,
            maxWidth: '80%'
          }}
        >
          <div>Erro ao carregar modelo:</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            {viewerState.errorMessage}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recarregar
          </button>
        </div>
      )}

      {/* Controles de navegação */}
      {viewerState.modelLoaded && (
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 5
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            Controles:
          </div>
          <div>• Clique e arraste para rotacionar</div>
          <div>• Scroll para zoom</div>
          <div>• Clique direito e arraste para mover</div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;