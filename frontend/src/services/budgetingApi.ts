/**
 * API Client - Sistema de Orçamento Automatizado Inteligente - Sprint 5
 * Cliente HTTP para comunicação com backend FastAPI
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  IntelligentBudgetCreate, 
  IntelligentBudgetResponse, 
  BudgetRecalculateRequest,
  SupplierComparisonRequest,
  Slant3DQuoteRequest,
  MaterialRecommendation,
  SupplierComparison,
  Slant3DQuote,
  BudgetTimeline,
  BudgetReport,
  BudgetExport,
  BudgetAnalytics,
  BudgetUpdate,
  ApiResponse,
  PaginatedResponse
} from '../types/budgeting';

class BudgetingApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = '/api/v1/budgeting') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor para adicionar autenticação
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError): ApiResponse {
    if (error.response?.data) {
      return {
        data: null,
        error: (error.response.data as any).detail || 'Erro desconhecido',
        status: error.response.status,
        timestamp: new Date().toISOString(),
      };
    }
    
    return {
      data: null,
      error: error.message || 'Erro de rede',
      status: 500,
      timestamp: new Date().toISOString(),
    };
  }

  // ========== MÉTODOS PRINCIPAIS ==========

  /**
   * Criar orçamento automatizado inteligente
   */
  async createIntelligentBudget(data: IntelligentBudgetCreate): Promise<IntelligentBudgetResponse> {
    try {
      const response: AxiosResponse<IntelligentBudgetResponse> = await this.client.post(
        '/intelligent/create',
        data
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Obter detalhes de um orçamento
   */
  async getBudgetDetails(budgetId: string): Promise<IntelligentBudgetResponse> {
    try {
      const response: AxiosResponse<IntelligentBudgetResponse> = await this.client.get(
        `/${budgetId}`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Recalcular orçamento com novos parâmetros
   */
  async recalculateBudget(
    budgetId: string, 
    data: BudgetRecalculateRequest
  ): Promise<IntelligentBudgetResponse> {
    try {
      const response = await this.client.post(
        `/${budgetId}/recalculate`,
        data
      );
      
      // Buscar orçamento atualizado
      return await this.getBudgetDetails(budgetId);
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Obter todos os orçamentos de um projeto
   */
  async getProjectBudgets(projectId: string): Promise<PaginatedResponse<IntelligentBudgetResponse>> {
    try {
      const response: AxiosResponse = await this.client.get(
        `/projects/${projectId}/budgets`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Excluir um orçamento
   */
  async deleteBudget(budgetId: string): Promise<void> {
    try {
      await this.client.delete(`/${budgetId}`);
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // ========== MATERIAIS ==========

  /**
   * Obter recomendações de materiais baseadas em simulações
   */
  async getMaterialRecommendations(budgetId: string): Promise<MaterialRecommendation[]> {
    try {
      const response: AxiosResponse<MaterialRecommendation[]> = await this.client.get(
        `/${budgetId}/materials`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Comparar preços de materiais entre fornecedores
   */
  async compareMaterials(data: {
    budget_id: string;
    model_info: any;
    quantity: number;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        '/materials/compare',
        data
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Verificar disponibilidade de material
   */
  async checkMaterialAvailability(data: {
    material: string;
    color?: string;
    finish_type?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        '/slant3d/availability',
        data
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // ========== FORNECEDORES ==========

  /**
   * Comparar fornecedores para um orçamento
   */
  async compareSuppliers(
    budgetId: string, 
    criteria: SupplierComparisonRequest
  ): Promise<SupplierComparison> {
    try {
      const params = new URLSearchParams();
      if (criteria.include_shipping !== undefined) {
        params.append('include_shipping', criteria.include_shipping.toString());
      }
      if (criteria.max_suppliers !== undefined) {
        params.append('max_suppliers', criteria.max_suppliers.toString());
      }
      if (criteria.region) {
        params.append('region', criteria.region);
      }

      const response: AxiosResponse<SupplierComparison> = await this.client.get(
        `/${budgetId}/suppliers?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Obter recomendações de fornecedores
   */
  async getSupplierRecommendations(data: {
    budget_data: any;
    criteria?: string[];
  }): Promise<any> {
    try {
      const response = await this.client.post(
        '/suppliers/recommendations',
        data
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // ========== SLANT3D INTEGRATION ==========

  /**
   * Obter cotação do Slant3D
   */
  async getSlant3DQuote(data: Slant3DQuoteRequest): Promise<any> {
    try {
      const response = await this.client.post(
        '/slant3d/quote',
        data
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Estimar custo de frete
   */
  async estimateShipping(data: {
    country?: string;
    state?: string;
    city?: string;
    postal_code?: string;
    weight_kg?: number;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        '/slant3d/shipping-estimate',
        data
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // ========== TIMELINE E RELATÓRIOS ==========

  /**
   * Obter cronograma detalhado do orçamento
   */
  async getBudgetTimeline(budgetId: string): Promise<{
    budget_id: string;
    timeline: BudgetTimeline[];
    total_duration_days: number;
    critical_path: string[];
  }> {
    try {
      const response = await this.client.get(
        `/${budgetId}/timeline`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Gerar relatório completo do orçamento
   */
  async generateBudgetReport(
    budgetId: string, 
    options: BudgetExport
  ): Promise<BudgetReport> {
    try {
      const params = new URLSearchParams();
      params.append('format', options.format);
      if (options.include_charts !== undefined) {
        params.append('include_charts', options.include_charts.toString());
      }
      if (options.include_supplier_details !== undefined) {
        params.append('include_supplier_details', options.include_supplier_details.toString());
      }
      if (options.language) {
        params.append('language', options.language);
      }

      const response: AxiosResponse<BudgetReport> = await this.client.get(
        `/${budgetId}/report?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Baixar relatório em PDF
   */
  async downloadBudgetReport(
    budgetId: string, 
    options: BudgetExport = { format: 'pdf' }
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', options.format);
      
      const response = await this.client.get(
        `/${budgetId}/report?${params.toString()}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // ========== ESTATÍSTICAS ==========

  /**
   * Obter estatísticas de orçamentos do usuário
   */
  async getUserBudgetStatistics(): Promise<any> {
    try {
      const response = await this.client.get('/statistics/user');
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  /**
   * Obter análises detalhadas de um orçamento
   */
  async getBudgetAnalytics(budgetId: string): Promise<BudgetAnalytics> {
    try {
      const response: AxiosResponse<BudgetAnalytics> = await this.client.get(
        `/${budgetId}/analytics`
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error as AxiosError);
    }
  }

  // ========== WEBSOCKET ==========

  /**
   * Conectar ao WebSocket para atualizações em tempo real
   */
  connectToWebSocket(budgetId: string, onMessage: (update: BudgetUpdate) => void): WebSocket {
    const ws = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/v1/budgeting/updates/${budgetId}`
    );

    ws.onopen = () => {
      console.log('WebSocket conectado para orçamento:', budgetId);
    };

    ws.onmessage = (event) => {
      try {
        const update: BudgetUpdate = JSON.parse(event.data);
        onMessage(update);
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado');
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    return ws;
  }

  /**
   * Enviar ping para manter conexão WebSocket ativa
   */
  pingWebSocket(ws: WebSocket): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('ping');
    }
  }

  // ========== CACHE E PERFORMANCE ==========

  /**
   * Cache em memória para requests frequentes
   */
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  private getCacheKey(url: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}_${paramString}`;
  }

  private isCacheValid(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp < ttl;
  }

  /**
   * Método com cache para requests frequentes
   */
  private async cachedRequest<T>(
    url: string, 
    params?: any, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, params);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp, cached.ttl)) {
      return cached.data;
    }

    const response = await this.client.get(url, { params });
    this.cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
      ttl
    });

    return response.data;
  }

  /**
   * Limpar cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Obter estatísticas do cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // ========== UTILITÁRIOS ==========

  /**
   * Formatar moeda brasileira
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }

  /**
   * Formatar duração em horas para texto legível
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours < 1) {
      return `${days} dia${days > 1 ? 's' : ''}`;
    }
    
    return `${days}d ${remainingHours.toFixed(0)}h`;
  }

  /**
   * Calcular data de entrega estimada
   */
  calculateDeliveryDate(estimatedDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + estimatedDays);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Validar dados de entrada
   */
  validateBudgetData(data: Partial<IntelligentBudgetCreate>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.projeto_id) {
      errors.push('Projeto ID é obrigatório');
    }

    if (data.margem_lucro_percentual !== undefined) {
      if (data.margem_lucro_percentual < 0 || data.margem_lucro_percentual > 100) {
        errors.push('Margem de lucro deve estar entre 0% e 100%');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obter configuração do cliente
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      timeout: 30000,
      cacheStats: this.getCacheStats()
    };
  }
}

// Instância singleton do cliente
export const budgetingApi = new BudgetingApiClient();

// Export para uso direto se necessário
export { BudgetingApiClient };

export default budgetingApi;