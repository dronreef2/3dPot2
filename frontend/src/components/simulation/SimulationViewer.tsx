/**
 * Componente Visualizador 3D de Simulação
 * Interface para visualizar modelos 3D e animações de simulação
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move,
  Settings,
  Download,
  Maximize2,
  Minimize2
  } from 'lucide-react';

interface SimulationViewerProps {
  model3d_url?: string;
  simulation_data?: any;
  isRunning?: boolean;
  showControls?: boolean;
  onExport?: (format: string) => void;
  className?: string;
}

export const SimulationViewer: React.FC<SimulationViewerProps> = ({
  model3d_url,
  simulation_data,
  isRunning = false,
  showControls = true,
  onExport,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [showWireframe, setShowWireframe] = useState(false);
  const [cameraDistance, setCameraDistance] = useState(5);

  // Inicializar Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Nota: Este é um placeholder para a implementação com Three.js
    // Em uma implementação real, aqui seria inicializado o Three.js scene
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Simular renderização 3D básica
    const renderFrame = () => {
      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Simular objeto 3D básico
      ctx.fillStyle = '#3b82f6';
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Desenhar cubo simples
      ctx.fillRect(centerX - 50, centerY - 50, 100, 100);
      
      // Desenhar faces do cubo (simulação 3D básica)
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(centerX - 60, centerY - 60, 80, 80);
      
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(centerX - 40, centerY - 40, 80, 80);

      // Se estiver rodando simulação, adicionar animação
      if (isRunning || isPlaying) {
        const time = Date.now() * 0.001;
        const offsetY = Math.sin(time) * 10;
        const rotation = time * 0.5;
        
        ctx.save();
        ctx.translate(centerX, centerY + offsetY);
        ctx.rotate(rotation);
        
        // Redesenhar objeto animado
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-50, -50, 100, 100);
        
        ctx.restore();
      }

      // Continuar renderização se necessário
      if (isRunning || isPlaying) {
        requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      // Cleanup se necessário
    };
  }, [isRunning, isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setAnimationTime(0);
  };

  const handleZoomIn = () => {
    setCameraDistance(Math.max(1, cameraDistance - 0.5));
  };

  const handleZoomOut = () => {
    setCameraDistance(Math.min(20, cameraDistance + 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getSimulationStatusColor = () => {
    if (isRunning) return 'bg-green-100 text-green-800';
    if (simulation_data?.status === 'completed') return 'bg-blue-100 text-blue-800';
    if (simulation_data?.status === 'failed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`simulation-viewer ${className}`}>
      {/* Header com Informações */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Visualizador 3D</span>
              {simulation_data && (
                <Badge className={getSimulationStatusColor()}>
                  {simulation_data.status || 'Em espera'}
                </Badge>
              )}
            </CardTitle>
            
            {showControls && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
                
                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport('stl')}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Área Principal do Visualizador */}
      <Card className={isFullscreen ? 'fixed inset-0 z-50' : ''}>
        <CardContent className="p-0">
          {/* Canvas 3D */}
          <div 
            className="relative bg-gray-100 flex items-center justify-center"
            style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : '500px' }}
          >
            <canvas
              ref={canvasRef}
              width={isFullscreen ? window.innerWidth - 40 : 800}
              height={isFullscreen ? window.innerHeight - 120 : 400}
              className="border border-gray-300 rounded"
            />
            
            {/* Overlay de Carregamento */}
            {!model3d_url && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando modelo 3D...</p>
                </div>
              </div>
            )}

            {/* Controles de Reprodução */}
            {(isRunning || simulation_data) && showControls && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white bg-opacity-90 rounded-lg p-2 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayPause}
                    disabled={!simulation_data}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!simulation_data}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <div className="h-6 w-px bg-gray-300"></div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWireframe(!showWireframe)}
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Indicador de FPS */}
            {isRunning && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                FPS: 60
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controles Inferiores */}
      {showControls && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Informações do Modelo */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Modelo 3D</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Formato:</span>
                  <span className="font-medium">STL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vértices:</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faces:</span>
                  <span className="font-medium">2,494</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-medium">124.5 cm³</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Simulação */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Simulação</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                {simulation_data ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium capitalize">
                        {simulation_data.tipo_simulacao?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progresso:</span>
                      <span className="font-medium">
                        {simulation_data.progress || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Iterações:</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Força aplicada:</span>
                      <span className="font-medium">0 N</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma simulação ativa
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controles da Câmera */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Câmera</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Distância</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={cameraDistance}
                    onChange={(e) => setCameraDistance(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1m</span>
                    <span>{cameraDistance}m</span>
                    <span>20m</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCameraDistance(5)}
                    className="flex-1"
                  >
                    Resetar
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showWireframe}
                      onChange={(e) => setShowWireframe(e.target.checked)}
                      className="rounded"
                    />
                    <span>Wireframe</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isPlaying}
                      onChange={handlePlayPause}
                      className="rounded"
                      disabled={!simulation_data}
                    />
                    <span>Animações</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toolbar de Ações Rápidas */}
      <Card className="mt-4">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar STL
            </Button>
            <Button variant="outline" size="sm">
              <Move className="w-4 h-4 mr-2" />
              Modo Wireframe
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar Visão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationViewer;