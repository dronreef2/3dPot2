"""
3dPot v2.0 - Interface Principal de Modelagem 3D
================================================

Este módulo implementa a interface principal de modelagem 3D que
combina formulário de especificações, visualizador e resultados.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ModelSpecs, 
  ModelingRequest, 
  ModelingResponse,
  ModelingTemplate,
  ModelViewerProps,
  ModelFormat
} from '../../types/modeling';
import { 
  useModelingStore, 
  createDefaultModelSpecs,
  useQuickModelGeneration,
  useModelValidation 
} from '../../store/modelingStore';
import { modelingApi } from '../../services/modelingApi';
import ModelSpecsForm from './ModelSpecsForm';
import ModelViewer from './ModelViewer';
import ModelingResult from './ModelingResult';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Tabs, 
  Tab,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ViewInAr as ModelIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  GridOn as GridIcon,
  ViewQuilt as ViewIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ height: '100%', width: '100%' }}>
      {value === index && children}
    </div>
  );
};

interface ModelingInterfaceProps {
  projectId?: string;
  initialSpecs?: ModelSpecs;
  className?: string;
  onModelGenerated?: (model: ModelingResponse) => void;
  onError?: (error: string) => void;
}

export const ModelingInterface: React.FC<ModelingInterfaceProps> = ({
  projectId,
  initialSpecs,
  className = '',
  onModelGenerated,
  onError
}) => {
  // Estado local
  const [currentTab, setCurrentTab] = useState(0);
  const [specs, setSpecs] = useState<ModelSpecs>(initialSpecs || createDefaultModelSpecs());
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [viewerConfig, setViewerConfig] = useState({
    backgroundColor: '#1a1a1a',
    gridVisible: true,
    axesVisible: true,
    wireframe: false,
    transparent: false,
    opacity: 1.0,
    autoRotate: false
  });

  // Store Zustand
  const {
    currentModel,
    modelingStatus,
    availableEngines,
    availableFormats,
    templates,
    isGenerating,
    isLoading,
    error,
    modelHistory,
    preferredEngine,
    preferredFormat,
    generateModel,
    loadAvailableEngines,
    loadTemplates,
    downloadModel,
    deleteModel,
    resetModeling,
    setError
  } = useModelingStore();

  const { generateFromSpecs } = useQuickModelGeneration();
  const { validateAndCheck, isValidating, validationErrors } = useModelValidation();

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadAvailableEngines(),
          loadTemplates()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        if (onError) {
          onError('Erro ao carregar configurações de modelagem');
        }
      }
    };

    loadInitialData();
  }, [loadAvailableEngines, loadTemplates, onError]);

  // Gerar modelo
  const handleGenerateModel = useCallback(async (request: ModelingRequest) => {
    try {
      setError(null);
      
      const result = await generateModel(request);
      
      if (onModelGenerated) {
        onModelGenerated(result);
      }
      
      // Mudar para aba de visualização
      setCurrentTab(1);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro na geração:', errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [generateModel, onModelGenerated, onError, setError]);

  // Download do modelo
  const handleDownload = useCallback(async (format?: ModelFormat) => {
    if (!currentModel?.model_path) return;
    
    try {
      const modelId = extractModelIdFromPath(currentModel.model_path);
      if (modelId) {
        await downloadModel(modelId, format || preferredFormat);
      }
    } catch (error) {
      console.error('Erro no download:', error);
    }
  }, [currentModel, downloadModel, preferredFormat]);

  // Validar modelo
  const handleValidate = useCallback(async () => {
    if (!currentModel?.model_path) return;
    
    try {
      const modelId = extractModelIdFromPath(currentModel.model_path);
      if (modelId) {
        await validateAndCheck(modelId);
      }
    } catch (error) {
      console.error('Erro na validação:', error);
    }
  }, [currentModel, validateAndCheck]);

  // Extrair ID do modelo do caminho
  const extractModelIdFromPath = (path: string): string | null => {
    const match = path.match(/model[_\-]([0-9]+)/);
    return match ? match[1] : null;
  };

  // Recarregar modelo
  const handleReload = useCallback(() => {
    if (currentModel) {
      // Recarregar o modelo atual
      const request: ModelingRequest = {
        specs,
        project_id: projectId,
        engine: preferredEngine,
        format: preferredFormat
      };
      handleGenerateModel(request);
    }
  }, [currentModel, specs, projectId, preferredEngine, preferredFormat, handleGenerateModel]);

  // Limpar erros
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Atualizar configurações do visualizador
  useEffect(() => {
    setViewerConfig(prev => ({
      ...prev,
      gridVisible: showGrid,
      axesVisible: showAxes,
      wireframe
    }));
  }, [showGrid, showAxes, wireframe]);

  // Props do visualizador
  const viewerProps: ModelViewerProps = {
    modelPath: currentModel?.model_path,
    onModelLoad: (model) => {
      console.log('Modelo carregado:', model);
    },
    onModelError: (error) => {
      console.error('Erro no modelo:', error);
      setError('Erro ao carregar modelo 3D');
    },
    onModelInteraction: (interaction) => {
      console.log('Interação:', interaction);
    },
    className: 'model-viewer-container'
  };

  return (
    <Box className={`modeling-interface ${className}`} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Cabeçalho */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ModelIcon />
            Modelagem 3D
          </Typography>
          
          {/* Controles do visualizador */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              onClick={() => setShowGrid(!showGrid)}
              color={showGrid ? 'primary' : 'default'}
              title="Mostrar/Ocultar Grid"
            >
              <GridIcon />
            </IconButton>
            
            <IconButton
              onClick={() => setShowAxes(!showAxes)}
              color={showAxes ? 'primary' : 'default'}
              title="Mostrar/Ocultar Eixos"
            >
              <ViewIcon />
            </IconButton>
            
            <IconButton
              onClick={() => setWireframe(!wireframe)}
              color={wireframe ? 'primary' : 'default'}
              title="Modo Wireframe"
            >
              {wireframe ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
            
            <Button
              onClick={handleReload}
              startIcon={<RefreshIcon />}
              variant="outlined"
              size="small"
              disabled={!currentModel || isGenerating}
            >
              Recarregar
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mx: 2, mt: 1 }}
        >
          {error}
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert 
          severity="warning" 
          onClose={() => setError(null)}
          sx={{ mx: 2, mt: 1 }}
        >
          <Typography variant="body2">
            Avisos de validação: {validationErrors.join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="Especificações" />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Visualização
                {currentModel && <Chip size="small" label="Gerado" color="success" />}
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Histórico
                {modelHistory.length > 0 && <Chip size="small" label={modelHistory.length} />}
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Conteúdo das Tabs */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        
        {/* Tab: Especificações */}
        <TabPanel value={currentTab} index={0}>
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={12} md={6} sx={{ height: '100%', overflow: 'auto' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <ModelSpecsForm
                    specs={specs}
                    onSpecsChange={setSpecs}
                    onGenerate={handleGenerateModel}
                    isGenerating={isGenerating}
                    templates={templates}
                    className="specs-form"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ height: '100%' }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preview e Informações
                  </Typography>
                  
                  {currentModel ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Modelo gerado com sucesso!
                      </Alert>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload()}
                          disabled={!currentModel.model_path}
                        >
                          Download
                        </Button>
                        
                        <Button
                          variant="outlined"
                          onClick={handleValidate}
                          disabled={isValidating || !currentModel.model_path}
                        >
                          {isValidating ? <CircularProgress size={20} /> : 'Validar'}
                        </Button>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Engine: {currentModel.engine_used}<br/>
                        Formato: {currentModel.format_used}<br/>
                        Tempo: {currentModel.generation_time.toFixed(2)}s
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        Preencha as especificações e clique em "Gerar Modelo 3D"
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Visualização */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ height: '100%', position: 'relative' }}>
            {isGenerating ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={60} />
                <Typography variant="h6">
                  Gerando modelo 3D...
                </Typography>
                <Typography color="text.secondary">
                  Isso pode levar alguns momentos
                </Typography>
              </Box>
            ) : currentModel?.model_path ? (
              <ModelViewer {...viewerProps} style={{ height: '100%' }} />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 2
              }}>
                <ModelIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  Nenhum modelo carregado
                </Typography>
                <Typography color="text.secondary">
                  Gere um modelo para visualizá-lo aqui
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Tab: Histórico */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            {modelHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Nenhum modelo no histórico
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {modelHistory.map((model, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" noWrap>
                            Modelo {index + 1}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload()}
                              title="Download"
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteModel(extractModelIdFromPath(model.model_path || '') || '')}
                              title="Excluir"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Engine: {model.engine_used}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Formato: {model.format_used}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          Tempo: {model.generation_time.toFixed(2)}s
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setCurrentTab(1)}
                            fullWidth
                          >
                            Visualizar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>
      </Box>

      {/* Status Bar */}
      <Box sx={{ 
        borderTop: 1, 
        borderColor: 'divider', 
        p: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '40px'
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {currentModel && (
            <>
              <Chip 
                size="small" 
                label={currentModel.success ? 'Sucesso' : 'Erro'} 
                color={currentModel.success ? 'success' : 'error'} 
              />
              {currentModel.validation_passed && (
                <Chip size="small" label="Validado" color="primary" />
              )}
            </>
          )}
          
          {isGenerating && (
            <Chip size="small" label="Gerando..." color="warning" />
          )}
          
          {modelingStatus && (
            <Typography variant="caption" color="text.secondary">
              Status: {modelingStatus.file_exists ? 'Disponível' : 'Indisponível'}
            </Typography>
          )}
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          Engine preferencial: {preferredEngine} | Formato: {preferredFormat}
        </Typography>
      </Box>
    </Box>
  );
};

export default ModelingInterface;