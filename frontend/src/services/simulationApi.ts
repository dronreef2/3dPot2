/**
 * Cliente API para Sistema de Simulação Física
 * Serviços para comunicação com backend FastAPI
 */

import axios, { AxiosResponse } from 'axios';
import {
  SimulationCreateRequest,
  SimulationResponse,
  SimulationResult,
  SimulationStatusResponse,
  SimulationTemplate,
  ValidationResult,
  SimulationType,
  SimulationStatus,
  TemplateCategory,
  HistoryParams
} from '../types/simulation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const simulationApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000, // 30 segundos para operações de simulação
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
simulationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
simulationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== SERVIÇOS PRINCIPAIS ==========

export class SimulationApiService {
  /**
   * Criar nova simulação física
   */
  static async createSimulation(data: SimulationCreateRequest): Promise<SimulationResponse> {
    try {
      const response: AxiosResponse<SimulationResponse> = await simulationApi.post(
        '/simulations/create',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obter detalhes de uma simulação específica
   */
  static async getSimulation(simulationId: string): Promise<SimulationResponse> {
    try {
      const response: AxiosResponse<SimulationResponse> = await simulationApi.get(
        `/simulations/${simulationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter simulação:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obter resultados detalhados da simulação
   */
  static async getSimulationResults(simulationId: string): Promise<SimulationResult> {
    try {
      const response: AxiosResponse<SimulationResult> = await simulationApi.get(
        `/simulations/${simulationId}/results`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter resultados:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obter status atual da simulação
   */
  static async getSimulationStatus(simulationId: string): Promise<SimulationStatusResponse> {
    try {
      const response: AxiosResponse<SimulationStatusResponse> = await simulationApi.get(
        `/simulations/${simulationId}/status`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter status:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Cancelar e excluir uma simulação
   */
  static async deleteSimulation(simulationId: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await simulationApi.delete(
        `/simulations/${simulationId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obter templates de simulação pré-configurados
   */
  static async getSimulationTemplates(): Promise<SimulationTemplate[]> {
    try {
      const response: AxiosResponse<SimulationTemplate[]> = await simulationApi.get(
        '/simulations/templates'
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter templates:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obter histórico de simulações do usuário
   */
  static async getSimulationHistory(params?: HistoryParams): Promise<SimulationResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
      if (params?.tipo_filter) queryParams.append('tipo_filter', params.tipo_filter);

      const response: AxiosResponse<SimulationResponse[]> = await simulationApi.get(
        `/simulations/history?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Validar parâmetros de simulação
   */
  static async validateSimulationParameters(simulationId: string): Promise<ValidationResult> {
    try {
      const response: AxiosResponse<ValidationResult> = await simulationApi.post(
        `/simulations/${simulationId}/validate`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao validar parâmetros:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Download dos resultados da simulação
   */
  static async downloadSimulationResults(
    simulationId: string,
    format: 'json' | 'pdf' = 'json'
  ): Promise<Blob> {
    try {
      const response = await simulationApi.get(
        `/simulations/${simulationId}/download-results?format=${format}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obter todas as simulações de um modelo específico
   */
  static async getModelSimulations(modelId: string): Promise<{
    model_id: string;
    model_name: string;
    total_simulations: number;
    simulations: SimulationResponse[];
  }> {
    try {
      const response = await simulationApi.get(`/models/${modelId}/simulations`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter simulações do modelo:', error);
      throw this.handleApiError(error);
    }
  }
}

// ========== SERVIÇOS DE MONITORAMENTO ==========

export class SimulationMonitoringService {
  private eventSource: EventSource | null = null;

  /**
   * Conectar ao WebSocket para monitoramento em tempo real
   */
  connectToMonitoring(simulationId: string, onUpdate: (data: any) => void): void {
    try {
      const token = localStorage.getItem('access_token');
      const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/simulations/${simulationId}?token=${token}`;
      
      this.eventSource = new EventSource(wsUrl);
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Erro na conexão WebSocket:', error);
        // Reconectar automaticamente
        setTimeout(() => {
          this.connectToMonitoring(simulationId, onUpdate);
        }, 5000);
      };
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }

  /**
   * Desconectar do WebSocket
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Polling para status (fallback se WebSocket não estiver disponível)
   */
  static async pollStatus(
    simulationId: string,
    onUpdate: (status: SimulationStatusResponse) => void,
    interval: number = 2000
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const status = await SimulationApiService.getSimulationStatus(simulationId);
        onUpdate(status);

        // Parar polling se concluído ou falhado
        if (status.status === SimulationStatus.COMPLETED || status.status === SimulationStatus.FAILED) {
          isPolling = false;
        }
      } catch (error) {
        console.error('Erro no polling:', error);
      }

      if (isPolling) {
        setTimeout(poll, interval);
      }
    };

    // Iniciar polling
    poll();

    // Retornar função para parar
    return () => {
      isPolling = false;
    };
  }
}

// ========== SERVIÇOS DE ANÁLISE E COMPARAÇÃO ==========

export class SimulationAnalysisService {
  /**
   * Comparar múltiplas simulações
   */
  static async compareSimulations(
    simulationIds: string[]
  ): Promise<{
    comparisons: any[];
    best_simulation?: string;
    recommendations: string[];
  }> {
    try {
      const response = await simulationApi.post('/simulations/compare', {
        simulation_ids: simulationIds,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao comparar simulações:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obter análises históricas de simulações
   */
  static async getSimulationTrends(
    modelId: string,
    days: number = 30
  ): Promise<{
    trends: Record<string, any>;
    insights: string[];
    predictions: any[];
  }> {
    try {
      const response = await simulationApi.get(`/simulations/analysis/trends/${modelId}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter tendências:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Gerar relatório de qualidade
   */
  static async generateQualityReport(simulationId: string): Promise<{
    score: number;
    issues: string[];
    improvements: string[];
    printable: boolean;
  }> {
    try {
      const response = await simulationApi.get(`/simulations/${simulationId}/quality-report`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw this.handleApiError(error);
    }
  }
}

// ========== SERVIÇOS DE CACHE ==========

export class SimulationCacheService {
  private static cache = new Map<string, any>();

  /**
   * Obter resultado do cache local
   */
  static getCachedResult(cacheKey: string): any {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires_at > Date.now()) {
      return cached.data;
    }
    
    // Remover entrada expirada
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Salvar resultado no cache local
   */
  static setCachedResult(cacheKey: string, data: any, ttl: number = 300000): void {
    this.cache.set(cacheKey, {
      data,
      expires_at: Date.now() + ttl,
    });
  }

  /**
   * Limpar cache local
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obter estatísticas do cache
   */
  static getCacheStats(): {
    size: number;
    hit_rate: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      hit_rate: 0, // Implementar tracking de hits se necessário
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ========== SERVIÇOS DE VALIDAÇÃO ==========

export class SimulationValidationService {
  /**
   * Validar parâmetros antes de criar simulação
   */
  static validateParameters(
    tipo_simulacao: SimulationType,
    parametros: Record<string, any>
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (tipo_simulacao) {
      case SimulationType.DROP_TEST:
        if (!parametros.drop_height || parametros.drop_height < 0.1) {
          errors.push('Altura de queda deve ser maior que 0.1m');
        }
        if (parametros.drop_height > 10) {
          errors.push('Altura de queda máxima: 10m');
        }
        if (!parametros.num_drops || parametros.num_drops < 1) {
          errors.push('Número de testes deve ser pelo menos 1');
        }
        if (parametros.num_drops > 50) {
          warnings.push('Muitos testes podem slowing a simulação');
        }
        break;

      case SimulationType.STRESS_TEST:
        if (!parametros.max_force || parametros.max_force < 1) {
          errors.push('Força máxima deve ser maior que 0');
        }
        if (parametros.max_force > 50000) {
          errors.push('Força máxima permitida: 50000N');
        }
        if (!parametros.force_increment || parametros.force_increment < 1) {
          errors.push('Incremento de força deve ser maior que 0');
        }
        if (parametros.force_increment > parametros.max_force / 10) {
          warnings.push('Incremento muito alto pode resultar em poucos pontos de dados');
        }
        break;

      case SimulationType.MOTION:
        if (!parametros.duration || parametros.duration < 1) {
          errors.push('Duração deve ser pelo menos 1 segundo');
        }
        if (parametros.duration > 300) {
          errors.push('Duração máxima: 300 segundos');
        }
        if (!parametros.velocity || parametros.velocity < 0.1) {
          errors.push('Velocidade deve ser maior que 0.1 m/s');
        }
        if (parametros.velocity > 20) {
          warnings.push('Velocidade muito alta pode causar instabilidade');
        }
        break;

      case SimulationType.FLUID:
        if (!parametros.fluid_density || parametros.fluid_density < 0.1) {
          errors.push('Densidade do fluido deve ser maior que 0.1 kg/m³');
        }
        if (parametros.fluid_density > 2000) {
          errors.push('Densidade máxima: 2000 kg/m³');
        }
        if (!parametros.drag_coefficient || parametros.drag_coefficient < 0) {
          errors.push('Coeficiente de arrasto deve ser positivo');
        }
        if (parametros.drag_coefficient > 2) {
          warnings.push('Coeficiente de arrasto muito alto');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Sugerir parâmetros otimizados
   */
  static suggestOptimizedParameters(
    tipo_simulacao: SimulationType,
    parametros: Record<string, any>
  ): Record<string, any> {
    const suggested = { ...parametros };

    switch (tipo_simulacao) {
      case SimulationType.DROP_TEST:
        suggested.num_drops = Math.min(parametros.num_drops || 5, 20);
        suggested.drop_height = Math.min(parametros.drop_height || 1.0, 5.0);
        break;

      case SimulationType.STRESS_TEST:
        suggested.force_increment = Math.min(
          parametros.force_increment || 100,
          parametros.max_force / 20 || 50
        );
        break;

      case SimulationType.MOTION:
        suggested.duration = Math.min(parametros.duration || 10, 60);
        suggested.velocity = Math.min(parametros.velocity || 1.0, 5.0);
        break;

      case SimulationType.FLUID:
        suggested.fluid_density = Math.min(parametros.fluid_density || 1.2, 100);
        break;
    }

    return suggested;
  }
}

// ========== SERVIÇOS UTILITÁRIOS ==========

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleApiError(error: any): ApiError {
  if (error.response) {
    // Erro do servidor
    const status = error.response.status;
    const message = error.response.data?.detail || error.response.data?.message || 'Erro do servidor';
    const data = error.response.data;
    
    return new ApiError(status, message, data);
  } else if (error.request) {
    // Erro de rede
    return new ApiError(0, 'Erro de conexão. Verifique sua internet.');
  } else {
    // Erro desconhecido
    return new ApiError(-1, 'Erro desconhecido: ' + error.message);
  }
}

// Funções utilitárias adicionais
export const SimulationUtils = {
  /**
   * Formatar duração da simulação
   */
  formatDuration(seconds: number): string {
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
  },

  /**
   * Calcular ETA baseado no progresso
   */
  calculateETA(startTime: string, progress: number): string {
    const now = new Date();
    const start = new Date(startTime);
    const elapsed = (now.getTime() - start.getTime()) / 1000;
    
    if (progress <= 0) return 'Calculando...';
    
    const totalEstimated = elapsed / (progress / 100);
    const remaining = totalEstimated - elapsed;
    
    return this.formatDuration(remaining);
  },

  /**
   * Gerar ID de cache único
   */
  generateCacheKey(modelPath: string, tipo: SimulationType, parametros: Record<string, any>): string {
    const paramStr = JSON.stringify(parametros, Object.keys(parametros).sort());
    const hash = btoa(modelPath + paramStr).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    return `simulation:${tipo}:${hash}`;
  },

  /**
   * Verificar se simulação está em progresso
   */
  isRunning(status: SimulationStatus): boolean {
    return status === SimulationStatus.PENDING || status === SimulationStatus.RUNNING;
  },

  /**
   * Obter cor do status
   */
  getStatusColor(status: SimulationStatus): string {
    switch (status) {
      case SimulationStatus.PENDING:
        return '#fbbf24'; // amber
      case SimulationStatus.RUNNING:
        return '#3b82f6'; // blue
      case SimulationStatus.COMPLETED:
        return '#10b981'; // green
      case SimulationStatus.FAILED:
        return '#ef4444'; // red
      case SimulationStatus.CANCELLED:
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  },

  /**
   * Obter ícone do status
   */
  getStatusIcon(status: SimulationStatus): string {
    switch (status) {
      case SimulationStatus.PENDING:
        return '⏳';
      case SimulationStatus.RUNNING:
        return '🔄';
      case SimulationStatus.COMPLETED:
        return '✅';
      case SimulationStatus.FAILED:
        return '❌';
      case SimulationStatus.CANCELLED:
        return '⏹️';
      default:
        return '❓';
    }
  },
};

export default simulationApi;