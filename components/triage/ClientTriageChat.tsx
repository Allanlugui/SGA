'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { AttachedFile } from '@/types';
import { 
  Bot, 
  Send, 
  Wrench, 
  ShoppingCart, 
  Camera, 
  Paperclip, 
  CheckCircle2, 
  ArrowRight,
  User,
  X,
  FileText
} from 'lucide-react';

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'cliente' | 'suporte' | 'gestor' | 'tecnico';
  message: string;
  timestamp: string;
  attachments?: AttachedFile[];
}

interface ClientTriageChatProps {
  onTicketCreated?: (ticketId: string, type: 'servico' | 'compra') => void;
}

export function ClientTriageChat({ onTicketCreated }: ClientTriageChatProps) {
  const { createTicketFromTriage, currentUser } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      senderName: 'Assistente CorpServices',
      senderRole: 'suporte',
      message: `Olá! Descreva aqui o problema técnico ocorrendo no local ou as peças que precisa solicitar para que eu possa abrir seu chamado de imediato.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [extractedTicketData, setExtractedTicketData] = useState<any>(null);
  const [createdTicketResult, setCreatedTicketResult] = useState<any>(null);
  
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  // File Upload Helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newFile: AttachedFile = {
        id: `att-chat-${Date.now()}`,
        name: file.name,
        url: reader.result as string,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.includes('image') ? 'image' : 'pdf',
        category: 'antes',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        uploadedBy: currentUser.name
      };
      setAttachedFiles(prev => [...prev, newFile]);
    };

    reader.readAsDataURL(file);
  };

  const removeAttachment = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Submit User Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const userText = inputText.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to UI
    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUser.name,
      senderRole: 'cliente',
      message: userText,
      timestamp: now,
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputText('');
    setAttachedFiles([]);
    setIsProcessing(true);

    try {
      // Call conversational triage API
      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          clientContext: {
            name: currentUser.name,
            company: currentUser.department, // Use Department or Company info
            department: currentUser.department,
            phone: currentUser.phone || '(11) 98765-4321',
            email: currentUser.email
          }
        })
      });

      if (!res.ok) throw new Error('API offline');

      const data = await res.json();

      // Add Bot response
      const botResponseMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        senderName: 'Assistente CorpServices',
        senderRole: 'suporte',
        message: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botResponseMsg]);

      // If Bot extracted complete ticket data
      if (data.ticketData) {
        setExtractedTicketData(data.ticketData);
      } else {
        setExtractedTicketData(null);
      }

    } catch (error) {
      console.error('Erro de triagem:', error);
      
      // Basic Local Fallback Response
      const isPurchase = userText.toLowerCase().includes('compr') || userText.toLowerCase().includes('peça');
      const botResponseMsg: ChatMessage = {
        id: `msg-bot-err-${Date.now()}`,
        senderName: 'Assistente CorpServices',
        senderRole: 'suporte',
        message: `Entendido. Registrei sua solicitação de ${isPurchase ? 'compra' : 'serviço'}. Deseja confirmar a criação do chamado técnico com esses detalhes agora?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botResponseMsg]);
      setExtractedTicketData({
        type: isPurchase ? 'compra' : 'servico',
        title: isPurchase ? 'Solicitação de Peças / Insumos' : 'Manutenção Corretiva Predial',
        description: userText,
        urgency: 'alta',
        suggestedCategory: isPurchase ? 'Suprimentos' : 'Manutenção Geral',
        location: 'Área indicada no chamado',
        equipmentName: 'Equipamento Geral',
        estimatedCost: isPurchase ? 600 : 400,
        suggestedChecklist: isPurchase 
          ? ['Cotar insumos', 'Verificar almoxarifado'] 
          : ['Avaliar local', 'Reparar e testar']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and Generate Ticket
  const handleConfirmTicket = () => {
    if (!extractedTicketData) return;

    const created = createTicketFromTriage({
      type: extractedTicketData.type,
      title: extractedTicketData.title,
      description: extractedTicketData.description,
      urgency: extractedTicketData.urgency,
      status: 'aberto',
      clientName: currentUser.name,
      clientEmail: currentUser.email,
      clientPhone: currentUser.phone || '(11) 98765-4321',
      clientCompany: currentUser.department || 'Matriz Industrial',
      location: extractedTicketData.location,
      equipmentName: extractedTicketData.equipmentName,
      aiTriageSummary: `Triagem amigável executada pelo Chatbot IA. Categoria sugerida: ${extractedTicketData.suggestedCategory}.`,
      aiSuggestedCategory: extractedTicketData.suggestedCategory,
      files: [],
      estimatedCost: extractedTicketData.estimatedCost
    });

    setCreatedTicketResult(created);
    setExtractedTicketData(null);
  };

  const handleReset = () => {
    setCreatedTicketResult(null);
    setExtractedTicketData(null);
    setMessages([
      {
        id: `msg-welcome-reset-${Date.now()}`,
        senderName: 'Assistente CorpServices',
        senderRole: 'suporte',
        message: `Olá! Qual o seu novo chamado ou material de compra que deseja registrar agora?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      
      {/* Dynamic Main Workspace: Welcome or Ticket Result */}
      {createdTicketResult ? (
        /* Minimal and Clean Success Screen */
        <div className="bg-white border border-[#e7dfd1] rounded-xl p-6 space-y-5 animate-in fade-in zoom-in-95">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wide">Ticket Criado</span>
              <h2 className="text-base font-bold text-stone-900">Protocolo #{createdTicketResult.ticketNumber}</h2>
            </div>
          </div>

          <div className="p-3.5 bg-[#faf7f2] rounded-lg border border-[#e7dfd1] text-xs text-stone-700 space-y-2">
            <div>
              <span className="text-stone-500">Tipo:</span>{' '}
              <span className="font-semibold capitalize text-stone-800">{createdTicketResult.type === 'servico' ? 'Atendimento Técnico' : 'Solicitação de Compra'}</span>
            </div>
            <div>
              <span className="text-stone-500">Título:</span>{' '}
              <span className="text-stone-900 font-semibold">{createdTicketResult.title}</span>
            </div>
            <div>
              <span className="text-stone-500">Localização:</span>{' '}
              <span className="text-stone-800 font-medium">{createdTicketResult.location}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1.5 justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition min-h-[38px]"
            >
              Novo Chamado
            </button>
            
            {onTicketCreated && (
              <button
                onClick={() => onTicketCreated(createdTicketResult.id, createdTicketResult.type)}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs shadow-xs transition min-h-[38px]"
              >
                <span>Acompanhar Chamado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Real Interactive Chat Interface */
        <div className="bg-white border border-[#e7dfd1] rounded-xl flex flex-col h-[68vh] overflow-hidden shadow-xs">
          
          {/* Chat Header */}
          <div className="px-4 py-3 bg-[#faf7f2] border-b border-[#e7dfd1] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#c85a32] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-stone-900 block leading-tight">Chatbot de Triagem</span>
                <span className="text-[10px] text-stone-500">Qualificação rápida de chamados</span>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfbf7]">
            {messages.map((msg) => {
              const isClient = msg.senderRole === 'cliente';
              return (
                <div key={msg.id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-stone-400 mb-0.5 px-1 font-mono">
                    {msg.senderName.split(' ')[0]} · {msg.timestamp}
                  </span>

                  <div className={`p-3 rounded-xl max-w-md text-xs leading-relaxed ${
                    isClient 
                      ? 'bg-[#c85a32] text-white rounded-tr-none' 
                      : 'bg-white text-stone-800 border border-[#e7dfd1] rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.message}</p>

                    {/* Attached files previews */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1 bg-black/5 p-1 rounded-lg">
                        {msg.attachments.map(f => (
                          <div key={f.id} className="flex items-center space-x-1.5 text-[10px]">
                            {f.type === 'image' ? (
                              <img src={f.url} alt={f.name} className="w-10 h-10 object-cover rounded" />
                            ) : (
                              <FileText className="w-4 h-4 text-stone-500" />
                            )}
                            <span className="truncate">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center space-x-2 text-xs text-stone-400 bg-white border border-[#e7dfd1] p-2.5 rounded-xl w-32 justify-center">
                <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                <span>Analisando...</span>
              </div>
            )}

            {/* In-Chat Confirm Ticket Card */}
            {extractedTicketData && (
              <div className="bg-[#faf7f2] border-2 border-[#df8c6f]/40 p-4 rounded-xl space-y-3 max-w-md animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                  <Bot className="w-4 h-4 text-[#c85a32]" />
                  <span>Resumo da Solicitação Identificada:</span>
                </div>
                
                <div className="space-y-1 text-[11px] text-stone-700">
                  <p><strong>Tipo:</strong> {extractedTicketData.type === 'servico' ? 'Serviço em Campo' : 'Compra de Material'}</p>
                  <p><strong>Título:</strong> {extractedTicketData.title}</p>
                  <p><strong>Local:</strong> {extractedTicketData.location}</p>
                  <p><strong>Equipamento:</strong> {extractedTicketData.equipmentName}</p>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setExtractedTicketData(null)}
                    className="px-3 py-1.5 text-[10px] text-stone-600 hover:text-stone-900 font-semibold"
                  >
                    Alterar Dados
                  </button>
                  <button
                    onClick={handleConfirmTicket}
                    className="px-3 py-1.5 bg-[#c85a32] hover:bg-[#b84924] text-white text-[10px] font-bold rounded-lg transition inline-flex items-center"
                  >
                    <span>Confirmar & Criar Ticket</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Active Attachments Bar */}
          {attachedFiles.length > 0 && (
            <div className="px-4 py-2 border-t border-[#e7dfd1] bg-[#faf7f2] flex flex-wrap gap-2">
              {attachedFiles.map(f => (
                <div key={f.id} className="inline-flex items-center space-x-1.5 bg-white border border-[#e7dfd1] px-2 py-1 rounded-lg text-[10px] text-stone-700">
                  <span className="truncate max-w-[120px]">{f.name}</span>
                  <button onClick={() => removeAttachment(f.id)} className="text-rose-600 hover:text-rose-800 font-bold ml-1">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#e7dfd1] bg-white flex items-center space-x-2">
            {/* Attachment Button */}
            <label className="cursor-pointer p-2.5 rounded-lg bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-600 border border-[#d6cab8] transition shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#c85a32]" />
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Digite aqui para o assistente..."
              className="flex-1 bg-[#faf7f2] border border-[#d6cab8] rounded-lg px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white min-h-[40px]"
              disabled={isProcessing}
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && attachedFiles.length === 0) || isProcessing}
              className="p-2.5 bg-[#c85a32] hover:bg-[#b84924] disabled:opacity-40 text-white rounded-lg transition min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
