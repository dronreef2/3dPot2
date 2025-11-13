/**
 * Componente de Resultados da Simulação
 * Visualização detalhada dos resultados de simulação física
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Download, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Shield, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  PieChart
} from 'lucide-react';

import {
  SimulationResult,
  DropTestResult,
  StressTestResult,
  MotionTestResult,
  FluidTestResult
} from '../../types/simulation';

interface SimulationResultsProps {
  result: SimulationResult;
  onDownload?: (format: "json" | "pdf") => void;
  onCompare?: () => void;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  result,
  onDownload,
  onCompare
}) => {
  const [activeTab, setActiveTab] = useState('summary');

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return { text: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (score >= 6) return { text: 'Bom', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 4) return { text: 'Regular', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Crítico', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="simulation-results space-y-6">
      {/* Header com Resumo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Resultados da Simulação</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {result.tipo_simulacao.replace('_', ' ')}
              </Badge>
              <Badge 
                className={getScoreBadge(result.metadata?.quality_score || 0).color}
              >
                {result.metadata?.quality_score ? 
                  `${result.metadata.quality_score.toFixed(1)}/10` : 
                  'N/A'
                }
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{result.status}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Duração</p>
                <p className="font-medium">
                  {result.duration ? formatDuration(result.duration) : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Imprimível</p>
                <p className="font-medium">
                  {result.metadata?.printable ? 'Sim' : 'Não'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Score Qualidade</p>
                <p className={`font-medium ${getScoreColor(result.metadata?.quality_score || 0)}`}>
                  {result.metadata?.quality_score ? 
                    `${result.metadata.quality_score.toFixed(1)}/10` : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Principais */}
      <div className="flex flex-wrap gap-3">
        {onDownload && (
          <>
            <Button
              onClick={() => onDownload('json')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </Button>
            <Button
              onClick={() => onDownload('pdf')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
          </>
        )}
        
        {onCompare && (
          <Button
            onClick={onCompare}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <PieChart className="w-4 h-4" />
            <span>Comparar</span>
          </Button>
        )}
      </div>

      {/* Resultados por Tipo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>

        {/* Aba de Resumo */}
        <TabsContent value="summary">
          {result.tipo_simulacao === 'drop_test' && (
            <DropTestSummary result={result.results as DropTestResult} />
          )}
          {result.tipo_simulacao === 'stress_test' && (
            <StressTestSummary result={result.results as StressTestResult} />
          )}
          {result.tipo_simulacao === 'motion' && (
            <MotionTestSummary result={result.results as MotionTestResult} />
          )}
          {result.tipo_simulacao === 'fluid' && (
            <FluidTestSummary result={result.results as FluidTestResult} />
          )}
        </TabsContent>

        {/* Aba de Métricas */}
        <TabsContent value="metrics">
          <MetricsTab result={result} />
        </TabsContent>

        {/* Aba de Análise */}
        <TabsContent value="analysis">
          <AnalysisTab result={result} />
        </TabsContent>

        {/* Aba de Dados */}
        <TabsContent value="data">
          <DataTab result={result} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ========== COMPONENTES DE RESUMO POR TIPO ==========

const DropTestSummary: React.FC<{ result: DropTestResult }> = ({ result }) => {
  const { metricas } = result;
  
  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Teste de Queda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Classificação:</span>
                <Badge 
                  className={
                    metricas.classificacao_resistencia === 'resistente' ? 'bg-green-100 text-green-800' :
                    metricas.classificacao_resistencia === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {metricas.classificacao_resistencia}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Velocidade de Impacto (média):</span>
                <span className="font-medium">{metricas.velocidade_impacto_media.toFixed(2)} m/s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Velocidade Máxima:</span>
                <span className="font-medium">{metricas.velocidade_impacto_max.toFixed(2)} m/s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Número de Testes:</span>
                <span className="font-medium">{metricas.numero_testes}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Rebotes (médio):</span>
                <span className="font-medium">{metricas.rebotes_medio.toFixed(1)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Duração Total:</span>
                <span className="font-medium">{result.duracao_total.toFixed(2)}s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Estabilidade:</span>
                <Badge variant="outline">
                  {metricas.velocidade_impacto_max < 8 ? 'Estável' : 'Instável'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados dos Testes Individuais */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.testes.map((teste, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Teste {teste.numero_teste + 1}</h4>
                  <Badge variant="outline">
                    {teste.altura_queda.toFixed(1)}m altura
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Impacto:</span>
                    <p className="font-medium">{teste.velocidade_impacto.toFixed(2)} m/s</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rebotes:</span>
                    <p className="font-medium">{teste.rebotes}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tempo até repouso:</span>
                    <p className="font-medium">{teste.tempo_ate_repouso.toFixed(2)}s</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge 
                      className={
                        teste.velocidade_impacto < 5 ? 'bg-green-100 text-green-800' :
                        teste.velocidade_impacto < 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {teste.velocidade_impacto < 5 ? 'Resistente' :
                       teste.velocidade_impacto < 10 ? 'Moderado' : 'Frágil'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StressTestSummary: React.FC<{ result: StressTestResult }> = ({ result }) => {
  const { metricas } = result;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Teste de Stress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Classificação:</span>
                <Badge 
                  className={
                    metricas.classificacao_resistencia === 'muito_resistente' ? 'bg-green-100 text-green-800' :
                    metricas.classificacao_resistencia === 'resistente' ? 'bg-blue-100 text-blue-800' :
                    metricas.classificacao_resistencia === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {metricas.classificacao_resistencia.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Força Máxima:</span>
                <span className="font-medium">{metricas.forca_maxima.toFixed(0)} N</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Deslocamento Máximo:</span>
                <span className="font-medium">{(metricas.deslocamento_maximo * 1000).toFixed(1)} mm</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Rigidez:</span>
                <span className="font-medium">{metricas.rigidez_calculada.toFixed(2)} N/mm</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Ponto de Ruptura:</span>
                <span className="font-medium">
                  {metricas.ponto_ruptura ? `${metricas.ponto_ruptura.toFixed(0)} N` : 'Não atingido'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={metricas.ponto_ruptura ? 'destructive' : 'default'}>
                  {metricas.ponto_ruptura ? 'Ruptura detectada' : 'Dentro dos limites'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Força vs Deslocamento */}
      <Card>
        <CardHeader>
          <CardTitle>Curva Força vs Deslocamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Gráfico de força vs deslocamento seria exibido aqui</p>
              <p className="text-sm text-gray-500 mt-1">
                {result.testes_forca.length} pontos de dados coletados
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MotionTestSummary: React.FC<{ result: MotionTestResult }> = ({ result }) => {
  const { metricas } = result;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Teste de Movimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Estabilidade:</span>
                <Badge 
                  className={
                    metricas.estabilidade === 'estável' ? 'bg-green-100 text-green-800' :
                    metricas.estabilidade === 'moderadamente_estável' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {metricas.estabilidade}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Energia Total:</span>
                <span className="font-medium">{metricas.energia_total.toFixed(2)} J</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Distância:</span>
                <span className="font-medium">{metricas.distancia_percorrida.toFixed(2)} m</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Velocidade Média:</span>
                <span className="font-medium">{metricas.velocidade_media.toFixed(2)} m/s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Pontos de Trajetória:</span>
                <span className="font-medium">{result.trajetoria.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FluidTestSummary: React.FC<{ result: FluidTestResult }> = ({ result }) => {
  const { metricas } = result;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Teste de Fluido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Aerodinâmica:</span>
                <Badge 
                  className={
                    metricas.classificacao_aerodinamica === 'aerodinâmico' ? 'bg-green-100 text-green-800' :
                    metricas.classificacao_aerodinamica === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {metricas.classificacao_aerodinamica}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Velocidade Terminal:</span>
                <span className="font-medium">{metricas.velocidade_terminal.toFixed(2)} m/s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Coeficiente de Arrasto:</span>
                <span className="font-medium">{metricas.coeficiente_arrasto.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ========== ABAS DE MÉTRICAS, ANÁLISE E DADOS ==========

const MetricsTab: React.FC<{ result: SimulationResult }> = ({ result }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas Detalhadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(result.results.metricas || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-3 border border-gray-200 rounded">
              <span className="text-gray-600 capitalize">
                {key.replace('_', ' ')}:
              </span>
              <span className="font-medium">
                {typeof value === 'number' ? value.toFixed(3) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AnalysisTab: React.FC<{ result: SimulationResult }> = ({ result }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise de Qualidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                O sistema avaliou a qualidade da simulação baseado nos resultados coletados.
              </AlertDescription>
            </Alert>
            
            {result.metadata?.recommendations && result.metadata.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recomendações:</h4>
                <ul className="space-y-1">
                  {result.metadata.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.metadata?.design_improvements && result.metadata.design_improvements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Melhorias Sugeridas:</h4>
                <ul className="space-y-1">
                  {result.metadata.design_improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DataTab: React.FC<{ result: SimulationResult }> = ({ result }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Brutos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(result.results, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationResults;