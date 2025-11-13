/**
 * Tipos TypeScript - Sistema de Orçamento Automatizado Inteligente - Sprint 5
 * Tipos e interfaces para frontend React
 */

// ========== ENUMS ==========

export enum QualityScore {
  EXCELLENT = "excellent",      // 90-100
  GOOD = "good",               // 75-89
  ACCEPTABLE = "acceptable",   // 60-74
  POOR = "poor",               // 40-59
  FAILED = "failed"            // 0-39
}

export enum BudgetStatus {
  DRAFT = "draft",
  CALCULATED = "calculated",
  REVIEW = "review",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired"
}

export enum MaterialType {
  PLA = "PLA",
  ABS = "ABS",
  PETG = "PETG",
  NYLON = "Nylon",
  METAL = "Metal",
  COMPOSITE = "Composite",
  RESIN = "Resin",
  TPU = "TPU"
}

export enum SupplierType {
  PRINT_SERVICE = "print_service",
  MATERIALS = "materials",
  ELECTRONICS = "electronics",
  ASSEMBLY = "assembly",
  INTEGRATED = "integrated"
}

// ========== INTERFACES DE SIMULAÇÃO ==========

export interface SimulationIntegration {
  simulation_id?: string;
  quality_score: number;
  test_completion_rate: number;
  recommended_material?: string;
  performance_metrics: Record<string, any>;
  failure_points: string[];
}

export interface QualityBasedPricing {
  base_cost: number;
  quality_multiplier: number;
  adjusted_cost: number;
  quality_score: number;
  quality_classification: QualityScore;
  confidence_level: number;
}

// ========== SCHEMAS DE ENTRADA ==========

export interface IntelligentBudgetCreate {
  projeto_id: string;
  simulation_id?: string;
  margem_lucro_percentual?: number;
  observacoes?: string;
  urgente?: boolean;
  
  // Configurações avançadas
  forcar_material?: MaterialType;
  preco_maximo?: number;
}

export interface BudgetRecalculateRequest {
  new_quality_score?: number;
  new_margin?: number;
  include_simulation?: boolean;
}

export interface SupplierComparisonRequest {
  include_shipping?: boolean;
  max_suppliers?: number;
  region?: string;
}

export interface Slant3DQuoteRequest {
  model_id: string;
  material: MaterialType;
  quantity: number;
  finish_type?: string;
  color?: string;
}

// ========== INTERFACES DE RESPOSTA ==========

export interface MaterialRecommendation {
  material: MaterialType;
  confidence: number;
  reason: string;
  is_premium: boolean;
  estimated_cost?: number;
  performance_score?: number;
  alternatives: MaterialType[];
}

export interface BudgetItem {
  descricao: string;
  quantidade: string | number;
  preco_unitario: number;
  preco_total: number;
  fornecedor: string;
  confianca?: number;
  justificativa?: string;
  categoria?: string;
}

export interface BudgetSupplier {
  nome: string;
  url?: string;
  confiabilidade: number;
  tempo_entrega?: number;
  custo_frete?: number;
  rating?: number;
}

export interface QualityMetrics {
  overall_score: number;
  classification: QualityScore;
  test_results: Record<string, any>;
  recommendations: string[];
  warnings: string[];
  optimization_suggestions: string[];
}

export interface BudgetMargin {
  margem_base_percentual: number;
  margem_valor: number;
  quality_multiplier: number;
  adjusted_cost: number;
  final_price: number;
}

export interface BudgetTimeline {
  fase: string;
  duracao_horas: number;
  dependencia?: string;
  recursos: string[];
  marcos: string[];
}

export interface IntelligentBudgetResponse {
  id: string;
  projeto_id: string;
  simulation_id?: string;
  
  // Qualidade e classificação
  quality_score: number;
  quality_classification: QualityScore;
  quality_multiplier: number;
  
  // Custos
  custo_material: number;
  custo_componentes: number;
  custo_impressao: number;
  custo_mao_obra: number;
  preco_final: number;
  
  // Tempos
  tempo_impressao_horas: number;
  tempo_montagem_horas: number;
  tempo_entrega_estimado: number;
  
  // Detalhes
  itens_detalhados: BudgetItem[];
  fornecedores: BudgetSupplier[];
  margens_lucro: BudgetMargin;
  justificativas: string[];
  
  // Materiais e complexidade
  material_recomendado: string;
  complexidade_score: number;
  
  // Metadados
  status: BudgetStatus;
  criado_em: string;
  atualizado_em: string;
  
  // Qualificação
  simulation_integration?: SimulationIntegration;
  quality_metrics?: QualityMetrics;
  timeline: BudgetTimeline[];
}

// ========== API SLANT3D ==========

export interface Slant3DQuote {
  quote_id: string;
  total_price: number;
  unit_price: number;
  quantity: number;
  material: string;
  estimated_delivery: number;
  shipping_cost?: number;
  availability: boolean;
  processing_time: number;
}

export interface Slant3DComparison {
  options: Slant3DQuote[];
  best_option: Slant3DQuote;
  comparison_summary: Record<string, any>;
}

// ========== COMPARAÇÃO DE FORNECEDORES ==========

export interface SupplierQuote {
  supplier_id: string;
  supplier_name: string;
  total_cost: number;
  unit_cost: number;
  delivery_time: number;
  quality_rating: number;
  reliability_score: number;
  shipping_cost?: number;
}

export interface SupplierComparison {
  budget_id: string;
  quotes: SupplierQuote[];
  recommended_supplier: SupplierQuote;
  comparison_criteria: Record<string, number>;
  reasoning: string;
}

// ========== RELATÓRIOS ==========

export interface BudgetReport {
  budget: IntelligentBudgetResponse;
  executive_summary: string;
  cost_breakdown: Record<string, any>;
  quality_analysis: Record<string, any>;
  risk_assessment: string[];
  recommendations: string[];
  alternatives: Record<string, any>[];
}

export interface BudgetExport {
  format: string;
  include_charts?: boolean;
  include_supplier_details?: boolean;
  language?: string;
}

// ========== ANÁLISES ==========

export interface BudgetAnalytics {
  budget_id: string;
  cost_per_gram?: number;
  cost_per_cm3?: number;
  quality_cost_ratio?: number;
  efficiency_score?: number;
  competitiveness?: number;
}

export interface BudgetOptimization {
  budget_id: string;
  current_price: number;
  optimized_price: number;
  savings: number;
  optimization_strategies: string[];
  trade_offs: string[];
}

// ========== UPDATES EM TEMPO REAL ==========

export interface BudgetUpdate {
  budget_id: string;
  status: BudgetStatus;
  progress: number;
  current_step: string;
  estimated_completion?: string;
  message?: string;
}

// ========== ESTADOS DA APLICAÇÃO ==========

export interface BudgetState {
  // Estados básicos
  budgets: IntelligentBudgetResponse[];
  current_budget: IntelligentBudgetResponse | null;
  loading: boolean;
  error: string | null;
  
  // Estados específicos
  simulation_integration: SimulationIntegration | null;
  quality_metrics: QualityMetrics | null;
  material_recommendations: MaterialRecommendation[];
  supplier_comparisons: SupplierComparison | null;
  slant3d_quotes: Slant3DQuote[];
  timeline: BudgetTimeline[];
  
  // Estados de cache
  budget_cache: Record<string, any>;
  last_updated: string | null;
}

// ========== AÇÕES DA STORE ==========

export interface BudgetActions {
  // CRUD operations
  createBudget: (data: IntelligentBudgetCreate) => Promise<IntelligentBudgetResponse>;
  getBudget: (id: string) => Promise<IntelligentBudgetResponse>;
  updateBudget: (id: string, data: Partial<IntelligentBudgetCreate>) => Promise<IntelligentBudgetResponse>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Recálculo
  recalculateBudget: (id: string, data: BudgetRecalculateRequest) => Promise<IntelligentBudgetResponse>;
  
  // Materiais
  getMaterialRecommendations: (budget_id: string) => Promise<MaterialRecommendation[]>;
  compareMaterials: (data: any) => Promise<Slant3DComparison>;
  
  // Fornecedores
  compareSuppliers: (budget_id: string, criteria: SupplierComparisonRequest) => Promise<SupplierComparison>;
  getSupplierRecommendations: (data: any) => Promise<any>;
  
  // Slant3D
  getSlant3DQuote: (data: Slant3DQuoteRequest) => Promise<Slant3DQuote>;
  checkAvailability: (material: MaterialType, color?: string, finish?: string) => Promise<any>;
  estimateShipping: (data: any) => Promise<any>;
  
  // Timeline e relatórios
  getTimeline: (budget_id: string) => Promise<BudgetTimeline[]>;
  generateReport: (budget_id: string, options: BudgetExport) => Promise<BudgetReport>;
  
  // Utilitários
  clearError: () => void;
  setCurrentBudget: (budget: IntelligentBudgetResponse | null) => void;
  updateFromWebSocket: (update: BudgetUpdate) => void;
}

// ========== SELETORES COMPUTADOS ==========

export interface BudgetSelectors {
  // Filtros
  getBudgetsByStatus: (status: BudgetStatus) => IntelligentBudgetResponse[];
  getBudgetsByMaterial: (material: MaterialType) => IntelligentBudgetResponse[];
  getBudgetsByDateRange: (startDate: string, endDate: string) => IntelligentBudgetResponse[];
  
  // Estatísticas
  getAverageCost: () => number;
  getMostUsedMaterial: () => MaterialType | null;
  getSuccessRate: () => number;
  getTotalSavings: () => number;
  
  // Ordenação
  getBudgetsSortedByCost: (ascending?: boolean) => IntelligentBudgetResponse[];
  getBudgetsSortedByQuality: (ascending?: boolean) => IntelligentBudgetResponse[];
  getBudgetsSortedByDate: (ascending?: boolean) => IntelligentBudgetResponse[];
}

// ========== CONFIGURAÇÕES DA APLICAÇÃO ==========

export interface BudgetConfig {
  // API endpoints
  api_base_url: string;
  websocket_url: string;
  
  // Cache settings
  cache_ttl: number;
  max_cache_size: number;
  
  // UI settings
  default_currency: string;
  decimal_places: number;
  
  // Quality thresholds
  excellent_threshold: number;
  good_threshold: number;
  acceptable_threshold: number;
  
  // Budget limits
  max_budgets_per_user: number;
  max_items_per_budget: number;
  default_margin: number;
}

// ========== EVENTOS E PAYLOADS ==========

export interface BudgetEvent {
  type: string;
  payload: any;
  timestamp: string;
  user_id?: string;
  budget_id?: string;
}

export type BudgetEventType = 
  | "budget_created"
  | "budget_updated"
  | "budget_deleted"
  | "calculation_started"
  | "calculation_completed"
  | "calculation_failed"
  | "supplier_comparison_started"
  | "supplier_comparison_completed"
  | "material_recommendation_updated"
  | "real_time_update";

// ========== VALIDATORS E HELPERS ==========

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BudgetHelpers {
  validateBudgetCreate: (data: IntelligentBudgetCreate) => ValidationResult;
  validateRecalculation: (data: BudgetRecalculateRequest) => ValidationResult;
  calculateQualityScore: (simulationResults: any) => number;
  formatCurrency: (amount: number) => string;
  formatDuration: (hours: number) => string;
  calculateDeliveryDate: (estimatedDays: number) => string;
}

// ========== CONFIGURAÇÃO DO STORE ==========

export interface BudgetStoreConfig {
  name: string;
  partialize?: (state: BudgetState) => any;
  persist?: boolean;
  version?: number;
}

// ========== TIPOS DE COMPONENTES ==========

export interface BudgetComponentProps {
  budget?: IntelligentBudgetResponse;
  onBudgetUpdate?: (budget: IntelligentBudgetResponse) => void;
  onError?: (error: string) => void;
  loading?: boolean;
}

export interface MaterialRecommendationProps {
  recommendations: MaterialRecommendation[];
  current_material?: MaterialType;
  onMaterialSelect: (material: MaterialType) => void;
  loading?: boolean;
}

export interface SupplierComparisonProps {
  comparison: SupplierComparison | null;
  loading?: boolean;
  onSupplierSelect: (supplier: SupplierQuote) => void;
  showDetails?: boolean;
}

export interface QualityPricingProps {
  quality_score: number;
  quality_classification: QualityScore;
  quality_multiplier: number;
  base_cost: number;
  adjusted_cost: number;
  justifications: string[];
  onRecalculate?: (newQualityScore: number) => void;
}

export interface BudgetTimelineProps {
  timeline: BudgetTimeline[];
  current_phase?: string;
  progress?: number;
  estimated_completion?: string;
  onPhaseSelect?: (phase: string) => void;
}

export interface BudgetReportProps {
  budget: IntelligentBudgetResponse;
  format: 'json' | 'pdf';
  includeCharts?: boolean;
  onExport: (format: string, options: any) => void;
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ErrorResponse {
  detail: string;
  error_code?: string;
  timestamp: string;
  path?: string;
}

// ========== WEBSOCKET TYPES ==========

export interface WebSocketMessage {
  type: BudgetEventType;
  data: any;
  timestamp: string;
  budget_id?: string;
  user_id?: string;
}

export interface WebSocketConnection {
  connected: boolean;
  last_message?: string;
  reconnect_attempts: number;
  error?: string;
}

// ========== EXPORTS ==========

export type {
  IntelligentBudgetResponse as Budget,
  MaterialRecommendation,
  SupplierComparison,
  BudgetState,
  BudgetActions,
  BudgetSelectors
};

export {
  QualityScore,
  BudgetStatus,
  MaterialType,
  SupplierType
};