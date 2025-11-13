/**
 * Componente de Configuração de Simulação
 * Interface para configurar parâmetros dos diferentes tipos de simulação
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Info, 
  AlertTriangle, 
  Calculator, 
  Gauge,
  Settings,
  Zap
} from 'lucide-react';

import {
  SimulationType,
  DropTestConfig,
  StressTestConfig,
  MotionTestConfig,
  FluidTestConfig,
  ValidationResult
} from '../../types/simulation';

interface SimulationConfigProps {
  tipo_simulacao: SimulationType;
  parametros: Record<string, any>;
  onChange: (config: any) => void;
  validation?: ValidationResult;
  isLoading?: boolean;
}

export const SimulationConfig: React.FC<SimulationConfigProps> = ({
  tipo_simulacao,
  parametros,
  onChange,
  validation,
  isLoading = false
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const updateParametro = (key: string, value: any) => {
    const novosParametros = { ...parametros, [key]: value };
    onChange({
      tipo_simulacao,
      parametros: novosParametros
    });
  };

  const getEstimatedTime = () => {
    switch (tipo_simulacao) {
      case SimulationType.DROP_TEST:
        const drops = parametros.num_drops || 5;
        return `${Math.ceil(drops * 0.5)} minutos`;
      case SimulationType.STRESS_TEST:
        const force = parametros.max_force || 1000;
        const increments = Math.ceil(force / (parametros.force_increment || 100));
        return `${Math.ceil(increments * 0.3)} minutos`;
      case SimulationType.MOTION:
        const duration = parametros.duration || 10;
        return `${Math.ceil(duration * 0.1)} minutos`;
      case SimulationType.FLUID:
        return '2-5 minutos';
      default:
        return '1-5 minutos';
    }
  };

  const getComplexityLevel = () => {
    switch (tipo_simulacao) {
      case SimulationType.DROP_TEST:
        return { level: 'Básico', color: 'bg-green-100 text-green-800' };
      case SimulationType.STRESS_TEST:
        return { level: 'Intermediário', color: 'bg-yellow-100 text-yellow-800' };
      case SimulationType.MOTION:
        return { level: 'Intermediário', color: 'bg-yellow-100 text-yellow-800' };
      case SimulationType.FLUID:
        return { level: 'Avançado', color: 'bg-red-100 text-red-800' };
      default:
        return { level: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const complexity = getComplexityLevel();

  return (
    <div className="space-y-6">
      {/* Header com Informações Gerais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configuração de {tipo_simulacao.replace('_', ' ')}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={complexity.color}>
                {complexity.level}
              </Badge>
              <Badge variant="outline">
                {getEstimatedTime()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-medium">{tipo_simulacao.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Complexidade</p>
                <p className="font-medium">{complexity.level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Tempo Estimado</p>
                <p className="font-medium">{getEstimatedTime()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validação */}
      {validation && validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validation && validation.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index}>• {warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Configuração por Tipo */}
      {tipo_simulacao === SimulationType.DROP_TEST && (
        <DropTestConfig 
          parametros={parametros as DropTestConfig}
          onChange={updateParametro}
          isLoading={isLoading}
        />
      )}

      {tipo_simulacao === SimulationType.STRESS_TEST && (
        <StressTestConfig 
          parametros={parametros as StressTestConfig}
          onChange={updateParametro}
          isLoading={isLoading}
        />
      )}

      {tipo_simulacao === SimulationType.MOTION && (
        <MotionTestConfig 
          parametros={parametros as MotionTestConfig}
          onChange={updateParametro}
          isLoading={isLoading}
        />
      )}

      {tipo_simulacao === SimulationType.FLUID && (
        <FluidTestConfig 
          parametros={parametros as FluidTestConfig}
          onChange={updateParametro}
          isLoading={isLoading}
        />
      )}

      {/* Parâmetros Avançados */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="cursor-pointer flex items-center space-x-2"
            onClick={() => setActiveSection(
              activeSection === 'advanced' ? null : 'advanced'
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações Avançadas</span>
            {activeSection === 'advanced' ? '▲' : '▼'}
          </CardTitle>
        </CardHeader>
        {activeSection === 'advanced' && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="physics-engine">Engine de Física</Label>
                <Select 
                  value={parametros.physics_engine || 'pybullet'}
                  onValueChange={(value) => updateParametro('physics_engine', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pybullet">PyBullet</SelectItem>
                    <SelectItem value="bullet">Bullet Physics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time-step">Passo de Tempo (s)</Label>
                <Input
                  id="time-step"
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="0.1"
                  value={parametros.time_step || 0.004}
                  onChange={(e) => updateParametro('time_step', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="max-iterations">Máximo de Iterações</Label>
                <Input
                  id="max-iterations"
                  type="number"
                  min="100"
                  max="100000"
                  value={parametros.max_iterations || 10000}
                  onChange={(e) => updateParametro('max_iterations', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="parallel-processing"
                  type="checkbox"
                  checked={parametros.parallel_processing !== false}
                  onChange={(e) => updateParametro('parallel_processing', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="parallel-processing">Processamento Paralelo</Label>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// ========== COMPONENTES ESPECÍFICOS POR TIPO ==========

interface DropTestConfigProps {
  parametros: DropTestConfig;
  onChange: (key: string, value: any) => void;
  isLoading: boolean;
}

const DropTestConfig: React.FC<DropTestConfigProps> = ({ parametros, onChange, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Teste de Queda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Altura de Queda */}
        <div>
          <Label htmlFor="drop-height">Altura de Queda (metros)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.drop_height || 1.0]}
              onValueChange={([value]) => onChange('drop_height', value)}
              min={0.1}
              max={10.0}
              step={0.1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0.1m</span>
              <span className="font-medium">{parametros.drop_height?.toFixed(1) || '1.0'}m</span>
              <span>10.0m</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Altura da qual o objeto será derrubado. Alturas maiores aumentam a energia de impacto.
          </p>
        </div>

        {/* Número de Testes */}
        <div>
          <Label htmlFor="num-drops">Número de Testes de Queda</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.num_drops || 5]}
              onValueChange={([value]) => onChange('num_drops', value)}
              min={1}
              max={50}
              step={1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1</span>
              <span className="font-medium">{parametros.num_drops || 5}</span>
              <span>50</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Quantidade de testes de queda. Mais testes fornecem resultados estatisticamente mais confiáveis.
          </p>
        </div>

        {/* Gravidade */}
        <div>
          <Label htmlFor="gravity">Gravidade (m/s²)</Label>
          <Input
            id="gravity"
            type="number"
            step="0.1"
            min="-20"
            max="0"
            value={parametros.gravity || -9.8}
            onChange={(e) => onChange('gravity', parseFloat(e.target.value))}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Gravidade da simulação. Valor negativo indica direção para baixo.
          </p>
        </div>

        {/* Tipo de Superfície */}
        <div>
          <Label htmlFor="surface-type">Tipo de Superfície</Label>
          <Select 
            value={parametros.surface_type || 'concrete'}
            onValueChange={(value) => onChange('surface_type', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a superfície" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concrete">Concreto</SelectItem>
              <SelectItem value="metal">Metal</SelectItem>
              <SelectItem value="wood">Madeira</SelectItem>
              <SelectItem value="foam">Espuma</SelectItem>
              <SelectItem value="rubber">Borracha</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Superfície de impacto que afeta o coeficiente de restituição e absorção de energia.
          </p>
        </div>

        {/* Coeficiente de Restituição */}
        <div>
          <Label htmlFor="restitution">Coeficiente de Restituição</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.restitution || 0.3]}
              onValueChange={([value]) => onChange('restitution', value)}
              min={0.0}
              max={1.0}
              step={0.05}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0.0 (Sem salto)</span>
              <span className="font-medium">{(parametros.restitution || 0.3).toFixed(2)}</span>
              <span>1.0 (Bola elástica)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Controla o quão elástico é o objeto. Valores mais altos resultam em mais saltos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

interface StressTestConfigProps {
  parametros: StressTestConfig;
  onChange: (key: string, value: any) => void;
  isLoading: boolean;
}

const StressTestConfig: React.FC<StressTestConfigProps> = ({ parametros, onChange, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Teste de Stress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Força Máxima */}
        <div>
          <Label htmlFor="max-force">Força Máxima (Newtons)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.max_force || 1000]}
              onValueChange={([value]) => onChange('max_force', value)}
              min={1}
              max={50000}
              step={100}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1N</span>
              <span className="font-medium">{parametros.max_force || 1000}N</span>
              <span>50kN</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Força máxima a ser aplicada no objeto durante o teste.
          </p>
        </div>

        {/* Incremento de Força */}
        <div>
          <Label htmlFor="force-increment">Incremento de Força (Newtons)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.force_increment || 100]}
              onValueChange={([value]) => onChange('force_increment', value)}
              min={1}
              max={5000}
              step={10}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1N</span>
              <span className="font-medium">{parametros.force_increment || 100}N</span>
              <span>5kN</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Incremento de força entre medições. Incrementos menores fornecem mais precisão.
          </p>
        </div>

        {/* Direção da Força */}
        <div>
          <Label htmlFor="force-direction">Direção da Força</Label>
          <Select 
            value={JSON.stringify(parametros.force_direction || [0, 0, 1])}
            onValueChange={(value) => onChange('force_direction', JSON.parse(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a direção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="[0, 0, 1]">Para cima (Z+)</SelectItem>
              <SelectItem value="[0, 0, -1]">Para baixo (Z-)</SelectItem>
              <SelectItem value="[1, 0, 0]">Eixo X+</SelectItem>
              <SelectItem value="[-1, 0, 0]">Eixo X-</SelectItem>
              <SelectItem value="[0, 1, 0]">Eixo Y+</SelectItem>
              <SelectItem value="[0, -1, 0]">Eixo Y-</SelectItem>
              <SelectItem value="[1, 1, 1]">Diagonal (X+Y+Z+)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Direção na qual a força será aplicada.
          </p>
        </div>

        {/* Duração do Teste */}
        <div>
          <Label htmlFor="test-duration">Duração do Teste (segundos)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.test_duration || 5]}
              onValueChange={([value]) => onChange('test_duration', value)}
              min={1}
              max={60}
              step={0.5}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1s</span>
              <span className="font-medium">{(parametros.test_duration || 5).toFixed(1)}s</span>
              <span>60s</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tempo que cada incremento de força é mantido.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

interface MotionTestConfigProps {
  parametros: MotionTestConfig;
  onChange: (key: string, value: any) => void;
  isLoading: boolean;
}

const MotionTestConfig: React.FC<MotionTestConfigProps> = ({ parametros, onChange, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Teste de Movimento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Trajetória */}
        <div>
          <Label htmlFor="trajectory-type">Tipo de Trajetória</Label>
          <Select 
            value={parametros.trajectory_type || 'circular'}
            onValueChange={(value) => onChange('trajectory_type', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a trajetória" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="figure_8">Figura 8</SelectItem>
              <SelectItem value="spiral">Espiral</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Padrão de movimento que o objeto deve seguir.
          </p>
        </div>

        {/* Duração */}
        <div>
          <Label htmlFor="duration">Duração (segundos)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.duration || 10]}
              onValueChange={([value]) => onChange('duration', value)}
              min={1}
              max={300}
              step={1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>1s</span>
              <span className="font-medium">{parametros.duration || 10}s</span>
              <span>300s</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Duração total do teste de movimento.
          </p>
        </div>

        {/* Velocidade */}
        <div>
          <Label htmlFor="velocity">Velocidade (m/s)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.velocity || 1.0]}
              onValueChange={([value]) => onChange('velocity', value)}
              min={0.1}
              max={20.0}
              step={0.1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0.1 m/s</span>
              <span className="font-medium">{(parametros.velocity || 1.0).toFixed(1)} m/s</span>
              <span>20.0 m/s</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Velocidade constante durante o movimento.
          </p>
        </div>

        {/* Raio (para trajetória circular) */}
        {parametros.trajectory_type === 'circular' && (
          <div>
            <Label htmlFor="radius">Raio da Trajetória (metros)</Label>
            <div className="space-y-2">
              <Slider
                value={[parametros.radius || 1.0]}
                onValueChange={([value]) => onChange('radius', value)}
                min={0.1}
                max={10.0}
                step={0.1}
                className="w-full"
                disabled={isLoading}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>0.1m</span>
                <span className="font-medium">{(parametros.radius || 1.0).toFixed(1)}m</span>
                <span>10.0m</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Raio do círculo para trajetória circular.
            </p>
          </div>
        )}

        {/* Aceleração */}
        <div>
          <Label htmlFor="acceleration">Aceleração (m/s²)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.acceleration || 0.0]}
              onValueChange={([value]) => onChange('acceleration', value)}
              min={0.0}
              max={10.0}
              step={0.1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0.0 m/s²</span>
              <span className="font-medium">{(parametros.acceleration || 0.0).toFixed(1)} m/s²</span>
              <span>10.0 m/s²</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Aceleração do objeto durante o movimento. 0 para velocidade constante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

interface FluidTestConfigProps {
  parametros: FluidTestConfig;
  onChange: (key: string, value: any) => void;
  isLoading: boolean;
}

const FluidTestConfig: React.FC<FluidTestConfigProps> = ({ parametros, onChange, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Teste de Fluido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Densidade do Fluido */}
        <div>
          <Label htmlFor="fluid-density">Densidade do Fluido (kg/m³)</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.fluid_density || 1.2]}
              onValueChange={([value]) => onChange('fluid_density', value)}
              min={0.1}
              max={2000.0}
              step={0.1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0.1</span>
              <span className="font-medium">{(parametros.fluid_density || 1.2).toFixed(1)}</span>
              <span>2000</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            1.2 = Ar, 1000 = Água. Densidades maiores aumentam a resistência.
          </p>
        </div>

        {/* Coeficiente de Arrasto */}
        <div>
          <Label htmlFor="drag-coefficient">Coeficiente de Arrasto</Label>
          <div className="space-y-2">
            <Slider
              value={[parametros.drag_coefficient || 0.47]}
              onValueChange={([value]) => onChange('drag_coefficient', value)}
              min={0.0}
              max={2.0}
              step={0.01}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0.0</span>
              <span className="font-medium">{(parametros.drag_coefficient || 0.47).toFixed(2)}</span>
              <span>2.0</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            0.0 = Sem resistência, 1.47 = Esfera, 0.25 = Aerodinâmico, 1.2 = Plano.
          </p>
        </div>

        {/* Viscosidade */}
        <div>
          <Label htmlFor="viscosity">Viscosidade Dinâmica (Pa·s)</Label>
          <Input
            id="viscosity"
            type="number"
            step="0.0001"
            min="0.0001"
            max="100"
            value={parametros.viscosity || 0.001}
            onChange={(e) => onChange('viscosity', parseFloat(e.target.value))}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            0.001 = Ar, 0.001 = Água. Fluidos mais viscosos oferecem mais resistência.
          </p>
        </div>

        {/* Direção do Fluxo */}
        <div>
          <Label htmlFor="flow-direction">Direção do Fluxo</Label>
          <Select 
            value={JSON.stringify(parametros.flow_direction || [0, 0, -1])}
            onValueChange={(value) => onChange('flow_direction', JSON.parse(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a direção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="[0, 0, -1]">Fluxo para baixo (Z-)</SelectItem>
              <SelectItem value="[0, 0, 1]">Fluxo para cima (Z+)</SelectItem>
              <SelectItem value="[1, 0, 0]">Fluxo eixo X+</SelectItem>
              <SelectItem value="[-1, 0, 0]">Fluxo eixo X-</SelectItem>
              <SelectItem value="[0, 1, 0]">Fluxo eixo Y+</SelectItem>
              <SelectItem value="[0, -1, 0]">Fluxo eixo Y-</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Direção na qual o fluido está se movendo em relação ao objeto.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationConfig;