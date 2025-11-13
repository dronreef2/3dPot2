"""
Componentes React para Sistema de Produção - Sprint 10-11
Interface para planejamento, execução e monitoramento de produção
"""

import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Badge, Button, Input, Label, Select, Table, Tabs, Progress,
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  Alert, AlertDescription, Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle
} from '@/components/ui';
import { 
  Production, Settings, TrendingUp, Clock, CheckCircle, 
  AlertTriangle, BarChart3, Calendar, Users, Package,
  DollarSign, Target, Zap, Download, Filter, Search
} from 'lucide-react';

// ========================================
// PRODUCTION DASHBOARD COMPONENT
// ========================================

interface ProductionDashboardProps {
  userId: string;
}

interface ProductionMetrics {
  overview: {
    total_orders: number;
    completed_orders: number;
    in_progress_orders: number;
    pending_orders: number;
    efficiency_rate: number;
    total_estimated_cost: number;
    total_actual_cost: number;
    cost_variance: number;
  };
  distributions: {
    status: Record<string, number>;
    priority: Record<string, number>;
    type: Record<string, number>;
  };
  recent_orders: Array<{
    id: string;
    status: string;
    priority: string;
    quantity: number;
    estimated_cost: number;
    created_at: string;
    scheduled_end?: string;
  }>;
  kpis: {
    average_lead_time: number;
    quality_pass_rate: number;
    resource_utilization: number;
  };
}

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({ userId }) => {
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductionMetrics();
  }, [userId]);

  const fetchProductionMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/production/dashboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch production metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planning': 'bg-blue-100 text-blue-800',
      'scheduled': 'bg-purple-100 text-purple-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'quality_check': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
      'on_hold': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800',
      'critical': 'bg-red-200 text-red-900'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dashboard de produção...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Erro ao carregar dashboard: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard de Produção</h2>
          <p className="text-muted-foreground">
            Visão geral do status e performance da produção
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ordens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.total_orders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.overview.completed_orders} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.efficiency_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de entrega no prazo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.overview.total_actual_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Variância: {metrics.overview.cost_variance > 0 ? '+' : ''}
              R$ {metrics.overview.cost_variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.kpis.quality_pass_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de aprovação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Status Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(metrics.distributions.status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge className={getStatusColor(status)}>
                  {status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(metrics.distributions.priority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <Badge className={getPriorityColor(priority)}>
                  {priority.toUpperCase()}
                </Badge>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens Recentes</CardTitle>
          <CardDescription>
            Últimas ordens de produção processadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">Ordem #{order.id.substring(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      Qtd: {order.quantity} • R$ {order.estimated_cost.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(order.priority)}>
                    {order.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Time Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.kpis.average_lead_time.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Qualidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.kpis.quality_pass_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilização de Recursos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.kpis.resource_utilization.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ========================================
// PRODUCTION ORDER CREATION COMPONENT
// ========================================

interface ProductionOrderCreateProps {
  budgetId: string;
  onOrderCreated: (order: any) => void;
}

interface ProductionOrderForm {
  quantity: number;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  requested_delivery_date: string;
  special_requirements: string;
  notes: string;
}

export const ProductionOrderCreate: React.FC<ProductionOrderCreateProps> = ({
  budgetId,
  onOrderCreated
}) => {
  const [form, setForm] = useState<ProductionOrderForm>({
    quantity: 1,
    priority: 'normal',
    requested_delivery_date: '',
    special_requirements: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/production/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          budget_id: budgetId,
          ...form,
          requested_delivery_date: form.requested_delivery_date || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create production order');
      }

      const order = await response.json();
      onOrderCreated(order);
      
      // Reset form
      setForm({
        quantity: 1,
        priority: 'normal',
        requested_delivery_date: '',
        special_requirements: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Ordem de Produção</CardTitle>
        <CardDescription>
          Configure os parâmetros para a nova ordem de produção
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(value: any) => setForm({ ...form, priority: value })}
              >
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
                <option value="critical">Crítica</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested_delivery_date">Data de Entrega Solicitada</Label>
            <Input
              id="requested_delivery_date"
              type="date"
              value={form.requested_delivery_date}
              onChange={(e) => setForm({ ...form, requested_delivery_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requirements">Requisitos Especiais</Label>
            <textarea
              id="special_requirements"
              className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md"
              value={form.special_requirements}
              onChange={(e) => setForm({ ...form, special_requirements: e.target.value })}
              placeholder="Descreva requisitos especiais para a produção..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Observações adicionais..."
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Criar Ordem de Produção
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// ========================================
// PRODUCTION MONITORING COMPONENT
// ========================================

interface ProductionMonitoringProps {
  orderId: string;
}

interface ProductionStatus {
  production_order: {
    id: string;
    status: string;
    progress_percentage: number;
    quantity: number;
    type: string;
    priority: string;
    scheduled_start?: string;
    estimated_completion?: string;
  };
  schedule: Array<{
    operation: string;
    order: number;
    status: string;
    progress: number;
    duration: number;
    start_time?: string;
    quality_gate: boolean;
  }>;
  quality: Array<{
    type: string;
    status: string;
    scheduled?: string;
    completed?: string;
  }>;
  recent_events: Array<{
    type: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }>;
  metrics: {
    cost_variance: number;
    time_variance: number;
    efficiency_score: number;
  };
}

export const ProductionMonitoring: React.FC<ProductionMonitoringProps> = ({ orderId }) => {
  const [status, setStatus] = useState<ProductionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProductionStatus();
    const interval = setInterval(fetchProductionStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchProductionStatus = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await fetch(`/api/v1/production/orders/${orderId}/status`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch production status');
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProductionStatus();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'skipped': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando status da produção...</span>
      </div>
    );
  }

  if (error && !status) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Erro ao carregar status: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) return null;

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Monitoramento de Produção</h3>
          <p className="text-muted-foreground">
            Ordem #{status.production_order.id.substring(0, 8)}
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <Zap className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Production Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Visão Geral da Produção</CardTitle>
            <Badge className={getStatusColor(status.production_order.status)}>
              {status.production_order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Progresso</p>
              <div className="mt-1">
                <Progress value={status.production_order.progress_percentage} />
                <p className="text-xs mt-1">{status.production_order.progress_percentage.toFixed(1)}%</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quantidade</p>
              <p className="text-lg font-semibold">{status.production_order.quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <p className="text-lg font-semibold capitalize">
                {status.production_order.type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
              <p className="text-lg font-semibold capitalize">
                {status.production_order.priority}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Produção</CardTitle>
          <CardDescription>
            Progresso das operações planejadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status.schedule.map((operation, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {operation.order}
                  </div>
                  <div>
                    <p className="font-medium">{operation.operation}</p>
                    <p className="text-sm text-muted-foreground">
                      Duração: {operation.duration}h
                      {operation.quality_gate && (
                        <Badge variant="outline" className="ml-2">QC</Badge>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Progress value={operation.progress} className="w-24" />
                    <p className="text-xs mt-1">{operation.progress.toFixed(0)}%</p>
                  </div>
                  <Badge className={getStatusColor(operation.status)}>
                    {operation.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Qualidade</CardTitle>
          <CardDescription>
            Status dos testes e verificações de qualidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status.quality.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{check.type.replace('_', ' ')}</p>
                  {check.scheduled && (
                    <p className="text-sm text-muted-foreground">
                      Agendado: {new Date(check.scheduled).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(check.status)}>
                  {check.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>
            Histórico de eventos da produção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status.recent_events.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.completed ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Variância de Custo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              status.metrics.cost_variance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {status.metrics.cost_variance > 0 ? '+' : ''}
              R$ {status.metrics.cost_variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Variância de Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              status.metrics.time_variance > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {status.metrics.time_variance > 0 ? '+' : ''}
              {status.metrics.time_variance.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Score de Eficiência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {status.metrics.efficiency_score.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ========================================
// COST OPTIMIZATION COMPONENT
// ========================================

interface CostOptimizationProps {
  userId: string;
}

interface OptimizationResult {
  analysis_date: string;
  data_period_days: number;
  optimization_results: Record<string, any>;
  consolidated_recommendations: Array<{
    title: string;
    description: string;
    estimated_savings: number;
    implementation_effort: string;
    risk_level: string;
    combined_score: number;
    analysis_source: string;
  }>;
  total_impact: {
    total_estimated_savings: number;
    total_improvement_percentage: number;
    analyses_completed: number;
    average_improvement_per_analysis: number;
  };
  implementation_roadmap: {
    immediate: Array<any>;
    short_term: Array<any>;
    medium_term: Array<any>;
    long_term: Array<any>;
  };
}

export const CostOptimization: React.FC<CostOptimizationProps> = ({ userId }) => {
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('90');

  useEffect(() => {
    runOptimizationAnalysis();
  }, [userId, selectedTimeframe]);

  const runOptimizationAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/production/cost-optimization/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          period_days: parseInt(selectedTimeframe),
          target_improvements: {
            cost_reduction: 10.0,
            time_reduction: 15.0,
            quality_improvement: 5.0
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run optimization analysis');
      }

      const data = await response.json();
      setOptimization(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getEffortColor = (effort: string) => {
    const colors = {
      'easy': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'hard': 'bg-red-100 text-red-800'
    };
    return colors[effort as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Analisando oportunidades de otimização...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Erro na análise: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!optimization) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Otimização de Custos</h2>
          <p className="text-muted-foreground">
            Análise inteligente para redução de custos e melhoria de eficiência
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="180">Últimos 6 meses</option>
          </Select>
          <Button onClick={runOptimizationAnalysis} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reanalisar
          </Button>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {optimization.total_impact.total_estimated_savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhoria Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {optimization.total_impact.total_improvement_percentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optimization.total_impact.analyses_completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Análise</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {optimization.total_impact.average_improvement_per_analysis.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle>Roadmap de Implementação</CardTitle>
          <CardDescription>
            Recomendações priorizadas por prazo de implementação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="immediate" className="space-y-4">
            <div className="flex space-x-2">
              <Button variant={optimization.implementation_roadmap.immediate.length > 0 ? "default" : "outline"} size="sm">
                Imediato ({optimization.implementation_roadmap.immediate.length})
              </Button>
              <Button variant={optimization.implementation_roadmap.short_term.length > 0 ? "default" : "outline"} size="sm">
                Curto Prazo ({optimization.implementation_roadmap.short_term.length})
              </Button>
              <Button variant={optimization.implementation_roadmap.medium_term.length > 0 ? "default" : "outline"} size="sm">
                Médio Prazo ({optimization.implementation_roadmap.medium_term.length})
              </Button>
              <Button variant={optimization.implementation_roadmap.long_term.length > 0 ? "default" : "outline"} size="sm">
                Longo Prazo ({optimization.implementation_roadmap.long_term.length})
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Principais Recomendações</CardTitle>
          <CardDescription>
            Top 5 oportunidades de otimização ordenadas por score de prioridade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimization.consolidated_recommendations.slice(0, 5).map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={getEffortColor(rec.implementation_effort)}>
                        {rec.implementation_effort}
                      </Badge>
                      <Badge className={getRiskColor(rec.risk_level)}>
                        {rec.risk_level} risco
                      </Badge>
                      <span className="text-sm font-medium text-green-600">
                        R$ {rec.estimated_savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {rec.combined_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};