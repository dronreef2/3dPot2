"""
Interface Principal do Sistema de Produção - Sprint 10-11
Componente principal que integra dashboard, criação de ordens, monitoramento e otimização
"""

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Badge, Alert, AlertDescription
} from '@/components/ui';
import { 
  Production, Plus, BarChart3, Settings, TrendingUp, 
  Package, Clock, CheckCircle, AlertTriangle, Target,
  Zap, DollarSign, Users, Calendar, Filter, Download
} from 'lucide-react';

import { 
  ProductionDashboard,
  ProductionOrderCreate,
  ProductionMonitoring,
  CostOptimization
} from './ProductionComponents';

interface ProductionSystemProps {
  userId: string;
}

interface ProductionOrder {
  id: string;
  status: string;
  progress_percentage: number;
  quantity: number;
  estimated_cost: number;
  priority: string;
  created_at: string;
  scheduled_end?: string;
}

export const ProductionSystem: React.FC<ProductionSystemProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  // Budgets available for production
  const [availableBudgets, setAvailableBudgets] = useState<any[]>([]);

  useEffect(() => {
    loadProductionOrders();
    loadAvailableBudgets();
  }, [userId]);

  const loadProductionOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/production/projects/overview/orders');
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load production orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBudgets = async () => {
    try {
      const response = await fetch('/api/v1/budgeting/user/budgets');
      
      if (response.ok) {
        const data = await response.json();
        setAvailableBudgets(data.budgets || []);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    }
  };

  const handleOrderCreated = (newOrder: any) => {
    setOrders(prev => [newOrder, ...prev]);
    setShowCreateOrder(false);
    
    // Show success message
    Alert.show({
      type: 'success',
      title: 'Ordem de Produção Criada',
      message: `A ordem ${newOrder.id} foi criada com sucesso e está em planejamento.`
    });
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    setActiveTab('monitoring');
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'planning': <Settings className="h-4 w-4" />,
      'scheduled': <Calendar className="h-4 w-4" />,
      'in_progress': <Clock className="h-4 w-4" />,
      'quality_check': <Target className="h-4 w-4" />,
      'completed': <CheckCircle className="h-4 w-4" />,
      'delivered': <Package className="h-4 w-4" />,
      'cancelled': <AlertTriangle className="h-4 w-4" />,
      'on_hold': <Clock className="h-4 w-4" />
    };
    return icons[status as keyof typeof icons] || <Package className="h-4 w-4" />;
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

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Sistema de Produção</h1>
              <p className="text-xl text-muted-foreground">
                Planejamento, execução e otimização de produção
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button 
                size="sm"
                onClick={() => setShowCreateOrder(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Ordem
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ordens Ativas</CardTitle>
                <Production className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => ['planning', 'scheduled', 'in_progress'].includes(o.status)).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prioridade Alta</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => ['high', 'urgent', 'critical'].includes(o.priority)).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {orders.reduce((sum, o) => sum + o.estimated_cost, 0).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Ordens</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Monitoramento</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Otimização</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Planejamento</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <ProductionDashboard userId={userId} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="space-y-6">
              {/* Order Creation Dialog */}
              {showCreateOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">Criar Nova Ordem de Produção</h2>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCreateOrder(false)}
                      >
                        ✕
                      </Button>
                    </div>
                    
                    {availableBudgets.length > 0 ? (
                      <ProductionOrderCreate
                        budgetId={availableBudgets[0].id}
                        onOrderCreated={handleOrderCreated}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum Orçamento Disponível</h3>
                        <p className="text-muted-foreground mb-4">
                          Você precisa de um orçamento inteligente para criar uma ordem de produção.
                        </p>
                        <Button variant="outline">
                          Criar Orçamento
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders List */}
              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Produção</CardTitle>
                  <CardDescription>
                    Gerencie todas as ordens de produção do seu sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Carregando ordens...</span>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOrderSelect(order.id)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <p className="font-medium">Ordem #{order.id.substring(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">
                                Qtd: {order.quantity} • R$ {order.estimated_cost.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Criada em {new Date(order.created_at).toLocaleDateString('pt-BR')}
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
                            {order.progress_percentage > 0 && (
                              <div className="text-sm font-medium">
                                {order.progress_percentage.toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma Ordem de Produção</h3>
                      <p className="text-muted-foreground mb-4">
                        Crie sua primeira ordem de produção para começar.
                      </p>
                      <Button onClick={() => setShowCreateOrder(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Ordem
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {selectedOrder ? (
              <ProductionMonitoring orderId={selectedOrder} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione uma Ordem para Monitorar</h3>
                  <p className="text-muted-foreground">
                    Escolha uma ordem de produção na aba "Ordens" para visualizar o progresso detalhado.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <CostOptimization userId={userId} />
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planejamento de Capacidade</CardTitle>
                <CardDescription>
                  Planeje a capacidade de produção e identifique gargalos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recomendações de Planejamento</h3>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">Otimização de Agendamento</h4>
                        <p className="text-sm text-muted-foreground">
                          Reduzir tempo de setup através de preparação prévia
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">Balanceamento de Carga</h4>
                        <p className="text-sm text-muted-foreground">
                          Distribuir produção de forma mais uniforme
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">Expansão de Capacidade</h4>
                        <p className="text-sm text-muted-foreground">
                          Adicionar equipamentos para aumentar throughput
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Status da Capacidade</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Impressoras 3D</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div className="w-16 h-2 bg-green-500 rounded"></div>
                          </div>
                          <span className="text-sm">80%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pós-processamento</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div className="w-12 h-2 bg-yellow-500 rounded"></div>
                          </div>
                          <span className="text-sm">60%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Controle de Qualidade</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div className="w-18 h-2 bg-blue-500 rounded"></div>
                          </div>
                          <span className="text-sm">90%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions Floating */}
        <div className="fixed bottom-6 right-6">
          <div className="flex flex-col space-y-2">
            <Button 
              size="sm"
              onClick={() => setShowCreateOrder(true)}
              className="shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setActiveTab('optimization')}
              className="shadow-lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Otimizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionSystem;