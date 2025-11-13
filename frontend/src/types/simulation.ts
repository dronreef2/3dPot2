/**
 * Tipos TypeScript para Sistema de Simulação Física
 * Definições de tipos para frontend React
 */

// ========== ENUMS ==========

export enum SimulationType {
  DROP_TEST = "drop_test",
  STRESS_TEST = "stress_test", 
  MOTION = "motion",
  FLUID = "fluid"
}

export enum SimulationStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export enum TemplateCategory {
  BASIC = "basic",
  COMPREHENSIVE = "comprehensive", 
  MECHANICAL = "mechanical",
  DYNAMIC = "dynamic",
  FLUID = "fluid"
}

// ========== CONFIGURAÇÕES DE SIMULAÇÃO ==========

export interface DropTestConfig {
  drop_height: number;        // metros
  num_drops: number;          // número de testes
  gravity: number;           // m/s²
  surface_type: string;      // tipo de superfície
  restitution?: number;      // coeficiente de restituição
}

export interface StressTestConfig {
  max_force: number;         // Newtons
  force_increment: number;   // Newtons
  force_direction: number[]; // [x, y, z]
  test_duration: number;     // segundos
}

export interface MotionTestConfig {
  trajectory_type: string;   // circular, linear, figure_8
  duration: number;          // segundos
  velocity: number;          // m/s
  radius?: number;           // metros (para circular)
  acceleration?: number;     // m/s²
}

export interface FluidTestConfig {
  fluid_density: number;     // kg/m³
  drag_coefficient: number;  // coeficiente de arrasto
  viscosity?: number;        // viscosidade dinâmica
  flow_direction?: number[]; // direção do fluxo
}

export type SimulationConfig = DropTestConfig | StressTestConfig | MotionTestConfig | FluidTestConfig;

// ========== INTERFACES DE REQUISIÇÃO ==========

export interface SimulationCreateRequest {
  modelo_3d_id: string;
  nome: string;
  tipo_simulacao: SimulationType;
  parametros: Record<string, any>;
  condicoes_iniciais?: Record<string, any>;
}

export interface SimulationPreviewRequest {
  tipo_simulacao: SimulationType;
  parametros: Record<string, any>;
}

// ========== INTERFACES DE RESPOSTA ==========

export interface SimulationResponse {
  id: string;
  nome: string;
  tipo_simulacao: SimulationType;
  status: SimulationStatus;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  model_3d_id: string;
  parametros: Record<string, any>;
  results?: Record<string, any>;
  error_message?: string;
  progress?: number;
  estimated_completion?: string;
  warning_messages: string[];
}

export interface SimulationStatusResponse {
  simulation_id: string;
  status: SimulationStatus;
  progress: number;
  estimated_completion?: string;
  error_message?: string;
  last_updated: string;
}

export interface SimulationResult {
  simulation_id: string;
  tipo_simulacao: SimulationType;
  status: SimulationStatus;
  results: Record<string, any>;
  created_at: string;
  completed_at?: string;
  duration?: number;
  metadata: Record<string, any>;
}

export interface SimulationTemplate {
  id: string;
  nome: string;
  tipo_simulacao: SimulationType;
  descricao: string;
  parametros: Record<string, any>;
  category: TemplateCategory;
  is_default: boolean;
}

export interface ValidationResult {
  simulation_id?: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggested_parameters: Record<string, any>;
}

// ========== RESULTADOS ESPECÍFICOS POR TIPO ==========

export interface DropTestResult {
  tipo: "drop_test";
  testes: Array<{
    numero_teste: number;
    altura_queda: number;
    velocidade_impacto: number;
    tempo_impacto: number;
    posicao_impacto: [number, number, number];
    rebotes: number;
    tempo_ate_repouso: number;
  }>;
  metricas: {
    velocidade_impacto_media: number;
    velocidade_impacto_max: number;
    velocidade_impacto_min: number;
    rebotes_medio: number;
    numero_testes: number;
    classificacao_resistencia: "resistente" | "moderado" | "frágil";
  };
  duracao_total: number;
}

export interface StressTestResult {
  tipo: "stress_test";
  testes_forca: Array<{
    forca: number;
    posicao_final: [number, number, number];
    velocidade_final: [number, number, number];
    deslocamento: number;
  }>;
  metricas: {
    forca_maxima: number;
    deslocamento_maximo: number;
    rigidez_calculada: number;
    ponto_ruptura?: number;
    classificacao_resistencia: "muito_resistente" | "resistente" | "moderado" | "frágil";
  };
  ponto_ruptura?: number;
}

export interface MotionTestResult {
  tipo: "motion_test";
  trajetoria: Array<{
    tempo: number;
    posicao: [number, number, number];
    energia_potencial: number;
  }>;
  metricas: {
    energia_total: number;
    distancia_percorrida: number;
    velocidade_media: number;
    estabilidade: "estável" | "moderadamente_estável" | "instável";
  };
  energia_consumida: number;
}

export interface FluidTestResult {
  tipo: "fluid_test";
  resistencia: Array<{
    velocidade: number;
    forca_arrasto: number;
  }>;
  metricas: {
    velocidade_terminal: number;
    coeficiente_arrasto: number;
    classificacao_aerodinamica: "aerodinâmico" | "moderado" | "arrasto_alto";
  };
}

// ========== INTERFACES DE ESTADO ==========

export interface SimulationState {
  currentSimulation: SimulationResponse | null;
  simulations: SimulationResponse[];
  templates: SimulationTemplate[];
  isLoading: boolean;
  error: string | null;
  progress: number;
  result: SimulationResult | null;
}

export interface SimulationStore extends SimulationState {
  // Actions
  createSimulation: (request: SimulationCreateRequest) => Promise<void>;
  getSimulationStatus: (id: string) => Promise<void>;
  getSimulationResults: (id: string) => Promise<void>;
  deleteSimulation: (id: string) => Promise<void>;
  getSimulationHistory: (params?: HistoryParams) => Promise<void>;
  getTemplates: () => Promise<void>;
  validateParameters: (id: string) => Promise<ValidationResult>;
  
  // UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCurrentSimulation: () => void;
  updateProgress: (progress: number) => void;
}

export interface HistoryParams {
  limit?: number;
  offset?: number;
  status_filter?: SimulationStatus;
  tipo_filter?: SimulationType;
}

// ========== INTERFACES DE COMPONENTES ==========

export interface SimulationConfigProps {
  tipo_simulacao: SimulationType;
  parametros: Record<string, any>;
  onChange: (parametros: Record<string, any>) => void;
  validation?: ValidationResult;
  isLoading?: boolean;
}

export interface SimulationResultsProps {
  result: SimulationResult;
  onDownload?: (format: "json" | "pdf") => void;
  onCompare?: () => void;
}

export interface SimulationViewerProps {
  model3d_url?: string;
  simulation_data?: any;
  isRunning?: boolean;
  showControls?: boolean;
  onExport?: (format: string) => void;
}

export interface TemplateSelectorProps {
  templates: SimulationTemplate[];
  onSelect: (template: SimulationTemplate) => void;
  selectedId?: string;
  filter_category?: TemplateCategory;
}

export interface ProgressIndicatorProps {
  progress: number;
  status: SimulationStatus;
  estimated_completion?: string;
  error_message?: string;
  showSpinner?: boolean;
}

// ========== INTERFACES DE MONITORAMENTO ==========

export interface SimulationProgress {
  simulation_id: string;
  status: SimulationStatus;
  progress_percentage: number;
  current_step: string;
  estimated_remaining_time?: number;
  steps_total: number;
  steps_completed: number;
}

export interface SimulationMetrics {
  execution_time: number;
  memory_usage?: number;
  cpu_usage?: number;
  iterations_per_second?: number;
  convergence_status?: string;
}

// ========== INTERFACES DE ANÁLISE ==========

export interface SimulationSummary {
  id: string;
  nome: string;
  tipo_simulacao: SimulationType;
  status: SimulationStatus;
  created_at: string;
  model_3d_name: string;
  key_results: Record<string, any>;
}

export interface SimulationAnalysis {
  simulation_id: string;
  summary: SimulationSummary;
  results: DropTestResult | StressTestResult | MotionTestResult | FluidTestResult;
  recommendations: string[];
  quality_score: number; // 0-10
  printable: boolean;
  design_improvements: string[];
}

export interface ComparativeAnalysis {
  model_id: string;
  simulations: SimulationSummary[];
  comparison_metrics: Record<string, any>;
  best_simulation_id?: string;
  trends: Record<string, any>;
  recommendations: string[];
}

// ========== INTERFACES DE CONFIGURAÇÃO AVANÇADA ==========

export interface AdvancedSimulationConfig {
  physics_engine: string;
  time_step: number;
  max_iterations: number;
  convergence_threshold: number;
  parallel_processing: boolean;
  gpu_acceleration: boolean;
  custom_physics: Record<string, any>;
}

export interface MaterialProperties {
  nome: string;
  categoria: string;
  densidade: number;
  modulo_young: number;
  coeficiente_poisson: number;
  resistencia_tracao: number;
  resistencia_compressao: number;
  limite_escoamento: number;
  temperatura_filamento?: number;
  temperatura_cama?: number;
  velocidade_impressao?: number;
  confiabilidade: "high" | "medium" | "low";
}

// ========== INTERFACES DE WEBSOCKET ==========

export interface SimulationUpdateMessage {
  type: "progress" | "completed" | "failed" | "cancelled";
  simulation_id: string;
  data: {
    progress?: number;
    status?: SimulationStatus;
    current_step?: string;
    error_message?: string;
    results?: Record<string, any>;
  };
  timestamp: string;
}

// ========== INTERFACES DE VALIDAÇÃO ==========

export interface ValidationRule {
  field: string;
  type: "range" | "required" | "custom" | "enum";
  params: Record<string, any>;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationConfig {
  tipo_simulacao: SimulationType;
  rules: ValidationRule[];
  custom_validator?: (parametros: Record<string, any>) => ValidationResult;
}

// ========== INTERFACES DE EXPORTAÇÃO ==========

export interface SimulationExportRequest {
  simulation_ids: string[];
  format: "json" | "csv" | "pdf";
  include_raw_data: boolean;
  include_visualizations: boolean;
}

export interface ExportOptions {
  format: "json" | "csv" | "pdf" | "stl";
  include_metadata: boolean;
  include_charts: boolean;
  compression: boolean;
}

// ========== INTERFACES DE CACHE ==========

export interface SimulationCache {
  key: string;
  result: SimulationResult;
  created_at: string;
  expires_at: string;
  hit_count: number;
  model_hash: string;
  parameters_hash: string;
}

export interface CacheStats {
  total_keys: number;
  hit_rate: number;
  avg_size: number;
  oldest_entry: string;
  newest_entry: string;
}

// ========== TIPOS UTILITÁRIOS ==========

export type SimulationTypeConfig = {
  [key in SimulationType]: {
    schema: any;
    default_params: Record<string, any>;
    validation_rules: ValidationRule[];
  };
};

export type ResultTypeMap = {
  [SimulationType.DROP_TEST]: DropTestResult;
  [SimulationType.STRESS_TEST]: StressTestResult;
  [SimulationType.MOTION]: MotionTestResult;
  [SimulationType.FLUID]: FluidTestResult;
};

export type ConfigTypeMap = {
  [SimulationType.DROP_TEST]: DropTestConfig;
  [SimulationType.STRESS_TEST]: StressTestConfig;
  [SimulationType.MOTION]: MotionTestConfig;
  [SimulationType.FLUID]: FluidTestConfig;
};