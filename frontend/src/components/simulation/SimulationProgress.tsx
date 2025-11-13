/**
 * Componente de Indicador de Progresso da Simulação
 * Exibe o progresso em tempo real da execução da simulação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Zap,
  Activity
} from 'lucide-react';

import { SimulationResponse, SimulationStatus } from '../../types/simulation';

interface SimulationProgressProps {
  simulation: SimulationResponse;
  progress: number;
}

export const SimulationProgress: React.FC<SimulationProgressProps> = ({
  simulation,
  progress
}) => {
  const [currentStep, setCurrentStep] = useState('Iniciando simulação');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // Calcular tempo decorrido
  useEffect(() => {
    if (simulation.created_at) {
      const startTime = new Date(simulation.created_at).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        setTimeElapsed(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [simulation.created_at]);

  // Calcular tempo restante estimado
  useEffect(() => {
    if (progress > 0 && timeElapsed > 0) {
      const totalEstimated = timeElapsed / (progress / 100);
      const remaining = totalEstimated - timeElapsed;
      setEstimatedTimeRemaining(remaining);
    }
  }, [progress, timeElapsed]);

  // Determinar etapa atual baseada no progresso
  useEffect(() => {
    if (progress < 10) {
      setCurrentStep('Inicializando ambiente de física');
    } else if (progress < 30) {
      setCurrentStep('Carregando modelo 3D');
    } else if (progress < 50) {
      setCurrentStep('Configurando parâmetros de simulação');
    } else if (progress < 80) {
      setCurrentStep('Executando cálculos físicos');
    } else if (progress < 95) {
      setCurrentStep('Processando resultados');
    } else if (progress < 100) {
      setCurrentStep('Finalizando simulação');
    } else {
      setCurrentStep('Simulação concluída');
    }
  }, [progress]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (status: SimulationStatus): string => {
    switch (status) {
      case SimulationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case SimulationStatus.RUNNING:
        return 'bg-blue-100 text-blue-800';
      case SimulationStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case SimulationStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case SimulationStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SimulationStatus) => {
    switch (status) {
      case SimulationStatus.PENDING:
        return <Clock className="w-4 h-4" />;
      case SimulationStatus.RUNNING:
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case SimulationStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case SimulationStatus.FAILED:
        return <AlertTriangle className="w-4 h-4" />;
      case SimulationStatus.CANCELLED:
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="simulation-progress space-y-4">
      {/* Status Principal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(simulation.status)}
          <div>
            <h3 className="font-medium">{simulation.nome}</h3>
            <p className="text-sm text-gray-600">{currentStep}</p>
          </div>
        </div>
        
        <Badge className={getStatusColor(simulation.status)}>
          {simulation.status}
        </Badge>
      </div>

      {/* Barra de Progresso */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Progresso</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        
        <Progress 
          value={progress} 
          className="w-full h-3"
          style={{
            background: 'linear-gradient(to right, #e5e7eb, #e5e7eb)',
          }}
        />
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getProgressColor(progress)}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Informações Temporais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>Decorrido</span>
          </div>
          <p className="font-medium">{formatTime(timeElapsed)}</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <Zap className="w-4 h-4" />
            <span>Restante</span>
          </div>
          <p className="font-medium">
            {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 
              ? formatTime(estimatedTimeRemaining)
              : 'Calculando...'
            }
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <Activity className="w-4 h-4" />
            <span>Tipo</span>
          </div>
          <p className="font-medium capitalize">
            {simulation.tipo_simulacao.replace('_', ' ')}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span>ETA</span>
          </div>
          <p className="font-medium">
            {simulation.estimated_completion 
              ? new Date(simulation.estimated_completion).toLocaleTimeString()
              : 'Não disponível'
            }
          </p>
        </div>
      </div>

      {/* Etapas do Processo */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Etapas da Simulação</h4>
        <div className="space-y-1">
          {[
            { step: 'Inicializar ambiente', progress: 10 },
            { step: 'Carregar modelo 3D', progress: 30 },
            { step: 'Configurar parâmetros', progress: 50 },
            { step: 'Executar cálculos', progress: 80 },
            { step: 'Processar resultados', progress: 95 },
            { step: 'Finalizar', progress: 100 }
          ].map(({ step, progress: stepProgress }, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                progress >= stepProgress ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                progress >= stepProgress ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {progress >= stepProgress && (
                <CheckCircle className="w-3 h-3 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Avisos e Erros */}
      {simulation.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Erro na Simulação</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{simulation.error_message}</p>
        </div>
      )}

      {simulation.warning_messages && simulation.warning_messages.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-yellow-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Avisos</span>
          </div>
          <ul className="text-sm text-yellow-600 mt-1 space-y-1">
            {simulation.warning_messages.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Informações do Sistema */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">ID da Simulação:</span>
            <br />
            <span className="font-mono">{simulation.id}</span>
          </div>
          <div>
            <span className="font-medium">Modelo 3D:</span>
            <br />
            <span className="font-mono">{simulation.model_3d_id}</span>
          </div>
          <div>
            <span className="font-medium">Iniciado:</span>
            <br />
            <span>{new Date(simulation.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-medium">Última Atualização:</span>
            <br />
            <span>{new Date(simulation.updated_at || simulation.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationProgress;