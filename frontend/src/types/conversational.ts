/**
 * Tipos para conversação com IA
 */

import { UUID } from './uuid';

export interface Conversation {
  id: UUID;
  user_id: UUID;
  project_id?: UUID;
  status: 'active' | 'especificando' | 'clarificando' | 'validando' | 'complete';
  especificacoes_extraidas: Record<string, any>;
  clarificacoes_pendentes: string[];
  contexto_conversacao: Record<string, any>;
  specs: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface Message {
  id: UUID;
  conversation_id: UUID;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ConversationMessage {
  id: UUID;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  extractedSpecs?: Record<string, any>;
}

export interface SpecExtraction {
  conversation_id: UUID;
  specifications: Record<string, any>;
  extracted_at: Date;
}

export interface ConversationalRequest {
  message: string;
  conversation_id?: UUID;
  project_id?: UUID;
}

export interface ConversationalResponse {
  response: string;
  conversation_id: UUID;
  message_id: UUID;
  clarifications_needed: string[];
  extractedSpecs: Record<string, any>;
}