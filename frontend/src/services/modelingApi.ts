"""
3dPot v2.0 - Cliente API para Modelagem 3D
==========================================

Este módulo implementa o cliente HTTP para interação com a API
de modelagem 3D do backend.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ModelingRequest,
  ModelingResponse,
  ModelingStatus,
  ModelFormatResponse,
  ModelingTemplate,
  BatchModelingResponse,
  ModelingEngine,
  ModelFormat,
  ModelSpecs
} from '../types/modeling';

class ModelingApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 300000, // 5 minutos para geração de modelos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado, redirecionar para login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Lista engines de modelagem 3D disponíveis
   */
  async getAvailableEngines(): Promise<string[]> {
    try {
      const response: AxiosResponse<string[]> = await this.client.get('/api/v1/modeling/engines');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar engines:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lista formatos suportados por um engine
   */
  async getSupportedFormats(engine: string): Promise<ModelFormatResponse> {
    try {
      const response: AxiosResponse<ModelFormatResponse> = await this.client.get(
        '/api/v1/modeling/formats',
        { params: { engine } }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar formatos:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Gera modelo 3D a partir das especificações
   */
  async generateModel(request: ModelingRequest): Promise<ModelingResponse> {
    try {
      const response: AxiosResponse<ModelingResponse> = await this.client.post(
        '/api/v1/modeling/generate',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Erro na geração do modelo:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Gera múltiplos modelos 3D em lote
   */
  async batchGenerateModels(requests: ModelingRequest[]): Promise<BatchModelingResponse> {
    try {
      const response: AxiosResponse<BatchModelingResponse> = await this.client.post(
        '/api/v1/modeling/batch-generate',
        { requests }
      );
      return response.data;
    } catch (error) {
      console.error('Erro na geração em lote:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Verifica o status de um modelo 3D
   */
  async getModelingStatus(modelId: string): Promise<ModelingStatus> {
    try {
      const response: AxiosResponse<ModelingStatus> = await this.client.get(
        `/api/v1/modeling/status/${modelId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do modelo:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Baixa modelo 3D gerado
   */
  async downloadModel(modelId: string, format: ModelFormat = ModelFormat.STL): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await this.client.get(
        `/api/v1/modeling/download/${modelId}`,
        {
          params: { format },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro no download do modelo:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Exclui modelo 3D
   */
  async deleteModel(modelId: string): Promise<{ success: boolean; message: string; deleted_files: string[] }> {
    try {
      const response = await this.client.delete(`/api/v1/modeling/model/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir modelo:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Valida modelo 3D para impressão
   */
  async validateModel(modelId: string): Promise<any> {
    try {
      const response = await this.client.post(`/api/v1/modeling/validate/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('Erro na validação do modelo:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Lista templates de modelagem disponíveis
   */
  async getModelingTemplates(): Promise<ModelingTemplate[]> {
    try {
      const response: AxiosResponse<ModelingTemplate[]> = await this.client.get(
        '/api/v1/modeling/templates'
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao listar templates:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Cria requisição de modelagem a partir de especificações extraídas
   */
  createModelingRequest(
    specs: ModelSpecs,
    projectId?: string,
    engine?: ModelingEngine,
    format?: ModelFormat
  ): ModelingRequest {
    return {
      specs,
      project_id: projectId,
      engine: engine || ModelingEngine.CADQUERY,
      format: format || ModelFormat.STL
    };
  }

  /**
   * Faz download direto do modelo com o navegador
   */
  async triggerDownload(modelId: string, format: ModelFormat = ModelFormat.STL): Promise<void> {
    try {
      const blob = await this.downloadModel(modelId, format);
      
      // Criar URL do blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar elemento de link temporário
      const link = document.createElement('a');
      link.href = url;
      link.download = `3dpot_model_${modelId}.${format}`;
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro no download direto:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Verifica se um modelo é imprimível baseado no relatório de validação
   */
  isModelPrintable(validationReport: any): boolean {
    if (!validationReport) return false;
    
    return validationReport.printable === true && 
           (!validationReport.errors || validationReport.errors.length === 0);
  }

  /**
   * Extrai métricas úteis do relatório de validação
   */
  extractModelMetrics(validationReport: any): {
    volume: number;
    surfaceArea: number;
    vertices: number;
    faces: number;
    dimensions: { width: number; height: number; depth: number };
    isPrintable: boolean;
    warnings: string[];
    errors: string[];
  } {
    if (!validationReport) {
      return {
        volume: 0,
        surfaceArea: 0,
        vertices: 0,
        faces: 0,
        dimensions: { width: 0, height: 0, depth: 0 },
        isPrintable: false,
        warnings: [],
        errors: ['Modelo não validado']
      };
    }

    const metrics = validationReport.metrics || {};
    const printability = validationReport.printability || {};

    return {
      volume: metrics.volume_mm3 || 0,
      surfaceArea: metrics.surface_area_mm2 || 0,
      vertices: metrics.vertices || 0,
      faces: metrics.faces || 0,
      dimensions: {
        width: metrics.dimensions_mm?.x || 0,
        height: metrics.dimensions_mm?.z || 0,
        depth: metrics.dimensions_mm?.y || 0
      },
      isPrintable: printability.is_printable || false,
      warnings: printability.warnings || [],
      errors: printability.errors || []
    };
  }

  /**
   * Converte erro da API para erro amigável
   */
  private handleApiError(error: any): Error {
    if (error.response) {
      // Erro do servidor
      const message = error.response.data?.detail || 
                     error.response.data?.message || 
                     `Erro ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão com o servidor');
    } else {
      // Erro de configuração
      return new Error(`Erro na requisição: ${error.message}`);
    }
  }

  /**
   * Atualiza token de autenticação
   */
  updateAuthToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  /**
   * Remove token de autenticação
   */
  clearAuthToken(): void {
    localStorage.removeItem('access_token');
  }
}

// Instância global do cliente
export const modelingApi = new ModelingApiClient();

// Utilitários para criação de especificações padrão
export const createDefaultModelSpecs = (
  category: string = 'mecanico',
  material: string = 'PLA',
  dimensions?: { largura: number; altura: number; profundidade: number }
): ModelSpecs => ({
  category: category as any,
  material: material as any,
  dimensions: dimensions || {
    largura: 50,
    altura: 30,
    profundidade: 20
  },
  additional_specs: {},
  components: [],
  features: []
});

// Utilitário para validar especificações
export const validateModelSpecs = (specs: ModelSpecs): string[] => {
  const errors: string[] = [];

  if (!specs.category) {
    errors.push('Categoria é obrigatória');
  }

  if (!specs.material) {
    errors.push('Material é obrigatório');
  }

  if (!specs.dimensions) {
    errors.push('Dimensões são obrigatórias');
  } else {
    const { largura, altura, profundidade } = specs.dimensions;
    
    if (!largura || largura <= 0) {
      errors.push('Largura deve ser positiva');
    }
    
    if (!altura || altura <= 0) {
      errors.push('Altura deve ser positiva');
    }
    
    if (!profundidade || profundidade <= 0) {
      errors.push('Profundidade deve ser positiva');
    }
  }

  return errors;
};

// Exportar para uso em componentes React
export default modelingApi;