import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface Project {
  id: string;
  nome: string;
  descricaoUsuario: string;
  categoria: 'mecanico' | 'eletronico' | 'mixto' | 'arquitetura';
  status: 'draft' | 'conversando' | 'modelando' | 'simulando' | 'orcando' | 'completo';
  createdAt: string;
  updatedAt: string;
}

export interface ConversationalRequest {
  message: string;
  conversationId?: string;
  projectId?: string;
}

export interface ConversationalResponse {
  response: string;
  conversationId: string;
  messageId: string;
  clarificationsNeeded: string[];
  extractedSpecs: Record<string, any>;
}

export interface Model3D {
  id: string;
  nome: string;
  engine: 'cadquery' | 'openscad' | 'slant3d' | 'manual';
  arquivoPath: string;
  imprimivel: boolean;
  errosValidacao: string[];
  warnings: string[];
  metrics: {
    volume: number;
    area: number;
    vertices: number;
    faces: number;
  };
}

export interface Simulation {
  id: string;
  nome: string;
  tipoSimulacao: 'drop_test' | 'stress_test' | 'motion' | 'fluid';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progresso: number;
  resultado?: any;
}

export interface Budget {
  id: string;
  custoMaterial: number;
  custoComponentes: number;
  custoImpressao: number;
  custoMaoObra: number;
  precoFinal: number;
  margemLucroPercentual: number;
  itensDetalhados: Array<{
    descricao: string;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
    fornecedor: string;
  }>;
}

// API Client
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          toast.error('Sessão expirada. Faça login novamente.');
          window.location.href = '/login';
        } else if (error.response?.status >= 500) {
          toast.error('Erro interno do servidor. Tente novamente mais tarde.');
        } else if (error.response?.data?.detail) {
          toast.error(error.response.data.detail);
        } else {
          toast.error('Erro desconhecido. Tente novamente.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<{ access_token: string; token_type: string }> {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  // Projects methods
  async getProjects(): Promise<Project[]> {
    const response = await this.client.get('/projects');
    return response.data.items;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await this.client.post('/projects/', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await this.client.put(`/projects/${id}`, projectData);
    return response.data;
  }

  // Conversational methods
  async startConversation(projectId?: string): Promise<any> {
    const response = await this.client.post('/conversational/start', { projectId });
    return response.data;
  }

  async sendMessage(request: ConversationalRequest): Promise<ConversationalResponse> {
    const response = await this.client.post('/conversational/message', request);
    return response.data;
  }

  async getConversation(conversationId: string): Promise<any> {
    const response = await this.client.get(`/conversational/${conversationId}`);
    return response.data;
  }

  // Modeling methods
  async generateModel(projectId: string, specifications: Record<string, any>): Promise<Model3D> {
    const formData = new FormData();
    formData.append('project_id', projectId);
    formData.append('specifications', JSON.stringify(specifications));

    const response = await this.client.post('/modeling/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getModelStatus(modelId: string): Promise<any> {
    const response = await this.client.get(`/modeling/${modelId}/status`);
    return response.data;
  }

  async downloadModel(modelId: string): Promise<Blob> {
    const response = await this.client.get(`/modeling/${modelId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Simulation methods
  async startSimulation(simulationData: {
    modelId: string;
    nome: string;
    tipoSimulacao: string;
    parametros?: Record<string, any>;
    condicoesIniciais?: Record<string, any>;
  }): Promise<Simulation> {
    const response = await this.client.post('/simulation/start', simulationData);
    return response.data;
  }

  async getSimulationStatus(simulationId: string): Promise<any> {
    const response = await this.client.get(`/simulation/${simulationId}/status`);
    return response.data;
  }

  async getSimulationResults(simulationId: string): Promise<any> {
    const response = await this.client.get(`/simulation/${simulationId}/results`);
    return response.data;
  }

  // Budgeting methods
  async calculateBudget(projectId: string, margemLucro: number = 30): Promise<Budget> {
    const response = await this.client.post('/budgeting/calculate', {
      projetoId: projectId,
      margemLucroPercentual: margemLucro,
    });
    return response.data;
  }

  async getBudget(projectId: string): Promise<Budget> {
    const response = await this.client.get(`/budgeting/${projectId}`);
    return response.data;
  }

  async generateProposal(budgetId: string): Promise<{ proposalPath: string; downloadUrl: string }> {
    const response = await this.client.post(`/budgeting/${budgetId}/proposal`);
    return response.data;
  }

  async downloadProposal(budgetId: string): Promise<Blob> {
    const response = await this.client.get(`/budgeting/${budgetId}/download-proposal`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // System methods
  async getHealthStatus(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }

  async getSystemStats(): Promise<any> {
    const response = await this.client.get('/stats');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();