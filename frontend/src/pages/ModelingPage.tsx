"""
3dPot v2.0 - Página de Modelagem 3D
===================================

Este módulo implementa a página principal de modelagem 3D que
integra a interface de modelagem com o contexto do projeto.

Autor: MiniMax Agent
Data: 2025-11-11
Versão: 1.0.0 - Sprint 3
"""

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModelingInterface } from '../components/modeling/ModelingInterface';
import { useAuthStore } from '../store/authStore';
import { modelingApi } from '../services/modelingApi';
import { ModelSpecs, ModelingResponse } from '../types/modeling';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Button
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

export const ModelingPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedSpecs, setExtractedSpecs] = useState<ModelSpecs | null>(null);

  // Carregar dados do projeto
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        setError('ID do projeto não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Simular carregamento do projeto (implementar API real)
        // Por enquanto, usar dados mock
        const mockProject = {
          id: projectId,
          name: 'Projeto de Prototipagem',
          description: 'Projeto criado para demonstração',
          status: 'em_modelagem',
          specifications: {
            category: 'mecanico',
            material: 'PLA',
            dimensions: {
              largura: 100,
              altura: 50,
              profundidade: 30
            }
          }
        };

        setProject(mockProject);
        
        // Converter especificações do projeto para formato da modelagem
        if (mockProject.specifications) {
          const modelSpecs: ModelSpecs = {
            category: mockProject.specifications.category || 'mecanico',
            material: mockProject.specifications.material || 'PLA',
            dimensions: mockProject.specifications.dimensions || {
              largura: 50,
              altura: 30,
              profundidade: 20
            },
            additional_specs: {},
            components: [],
            features: []
          };
          setExtractedSpecs(modelSpecs);
        }

      } catch (err) {
        console.error('Erro ao carregar projeto:', err);
        setError('Erro ao carregar dados do projeto');
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  // Callback para modelo gerado
  const handleModelGenerated = (model: ModelingResponse) => {
    toast.success('Modelo 3D gerado com sucesso!');
    console.log('Modelo gerado:', model);
    
    // Aqui você pode atualizar o projeto com o modelo gerado
    // updateProjectWithModel(projectId, model);
  };

  // Callback para erro
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Navegação
  const handleNavigateBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleNavigateHome = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">
          Carregando projeto...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleNavigateBack}
          >
            Voltar ao Projeto
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleNavigateHome}
          >
            Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Projeto não encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleNavigateBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <CreateIcon sx={{ mr: 2 }} />
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Modelagem 3D - {project.name}
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Usuário: {user?.username}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: 3, py: 1 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              handleNavigateHome();
            }}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            color="inherit"
            href={`/projects/${projectId}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigateBack();
            }}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            {project.name}
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <CreateIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Modelagem 3D
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Interface de Modelagem */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ModelingInterface
          projectId={projectId}
          initialSpecs={extractedSpecs || undefined}
          onModelGenerated={handleModelGenerated}
          onError={handleError}
          className="modeling-page-content"
        />
      </Box>
    </Box>
  );
};

export default ModelingPage;