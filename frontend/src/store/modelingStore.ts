"""
3dPot v2.0 - Store Zustand para Modelagem 3D
============================================

Este módulo implementa o store Zustand para gerenciamento de estado
da modelagem 3D no frontend.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { modelingApi, createDefaultModelSpecs } from '../services/modelingApi';
import {
  ModelingState,
  ModelingActions,
  ModelingRequest,
  ModelingResponse,
  ModelingStatus,
  ModelingTemplate,
  ModelSpecs,
  ModelingEngine,
  ModelFormat,
  BatchModelingResponse
} from '../types/modeling';

// Estado inicial
const initialState: ModelingState & ModelingActions = {
  // Estado atual
  currentModel: null,
  modelingStatus: null,
  availableEngines: [],
  availableFormats: {},
  templates: [],
  
  // Estados de carregamento
  isGenerating: false,
  isValidating: false,
  isLoading: false,
  
  // Estados de erro
  error: null,
  validationErrors: [],
  
  // Histórico
  modelHistory: [],
  
  // Preferências do usuário
  preferredEngine: ModelingEngine.CADQUERY,
  preferredFormat: ModelFormat.STL,

  // Ações
  generateModel: async () => {},
  generateBatchModels: async () => {},
  checkModelStatus: async () => {},
  validateModel: async () => {},
  downloadModel: async () => {},
  deleteModel: async () => {},
  loadAvailableEngines: async () => {},
  loadTemplates: async () => {},
  resetModeling: () => {},
  setError: () => {},
  setPreferredEngine: () => {},
  setPreferredFormat: () => {}
};

// Funções auxiliares
const generateModelId = (): string => {
  return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const addToHistory = (history: ModelingResponse[], newModel: ModelingResponse): ModelingResponse[] => {
  // Remover modelos duplicados baseado no model_path
  const filtered = history.filter(model => model.model_path !== newModel.model_path);
  
  // Adicionar no início e limitar o histórico
  const updated = [newModel, ...filtered].slice(0, 10);
  
  return updated;
};

// Store principal
export const useModelingStore = create<ModelingState & ModelingActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Geração de modelos
        generateModel: async (request: ModelingRequest) => {
          set({ isGenerating: true, error: null });
          
          try {
            // Definir ID único para o modelo
            const modelId = generateModelId();
            const enhancedRequest = {
              ...request,
              project_id: request.project_id || modelId
            };

            // Chamar API
            const result = await modelingApi.generateModel(enhancedRequest);
            
            // Atualizar estado
            set((state) => ({
              currentModel: result,
              modelHistory: addToHistory(state.modelHistory, result),
              isGenerating: false
            }));

            // Verificar status do modelo
            if (result.success && result.model_path) {
              get().checkModelStatus(modelId);
            }

            return result;
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            set({ 
              error: errorMessage, 
              isGenerating: false 
            });
            throw error;
          }
        },

        // Geração em lote
        generateBatchModels: async (requests: ModelingRequest[]) => {
          set({ isGenerating: true, error: null });
          
          try {
            const result = await modelingApi.batchGenerateModels(requests);
            
            // Adicionar modelos bem-sucedidos ao histórico
            const successfulModels = result.results
              .filter(r => r.success && r.model_path)
              .map(r => ({
                success: r.success,
                model_path: r.model_path,
                message: r.message,
                generation_time: r.generation_time,
                engine_used: ModelingEngine.CADQUERY,
                format_used: ModelFormat.STL,
                validation_passed: false
              } as ModelingResponse));
            
            set((state) => ({
              modelHistory: [...state.modelHistory, ...successfulModels],
              isGenerating: false
            }));

            return result;
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro na geração em lote';
            set({ 
              error: errorMessage, 
              isGenerating: false 
            });
            throw error;
          }
        },

        // Verificar status do modelo
        checkModelStatus: async (modelId: string) => {
          set({ isLoading: true });
          
          try {
            const status = await modelingApi.getModelingStatus(modelId);
            
            set((state) => ({
              modelingStatus: status,
              isLoading: false
            }));

            return status;
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar status';
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
            throw error;
          }
        },

        // Validar modelo
        validateModel: async (modelId: string) => {
          set({ isValidating: true, validationErrors: [] });
          
          try {
            const validation = await modelingApi.validateModel(modelId);
            
            // Extrair erros e avisos
            const errors = validation.validation?.errors || [];
            const warnings = validation.validation?.warnings || [];
            
            set((state) => ({
              validationErrors: [...errors, ...warnings],
              isValidating: false
            }));

            return validation;
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro na validação';
            set({ 
              error: errorMessage, 
              isValidating: false 
            });
            throw error;
          }
        },

        // Download do modelo
        downloadModel: async (modelId: string, format?: ModelFormat) => {
          try {
            await modelingApi.triggerDownload(modelId, format);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro no download';
            set({ error: errorMessage });
            throw error;
          }
        },

        // Excluir modelo
        deleteModel: async (modelId: string) => {
          try {
            await modelingApi.deleteModel(modelId);
            
            // Remover do histórico se existir
            set((state) => ({
              modelHistory: state.modelHistory.filter(model => 
                !model.model_path?.includes(modelId)
              ),
              currentModel: state.currentModel?.model_path?.includes(modelId) 
                ? null 
                : state.currentModel
            }));

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir modelo';
            set({ error: errorMessage });
            throw error;
          }
        },

        // Carregar engines disponíveis
        loadAvailableEngines: async () => {
          try {
            const engines = await modelingApi.getAvailableEngines();
            
            // Carregar formatos para cada engine
            const formats: Record<string, string[]> = {};
            for (const engine of engines) {
              try {
                const formatResponse = await modelingApi.getSupportedFormats(engine);
                formats[engine] = formatResponse.formats;
              } catch (error) {
                console.warn(`Erro ao carregar formatos para ${engine}:`, error);
                formats[engine] = [];
              }
            }
            
            set({
              availableEngines: engines,
              availableFormats: formats
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar engines';
            set({ error: errorMessage });
            throw error;
          }
        },

        // Carregar templates
        loadTemplates: async () => {
          try {
            const templates = await modelingApi.getModelingTemplates();
            set({ templates });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar templates';
            set({ error: errorMessage });
            // Não lancar erro para templates, apenas logar
            console.error(errorMessage);
          }
        },

        // Reset do estado
        resetModeling: () => {
          set({
            currentModel: null,
            modelingStatus: null,
            isGenerating: false,
            isValidating: false,
            isLoading: false,
            error: null,
            validationErrors: []
          });
        },

        // Definir erro
        setError: (error: string | null) => {
          set({ error });
        },

        // Definir engine preferido
        setPreferredEngine: (engine: ModelingEngine) => {
          set({ preferredEngine: engine });
        },

        // Definir formato preferido
        setPreferredFormat: (format: ModelFormat) => {
          set({ preferredFormat: format });
        }
      }),
      {
        name: 'modeling-store',
        partialize: (state) => ({
          // Persistir apenas configurações do usuário
          preferredEngine: state.preferredEngine,
          preferredFormat: state.preferredFormat,
          modelHistory: state.modelHistory.slice(0, 5) // Persistir apenas 5 últimos modelos
        })
      }
    ),
    { name: 'modeling-store' }
  )
);

// Seletores customizados
export const useCurrentModel = () => useModelingStore((state) => state.currentModel);
export const useModelingStatus = () => useModelingStore((state) => state.modelingStatus);
export const useAvailableEngines = () => useModelingStore((state) => state.availableEngines);
export const useModelingHistory = () => useModelingStore((state) => state.modelHistory);
export const useModelingLoading = () => useModelingStore((state) => state.isGenerating);
export const useModelingError = () => useModelingStore((state) => state.error);

// Hook para geração rápida
export const useQuickModelGeneration = () => {
  const generateModel = useModelingStore((state) => state.generateModel);
  const preferredEngine = useModelingStore((state) => state.preferredEngine);
  const preferredFormat = useModelingStore((state) => state.preferredFormat);

  const generateFromSpecs = async (
    specs: ModelSpecs,
    projectId?: string
  ): Promise<ModelingResponse> => {
    const request: ModelingRequest = {
      specs,
      project_id: projectId,
      engine: preferredEngine,
      format: preferredFormat
    };

    return generateModel(request);
  };

  return { generateFromSpecs, preferredEngine, preferredFormat };
};

// Hook para validação
export const useModelValidation = () => {
  const validateModel = useModelingStore((state) => state.validateModel);
  const isValidating = useModelingStore((state) => state.isValidating);
  const validationErrors = useModelingStore((state) => state.validationErrors);

  const validateAndCheck = async (modelId: string) => {
    const result = await validateModel(modelId);
    
    // Analisar resultado da validação
    const printabilityReport = result.printability || result.validation;
    const isPrintable = modelingApi.isModelPrintable(printabilityReport);
    const metrics = modelingApi.extractModelMetrics(printabilityReport);
    
    return {
      result,
      isPrintable,
      metrics,
      errors: validationErrors
    };
  };

  return {
    validateAndCheck,
    isValidating,
    validationErrors
  };
};

// Utilitários para criação de especificações comuns
export const createMechanicalSpecs = (
  dimensions: { largura: number; altura: number; profundidade: number },
  material: string = 'PLA',
  features?: any[]
): ModelSpecs => ({
  category: 'mecanico' as any,
  material: material as any,
  dimensions,
  features: features || [
    {
      nome: 'furos_fixacao',
      tipo: 'furo',
      diametro: 5,
      posicao: { x: 0, y: 0 }
    }
  ],
  components: [],
  additional_specs: {
    tolerancia: 0.1,
    acabamento: 'liso'
  }
});

export const createElectronicSpecs = (
  dimensions: { largura: number; altura: number; profundidade: number },
  material: string = 'PLA'
): ModelSpecs => ({
  category: 'eletronico' as any,
  material: material as any,
  dimensions,
  features: [
    {
      nome: 'ventilacao',
      tipo: 'furo',
      diametro: 3,
      posicao: { x: 0, y: 0 }
    }
  ],
  components: [],
  additional_specs: {
    ventilacao: true,
    acesso_conectores: true
  }
});

export default useModelingStore;