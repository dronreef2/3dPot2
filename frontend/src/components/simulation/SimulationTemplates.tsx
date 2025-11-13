/**
 * Componente de Templates de Simulação
 * Interface para seleção de templates pré-configurados
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, 
  Clock, 
  Zap, 
  Settings, 
  Shield, 
  Gauge,
  Eye,
  Filter
} from 'lucide-react';

import {
  SimulationTemplate,
  TemplateCategory,
  SimulationType
} from '../../types/simulation';

interface SimulationTemplatesProps {
  templates: SimulationTemplate[];
  onSelect: (template: SimulationTemplate) => void;
  selectedId?: string;
  filter_category?: TemplateCategory;
}

export const SimulationTemplates: React.FC<SimulationTemplatesProps> = ({
  templates,
  onSelect,
  selectedId,
  filter_category
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  // Filtrar templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Agrupar templates por categoria
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<TemplateCategory, SimulationTemplate[]>);

  const categories = Object.keys(templatesByCategory) as TemplateCategory[];

  return (
    <div className="simulation-templates space-y-6">
      {/* Header e Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Templates de Simulação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por Categoria */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as Categorias</option>
                <option value={TemplateCategory.BASIC}>Básico</option>
                <option value={TemplateCategory.COMPREHENSIVE}>Completo</option>
                <option value={TemplateCategory.MECHANICAL}>Mecânico</option>
                <option value={TemplateCategory.DYNAMIC}>Dinâmico</option>
                <option value={TemplateCategory.FLUID}>Fluido</option>
              </select>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{templates.length}</p>
              <p className="text-sm text-gray-600">Total de Templates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{categories.length}</p>
              <p className="text-sm text-gray-600">Categorias</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Object.values(SimulationType).length}
              </p>
              <p className="text-sm text-gray-600">Tipos de Simulação</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {templates.filter(t => t.is_default).length}
              </p>
              <p className="text-sm text-gray-600">Templates Padrão</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates por Categoria */}
      <div className="space-y-8">
        {categories.map(category => (
          <div key={category}>
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {category}
              </Badge>
              <span className="text-gray-600">
                ({templatesByCategory[category].length} templates)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesByCategory[category].map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedId === template.id}
                  onSelect={onSelect}
                  onPreview={() => setPreviewTemplate(template.id)}
                  isPreview={previewTemplate === template.id}
                  onClosePreview={() => setPreviewTemplate(null)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum template encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros de busca ou categoria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// ========== COMPONENTE DE CARD DE TEMPLATE ==========

interface TemplateCardProps {
  template: SimulationTemplate;
  isSelected: boolean;
  onSelect: (template: SimulationTemplate) => void;
  onPreview: () => void;
  isPreview: boolean;
  onClosePreview: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onPreview,
  isPreview,
  onClosePreview
}) => {
  const getTypeIcon = (tipo: SimulationType) => {
    switch (tipo) {
      case SimulationType.DROP_TEST:
        return <Shield className="w-5 h-5" />;
      case SimulationType.STRESS_TEST:
        return <Gauge className="w-5 h-5" />;
      case SimulationType.MOTION:
        return <Zap className="w-5 h-5" />;
      case SimulationType.FLUID:
        return <Settings className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: TemplateCategory) => {
    switch (category) {
      case TemplateCategory.BASIC:
        return 'bg-green-100 text-green-800';
      case TemplateCategory.COMPREHENSIVE:
        return 'bg-blue-100 text-blue-800';
      case TemplateCategory.MECHANICAL:
        return 'bg-purple-100 text-purple-800';
      case TemplateCategory.DYNAMIC:
        return 'bg-orange-100 text-orange-800';
      case TemplateCategory.FLUID:
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimatedTime = (parametros: Record<string, any>) => {
    const tipo = template.tipo_simulacao;
    
    switch (tipo) {
      case SimulationType.DROP_TEST:
        const drops = parametros.num_drops || 5;
        return `${Math.ceil(drops * 0.3)} min`;
      case SimulationType.STRESS_TEST:
        const force = parametros.max_force || 1000;
        const increments = Math.ceil(force / (parametros.force_increment || 100));
        return `${Math.ceil(increments * 0.2)} min`;
      case SimulationType.MOTION:
        const duration = parametros.duration || 10;
        return `${Math.ceil(duration * 0.1)} min`;
      case SimulationType.FLUID:
        return '2-5 min';
      default:
        return '1-5 min';
    }
  };

  return (
    <>
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50' 
            : 'hover:shadow-md border-gray-200'
        }`}
        onClick={() => onSelect(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 flex items-center space-x-2">
                {getTypeIcon(template.tipo_simulacao)}
                <span>{template.nome}</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
                <Badge variant="outline">
                  {template.tipo_simulacao.replace('_', ' ')}
                </Badge>
                {template.is_default && (
                  <Badge variant="secondary">Padrão</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {template.descricao}
          </p>
          
          <div className="space-y-3">
            {/* Tempo Estimado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Tempo:</span>
              </div>
              <span className="text-sm font-medium">
                {getEstimatedTime(template.parametros)}
              </span>
            </div>
            
            {/* Parâmetros Principais */}
            <div className="space-y-1">
              <span className="text-sm text-gray-600">Parâmetros Principais:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(template.parametros).slice(0, 3).map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
                {Object.keys(template.parametros).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{Object.keys(template.parametros).length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button
            className="w-full mt-4"
            variant={isSelected ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            {isSelected ? 'Selecionado' : 'Usar Template'}
          </Button>
        </CardContent>
      </Card>

      {/* Modal de Preview */}
      {isPreview && (
        <TemplatePreviewModal
          template={template}
          onClose={onClosePreview}
          onSelect={() => {
            onSelect(template);
            onClosePreview();
          }}
        />
      )}
    </>
  );
};

// ========== MODAL DE PREVIEW DO TEMPLATE ==========

interface TemplatePreviewModalProps {
  template: SimulationTemplate;
  onClose: () => void;
  onSelect: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onSelect
}) => {
  const formatParametros = (parametros: Record<string, any>) => {
    return Object.entries(parametros).map(([key, value]) => ({
      key,
      value,
      description: getParameterDescription(key, template.tipo_simulacao)
    }));
  };

  const parametrosFormatados = formatParametros(template.parametros);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{template.nome}</h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
          
          {/* Descrição */}
          <p className="text-gray-600 mb-6">{template.descricao}</p>
          
          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-600">Tipo de Simulação</label>
              <p className="font-medium capitalize">{template.tipo_simulacao.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Categoria</label>
              <p className="font-medium capitalize">{template.category}</p>
            </div>
          </div>
          
          {/* Parâmetros */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Parâmetros de Configuração</h3>
            <div className="space-y-3">
              {parametrosFormatados.map(({ key, value, description }) => (
                <div key={key} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <label className="font-medium capitalize text-sm">
                      {key.replace('_', ' ')}
                    </label>
                    <Badge variant="outline" className="text-xs">
                      {typeof value}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{description}</p>
                  <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex space-x-3">
            <Button onClick={onSelect} className="flex-1">
              Usar Este Template
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== FUNÇÕES AUXILIARES ==========

const getParameterDescription = (key: string, tipo: SimulationType): string => {
  const descriptions: Record<string, Record<string, string>> = {
    drop_test: {
      drop_height: 'Altura da qual o objeto será derrubado. Alturas maiores aumentam a energia de impacto.',
      num_drops: 'Número de testes de queda. Mais testes fornecem resultados estatisticamente mais confiáveis.',
      gravity: 'Gravidade da simulação. Valor negativo indica direção para baixo.',
      surface_type: 'Superfície de impacto que afeta o coeficiente de restituição e absorção de energia.',
      restitution: 'Controla o quão elástico é o objeto. Valores mais altos resultam em mais saltos.'
    },
    stress_test: {
      max_force: 'Força máxima a ser aplicada no objeto durante o teste.',
      force_increment: 'Incremento de força entre medições. Incrementos menores fornecem mais precisão.',
      force_direction: 'Direção na qual a força será aplicada.',
      test_duration: 'Tempo que cada incremento de força é mantido.'
    },
    motion: {
      trajectory_type: 'Padrão de movimento que o objeto deve seguir.',
      duration: 'Duração total do teste de movimento.',
      velocity: 'Velocidade constante durante o movimento.',
      radius: 'Raio do círculo para trajetória circular.',
      acceleration: 'Aceleração do objeto durante o movimento. 0 para velocidade constante.'
    },
    fluid: {
      fluid_density: 'Densidade do fluido. 1.2 = Ar, 1000 = Água. Densidades maiores aumentam a resistência.',
      drag_coefficient: 'Coeficiente de arrasto. 0.0 = Sem resistência, 1.47 = Esfera.',
      viscosity: 'Viscosidade dinâmica do fluido. Fluidos mais viscosos oferecem mais resistência.',
      flow_direction: 'Direção na qual o fluido está se movendo em relação ao objeto.'
    }
  };

  return descriptions[tipo]?.[key] || 'Parâmetro de configuração da simulação.';
};

export default SimulationTemplates;