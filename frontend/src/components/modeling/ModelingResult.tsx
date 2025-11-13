"""
3dPot v2.0 - Componente de Resultado da Modelagem 3D
===================================================

Este módulo implementa o componente para exibição dos resultados
de geração de modelos 3D com métricas e ações.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

import React from 'react';
import {
  ModelingResultProps,
  ModelingResponse,
  PrintabilityReport,
  ModelFormat
} from '../../types/modeling';
import { modelingApi } from '../../services/modelingApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Grid,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Assessment as MetricsIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Build as BuildIcon
} from '@mui/icons-material';

export const ModelingResult: React.FC<ModelingResultProps> = ({
  result,
  onDownload,
  onRegenerate,
  onValidate,
  className = ''
}) => {
  // Extrair métricas do resultado
  const extractMetrics = () => {
    if (!result.specs) return null;
    
    return {
      volume: result.specs.volume || 0,
      surfaceArea: result.specs.surface_area || 0,
      vertices: result.specs.vertices || 0,
      faces: result.specs.faces || 0,
      fileSize: result.specs.file_size || 0,
      dimensions: result.specs.dimensions || { largura: 0, altura: 0, profundidade: 0 }
    };
  };

  // Verificar imprimibilidade
  const isPrintable = () => {
    if (result.printability_report) {
      return modelingApi.isModelPrintable(result.printability_report);
    }
    return result.validation_passed;
  };

  // Extrair relatório de imprimibilidade
  const getPrintabilityReport = (): PrintabilityReport | null => {
    return result.printability_report || null;
  };

  // Formatação de bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatação de volume
  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(2) + ' cm³';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + ' cm³';
    } else {
      return volume.toFixed(2) + ' mm³';
    }
  };

  // Determinar cor do status
  const getStatusColor = (success: boolean, printable: boolean) => {
    if (!success) return 'error';
    if (!printable) return 'warning';
    return 'success';
  };

  // Renderizar métricas
  const renderMetrics = () => {
    const metrics = extractMetrics();
    if (!metrics) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <StorageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{formatBytes(metrics.fileSize)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Tamanho do arquivo
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <BuildIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{metrics.vertices.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">
              Vértices
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <MetricsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{metrics.faces.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">
              Faces
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box sx={{ textAlign: 'center' }}>
            <StorageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{formatVolume(metrics.volume)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Volume
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  // Renderizar dimensões
  const renderDimensions = () => {
    const metrics = extractMetrics();
    if (!metrics) return null;

    const { largura, altura, profundidade } = metrics.dimensions;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Dimensões
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="h6">{largura.toFixed(1)}mm</Typography>
              <Typography variant="caption" color="text.secondary">Largura</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="h6">{altura.toFixed(1)}mm</Typography>
              <Typography variant="caption" color="text.secondary">Altura</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="h6">{profundidade.toFixed(1)}mm</Typography>
              <Typography variant="caption" color="text.secondary">Profundidade</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Renderizar relatório de imprimibilidade
  const renderPrintabilityReport = () => {
    const report = getPrintabilityReport();
    if (!report) return null;

    const { printable, warnings, errors, metrics } = report;
    const statusColor = getStatusColor(result.success, printable);

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Relatório de Imprimibilidade
        </Typography>
        
        <Alert 
          severity={statusColor as any} 
          icon={printable ? <CheckIcon /> : <WarningIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body1" fontWeight="bold">
            {printable ? 'Modelo Imprimível' : 'Problemas de Impressão'}
          </Typography>
          <Typography variant="body2">
            {printable 
              ? 'Este modelo passou na validação e está pronto para impressão 3D.'
              : 'Este modelo possui problemas que podem afetar a impressão.'
            }
          </Typography>
        </Alert>

        {errors.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Erros Críticos:
            </Typography>
            <List dense>
              {errors.map((error, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {warnings.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              Avisos:
            </Typography>
            <List dense>
              {warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={warning} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {metrics && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Métricas de Qualidade:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  Volume: {formatVolume(metrics.volume_mm3)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  Área: {(metrics.surface_area_mm2 / 100).toFixed(2)} cm²
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  Vértices: {metrics.vertices.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  Faces: {metrics.faces.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    );
  };

  const metrics = extractMetrics();
  const printable = isPrintable();
  const printabilityReport = getPrintabilityReport();
  const statusColor = getStatusColor(result.success, printable);

  return (
    <Card className={`modeling-result ${className}`} sx={{ width: '100%' }}>
      <CardContent>
        
        {/* Cabeçalho do resultado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Resultado da Modelagem 3D
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                size="small" 
                label={result.success ? 'Sucesso' : 'Falha'} 
                color={result.success ? 'success' : 'error'}
                icon={result.success ? <CheckIcon /> : <ErrorIcon />}
              />
              
              {result.engine_used && (
                <Chip size="small" label={`Engine: ${result.engine_used}`} variant="outlined" />
              )}
              
              {result.format_used && (
                <Chip size="small" label={`Formato: ${result.format_used.toUpperCase()}`} variant="outlined" />
              )}
              
              {printable && (
                <Chip 
                  size="small" 
                  label="Imprimível" 
                  color="primary" 
                  icon={<CheckIcon />}
                />
              )}
            </Box>
          </Box>

          {/* Ações */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Validar modelo">
              <IconButton onClick={onValidate} color="primary">
                <Assessment />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Download STL">
              <IconButton onClick={() => onDownload(ModelFormat.STL)} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            
            {result.model_path && (
              <Tooltip title="Visualizar modelo">
                <IconButton 
                  onClick={() => window.open(result.model_path, '_blank')}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Gerar novo modelo">
              <IconButton onClick={onRegenerate} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Mensagem */}
        {result.message && (
          <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 3 }}>
            {result.message}
          </Alert>
        )}

        {/* Tempo de geração */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <SpeedIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Tempo de geração: {result.generation_time.toFixed(2)} segundos
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Métricas principais */}
        {metrics && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Métricas do Modelo
            </Typography>
            {renderMetrics()}
          </Box>
        )}

        {/* Dimensões */}
        {metrics && renderDimensions()}

        {/* Relatório de imprimibilidade */}
        {printabilityReport && renderPrintabilityReport()}

        {/* Informações técnicas */}
        {result.specs && !printabilityReport && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Especificações Técnicas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Vértices: {result.specs.vertices || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Faces: {result.specs.faces || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Volume: {result.specs.volume ? formatVolume(result.specs.volume) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Área: {result.specs.surface_area ? (result.specs.surface_area / 100).toFixed(2) + ' cm²' : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Botões de ação */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload()}
            disabled={!result.model_path}
          >
            Download STL
          </Button>
          
          <Button
            variant="outlined"
            onClick={onValidate}
            disabled={!result.model_path}
          >
            Validar para Impressão
          </Button>
          
          <Button
            variant="outlined"
            onClick={onRegenerate}
            startIcon={<RefreshIcon />}
          >
            Gerar Novo
          </Button>
        </Box>

        {/* Barra de progresso para qualidade */}
        {metrics && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Complexidade do Modelo
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((metrics.faces / 10000) * 100, 100)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary">
              {metrics.faces < 5000 ? 'Modelo simples' : 
               metrics.faces < 15000 ? 'Modelo moderado' : 'Modelo complexo'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelingResult;