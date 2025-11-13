/**
 * Loja de estado para conversação com IA
 * Gerencia estado relacionado a conversas e especificações extraídas
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Conversation, 
  Message, 
  SpecExtraction,
  ConversationMessage
} from '../types/conversational';
import * as api from '../services/conversationalApi';

interface ConversationalState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchConversations: () => Promise<void>;
  createConversation: (projectId?: string) => Promise<string | null>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  extractSpecs: (conversationId: string) => Promise<SpecExtraction | null>;
  clearError: () => void;
}

export const useConversationalStore = create<ConversationalState>()(
  devtools(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoading: false,
      error: null,

      fetchConversations: async () => {
        try {
          set({ isLoading: true, error: null });
          const conversations = await api.listConversations();
          set({ conversations, isLoading: false });
        } catch (error) {
          console.error('Erro ao buscar conversas:', error);
          set({ error: 'Não foi possível buscar as conversas', isLoading: false });
        }
      },

      createConversation: async (projectId?: string) => {
        try {
          set({ isLoading: true, error: null });
          const conversation = await api.createConversation(projectId);
          
          // Atualizar lista de conversas
          const currentConversations = get().conversations;
          set({ 
            conversations: [conversation, ...currentConversations],
            isLoading: false 
          });
          
          return conversation.id;
        } catch (error) {
          console.error('Erro ao criar conversa:', error);
          set({ error: 'Não foi possível criar a conversa', isLoading: false });
          return null;
        }
      },

      selectConversation: async (conversationId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Buscar detalhes da conversa
          const conversation = await api.getConversation(conversationId);
          
          // Buscar mensagens
          const messages = await api.getMessages(conversationId);
          
          set({
            currentConversation: conversation,
            messages,
            isLoading: false
          });
        } catch (error) {
          console.error('Erro ao buscar conversa:', error);
          set({ error: 'Não foi possível buscar a conversa', isLoading: false });
        }
      },

      sendMessage: async (conversationId: string, content: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Enviar mensagem
          const message = await api.sendMessage(conversationId, content);
          
          // Atualizar lista de mensagens
          const currentMessages = get().messages;
          set({ 
            messages: [...currentMessages, message],
            isLoading: false 
          });
        } catch (error) {
          console.error('Erro ao enviar mensagem:', error);
          set({ error: 'Não foi possível enviar a mensagem', isLoading: false });
        }
      },

      extractSpecs: async (conversationId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Extrair especificações
          const specs = await api.extractSpecs(conversationId);
          
          set({ isLoading: false });
          return specs;
        } catch (error) {
          console.error('Erro ao extrair especificações:', error);
          set({ error: 'Não foi possível extrair especificações', isLoading: false });
          return null;
        }
      },

      clearError: () => set({ error: null })
    })
  )
);