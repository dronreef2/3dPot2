/**
 * Store Zustand para Sistema de Simulação Física
 * Gerenciamento de estado global para simulações
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  SimulationState,
  SimulationStore,
  SimulationCreateRequest,
  SimulationResponse,
  SimulationResult,
  SimulationTemplate,
  ValidationResult,
  HistoryParams,
  SimulationStatus,
  SimulationType
} from '../types/simulation';
import {
  SimulationApiService,
  SimulationMonitoringService,
  SimulationAnalysisService,
  SimulationCacheService,
  SimulationValidationService,
  SimulationUtils
} from '../services/simulationApi';

// ========== CONFIGURAÇÃO DO STORE ==========

const initialState: SimulationState = {
  currentSimulation: null,
  simulations: [],
  templates: [],
  isLoading: false,
  error: null,
  progress: 0,
  result: null,
};

export const useSimulationStore = create<SimulationStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ========== AÇÕES PRINCIPAIS ==========

    createSimulation: async (request: SimulationCreateRequest) => {
      try {
        set({ isLoading: true, error: null });

        // Validar parâmetros localmente
        const validation = SimulationValidationService.validateParameters(
          request.tipo_simulacao,
          request.parametros
        );

        if (!validation.valid) {
          throw new Error(`Parâmetros inválidos: ${validation.errors.join(', ')}`);
        }

        // Aplicar parâmetros sugeridos se houver warnings
        if (validation.warnings.length > 0) {
          request.parametros = SimulationValidationService.suggestOptimizedParameters(
            request.tipo_simulacao,
            request.parametros
          );
        }

        // Verificar cache antes de criar
        const cacheKey = SimulationUtils.generateCacheKey(
          request.modelo_3d_id,
          request.tipo_simulacao,
          request.parametros
        );

        const cachedResult = SimulationCacheService.getCachedResult(cacheKey);
        if (cachedResult) {
          // Usar resultado do cache
          const cachedSimulation: SimulationResponse = {
            id: 'cached',
            nome: request.nome,
            tipo_simulacao: request.tipo_simulacao,
            status: SimulationStatus.COMPLETED,
            created_at: new Date().toISOString(),
            model_3d_id: request.modelo_3d_id,
            parametros: request.parametros,
            results: cachedResult,
            warning_messages: validation.warnings
          };

          set({
            currentSimulation: cachedSimulation,
            result: cachedResult,
            isLoading: false,
            error: null
          });
          return;
        }

        // Criar nova simulação
        const simulation = await SimulationApiService.createSimulation(request);
        
        set({
          currentSimulation: simulation,
          simulations: [simulation, ...get().simulations],
          isLoading: false,
          error: null,
          progress: 0
        });

        // Iniciar monitoramento em tempo real
        startSimulationMonitoring(simulation.id);

      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao criar simulação';
        set({
          isLoading: false,
          error: errorMessage,
          currentSimulation: null
        });
        console.error('Erro ao criar simulação:', error);
      }
    },

    getSimulationStatus: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        const status = await SimulationApiService.getSimulationStatus(id);
        
        // Atualizar simulação atual se for a mesma
        const current = get().currentSimulation;
        if (current && current.id === id) {
          set({
            currentSimulation: {
              ...current,
              status: status.status,
              progress: status.progress,
              estimated_completion: status.estimated_completion,
              error_message: status.error_message
            },
            isLoading: false
          });
        }

        // Atualizar na lista de simulações
        const simulations = get().simulations.map(sim => 
          sim.id === id 
            ? { ...sim, status: status.status, progress: status.progress }
            : sim
        );
        set({ simulations });

      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao obter status'
        });
      }
    },

    getSimulationResults: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        const result = await SimulationApiService.getSimulationResults(id);
        
        set({
          result,
          currentSimulation: get().currentSimulation ? {
            ...get().currentSimulation!,
            status: SimulationStatus.COMPLETED,
            results: result.results
          } : null,
          isLoading: false
        });

        // Cache do resultado
        if (get().currentSimulation) {
          const cacheKey = SimulationUtils.generateCacheKey(
            get().currentSimulation!.model_3d_id,
            get().currentSimulation!.tipo_simulacao,
            get().currentSimulation!.parametros
          );
          SimulationCacheService.setCachedResult(cacheKey, result.results);
        }

      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao obter resultados'
        });
      }
    },

    deleteSimulation: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        await SimulationApiService.deleteSimulation(id);
        
        // Remover da lista
        const simulations = get().simulations.filter(sim => sim.id !== id);
        set({ 
          simulations,
          currentSimulation: get().currentSimulation?.id === id ? null : get().currentSimulation,
          isLoading: false 
        });

      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao excluir simulação'
        });
      }
    },

    getSimulationHistory: async (params?: HistoryParams) => {
      try {
        set({ isLoading: true, error: null });

        const simulations = await SimulationApiService.getSimulationHistory(params);
        set({ 
          simulations,
          isLoading: false 
        });

      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao carregar histórico'
        });
      }
    },

    getTemplates: async () => {
      try {
        set({ isLoading: true, error: null });

        const templates = await SimulationApiService.getSimulationTemplates();
        set({ 
          templates,
          isLoading: false 
        });

      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao carregar templates'
        });
      }
    },

    validateParameters: async (id: string) => {
      try {
        return await SimulationApiService.validateSimulationParameters(id);
      } catch (error: any) {
        console.error('Erro na validação:', error);
        throw error;
      }
    },

    // ========== AÇÕES DE UI ==========

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clearCurrentSimulation: () => {
      set({ 
        currentSimulation: null, 
        result: null,
        progress: 0,
        error: null 
      });
    },

    updateProgress: (progress: number) => {
      set({ progress });
      
      // Atualizar simulação atual
      const current = get().currentSimulation;
      if (current) {
        set({
          currentSimulation: {
            ...current,
            progress
          }
        });
      }
    },

    // ========== AÇÕES DE ANÁLISE ==========

    compareSimulations: async (simulationIds: string[]) => {
      try {
        set({ isLoading: true, error: null });

        const comparison = await SimulationAnalysisService.compareSimulations(simulationIds);
        
        set({ 
          isLoading: false,
          error: null
        });

        return comparison;

      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro na comparação'
        });
        throw error;
      }
    },

    generateQualityReport: async (simulationId: string) => {
      try {
        set({ isLoading: true, error: null });

        const report = await SimulationAnalysisService.generateQualityReport(simulationId);
        
        set({ isLoading: false });
        return report;

      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao gerar relatório'
        });
        throw error;
      }
    },

    // ========== AÇÕES DE CACHE ==========

    clearCache: () => {
      SimulationCacheService.clearCache();
    },

    getCacheStats: () => {
      return SimulationCacheService.getCacheStats();
    },

    // ========== SELÉTORES COMPUTADOS ==========

    getFilteredSimulations: (status?: SimulationStatus, tipo?: SimulationType) => {
      const simulations = get().simulations;
      return simulations.filter(sim => {
        const statusMatch = !status || sim.status === status;
        const typeMatch = !tipo || sim.tipo_simulacao === tipo;
        return statusMatch && typeMatch;
      });
    },

    getRunningSimulations: () => {
      return get().simulations.filter(sim => 
        SimulationUtils.isRunning(sim.status)
      );
    },

    getCompletedSimulations: () => {
      return get().simulations.filter(sim => 
        sim.status === SimulationStatus.COMPLETED
      );
    },

    getSimulationById: (id: string) => {
      return get().simulations.find(sim => sim.id === id);
    },

    getSimulationStats: () => {
      const simulations = get().simulations;
      const stats = {
        total: simulations.length,
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        byType: {} as Record<string, number>
      };

      simulations.forEach(sim => {
        stats[sim.status]++;
        stats.byType[sim.tipo_simulacao] = (stats.byType[sim.tipo_simulacao] || 0) + 1;
      });

      return stats;
    },

    // ========== FUNÇÃO AUXILIAR ==========

    getProgressColor: () => {
      const progress = get().progress;
      if (progress < 30) return '#ef4444'; // red
      if (progress < 70) return '#f59e0b'; // amber
      return '#10b981'; // green
    },

    getEstimatedTime: () => {
      const current = get().currentSimulation;
      if (!current || !current.created_at) return null;
      
      return SimulationUtils.calculateETA(
        current.created_at,
        current.progress || 0
      );
    },

    isCurrentSimulation: (id: string) => {
      return get().currentSimulation?.id === id;
    },

    hasSimulationProgress: () => {
      const current = get().currentSimulation;
      return current && current.progress !== undefined && current.progress > 0;
    },

    shouldShowProgress: () => {
      const current = get().currentSimulation;
      return current && SimulationUtils.isRunning(current.status);
    },

    canDownloadResults: () => {
      const current = get().currentSimulation;
      return current && 
             current.status === SimulationStatus.COMPLETED && 
             current.results;
    }
  }))
);

// ========== MONITORAMENTO EM TEMPO REAL ==========

let monitoringService: SimulationMonitoringService | null = null;

function startSimulationMonitoring(simulationId: string) {
  const store = useSimulationStore.getState();
  
  // Parar monitoramento anterior
  if (monitoringService) {
    monitoringService.disconnect();
  }

  monitoringService = new SimulationMonitoringService();
  
  monitoringService.connectToMonitoring(simulationId, (data) => {
    switch (data.type) {
      case 'progress':
        store.updateProgress(data.data.progress || 0);
        store.getSimulationStatus(simulationId);
        break;
      
      case 'completed':
        store.getSimulationStatus(simulationId);
        store.getSimulationResults(simulationId);
        break;
      
      case 'failed':
        store.setError(data.data.error_message || 'Simulação falhou');
        store.getSimulationStatus(simulationId);
        break;
      
      case 'cancelled':
        store.getSimulationStatus(simulationId);
        break;
    }
  });
}

// ========== EFEITOS E SUBSCRIÇÕES ==========

// Limpar monitoramento quando a simulação for concluída ou limpa
useSimulationStore.subscribe(
  (state) => state.currentSimulation?.status,
  (status, prevStatus) => {
    if (prevStatus && 
        (status === SimulationStatus.COMPLETED || 
         status === SimulationStatus.FAILED || 
         status === SimulationStatus.CANCELLED)) {
      if (monitoringService) {
        monitoringService.disconnect();
        monitoringService = null;
      }
    }
  }
);

// Limpar monitoramento quando a simulação for limpa
useSimulationStore.subscribe(
  (state) => state.currentSimulation,
  (current) => {
    if (!current && monitoringService) {
      monitoringService.disconnect();
      monitoringService = null;
    }
  }
);

// Salvar estado no localStorage (persistence básica)
useSimulationStore.subscribe(
  (state) => ({
    simulations: state.simulations,
    templates: state.templates
  }),
  (state) => {
    try {
      localStorage.setItem('simulation_state', JSON.stringify(state));
    } catch (error) {
      console.warn('Erro ao salvar estado da simulação:', error);
    }
  }
);

// Recuperar estado do localStorage na inicialização
if (typeof window !== 'undefined') {
  try {
    const savedState = localStorage.getItem('simulation_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      useSimulationStore.setState({
        simulations: parsed.simulations || [],
        templates: parsed.templates || []
      });
    }
  } catch (error) {
    console.warn('Erro ao recuperar estado da simulação:', error);
  }
}

// ========== EXPORTAR HOOKS CUSTOMIZADOS ==========

export const useSimulationActions = () => useSimulationStore((state) => ({
  createSimulation: state.createSimulation,
  getSimulationStatus: state.getSimulationStatus,
  getSimulationResults: state.getSimulationResults,
  deleteSimulation: state.deleteSimulation,
  getSimulationHistory: state.getSimulationHistory,
  getTemplates: state.getTemplates,
  validateParameters: state.validateParameters,
  compareSimulations: state.compareSimulations,
  generateQualityReport: state.generateQualityReport,
  clearCurrentSimulation: state.clearCurrentSimulation,
  updateProgress: state.updateProgress,
  setLoading: state.setLoading,
  setError: state.setError,
  clearCache: state.clearCache
}));

export const useSimulationState = () => useSimulationStore((state) => ({
  currentSimulation: state.currentSimulation,
  simulations: state.simulations,
  templates: state.templates,
  isLoading: state.isLoading,
  error: state.error,
  progress: state.progress,
  result: state.result
}));

export const useSimulationSelectors = () => useSimulationStore((state) => ({
  getFilteredSimulations: state.getFilteredSimulations,
  getRunningSimulations: state.getRunningSimulations,
  getCompletedSimulations: state.getCompletedSimulations,
  getSimulationById: state.getSimulationById,
  getSimulationStats: state.getSimulationStats,
  getProgressColor: state.getProgressColor,
  getEstimatedTime: state.getEstimatedTime,
  isCurrentSimulation: state.isCurrentSimulation,
  hasSimulationProgress: state.hasSimulationProgress,
  shouldShowProgress: state.shouldShowProgress,
  canDownloadResults: state.canDownloadResults
}));

export default useSimulationStore;