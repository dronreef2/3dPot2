"""
3dPot v2.0 - Formulário de Especificações de Modelagem 3D
========================================================

Este módulo implementa o formulário React para entrada de especificações
de modelagem 3D baseado nos templates e categorias.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

import React, { useState, useEffect } from 'react';
import {
  ModelSpecsFormProps,
  ModelSpecs,
  ModelingTemplate,
  ModelCategory,
  MaterialType,
  ModelingEngine,
  ModelFormat
} from '../../types/modeling';
import {
  createMechanicalSpecs,
  createElectronicSpecs,
  validateModelSpecs
} from '../../store/modelingStore';
import { modelingApi } from '../../services/modelingApi';

export const ModelSpecsForm: React.FC<ModelSpecsFormProps> = ({
  specs,
  onSpecsChange,
  onGenerate,
  isGenerating = false,
  templates = [],
  onTemplateSelect,
  className = ''
}) => {
  const [formData, setFormData] = useState<ModelSpecs>(specs);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string>('');

  // Sincronizar com props externas
  useEffect(() => {
    setFormData(specs);
  }, [specs]);

  // Validar formulários
  const validateForm = (data: ModelSpecs): string[] => {
    return validateModelSpecs(data);
  };

  // Atualizar especificações
  const updateSpecs = (updates: Partial<ModelSpecs>) => {
    const newSpecs = { ...formData, ...updates };
    setFormData(newSpecs);
    
    const validationErrors = validateForm(newSpecs);
    setErrors(validationErrors);
    
    onSpecsChange(newSpecs);
  };

  // Aplicar template
  const applyTemplate = (template: ModelingTemplate) => {
    const templateSpecs: ModelSpecs = {
      category: template.category,
      material: MaterialType.PLA,
      dimensions: {
        largura: 50,
        altura: 30,
        profundidade: 20
      },
      additional_specs: {},
      components: [],
      features: []
    };

    setFormData(templateSpecs);
    setActiveTemplate(template.id);
    setErrors([]);
    onSpecsChange(templateSpecs);
    
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  // Preencher com exemplo
  const fillExample = (type: 'mechanical' | 'electronic') => {
    if (type === 'mechanical') {
      const example = createMechanicalSpecs(
        { largura: 100, altura: 50, profundidade: 30 },
        MaterialType.PLA
      );
      setFormData(example);
      onSpecsChange(example);
      setActiveTemplate('custom');
    } else {
      const example = createElectronicSpecs(
        { largura: 80, altura: 25, profundidade: 60 },
        MaterialType.PETG
      );
      setFormData(example);
      onSpecsChange(example);
      setActiveTemplate('custom');
    }
    setErrors([]);
  };

  // Adicionar dimensão
  const updateDimension = (key: 'largura' | 'altura' | 'profundidade', value: string) => {
    const numValue = parseFloat(value) || 0;
    updateSpecs({
      dimensions: {
        ...formData.dimensions,
        [key]: numValue
      }
    });
  };

  // Adicionar especificação adicional
  const addAdditionalSpec = (key: string, value: string) => {
    const newSpecs = {
      ...formData.additional_specs,
      [key]: key === 'temperatura_impressao' || key === 'velocidade_impressao' 
        ? parseFloat(value) || 0 
        : value
    };
    updateSpecs({ additional_specs: newSpecs });
  };

  // Remover especificação adicional
  const removeAdditionalSpec = (key: string) => {
    const newSpecs = { ...formData.additional_specs };
    delete newSpecs[key];
    updateSpecs({ additional_specs: newSpecs });
  };

  // Adicionar funcionalidade
  const addFeature = () => {
    const newFeatures = [
      ...(formData.features || []),
      {
        nome: `funcionalidade_${Date.now()}`,
        tipo: 'furo',
        parametros: { diametro: 5 },
        posicao: { x: 0, y: 0 }
      }
    ];
    updateSpecs({ features: newFeatures });
  };

  // Atualizar funcionalidade
  const updateFeature = (index: number, field: string, value: any) => {
    const newFeatures = [...(formData.features || [])];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newFeatures[index] = {
        ...newFeatures[index],
        [parent]: {
          ...newFeatures[index][parent],
          [child]: value
        }
      };
    } else {
      newFeatures[index] = {
        ...newFeatures[index],
        [field]: value
      };
    }
    updateSpecs({ features: newFeatures });
  };

  // Remover funcionalidade
  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    updateSpecs({ features: newFeatures });
  };

  const commonAdditionalSpecs = [
    { key: 'temperatura_impressao', label: 'Temperatura (°C)', type: 'number' },
    { key: 'velocidade_impressao', label: 'Velocidade (mm/s)', type: 'number' },
    { key: 'tolerancia', label: 'Tolerância (mm)', type: 'number' },
    { key: 'acabamento', label: 'Acabamento', type: 'text' }
  ];

  return (
    <div className={`model-specs-form ${className}`} style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>
        Especificações do Modelo 3D
      </h3>

      {/* Templates */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Templates Pré-definidos
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template)}
              style={{
                padding: '8px 12px',
                background: activeTemplate === template.id ? '#007bff' : '#f8f9fa',
                color: activeTemplate === template.id ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {template.name}
            </button>
          ))}
          <button
            onClick={() => fillExample('mechanical')}
            style={{
              padding: '8px 12px',
              background: '#28a745',
              color: 'white',
              border: '1px solid #28a745',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Exemplo Mecânico
          </button>
          <button
            onClick={() => fillExample('electronic')}
            style={{
              padding: '8px 12px',
              background: '#17a2b8',
              color: 'white',
              border: '1px solid #17a2b8',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Exemplo Eletrônico
          </button>
        </div>
      </div>

      {/* Categoria */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Categoria *
        </label>
        <select
          value={formData.category}
          onChange={(e) => updateSpecs({ category: e.target.value as ModelCategory })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value={ModelCategory.MECANICO}>Mecânico</option>
          <option value={ModelCategory.ELETRONICO}>Eletrônico</option>
          <option value={ModelCategory.MISTO}>Misto</option>
          <option value={ModelCategory.ARQUITETURA}>Arquitetura</option>
        </select>
      </div>

      {/* Material */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Material *
        </label>
        <select
          value={formData.material}
          onChange={(e) => updateSpecs({ material: e.target.value as MaterialType })}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value={MaterialType.PLA}>PLA</option>
          <option value={MaterialType.ABS}>ABS</option>
          <option value={MaterialType.PETG}>PETG</option>
          <option value={MaterialType.NYLON}>Nylon</option>
          <option value={MaterialType.METAL}>Metal</option>
          <option value={MaterialType.RESINA}>Resina</option>
        </select>
      </div>

      {/* Dimensões */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Dimensões (mm) *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Largura
            </label>
            <input
              type="number"
              value={formData.dimensions.largura}
              onChange={(e) => updateDimension('largura', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="50"
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Altura
            </label>
            <input
              type="number"
              value={formData.dimensions.altura}
              onChange={(e) => updateDimension('altura', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="30"
              min="0.1"
              step="0.1"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Profundidade
            </label>
            <input
              type="number"
              value={formData.dimensions.profundidade}
              onChange={(e) => updateDimension('profundidade', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="20"
              min="0.1"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Especificações Adicionais */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Especificações Adicionais
        </label>
        <div style={{ display: 'grid', gap: '10px' }}>
          {commonAdditionalSpecs.map(({ key, label, type }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                {label}
              </label>
              <input
                type={type}
                value={formData.additional_specs?.[key] || ''}
                onChange={(e) => addAdditionalSpec(key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder={`Digite ${label.toLowerCase()}`}
              />
              {formData.additional_specs?.[key] && (
                <button
                  onClick={() => removeAdditionalSpec(key)}
                  style={{
                    marginTop: '4px',
                    padding: '4px 8px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Funcionalidades */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>
            Funcionalidades
          </label>
          <button
            onClick={addFeature}
            style={{
              padding: '6px 12px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Adicionar
          </button>
        </div>
        
        {formData.features?.map((feature, index) => (
          <div
            key={index}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '8px',
              background: '#f8f9fa'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                  Nome
                </label>
                <input
                  type="text"
                  value={feature.nome}
                  onChange={(e) => updateFeature(index, 'nome', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                  Tipo
                </label>
                <select
                  value={feature.tipo}
                  onChange={(e) => updateFeature(index, 'tipo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="furo">Furo</option>
                  <option value="suporte">Suporte</option>
                  <option value="encaixe">Encaixe</option>
                </select>
              </div>
            </div>
            
            {feature.tipo === 'furo' && (
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                  Diâmetro (mm)
                </label>
                <input
                  type="number"
                  value={feature.parametros?.diametro || 5}
                  onChange={(e) => updateFeature(index, 'parametros.diametro', parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100px',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  min="0.1"
                  step="0.1"
                />
              </div>
            )}
            
            <button
              onClick={() => removeFeature(index)}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      {/* Erros de Validação */}
      {errors.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          <strong>Erros de validação:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {errors.map((error, index) => (
              <li key={index} style={{ fontSize: '14px' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botão de Geração */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => {
            const validationErrors = validateForm(formData);
            if (validationErrors.length > 0) {
              setErrors(validationErrors);
              return;
            }
            onGenerate({
              specs: formData
            });
          }}
          disabled={isGenerating || errors.length > 0}
          style={{
            padding: '12px 24px',
            background: isGenerating || errors.length > 0 ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isGenerating || errors.length > 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isGenerating ? 'Gerando Modelo...' : 'Gerar Modelo 3D'}
        </button>
      </div>
    </div>
  );
};

export default ModelSpecsForm;