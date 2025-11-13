/**
 * Interface Principal do Sistema de Simulação Física
 * Componente principal que integra todos os elementos da simulação
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Play, 
  Square, 
  Download, 
  Settings, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  Eye
} from 'lucide-react';

import { SimulationConfig } from './SimulationConfig';
import { SimulationResults } from './SimulationResults';
import { SimulationViewer } from './SimulationViewer';
import { SimulationTemplates } from './SimulationTemplates';
import { SimulationProgress } from './SimulationProgress';

import {
  useSimulationStore,
  useSimulationActions,
  useSimulationSelectors,
  useSimulationState
} from '../../store/simulationStore';
import {
  SimulationType,
  SimulationStatus,
  SimulationCreateRequest
} from '../../types/simulation';

interface SimulationInterfaceProps {
  model3dId?: string;
  model3dName?: string;
  onBack?: () => void;
  className?: string;
}

export const SimulationInterface: React.FC<SimulationInterfaceProps> = ({
  model3dId,
  model3dName,
  onBack,
  className = ''
}) => {
  const {
    currentSimulation,
    simulations,
    templates,
    isLoading,
    error,
    progress,
    result
  } = useSimulationState();

  const {
    createSimulation,
    clearCurrentSimulation,
    deleteSimulation,
    getTemplates,
    shouldShowProgress,
    canDownloadResults
  } = useSimulationActions();

  const {
    getSimulationStats,
    getRunningSimulations,
    isCurrentSimulation
  } = useSimulationSelectors();

  // Estado local
  const [activeTab, setActiveTab] = useState('config');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [simulationConfig, setSimulationConfig] = useState({
    tipo_simulacao: SimulationType.DROP_TEST,
    parametros: {
      drop_height: 1.0,
      num_drops: 5,
      gravity: -9.8
    },
    nome: '',
    modelo_3d_id: model3dId || ''
  });

  // Carregar templates ao montar
  useEffect(() => {
    if (templates.length === 0) {
      getTemplates();
    }
  }, [templates.length, getTemplates]);

  // Atualizar nome do modelo quando mudar
  useEffect(() => {
    if (model3dName && simulationConfig.nome === '') {
      setSimulationConfig(prev => ({
        ...prev,
        nome: `Simulação - ${model3dName}`
      }));
    }
  }, [model3dName, simulationConfig.nome]);

  // Handlers
  const handleConfigChange = (config: any) => {
    setSimulationConfig(config);
  };

  const handleStartSimulation = async () => {
    if (!simulationConfig.nome.trim()) {
      alert('Por favor, insira um nome para a simulação');
      return;
    }

    if (!simulationConfig.modelo_3d_id) {
      alert('Selecione um modelo 3D para simular');
      return;
    }

    const request: SimulationCreateRequest = {
      nome: simulationConfig.nome,
      tipo_simulacao: simulationConfig.tipo_simulacao,
      parametros: simulationConfig.parametros,
      modelo_3d_id: simulationConfig.modelo_3d_id
    };

    try {
      await createSimulation(request);
      setActiveTab('results');
    } catch (error) {
      console.error('Erro ao iniciar simulação:', error);
    }
  };

  const handleStopSimulation = async () => {
    if (currentSimulation) {
      try {
        await deleteSimulation(currentSimulation.id);
        clearCurrentSimulation();
        setActiveTab('config');
      } catch (error) {
        console.error('Erro ao parar simulação:', error);
      }
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    setSimulationConfig(prev => ({
      ...prev,
      tipo_simulacao: template.tipo_simulacao,
      parametros: template.parametros
    }));
    setActiveTab('config');
  };

  const handleDownloadResults = () => {
    if (result && currentSimulation) {
      // Implementar download
      console.log('Download results:', result);
      // TODO: Implementar download real
    }
  };

  // Estatísticas
  const stats = getSimulationStats();
  const runningSimulations = getRunningSimulations();

  return (
    <div className={`simulation-interface ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Simulação Física
            </h1>
            {model3dName && (
              <p className="text-sm text-gray-600 mt-1">
                Modelo: {model3dName}
              </p>
            )}
          </div>
          
          {currentSimulation && (
            <Badge 
              variant={
                currentSimulation.status === SimulationStatus.COMPLETED 
                  ? 'default' 
                  : currentSimulation.status === SimulationStatus.FAILED
                  ? 'destructive'
                  : 'secondary'
              }
              className="px-3 py-1"
            >
              {currentSimulation.status}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onBack && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <span>←</span>
              <span>Voltar</span>
            </Button>
          )}
          
          {currentSimulation && shouldShowProgress() && (
            <Button
              variant="destructive"
              onClick={handleStopSimulation}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Parar</span>
            </Button>
          )}

          {canDownloadResults() && (
            <Button
              onClick={handleDownloadResults}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Em Execução</p>
                <p className="text-2xl font-semibold">{stats.running}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-semibold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Falharam</p>
                <p className="text-2xl font-semibold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulação em Progresso */}
      {currentSimulation && shouldShowProgress() && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Simulação em Progresso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimulationProgress 
              simulation={currentSimulation}
              progress={progress}
            />
          </CardContent>
        </Card>
      )}

      {/* Erro Global */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurar</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="viewer" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Visualizar</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Resultados</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Configuração */}
        <TabsContent value="config">
          <div className="space-y-6">
            <SimulationConfig
              tipo_simulacao={simulationConfig.tipo_simulacao}
              parametros={simulationConfig.parametros}
              onChange={handleConfigChange}
              isLoading={isLoading}
            />

            {/* Informações do Modelo */}
            {model3dId && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Modelo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ID do Modelo:</span>
                      <span className="text-sm font-mono">{model3dId}</span>
                    </div>
                    {model3dName && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nome:</span>
                        <span className="text-sm font-medium">{model3dName}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Controles de Execução */}
            <Card>
              <CardHeader>
                <CardTitle>Controles de Execução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Simulação
                  </label>
                  <input
                    type="text"
                    value={simulationConfig.nome}
                    onChange={(e) => setSimulationConfig(prev => ({
                      ...prev,
                      nome: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite um nome para a simulação"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleStartSimulation}
                    disabled={isLoading || !simulationConfig.nome.trim() || !model3dId}
                    className="flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isLoading ? 'Executando...' : 'Iniciar Simulação'}</span>
                  </Button>

                  {currentSimulation && isCurrentSimulation(currentSimulation.id) && (
                    <Button
                      variant="outline"
                      onClick={handleStopSimulation}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <Square className="w-4 h-4" />
                      <span>Parar</span>
                    </Button>
                  )}
                </div>

                {isLoading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processando...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Templates */}
        <TabsContent value="templates">
          <SimulationTemplates
            templates={templates}
            onSelect={handleTemplateSelect}
            selectedId={selectedTemplate}
          />
        </TabsContent>

        {/* Aba de Visualização */}
        <TabsContent value="viewer">
          <SimulationViewer
            model3d_url={`/api/models/${model3dId}/download`}
            simulation_data={currentSimulation}
            isRunning={shouldShowProgress()}
            showControls={true}
          />
        </TabsContent>

        {/* Aba de Resultados */}
        <TabsContent value="results">
          {result && currentSimulation ? (
            <SimulationResults
              result={result}
              onDownload={handleDownloadResults}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum resultado disponível
                </h3>
                <p className="text-gray-600">
                  Execute uma simulação para ver os resultados aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Hist Recente */}
      {simulations.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Simulações Recentes</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {/* TODO: Navigate to history */}}
              >
                Ver Todos
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simulations.slice(0, 5).map((simulation) => (
                <div
                  key={simulation.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{simulation.nome}</h4>
                      <Badge variant="outline">
                        {simulation.tipo_simulacao}
                      </Badge>
                      <Badge
                        variant={
                          simulation.status === SimulationStatus.COMPLETED 
                            ? 'default' 
                            : simulation.status === SimulationStatus.FAILED
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {simulation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(simulation.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {simulation.status === SimulationStatus.COMPLETED && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Load this simulation
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSimulation(simulation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimulationInterface;