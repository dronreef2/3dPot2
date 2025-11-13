import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Sparkles, HelpCircle, Info, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useConversationalStore } from '../../store/conversationalStore';
import { useAuthStore } from '../../store/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  clarifications?: string[];
  extractedSpecs?: Record<string, any>;
}

interface ConversationalInterfaceProps {
  projectId?: string;
  conversationId?: string;
  onSpecificationsExtracted?: (specs: Record<string, any>) => void;
}

export const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({
  projectId,
  conversationId,
  onSpecificationsExtracted,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  
  const {
    currentConversation,
    messages,
    isLoading,
    error,
    createConversation,
    selectConversation,
    sendMessage,
    clearError,
  } = useConversationalStore();
  
  // Inicializar conversa se necessário
  useEffect(() => {
    const initializeConversation = async () => {
      if (!conversationId && !currentConversation) {
        const newConversationId = await createConversation(projectId);
        if (newConversationId) {
          await selectConversation(newConversationId);
        }
      } else if (conversationId && conversationId !== currentConversation?.id) {
        await selectConversation(conversationId);
      }
    };
    
    initializeConversation();
  }, [conversationId, currentConversation, projectId]);
  
  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Focar input quando componente carregar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation || isLoading) return;
    
    // Limpar erro anterior
    clearError();
    
    const message = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Enviar mensagem
      await sendMessage(currentConversation.id, message);
      
      // Verificar se foram extraídas especificações
      const latestMessage = messages[messages.length - 1];
      if (latestMessage?.extractedSpecs && onSpecificationsExtracted) {
        onSpecificationsExtracted(latestMessage.extractedSpecs);
        toast.success('Especificações extraídas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleClarification = (clarification: string) => {
    setInputMessage(`Sobre ${clarification}: `);
    inputRef.current?.focus();
  };
  
  const formatMessage = (content: string) => {
    // Formatação básica de markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br />');
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Assistente de Prototipagem</h3>
            <p className="text-blue-100 text-sm">
              Conversação Inteligente • Minimax M2 AI
            </p>
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button 
                  onClick={clearError}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
        {currentConversation && (
          <div className="text-xs text-gray-500 mb-4">
            {new Date(currentConversation.created_at).toLocaleDateString()}
          </div>
        )}
        
        {currentConversation && messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Inicie uma conversa sobre seu projeto de prototipagem. Seja detalhado sobre suas necessidades.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button 
                onClick={() => setInputMessage('Quero criar um projeto para Arduino')}
                className="text-xs p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Projeto para Arduino
              </button>
              <button 
                onClick={() => setInputMessage('Preciso de um gabinete para Raspberry Pi')}
                className="text-xs p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Gabinete Raspberry Pi
              </button>
              <button 
                onClick={() => setInputMessage('Projeto mecânico com peças impressas')}
                className="text-xs p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Projeto Mecânico
              </button>
              <button 
                onClick={() => setInputMessage('Preciso de componentes eletrônicos')}
                className="text-xs p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Componentes Eletrônicos
              </button>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">IA Assistant</span>
                  </div>
                )}
                
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(message.content),
                  }}
                />
                
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                
                {/* Especificações extraídas */}
                {message.extractedSpecs && Object.keys(message.extractedSpecs).length > 0 && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs font-medium text-green-800 mb-1 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      ✅ Especificações Extraídas:
                    </p>
                    <div className="text-xs text-green-700">
                      {message.extractedSpecs.categoria && (
                        <div>Categoria: {message.extractedSpecs.categoria}</div>
                      )}
                      {message.extractedSpecs.material && (
                        <div>Material: {message.extractedSpecs.material}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Clarificações necessárias */}
                {message.clarifications && message.clarifications.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-yellow-800 mb-2">
                      💡 Para melhorar, você poderia especificar:
                    </p>
                    {message.clarifications.map((clarification, index) => (
                      <button
                        key={index}
                        onClick={() => handleClarification(clarification)}
                        className="block w-full text-left text-xs p-2 bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors"
                      >
                        <HelpCircle className="w-3 h-3 inline mr-1" />
                        {clarification}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Indicador de digitação */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-600">Pensando...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Descreva seu projeto em detalhes..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || !currentConversation}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !currentConversation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
          <span>💡 Dicas: Mencione dimensões, materiais, funcionalidades e restrições para melhor resultado</span>
          {currentConversation && (
            <button 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              onClick={() => selectConversation(currentConversation.id)}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizar</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};