/**
 * Analytics Dashboard para Simulações
 * Dashboard de monitoramento e analytics das simulações
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Activity,
  Zap,
  Award,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

interface SimulationAnalyticsProps {
  userId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  simulationTypes?: string[];
  className?: string;
}

interface AnalyticsData {
  overview: {
    totalSimulations: number;
    completedSimulations: number;
    failedSimulations: number;
    averageDuration: number;
    successRate: number;
    totalUsers: number;
    popularSimulationType: string;
  };
  timeSeries: {
    daily: Array<{
      date: string;
      simulations: number;
      completed: number;
      failed: number;
      avgDuration: number;
    }>;
    weekly: Array<{
      week: string;
      simulations: number;
      completed: number;
      failed: number;
      avgDuration: number;
    }>;
  };
  simulationTypes: Array<{
    type: string;
    count: number;
    successRate: number;
    avgDuration: number;
    color: string;
  }>;
  performance: Array<{
    simulationId: string;
    type: string;
    duration: number;
    success: boolean;
    timestamp: string;
    parameters: any;
  }>;
  userActivity: Array<{
    userId: string;
    username: string;
    simulationsCount: number;
    lastActivity: string;
    successRate: number;
  }>;
  systemMetrics: {
    averageLoadTime: number;
    errorRate: number;
    activeWorkers: number;
    queueSize: number;
    cpuUsage: number;
    memoryUsage: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const SimulationAnalytics: React.FC<SimulationAnalyticsProps> = ({
  userId,
  timeRange = '30d',
  simulationTypes,
  className = ''
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [refreshing, setRefreshing] = useState(false);

  // Função para buscar dados de analytics
  const fetchAnalyticsData = async () => {
    try {
      setError(null);
      
      // Simular dados de analytics (em produção, isso seria uma chamada real à API)
      const mockData: AnalyticsData = {
        overview: {
          totalSimulations: 1247,
          completedSimulations: 1089,
          failedSimulations: 158,
          averageDuration: 145.3,
          successRate: 87.3,
          totalUsers: 89,
          popularSimulationType: 'drop_test'
        },
        timeSeries: {
          daily: generateDailyData(),
          weekly: generateWeeklyData()
        },
        simulationTypes: [
          { type: 'drop_test', count: 456, successRate: 89.1, avgDuration: 98.2, color: '#0088FE' },
          { type: 'stress_test', count: 389, successRate: 85.3, avgDuration: 187.4, color: '#00C49F' },
          { type: 'motion', count: 234, successRate: 91.2, avgDuration: 156.8, color: '#FFBB28' },
          { type: 'fluid', count: 168, successRate: 83.9, avgDuration: 203.1, color: '#FF8042' }
        ],
        performance: generatePerformanceData(),
        userActivity: generateUserActivityData(),
        systemMetrics: {
          averageLoadTime: 2.3,
          errorRate: 2.1,
          activeWorkers: 4,
          queueSize: 12,
          cpuUsage: 34.2,
          memoryUsage: 67.8
        }
      };
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAnalyticsData(mockData);
    } catch (err) {
      setError(`Erro ao carregar analytics: ${err}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Funções para gerar dados mock
  const generateDailyData = () => {
    const data = [];
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const simulations = Math.floor(Math.random() * 50) + 10;
      const completed = Math.floor(simulations * (0.8 + Math.random() * 0.15));
      const failed = simulations - completed;
      
      data.push({
        date: date.toISOString().split('T')[0],
        simulations,
        completed,
        failed,
        avgDuration: 120 + Math.random() * 60
      });
    }
    
    return data;
  };

  const generateWeeklyData = () => {
    const data = [];
    const weeks = selectedTimeRange === '7d' ? 1 : selectedTimeRange === '30d' ? 4 : 12;
    
    for (let i = weeks - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      
      const simulations = Math.floor(Math.random() * 300) + 50;
      const completed = Math.floor(simulations * (0.8 + Math.random() * 0.15));
      const failed = simulations - completed;
      
      data.push({
        week: `Sem ${date.getWeek()}`,
        simulations,
        completed,
        failed,
        avgDuration: 120 + Math.random() * 60
      });
    }
    
    return data;
  };

  const generatePerformanceData = () => {
    const data = [];
    const types = ['drop_test', 'stress_test', 'motion', 'fluid'];
    
    for (let i = 0; i < 100; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      data.push({
        simulationId: `sim_${i.toString().padStart(3, '0')}`,
        type,
        duration: 60 + Math.random() * 300,
        success: Math.random() > 0.15,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        parameters: { /* simulation parameters */ }
      });
    }
    
    return data;
  };

  const generateUserActivityData = () => {
    const data = [];
    
    for (let i = 0; i < 20; i++) {
      data.push({
        userId: `user_${i.toString().padStart(3, '0')}`,
        username: `usuário${i + 1}`,
        simulationsCount: Math.floor(Math.random() * 50) + 1,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        successRate: 75 + Math.random() * 20
      });
    }
    
    return data.sort((a, b) => b.simulationsCount - a.simulationsCount);
  };

  // Effect para carregar dados
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange, userId, simulationTypes]);

  // Funções de formatação
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Estados de loading e error
  if (loading) {
    return (
      <div className={`simulation-analytics ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Carregando analytics das simulações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`simulation-analytics ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAnalyticsData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className={`simulation-analytics space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics de Simulações</h2>
          <p className="text-gray-600 mt-1">
            Monitoramento e análise de performance das simulações
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filtro de período */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          
          <Button
            onClick={() => {
              setRefreshing(true);
              fetchAnalyticsData();
            }}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Simulações</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.overview.totalSimulations.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 ml-1">vs. período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPercentage(analyticsData.overview.successRate)}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analyticsData.overview.successRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Duração Média</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatDuration(analyticsData.overview.averageDuration)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Zap className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-gray-600">Otimizado</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsData.overview.totalUsers}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Award className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-gray-600">Top: {analyticsData.overview.popularSimulationType.replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulações por dia/semana */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.timeSeries.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value, name) => [
                    value,
                    name === 'simulations' ? 'Total' :
                    name === 'completed' ? 'Concluídas' : 'Falharam'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="simulations"
                  stackId="1"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.6}
                  name="Total"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="2"
                  stroke="#00C49F"
                  fill="#00C49F"
                  fillOpacity={0.8}
                  name="Concluídas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Simulações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.simulationTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count, percent }) => 
                    `${type.replace('_', ' ')}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.simulationTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter plot de performance */}
        <Card>
          <CardHeader>
            <CardTitle>Análise de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={analyticsData.performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="duration" 
                  name="Duração (s)"
                  tickFormatter={(value) => `${Math.round(value)}s`}
                />
                <YAxis 
                  dataKey="type"
                  tickFormatter={(value) => value.replace('_', ' ')}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
                          <p className="font-medium">Simulação {data.simulationId}</p>
                          <p>Tipo: {data.type.replace('_', ' ')}</p>
                          <p>Duração: {formatDuration(data.duration)}</p>
                          <p>Status: {data.success ? 'Sucesso' : 'Falhou'}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  dataKey="duration" 
                  fill="#0088FE"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxa de sucesso por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Sucesso por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.simulationTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="type" 
                  tickFormatter={(value) => value.replace('_', ' ')}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toFixed(1)}%`,
                    'Taxa de Sucesso'
                  ]}
                  labelFormatter={(label) => label.replace('_', ' ')}
                />
                <Bar 
                  dataKey="successRate" 
                  fill="#00C49F"
                  name="Taxa de Sucesso (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tempo de Carregamento</p>
              <p className="text-2xl font-bold">{analyticsData.systemMetrics.averageLoadTime}s</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Taxa de Erro</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPercentage(analyticsData.systemMetrics.errorRate)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Workers Ativos</p>
              <p className="text-2xl font-bold text-blue-600">
                {analyticsData.systemMetrics.activeWorkers}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Fila</p>
              <p className="text-2xl font-bold text-orange-600">
                {analyticsData.systemMetrics.queueSize}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">CPU</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPercentage(analyticsData.systemMetrics.cpuUsage)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Memória</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(analyticsData.systemMetrics.memoryUsage)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Usuário</th>
                  <th className="text-left py-3 px-4">Simulações</th>
                  <th className="text-left py-3 px-4">Taxa de Sucesso</th>
                  <th className="text-left py-3 px-4">Última Atividade</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.userActivity.slice(0, 10).map((user, index) => (
                  <tr key={user.userId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.simulationsCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${user.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatPercentage(user.successRate)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(user.lastActivity)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={user.successRate > 85 ? "default" : "secondary"}
                        className={user.successRate > 85 ? "bg-green-100 text-green-800" : ""}
                      >
                        {user.successRate > 85 ? "Ativo" : "Regular"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationAnalytics;