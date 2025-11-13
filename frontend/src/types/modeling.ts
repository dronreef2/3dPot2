"""
3dPot v2.0 - Tipos TypeScript para Modelagem 3D
================================================

Este módulo define os tipos TypeScript para operações de modelagem 3D
no frontend, incluindo especificações, respostas e estados.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

// Tipos base para modelagem 3D
export enum ModelingEngine {
  CADQUERY = "cadquery",
  OPENSCAD = "openscad"
}

export enum ModelFormat {
  STL = "stl",
  OBJ = "obj",
  STEP = "step"
}

export enum ModelCategory {
  MECANICO = "mecanico",
  ELETRONICO = "eletronico",
  MISTO = "misto",
  ARQUITETURA = "arquitetura"
}

export enum MaterialType {
  PLA = "PLA",
  ABS = "ABS",
  PETG = "PETG",
  NYLON = "nylon",
  METAL = "metal",
  RESINA = "resina"
}

// Especificações para modelagem 3D
export interface ModelDimensions {
  largura: number;
  altura: number;
  profundidade: number;
}

export interface ModelComponent {
  tipo: string;
  nome: string;
  especificacoes: Record<string, any>;
  posicao?: { x: number; y: number; z: number };
}

export interface ModelFeature {
  nome: string;
  tipo: string;
  parametros: Record<string, any>;
  posicao?: { x: number; y: number; z: number };
}

export interface ModelSpecs {
  category: ModelCategory;
  material: MaterialType;
  dimensions: ModelDimensions;
  additional_specs?: Record<string, any>;
  components?: ModelComponent[];
  features?: ModelFeature[];
}

// Requisições para a API
export interface ModelingRequest {
  specs: ModelSpecs;
  project_id?: string;
  engine?: ModelingEngine;
  format?: ModelFormat;
}

// Respostas da API
export interface PrintabilityReport {
  printable: boolean;
  warnings: string[];
  errors: string[];
  metrics: {
    volume_mm3: number;
    surface_area_mm2: number;
    vertices: number;
    faces: number;
    file_size_bytes: number;
    dimensions_mm: {
      x: number;
      y: number;
      z: number;
    };
  };
}

export interface ModelingResponse {
  success: boolean;
  model_path?: string;
  engine_used?: string;
  format_used?: string;
  message: string;
  specs?: Record<string, any>;
  validation_passed: boolean;
  printability_report?: PrintabilityReport;
  generation_time: number;
}

export interface ModelingStatus {
  model_id: string;
  file_exists: boolean;
  file_path?: string;
  file_size?: number;
  validation: Record<string, any>;
  specs: Record<string, any>;
  last_modified: number;
}

export interface ModelFormatResponse {
  engine: string;
  formats: string[];
}

export interface ModelingTemplate {
  id: string;
  name: string;
  description: string;
  category: ModelCategory;
  default_engine: ModelingEngine;
  default_format: ModelFormat;
  required_specs: string[];
  optional_specs: string[];
}

// Estados do frontend
export interface ModelingState {
  // Estado atual
  currentModel: ModelingResponse | null;
  modelingStatus: ModelingStatus | null;
  availableEngines: string[];
  availableFormats: Record<string, string[]>;
  templates: ModelingTemplate[];
  
  // Estados de carregamento
  isGenerating: boolean;
  isValidating: boolean;
  isLoading: boolean;
  
  // Estados de erro
  error: string | null;
  validationErrors: string[];
  
  // Histórico
  modelHistory: ModelingResponse[];
  
  // Preferências do usuário
  preferredEngine: ModelingEngine;
  preferredFormat: ModelFormat;
}

// Ações do store
export interface ModelingActions {
  // Geração de modelos
  generateModel: (request: ModelingRequest) => Promise<void>;
  generateBatchModels: (requests: ModelingRequest[]) => Promise<void>;
  
  // Status e validação
  checkModelStatus: (modelId: string) => Promise<void>;
  validateModel: (modelId: string) => Promise<void>;
  
  // Gerenciamento de arquivos
  downloadModel: (modelId: string, format?: ModelFormat) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
  
  // Configuração
  loadAvailableEngines: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  
  // Utilitários
  resetModeling: () => void;
  setError: (error: string | null) => void;
  setPreferredEngine: (engine: ModelingEngine) => void;
  setPreferredFormat: (format: ModelFormat) => void;
}

// Propriedades do componente ModelViewer
export interface ModelViewerProps {
  modelPath?: string;
  fileUrl?: string;
  onModelLoad?: (model: any) => void;
  onModelError?: (error: string) => void;
  onModelInteraction?: (interaction: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Estados de carregamento do visualizador
export interface ViewerState {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  modelLoaded: boolean;
  cameraPosition: [number, number, number];
  controlsEnabled: boolean;
}

// Propriedades do componente de especificação
export interface ModelSpecsFormProps {
  specs: ModelSpecs;
  onSpecsChange: (specs: ModelSpecs) => void;
  onGenerate: (request: ModelingRequest) => void;
  isGenerating?: boolean;
  templates?: ModelingTemplate[];
  onTemplateSelect?: (template: ModelingTemplate) => void;
  className?: string;
}

// Propriedades do componente de resultado
export interface ModelingResultProps {
  result: ModelingResponse;
  onDownload: (format?: ModelFormat) => void;
  onRegenerate: () => void;
  onValidate: () => void;
  className?: string;
}

// Dados para exibição em tabela
export interface ModelInfoData {
  id: string;
  name: string;
  category: ModelCategory;
  material: MaterialType;
  engine: ModelingEngine;
  format: ModelFormat;
  file_size: number;
  created_at: string;
  printable: boolean;
  volume?: number;
  vertices?: number;
  faces?: number;
}

// Eventos personalizados
export interface ModelGenerationEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  payload: {
    modelId?: string;
    progress?: number;
    message?: string;
    error?: string;
    result?: ModelingResponse;
  };
}

export interface ModelValidationEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  payload: {
    modelId: string;
    progress?: number;
    report?: PrintabilityReport;
    error?: string;
  };
}

// Configurações do visualizador 3D
export interface ViewerConfig {
  backgroundColor: string;
  gridVisible: boolean;
  axesVisible: boolean;
  wireframe: boolean;
  transparent: boolean;
  opacity: number;
  autoRotate: boolean;
  showStats: boolean;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  lighting: {
    ambient: { intensity: number; color: string };
    directional: { intensity: number; color: string; position: [number, number, number] };
  };
}

// Resposta da geração em lote
export interface BatchModelingResponse {
  total_requests: number;
  successful: number;
  failed: number;
  results: Array<{
    request_id?: string;
    success: boolean;
    model_path?: string;
    message: string;
    generation_time: number;
  }>;
}

// Eventos do componente de modelagem
export interface ModelingComponentEvent {
  component: string;
  action: string;
  data?: any;
  timestamp: number;
}

// Estado do modelo no visualizador
export interface Model3DState {
  geometry: any | null;
  material: any | null;
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  metrics: {
    volume: number;
    surfaceArea: number;
    dimensions: ModelDimensions;
  };
  isValid: boolean;
  warnings: string[];
  errors: string[];
}