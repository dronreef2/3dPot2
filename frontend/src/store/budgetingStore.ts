/**
 * Store Zustand - Sistema de Orçamento Automatizado Inteligente - Sprint 5
 * Gerenciamento de estado global para orçamentos
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { 
  IntelligentBudgetResponse, 
  MaterialRecommendation, 
  SupplierComparison, 
  Slant3DQuote,
  BudgetTimeline,
  BudgetUpdate,
  BudgetState,
  BudgetActions,
  BudgetSelectors,
  BudgetConfig
} from '../types/budgeting';
import budgetingApi from '../services/budgetingApi';

const defaultConfig: BudgetConfig = {
  api_base_url: '/api/v1/budgeting',
  websocket_url: '/api/v1/budgeting/updates',
  cache_ttl: 5 * 60 * 1000, // 5 minutos
  max_cache_size: 100,
  default_currency: 'BRL',
  decimal_places: 2,
  excellent_threshold: 90,
  good_threshold: 75,
  acceptable_threshold: 60,
  max_budgets_per_user: 50,
  max_items_per_budget: 100,
  default_margin: 25,
};

// Estado inicial
const initialState: Omit<BudgetState, 'actions' | 'selectors'> = {
  budgets: [],
  current_budget: null,
  loading: false,
  error: null,
  simulation_integration: null,
  quality_metrics: null,
  material_recommendations: [],
  supplier_comparisons: null,
  slant3d_quotes: [],
  timeline: [],
  budget_cache: {},
  last_updated: null,
};

// Store principal
export const useBudgetStore = create<BudgetState & BudgetActions & BudgetSelectors>()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialState,
      
      // ========== AÇÕES PRINCIPAIS ==========

      // CRUD Operations
      createBudget: async (data) => {
        set({ loading: true, error: null });
        
        try {
          const newBudget = await budgetingApi.createIntelligentBudget(data);
          
          set((state) => ({
            budgets: [newBudget, ...state.budgets],
            current_budget: newBudget,
            loading: false,
            last_updated: new Date().toISOString()
          }));

          return newBudget;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      getBudget: async (id) => {
        // Verificar cache primeiro
        const cached = get().budgets.find(b => b.id === id);
        if (cached) {
          set({ current_budget: cached });
          return cached;
        }

        set({ loading: true, error: null });
        
        try {
          const budget = await budgetingApi.getBudgetDetails(id);
          
          set((state) => ({
            budgets: [...state.budgets.filter(b => b.id !== id), budget],
            current_budget: budget,
            loading: false,
            last_updated: new Date().toISOString()
          }));

          return budget;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar orçamento';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      updateBudget: async (id, data) => {
        set({ loading: true, error: null });
        
        try {
          // Para simplificação, usar recalculate para updates
          const updatedBudget = await budgetingApi.recalculateBudget(id, {
            new_margin: data.margem_lucro_percentual
          } as any);
          
          set((state) => ({
            budgets: state.budgets.map(b => b.id === id ? updatedBudget : b),
            current_budget: state.current_budget?.id === id ? updatedBudget : state.current_budget,
            loading: false,
            last_updated: new Date().toISOString()
          }));

          return updatedBudget;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar orçamento';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      deleteBudget: async (id) => {
        set({ loading: true, error: null });
        
        try {
          await budgetingApi.deleteBudget(id);
          
          set((state) => ({
            budgets: state.budgets.filter(b => b.id !== id),
            current_budget: state.current_budget?.id === id ? null : state.current_budget,
            loading: false,
            last_updated: new Date().toISOString()
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir orçamento';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Recálculo
      recalculateBudget: async (id, data) => {
        set({ loading: true, error: null });
        
        try {
          const updatedBudget = await budgetingApi.recalculateBudget(id, data);
          
          set((state) => ({
            budgets: state.budgets.map(b => b.id === id ? updatedBudget : b),
            current_budget: state.current_budget?.id === id ? updatedBudget : state.current_budget,
            loading: false,
            last_updated: new Date().toISOString()
          }));

          return updatedBudget;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao recalcular orçamento';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // ========== MATERIAIS ==========

      getMaterialRecommendations: async (budget_id) => {
        try {
          const recommendations = await budgetingApi.getMaterialRecommendations(budget_id);
          
          set({ material_recommendations: recommendations });
          return recommendations;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar recomendações de material';
          set({ error: errorMessage });
          throw error;
        }
      },

      compareMaterials: async (data) => {
        try {
          const comparison = await budgetingApi.compareMaterials(data);
          return comparison;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao comparar materiais';
          set({ error: errorMessage });
          throw error;
        }
      },

      // ========== FORNECEDORES ==========

      compareSuppliers: async (budget_id, criteria) => {
        set({ loading: true, error: null });
        
        try {
          const comparison = await budgetingApi.compareSuppliers(budget_id, criteria);
          
          set({
            supplier_comparisons: comparison,
            loading: false,
            last_updated: new Date().toISOString()
          });

          return comparison;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao comparar fornecedores';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      getSupplierRecommendations: async (data) => {
        try {
          const recommendations = await budgetingApi.getSupplierRecommendations(data);
          return recommendations;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar recomendações de fornecedores';
          set({ error: errorMessage });
          throw error;
        }
      },

      // ========== SLANT3D ==========

      getSlant3DQuote: async (data) => {
        try {
          const quote = await budgetingApi.getSlant3DQuote(data);
          
          set((state) => ({
            slant3d_quotes: [...state.slant3d_quotes, quote.quote]
          }));

          return quote.quote;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao obter cotação Slant3D';
          set({ error: errorMessage });
          throw error;
        }
      },

      checkAvailability: async (material, color, finish) => {
        try {
          return await budgetingApi.checkMaterialAvailability({
            material,
            color,
            finish_type: finish
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar disponibilidade';
          set({ error: errorMessage });
          throw error;
        }
      },

      estimateShipping: async (data) => {
        try {
          return await budgetingApi.estimateShipping(data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao estimar frete';
          set({ error: errorMessage });
          throw error;
        }
      },

      // ========== TIMELINE E RELATÓRIOS ==========

      getTimeline: async (budget_id) => {
        try {
          const timelineData = await budgetingApi.getBudgetTimeline(budget_id);
          
          set({ timeline: timelineData.timeline });
          return timelineData.timeline;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar cronograma';
          set({ error: errorMessage });
          throw error;
        }
      },

      generateReport: async (budget_id, options) => {
        set({ loading: true, error: null });
        
        try {
          const report = await budgetingApi.generateBudgetReport(budget_id, options);
          
          set({ loading: false });
          return report;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar relatório';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // ========== UTILITÁRIOS ==========

      clearError: () => {
        set({ error: null });
      },

      setCurrentBudget: (budget) => {
        set({ current_budget: budget });
      },

      updateFromWebSocket: (update: BudgetUpdate) => {
        set((state) => ({
          current_budget: state.current_budget?.id === update.budget_id 
            ? { ...state.current_budget, status: update.status }
            : state.current_budget,
          budgets: state.budgets.map(b => 
            b.id === update.budget_id 
              ? { ...b, status: update.status }
              : b
          )
        }));
      },

      // ========== SELETORES COMPUTADOS ==========

      // Filtros
      getBudgetsByStatus: (status) => {
        return get().budgets.filter(b => b.status === status);
      },

      getBudgetsByMaterial: (material) => {
        return get().budgets.filter(b => b.material_recomendado === material);
      },

      getBudgetsByDateRange: (startDate, endDate) => {
        return get().budgets.filter(b => {
          const budgetDate = new Date(b.bCriado_em || b.criado_em);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return budgetDate >= start && budgetDate <= end;
        });
      },

      // Estatísticas
      getAverageCost: () => {
        const budgets = get().budgets;
        if (budgets.length === 0) return 0;
        
        const total = budgets.reduce((sum, b) => sum + b.preco_final, 0);
        return total / budgets.length;
      },

      getMostUsedMaterial: () => {
        const budgets = get().budgets;
        const materialCount: Record<string, number> = {};
        
        budgets.forEach(b => {
          const material = b.material_recomendado;
          materialCount[material] = (materialCount[material] || 0) + 1;
        });

        return Object.keys(materialCount).reduce((a, b) => 
          materialCount[a] > materialCount[b] ? a : b
        , null);
      },

      getSuccessRate: () => {
        const budgets = get().budgets;
        if (budgets.length === 0) return 0;
        
        const successCount = budgets.filter(b => 
          b.status === 'approved' || b.status === 'calculated'
        ).length;
        
        return (successCount / budgets.length) * 100;
      },

      getTotalSavings: () => {
        // Implementar cálculo de economia baseado em comparações
        return 0; // Placeholder
      },

      // Ordenação
      getBudgetsSortedByCost: (ascending = true) => {
        return [...get().budgets].sort((a, b) => 
          ascending ? a.preco_final - b.preco_final : b.preco_final - a.preco_final
        );
      },

      getBudgetsSortedByQuality: (ascending = true) => {
        return [...get().budgets].sort((a, b) => 
          ascending ? a.quality_score - b.quality_score : b.quality_score - a.quality_score
        );
      },

      getBudgetsSortedByDate: (ascending = true) => {
        return [...get().budgets].sort((a, b) => {
          const dateA = new Date(a.criado_em);
          const dateB = new Date(b.criado_em);
          return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });
      }
    })),

    // Configuração de persistência
    {
      name: 'budgeting-store',
      partialize: (state) => ({
        budgets: state.budgets,
        current_budget: state.current_budget,
        last_updated: state.last_updated,
      }),
      version: 1,
    }
  )
);

// ========== STORE DE CACHE SEPARADO ==========

interface CacheState {
  cache: Record<string, { data: any; timestamp: number; ttl: number }>;
  maxCacheSize: number;
}

interface CacheActions {
  set: (key: string, data: any, ttl?: number) => void;
  get: <T>(key: string) => T | null;
  delete: (key: string) => void;
  clear: () => void;
  clearExpired: () => void;
  getStats: () => { size: number; keys: string[]; expired: number };
}

export const useBudgetCache = create<CacheState & CacheActions>()(
  persist(
    (set, get) => ({
      cache: {},
      maxCacheSize: defaultConfig.max_cache_size,

      set: (key, data, ttl = defaultConfig.cache_ttl) => {
        const state = get();
        const cache = { ...state.cache };
        
        // Limpar cache se estiver muito cheio
        if (Object.keys(cache).length >= state.maxCacheSize) {
          const oldestKey = Object.keys(cache).reduce((oldest, current) => 
            cache[current].timestamp < cache[oldest].timestamp ? current : oldest
          );
          delete cache[oldestKey];
        }

        cache[key] = {
          data,
          timestamp: Date.now(),
          ttl
        };

        set({ cache });
      },

      get: (key) => {
        const cached = get().cache[key];
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > cached.ttl;
        if (isExpired) {
          // Remove automaticamente se expirado
          const newCache = { ...get().cache };
          delete newCache[key];
          set({ cache: newCache });
          return null;
        }

        return cached.data;
      },

      delete: (key) => {
        const cache = { ...get().cache };
        delete cache[key];
        set({ cache });
      },

      clear: () => {
        set({ cache: {} });
      },

      clearExpired: () => {
        const cache = { ...get().cache };
        const now = Date.now();
        
        Object.keys(cache).forEach(key => {
          if (now - cache[key].timestamp > cache[key].ttl) {
            delete cache[key];
          }
        });

        set({ cache });
      },

      getStats: () => {
        const cache = get().cache;
        const now = Date.now();
        
        return {
          size: Object.keys(cache).length,
          keys: Object.keys(cache),
          expired: Object.keys(cache).filter(key => 
            now - cache[key].timestamp > cache[key].ttl
          ).length
        };
      }
    }),

    {
      name: 'budgeting-cache',
      partialize: (state) => ({ cache: state.cache })
    }
  )
);

// ========== HOOKS PERSONALIZADOS ==========

/**
 * Hook para usar apenas as ações do store
 */
export const useBudgetActions = () => {
  const store = useBudgetStore();
  return {
    ...store,
    // Filtrar apenas as ações
    budgets: undefined,
    current_budget: undefined,
    loading: undefined,
    error: undefined,
    simulation_integration: undefined,
    quality_metrics: undefined,
    material_recommendations: undefined,
    supplier_comparisons: undefined,
    slant3d_quotes: undefined,
    timeline: undefined,
    budget_cache: undefined,
    last_updated: undefined,
    // Seletores
    getBudgetsByStatus: undefined,
    getBudgetsByMaterial: undefined,
    getBudgetsByDateRange: undefined,
    getAverageCost: undefined,
    getMostUsedMaterial: undefined,
    getSuccessRate: undefined,
    getTotalSavings: undefined,
    getBudgetsSortedByCost: undefined,
    getBudgetsSortedByQuality: undefined,
    getBudgetsSortedByDate: undefined
  } as BudgetActions;
};

/**
 * Hook para usar apenas os seletores computados
 */
export const useBudgetSelectors = () => {
  const store = useBudgetStore();
  return {
    getBudgetsByStatus: store.getBudgetsByStatus,
    getBudgetsByMaterial: store.getBudgetsByMaterial,
    getBudgetsByDateRange: store.getBudgetsByDateRange,
    getAverageCost: store.getAverageCost,
    getMostUsedMaterial: store.getMostUsedMaterial,
    getSuccessRate: store.getSuccessRate,
    getTotalSavings: store.getTotalSavings,
    getBudgetsSortedByCost: store.getBudgetsSortedByCost,
    getBudgetsSortedByQuality: store.getBudgetsSortedByQuality,
    getBudgetsSortedByDate: store.getBudgetsSortedByDate
  } as BudgetSelectors;
};

/**
 * Hook para orçamento atual
 */
export const useCurrentBudget = () => {
  return useBudgetStore((state) => state.current_budget);
};

/**
 * Hook para lista de orçamentos
 */
export const useBudgets = () => {
  return useBudgetStore((state) => state.budgets);
};

/**
 * Hook para loading e error states
 */
export const useBudgetStatus = () => {
  return useBudgetStore((state) => ({
    loading: state.loading,
    error: state.error
  }));
};

// ========== MIDDLEWARE E EFEITOS ==========

/**
 * Middleware para limpar cache expirado periodicamente
 */
export const useBudgetCacheCleanup = (intervalMs: number = 60000) => {
  const clearExpired = useBudgetCache(state => state.clearExpired);
  
  React.useEffect(() => {
    // Limpar cache expirado imediatamente
    clearExpired();
    
    // Configurar limpeza periódica
    const interval = setInterval(() => {
      clearExpired();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [clearExpired, intervalMs]);
};

/**
 * Middleware para WebSocket em tempo real
 */
export const useBudgetWebSocket = (budgetId?: string) => {
  const updateFromWebSocket = useBudgetStore(state => state.updateFromWebSocket);
  const currentBudget = useCurrentBudget();
  
  React.useEffect(() => {
    if (!budgetId) return;

    const ws = budgetingApi.connectToWebSocket(budgetId, (update) => {
      updateFromWebSocket(update);
    });

    // Ping para manter conexão ativa
    const pingInterval = setInterval(() => {
      budgetingApi.pingWebSocket(ws);
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [budgetId, updateFromWebSocket]);
};

// Import React para os hooks
import React from 'react';

export default useBudgetStore;