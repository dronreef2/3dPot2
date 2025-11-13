/**
 * Cliente API para conversação
 * Implementa comunicação com backend para funcionalidades de IA conversacional
 */

import { 
  Conversation, 
  Message, 
  SpecExtraction, 
  ConversationMessage,
  ConversationalRequest, 
  ConversationalResponse 
} from '../types/conversational';
import { apiClient } from './apiClient';

// Criar nova conversa
export async function createConversation(projectId?: string): Promise<Conversation> {
  const payload: any = {};
  
  if (projectId) {
    payload.project_id = projectId;
  }
  
  return apiClient.post<Conversation>('/conversational/conversations', payload);
}

// Listar conversas do usuário
export async function listConversations(skip = 0, limit = 20): Promise<Conversation[]> {
  return apiClient.get<Conversation[]>(`/conversational/conversations?skip=${skip}&limit=${limit}`);
}

// Obter detalhes de uma conversa
export async function getConversation(conversationId: string): Promise<Conversation> {
  return apiClient.get<Conversation>(`/conversational/conversations/${conversationId}`);
}

// Obter mensagens de uma conversa
export async function getMessages(conversationId: string, skip = 0, limit = 50): Promise<Message[]> {
  return apiClient.get<Message[]>(`/conversational/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`);
}

// Enviar mensagem para conversa
export async function sendMessage(conversationId: string, content: string): Promise<ConversationMessage> {
  const payload = {
    content,
  };
  
  return apiClient.post<ConversationMessage>(`/conversational/conversations/${conversationId}/messages`, payload);
}

// Extrair especificações de uma conversa
export async function extractSpecs(conversationId: string): Promise<SpecExtraction> {
  return apiClient.get<SpecExtraction>(`/conversational/conversations/${conversationId}/extract-specs`);
}

// Iniciar conversa usando o serviço legado
export async function startConversation(projectId?: string): Promise<Conversation> {
  const params = projectId ? `?project_id=${projectId}` : '';
  return apiClient.post<Conversation>(`/conversational/start${params}`, {});
}

// Processar mensagem usando o serviço legado
export async function processMessage(request: ConversationalRequest): Promise<ConversationalResponse> {
  return apiClient.post<ConversationalResponse>('/conversational/message', request);
}