'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Ticket, AttachedFile, TicketMessage } from '@/types';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  ShoppingCart, 
  Send, 
  Camera, 
  Copy, 
  Check, 
  Share2, 
  Building2, 
  MessageSquare, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Timer, 
  FileText, 
  RefreshCw,
  TrendingUp,
  Bot
} from 'lucide-react';

interface ClientTrackingPortalProps {
  initialProtocol?: string;
  onNavigateToTriage?: () => void;
}

export function ClientTrackingPortal({ initialProtocol, onNavigateToTriage }: ClientTrackingPortalProps) {
  const { 
    tickets, 
    workOrders, 
    purchases, 
    addTicketMessage, 
    rateTicket, 
    createTicketFromTriage,
    isOnline,
    offlineQueueCount
  } = useApp();

  // Mode: 'track' | 'new_request' | 'analytics'
  const [viewMode, setViewMode] = useState<'track' | 'new_request' | 'analytics'>('track');
  const [searchInput, setSearchInput] = useState(initialProtocol || tickets[0]?.ticketNumber || '');
  const [searchedTicketId, setSearchedTicketId] = useState<string | null>(() => {
    if (initialProtocol) {
      const match = tickets.find(t => 
        t.ticketNumber.toLowerCase() === initialProtocol.toLowerCase() ||
        (t.trackingCode && t.trackingCode.toLowerCase() === initialProtocol.toLowerCase())
      );
      if (match) return match.id;
    }
    return tickets[0]?.id || null;
  });
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Derived current ticket - always up-to-date with context tickets
  const searchedTicket = searchedTicketId 
    ? (tickets.find(t => t.id === searchedTicketId) || null) 
    : (tickets[0] || null);

  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatAttachments, setChatAttachments] = useState<AttachedFile[]>([]);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Rating state
  const [selectedStars, setSelectedStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // New Request Form state (Customer Direct Access)
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [newRequestFiles, setNewRequestFiles] = useState<AttachedFile[]>([]);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Image modal preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchedTicket?.messages]);

  const handleSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : searchInput).trim().toLowerCase();
    if (!q) return;

    setSearchNotFound(false);

    // Search by ticketNumber, trackingCode, phone, email, or clientName
    const found = tickets.find(t => 
      t.ticketNumber.toLowerCase() === q ||
      (t.trackingCode && t.trackingCode.toLowerCase() === q) ||
      t.clientPhone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      t.clientEmail.toLowerCase() === q ||
      t.clientName.toLowerCase().includes(q)
    );

    if (found) {
      setSearchedTicketId(found.id);
      setSearchNotFound(false);
    } else {
      setSearchNotFound(true);
    }
  };

  const handleCopyCode = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = (t: Ticket) => {
    const code = t.trackingCode || t.ticketNumber;
    const msg = encodeURIComponent(
      `Olá! Estou acompanhando o chamado ${t.ticketNumber} (Protocolo: ${code}) na CorpServices.\nStatus atual: ${t.status.toUpperCase()}.\nConsulte em tempo real no portal.`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() && chatAttachments.length === 0) return;
    if (!searchedTicket) return;

    addTicketMessage(
      searchedTicket.id,
      chatMessage.trim(),
      'cliente',
      searchedTicket.clientName || 'Cliente',
      chatAttachments.length > 0 ? [...chatAttachments] : undefined
    );

    setChatMessage('');
    setChatAttachments([]);
  };

  const handleSimulateSupportReply = () => {
    if (!searchedTicket) return;
    addTicketMessage(
      searchedTicket.id,
      `Olá ${searchedTicket.clientName.split(' ')[0]}! Aqui é a equipe de Suporte CorpServices. Analisamos sua solicitação e o técnico já está em deslocamento com as peças originais para verificação.`,
      'suporte',
      'Central de Atendimento CorpServices'
    );
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newAtt: AttachedFile = {
        id: `att-chat-${Date.now()}`,
        name: file.name,
        url: reader.result as string,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.includes('image') ? 'image' : 'pdf',
        category: 'durante',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        uploadedBy: 'Cliente'
      };
      setChatAttachments(prev => [...prev, newAtt]);
    };

    reader.readAsDataURL(file);
  };

  const handleNewRequestFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newAtt: AttachedFile = {
        id: `att-req-${Date.now()}`,
        name: file.name,
        url: reader.result as string,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.includes('image') ? 'image' : 'pdf',
        category: 'antes',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        uploadedBy: clientName || 'Cliente'
      };
      setNewRequestFiles(prev => [...prev, newAtt]);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDescription.trim() || !clientName.trim() || !clientPhone.trim()) return;

    setIsSubmittingNew(true);

    const isPurchase = requestDescription.toLowerCase().includes('compr') || requestDescription.toLowerCase().includes('peça');

    const created = createTicketFromTriage({
      type: isPurchase ? 'compra' : 'servico',
      title: `${isPurchase ? 'Aquisição' : 'Atendimento'}: ${equipmentName || 'Manutenção Solicitada'}`,
      description: requestDescription,
      urgency: 'alta',
      status: 'aberto',
      clientName,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '.')}@empresa.com.br`,
      clientPhone,
      clientCompany: clientCompany || 'Cliente Corporativo',
      department: department || 'Operações',
      location: location || 'Matriz / Unidade Central',
      equipmentName: equipmentName || 'Equipamento Geral',
      aiTriageSummary: `Solicitação registrada via Portal Mobile do Cliente. Classificada como [${isPurchase ? 'COMPRAS' : 'SERVIÇOS EM CAMPO'}].`,
      aiSuggestedCategory: isPurchase ? 'Suprimentos & Peças' : 'Manutenção Geral',
      aiConfidence: 0.96,
      files: newRequestFiles,
      estimatedCost: isPurchase ? 950 : 650
    });

    setIsSubmittingNew(false);
    setSearchedTicketId(created.id);
    setSearchInput(created.ticketNumber);
    setViewMode('track');

    // Reset form fields
    setRequestDescription('');
    setNewRequestFiles([]);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedTicket) return;
    rateTicket(searchedTicket.id, selectedStars, ratingComment);
    setRatingSubmitted(true);
  };

  // Find linked Work Order or Purchase Request
  const linkedOS = searchedTicket?.convertedToId 
    ? workOrders.find(o => o.id === searchedTicket.convertedToId) 
    : workOrders.find(o => o.ticketId === searchedTicket?.id);

  const linkedPurchase = searchedTicket?.convertedToId 
    ? purchases.find(p => p.id === searchedTicket.convertedToId)
    : purchases.find(p => p.ticketId === searchedTicket?.id);

  // Status Stepper calculation
  const getStepProgress = (ticket: Ticket) => {
    if (ticket.status === 'aberto' || ticket.status === 'em_triagem') return 1;
    if (ticket.status === 'convertido_os' || ticket.status === 'convertido_compra' || ticket.status === 'aprovado_gestor') {
      if (linkedOS) {
        if (linkedOS.status === 'em_execucao' || linkedOS.status === 'pausada') return 3;
        if (linkedOS.status === 'aguardando_validacao_gestor') return 4;
        if (linkedOS.status === 'concluida') return 5;
        return 2;
      }
      return 2;
    }
    if (ticket.status === 'resolvido_direto' || ticket.status === 'concluido') return 5;
    return 1;
  };

  const currentStep = searchedTicket ? getStepProgress(searchedTicket) : 1;

  // Analytics for all clients
  const uniqueCompanies = Array.from(new Set(tickets.map(t => t.clientCompany).filter(Boolean)));
  const ratedTickets = tickets.filter(t => t.clientRating?.stars);
  const averageCSAT = ratedTickets.length > 0 
    ? (ratedTickets.reduce((acc, t) => acc + (t.clientRating?.stars || 0), 0) / ratedTickets.length).toFixed(1)
    : '4.9';

  return (
    <div className="space-y-4 pb-20 md:pb-6 max-w-5xl mx-auto">

      {/* Top Banner & Mode Switcher */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#e7dfd1] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#c85a32] to-[#df8c6f] flex items-center justify-center shrink-0 shadow-md shadow-[#c85a32]/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  Portal de Acompanhamento do Cliente
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Acesso Público
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Consulte o andamento pelo código de protocolo, converse no chat com suporte e avalie o serviço.
              </p>
            </div>
          </div>

          {/* Quick Tabs: Acompanhar | Nova Solicitação | Análise & Relatórios */}
          <div className="flex items-center p-1 bg-[#faf7f2] rounded-xl border border-[#e7dfd1] text-xs font-medium self-start sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => setViewMode('track')}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg transition min-h-[40px] flex items-center justify-center space-x-1.5 ${
                viewMode === 'track' 
                  ? 'bg-[#c85a32] text-white font-semibold shadow-xs' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Consultar Protocolo</span>
            </button>
            <button
              onClick={() => setViewMode('new_request')}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg transition min-h-[40px] flex items-center justify-center space-x-1.5 ${
                viewMode === 'new_request' 
                  ? 'bg-[#c85a32] text-white font-semibold shadow-xs' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Nova Solicitação</span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex-1 sm:flex-initial px-3 py-2 rounded-lg transition min-h-[40px] flex items-center justify-center space-x-1.5 ${
                viewMode === 'analytics' 
                  ? 'bg-[#c85a32] text-white font-semibold shadow-xs' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Análise de Clientes</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE: TRACK / SEARCH */}
      {viewMode === 'track' && (
        <div className="space-y-4">
          
          {/* Protocol Search Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e7dfd1] shadow-xs">
            <label className="block text-xs font-semibold text-stone-800 mb-2">
              Informe o Código do Ticket, Protocolo de Rastreamento ou Telefone:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: TCK-2026-0891, TRK-0891 ou (11) 99345-1234"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white min-h-[48px] transition"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                className="px-6 py-3 rounded-xl bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center space-x-2 min-h-[48px]"
              >
                <Search className="w-4 h-4" />
                <span>Rastrear Agora</span>
              </button>
            </div>

            {/* Quick Sample Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-stone-500 font-medium">Exemplos rápidos:</span>
              {tickets.slice(0, 4).map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSearchInput(t.ticketNumber);
                    handleSearch(t.ticketNumber);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    searchedTicket?.id === t.id
                      ? 'bg-[#fdf2ed] text-[#c85a32] border-[#f5d6c6] font-bold'
                      : 'bg-[#faf7f2] text-stone-700 border-[#e7dfd1] hover:bg-[#ede5d8]'
                  }`}
                >
                  {t.ticketNumber} ({t.type === 'servico' ? 'Serviço' : 'Compra'})
                </button>
              ))}
            </div>

            {searchNotFound && (
              <div className="mt-3 p-3 rounded-xl bg-[#fdf2f2] border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Nenhuma solicitação encontrada com esse código ou telefone. Verifique os dígitos e tente novamente.</span>
              </div>
            )}
          </div>

          {/* Searched Ticket Details */}
          {searchedTicket && (
            <div className="space-y-4">
              
              {/* Protocol Card with Share and Copy */}
              <div className="bg-white border border-[#e7dfd1] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e7dfd1]">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
                        Protocolo Oficial
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        searchedTicket.urgency === 'critica' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        searchedTicket.urgency === 'alta' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-stone-100 text-stone-800 border border-stone-200'
                      }`}>
                        Urgência {searchedTicket.urgency}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-mono tracking-tight">
                        {searchedTicket.ticketNumber}
                      </h2>
                      {searchedTicket.trackingCode && (
                        <span className="text-xs font-mono font-bold bg-[#faf7f2] text-emerald-800 px-2 py-1 rounded border border-[#e7dfd1]">
                          Rastreio: {searchedTicket.trackingCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Copy & WhatsApp */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCode(searchedTicket.trackingCode || searchedTicket.ticketNumber)}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 text-xs font-semibold border border-[#e7dfd1] transition min-h-[40px]"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(searchedTicket)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-xs transition min-h-[40px]"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Status Stepper Progress */}
                <div className="p-4 bg-[#faf7f2] rounded-xl border border-[#e7dfd1] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 uppercase tracking-wider text-[11px]">
                      Linha do Tempo da Solicitação
                    </span>
                    <span className="font-bold text-[#c85a32]">
                      Etapa {currentStep} de 5
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#e7dfd1] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#df8c6f] to-[#c85a32] h-full transition-all duration-500"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                  </div>

                  {/* 5 Steps Label Grid */}
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px] sm:text-xs">
                    <div className={currentStep >= 1 ? 'text-[#c85a32] font-bold' : 'text-stone-400'}>
                      1. Recebido
                    </div>
                    <div className={currentStep >= 2 ? 'text-[#c85a32] font-bold' : 'text-stone-400'}>
                      2. Triagem IA
                    </div>
                    <div className={currentStep >= 3 ? 'text-[#c85a32] font-bold' : 'text-stone-400'}>
                      3. Em Execução
                    </div>
                    <div className={currentStep >= 4 ? 'text-[#c85a32] font-bold' : 'text-stone-400'}>
                      4. Assinatura
                    </div>
                    <div className={currentStep >= 5 ? 'text-emerald-700 font-bold' : 'text-stone-400'}>
                      5. Concluído
                    </div>
                  </div>
                </div>

                {/* Ticket Details & Real-Time Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Left Column: Client Data & Problem */}
                  <div className="space-y-3 bg-[#faf7f2] p-4 rounded-xl border border-[#e7dfd1]">
                    <h3 className="font-bold text-stone-900 text-sm flex items-center">
                      <Building2 className="w-4 h-4 mr-1.5 text-[#c85a32]" />
                      Dados do Solicitante & Localização
                    </h3>

                    <div className="space-y-1.5 text-stone-700">
                      <div>
                        <span className="text-stone-500">Solicitante:</span>{' '}
                        <strong className="text-stone-900">{searchedTicket.clientName}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500">Empresa:</span>{' '}
                        <span className="text-stone-900 font-medium">{searchedTicket.clientCompany}</span>
                      </div>
                      {searchedTicket.department && (
                        <div>
                          <span className="text-stone-500">Departamento:</span>{' '}
                          <span className="text-stone-900">{searchedTicket.department}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-stone-500">Telefone:</span>{' '}
                        <span className="text-stone-900 font-mono">{searchedTicket.clientPhone}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Endereço / Unidade:</span>{' '}
                        <span className="text-stone-900">{searchedTicket.location}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Equipamento:</span>{' '}
                        <span className="text-emerald-800 font-semibold">{searchedTicket.equipmentName || 'Manutenção Predial'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e7dfd1]">
                      <span className="text-stone-500 block mb-1">Descrição Relatada:</span>
                      <p className="text-stone-700 leading-relaxed bg-white p-2.5 rounded-lg border border-[#e7dfd1] text-[11px]">
                        {searchedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Execution Status, Field Tech & Linked OS */}
                  <div className="space-y-3 bg-[#faf7f2] p-4 rounded-xl border border-[#e7dfd1]">
                    <h3 className="font-bold text-stone-900 text-sm flex items-center justify-between">
                      <span className="flex items-center">
                        <Wrench className="w-4 h-4 mr-1.5 text-[#c85a32]" />
                        Status do Atendimento em Campo
                      </span>
                      {linkedOS?.isTimerActive && (
                        <span className="flex items-center space-x-1 text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono font-bold animate-pulse">
                          <Timer className="w-3 h-3 text-emerald-700" />
                          <span>Técnico no Local</span>
                        </span>
                      )}
                    </h3>

                    {linkedOS ? (
                      <div className="space-y-2 text-stone-700">
                        <div>
                          <span className="text-stone-500">Ordem de Serviço:</span>{' '}
                          <strong className="text-stone-900 font-mono">{linkedOS.osNumber}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500">Técnico Designado:</span>{' '}
                          <strong className="text-stone-900">{linkedOS.assignedTechnicianName || 'Roberto Silveira (Téc. Senior)'}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500">Status Operacional:</span>{' '}
                          <span className="capitalize text-emerald-800 font-semibold">
                            {linkedOS.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500">Agendamento:</span>{' '}
                          <span className="text-stone-900">{linkedOS.scheduledDate}</span>
                        </div>
                        {linkedOS.totalWorkDurationMinutes > 0 && (
                          <div>
                            <span className="text-stone-500">Tempo Trabalhado:</span>{' '}
                            <span className="text-stone-900 font-mono">{linkedOS.totalWorkDurationMinutes} minutos</span>
                          </div>
                        )}

                        {/* Checklist progress */}
                        {linkedOS.checklist && linkedOS.checklist.length > 0 && (
                          <div className="pt-2 border-t border-[#e7dfd1]">
                            <span className="text-stone-500 block mb-1">Checklist de Conformidade:</span>
                            <div className="space-y-1">
                              {linkedOS.checklist.map(item => (
                                <div key={item.id} className="flex items-center space-x-2 text-[11px]">
                                  {item.completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-stone-400 shrink-0" />
                                  )}
                                  <span className={item.completed ? 'text-stone-900 font-medium' : 'text-stone-500'}>
                                    {item.task}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {linkedOS.digitalSignature && (
                          <div className="pt-2 border-t border-[#e7dfd1] flex items-center justify-between">
                            <span className="text-emerald-800 font-semibold flex items-center">
                              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-700" /> Assinatura Digital Coletada
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Hash: {linkedOS.digitalSignature.validationHash.slice(0, 10)}...
                            </span>
                          </div>
                        )}
                      </div>
                    ) : linkedPurchase ? (
                      <div className="space-y-2 text-stone-700">
                        <div>
                          <span className="text-stone-500">Pedido de Compras:</span>{' '}
                          <strong className="text-stone-900 font-mono">{linkedPurchase.purchaseNumber}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500">Status Suprimentos:</span>{' '}
                          <span className="capitalize text-amber-800 font-semibold">{linkedPurchase.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Fornecedor Selecionado:</span>{' '}
                          <span className="text-stone-900">{linkedPurchase.selectedSupplier || 'Em cotação com 3 fornecedores'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Previsão de Entrega:</span>{' '}
                          <span className="text-stone-900">{linkedPurchase.neededByDate}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-lg text-stone-600 border border-[#e7dfd1]">
                        <p className="leading-relaxed">
                          Chamado registrado e aguardando despacho da gerência operacional. Você será notificado assim que o técnico ou comprador for atribuído.
                        </p>
                      </div>
                    )}

                  </div>

                </div>

                {/* Evidence Photos (Before / After) */}
                {searchedTicket.files.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#e7dfd1]">
                    <span className="text-xs font-semibold text-stone-800 flex items-center">
                      <Camera className="w-4 h-4 mr-1.5 text-[#c85a32]" />
                      Evidências Fotográficas do Chamado ({searchedTicket.files.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {searchedTicket.files.map(f => (
                        <div 
                          key={f.id} 
                          onClick={() => f.type === 'image' && setPreviewImage(f.url)}
                          className="group relative bg-[#faf7f2] rounded-xl p-2 border border-[#e7dfd1] cursor-pointer hover:border-[#c85a32] transition"
                        >
                          {f.type === 'image' ? (
                            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white">
                              <img src={f.url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                              <span className="absolute top-1 right-1 text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/60 text-white font-bold backdrop-blur-xs">
                                {f.category || 'evidência'}
                              </span>
                            </div>
                          ) : (
                            <div className="h-24 rounded-lg bg-white flex flex-col items-center justify-center p-2 text-center">
                              <FileText className="w-8 h-8 text-[#c85a32] mb-1" />
                              <span className="text-[10px] text-stone-600 truncate max-w-full">{f.name}</span>
                            </div>
                          )}
                          <p className="text-[10px] text-stone-700 truncate mt-1">{f.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* INTEGRATED LIVE CHAT: Customer ↔ Support & Administrators */}
              <div className="bg-white border border-[#e7dfd1] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd1]">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fdf2ed] text-[#c85a32] flex items-center justify-center border border-[#f5d6c6]">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Chat em Tempo Real com Suporte & Gestão
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Comunique-se diretamente com o suporte técnico e administradores
                      </p>
                    </div>
                  </div>

                  {/* No test button in production */}
                </div>

                {/* Messages Box */}
                <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e7dfd1] min-h-[220px] max-h-[380px] overflow-y-auto space-y-3">
                  {searchedTicket.messages && searchedTicket.messages.length > 0 ? (
                    searchedTicket.messages.map(msg => {
                      const isClient = msg.senderRole === 'cliente';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center space-x-1.5 mb-1 px-1">
                            <span className="text-[10px] font-semibold text-stone-600">
                              {msg.senderName}
                            </span>
                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              isClient ? 'bg-[#fdf2ed] text-[#c85a32]' : 'bg-white text-stone-700 border border-[#e7dfd1]'
                            }`}>
                              {msg.senderRole}
                            </span>
                            <span className="text-[9px] text-stone-400">
                              {msg.timestamp.slice(11, 16) || msg.timestamp}
                            </span>
                          </div>

                          <div className={`p-3 rounded-2xl max-w-sm sm:max-w-md text-xs leading-relaxed ${
                            isClient 
                              ? 'bg-[#c85a32] text-white rounded-tr-none shadow-xs' 
                              : 'bg-white text-stone-800 border border-[#e7dfd1] rounded-tl-none shadow-xs'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.message}</p>

                            {/* Message Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.attachments.map(att => (
                                  <div key={att.id} className="rounded overflow-hidden border border-black/10 bg-black/5 p-1">
                                    {att.type === 'image' ? (
                                      <img src={att.url} alt={att.name} className="w-full h-32 object-cover rounded" />
                                    ) : (
                                      <div className="flex items-center space-x-1 text-[11px] p-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="truncate">{att.name}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-stone-400 text-center">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-stone-500" />
                      <p className="text-xs">Nenhuma mensagem neste chamado ainda.</p>
                      <p className="text-[11px] text-stone-400">Inicie uma conversa digitando abaixo.</p>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Attachments preview */}
                {chatAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-[#faf7f2] rounded-lg border border-[#e7dfd1]">
                    {chatAttachments.map(f => (
                      <div key={f.id} className="relative bg-white rounded p-1.5 text-[10px] text-stone-800 border border-[#e7dfd1] flex items-center space-x-1.5">
                        <span className="truncate max-w-[120px] font-medium">{f.name}</span>
                        <button
                          onClick={() => setChatAttachments(prev => prev.filter(x => x.id !== f.id))}
                          className="text-rose-600 hover:text-rose-800 ml-1 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {/* Camera / Attachment button */}
                    <label className="cursor-pointer p-3 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-700 border border-[#d6cab8] transition flex items-center justify-center min-h-[44px] min-w-[44px]">
                      <Camera className="w-4 h-4 text-[#c85a32]" />
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        capture="environment"
                        onChange={handleChatFileUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      placeholder="Digite sua mensagem para o suporte ou gestor..."
                      className="flex-1 bg-white border border-[#d6cab8] rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                    />

                    <button
                      type="submit"
                      disabled={!chatMessage.trim() && chatAttachments.length === 0}
                      className="px-5 py-3 rounded-xl bg-[#c85a32] hover:bg-[#b84924] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center space-x-1.5 min-h-[44px]"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Enviar</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
                    <span>Pressione Enter para enviar</span>
                    {!isOnline && (
                      <span className="text-amber-800 flex items-center font-medium">
                        ⚠️ Modo offline: mensagem salva localmente
                      </span>
                    )}
                  </div>
                </form>

              </div>

              {/* CUSTOMER SATISFACTION (CSAT) RATING CARD */}
              <div className="bg-white border border-[#e7dfd1] rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center">
                  <Star className="w-4 h-4 mr-1.5 text-amber-500 fill-amber-500" />
                  Pesquisa de Satisfação do Cliente (CSAT)
                </h3>
                <p className="text-xs text-stone-600">
                  Sua avaliação é fundamental para os relatórios de qualidade e controle de metas da CorpServices.
                </p>

                {searchedTicket.clientRating || ratingSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-stone-900">Avaliação registrada com sucesso!</h4>
                      <div className="flex items-center space-x-1 my-1">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star 
                            key={st} 
                            className={`w-4 h-4 ${
                              st <= (searchedTicket.clientRating?.stars || selectedStars) 
                                ? 'text-amber-500 fill-amber-500' 
                                : 'text-stone-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-stone-700 text-[11px]">
                        &quot;{searchedTicket.clientRating?.feedback || ratingComment || 'Excelente atendimento e agilidade!'}&quot;
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-stone-700 mr-2">Como você avalia este atendimento?</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setSelectedStars(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star className={`w-6 h-6 ${
                            star <= selectedStars ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                          }`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-700 ml-2">
                        {selectedStars === 5 ? 'Excelente' : selectedStars === 4 ? 'Muito Bom' : selectedStars === 3 ? 'Regular' : 'A melhorar'}
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={ratingComment}
                      onChange={e => setRatingComment(e.target.value)}
                      placeholder="Deixe um comentário sobre a pontualidade, qualidade técnica e cordialidade da equipe..."
                      className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32]"
                    />

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs shadow-xs transition"
                    >
                      Enviar Avaliação de Satisfação
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* VIEW MODE: NEW REQUEST (COLLECT CUSTOMER DATA) */}
      {viewMode === 'new_request' && (
        <div className="bg-white border border-[#e7dfd1] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd1]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-[#c85a32]" />
                Abertura de Nova Solicitação pelo Cliente
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Não é necessário criar senha. Seus dados geram um número de protocolo automático para acompanhamento posterior.
              </p>
            </div>
            {onNavigateToTriage && (
              <button
                onClick={onNavigateToTriage}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#fdf2ed] text-[#c85a32] border border-[#f5d6c6] hover:bg-[#faebd7] transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c85a32]" />
                <span>Usar Bot IA Avançado</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitNewRequest} className="space-y-4">
            
            {/* Customer Data Collection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Ex: Mariana Duarte"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Empresa / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={clientCompany}
                  onChange={e => setClientCompany(e.target.value)}
                  placeholder="Ex: Industrial Alfa S.A."
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Telefone / WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="Ex: (11) 99345-1234"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  placeholder="Ex: mariana.duarte@alfa-ind.com.br"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Departamento / Centro de Custo
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Ex: Manutenção Predial, CPD, Logística"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Equipamento / Ativo / Patrimônio
                </label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={e => setEquipmentName(e.target.value)}
                  placeholder="Ex: Chiller, Gerador, Ar Condicionado"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Localização Física / Endereço / Bloco / Andar *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ex: Unidade Tamboré - Barueri/SP, Bloco B, Cobertura Técnica"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[44px]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Descreva detalhadamente o problema ou os materiais necessários *
              </label>
              <textarea
                rows={4}
                required
                value={requestDescription}
                onChange={e => setRequestDescription(e.target.value)}
                placeholder="Exemplo: O chiller do bloco B parou por alarme de sobrepressão e a temperatura dos servidores está subindo. Solicito envio de técnico emergencial."
                className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl p-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32]"
              />
            </div>

            {/* Camera / File upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700 flex items-center">
                  <Camera className="w-4 h-4 mr-1.5 text-[#c85a32]" />
                  Fotos do Problema ou Documentos (Câmera ou Arquivo)
                </label>
                <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 rounded-lg text-xs border border-[#d6cab8] transition">
                  <Camera className="w-3.5 h-3.5 text-[#c85a32]" />
                  <span>Tirar Foto / Anexar</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={handleNewRequestFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {newRequestFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {newRequestFiles.map(f => (
                    <div key={f.id} className="relative bg-[#faf7f2] rounded-xl p-2 border border-[#e7dfd1] flex items-center space-x-2">
                      {f.type === 'image' ? (
                        <img src={f.url} alt={f.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <FileText className="w-8 h-8 text-[#c85a32] shrink-0" />
                      )}
                      <div className="truncate flex-1">
                        <p className="text-[11px] font-medium text-stone-900 truncate">{f.name}</p>
                        <p className="text-[10px] text-stone-500">{f.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-stone-500 italic">
                  Nenhum arquivo anexado. Fotos facilitam o diagnóstico e aceleram o despacho da equipe técnica.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingNew}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-[#c85a32] hover:bg-[#b84924] text-white font-bold text-xs sm:text-sm shadow-xs transition disabled:opacity-50 min-h-[48px]"
              >
                {isSubmittingNew ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gerando Protocolo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Abrir Chamado e Gerar Código de Acompanhamento</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* VIEW MODE: ANALYTICS & CLIENTS REPORT */}
      {viewMode === 'analytics' && (
        <div className="space-y-4">
          
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Total de Solicitações de Clientes
              </span>
              <div className="text-2xl font-black text-stone-900 mt-1">
                {tickets.length}
              </div>
              <span className="text-[10px] text-[#c85a32] font-semibold">100% catalogados</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Empresas & Unidades Atendidas
              </span>
              <div className="text-2xl font-black text-stone-900 mt-1">
                {uniqueCompanies.length}
              </div>
              <span className="text-[10px] text-stone-600 font-semibold">Clientes ativos no ERP</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Índice Médio de Satisfação (CSAT)
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1 flex items-center">
                <span>{averageCSAT}</span>
                <span className="text-sm text-stone-400 font-normal ml-1">/ 5.0</span>
                <Star className="w-5 h-5 ml-2 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">Meta de Excelência ≥ 4.8</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] shadow-xs">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Resolução no Prazo (SLA)
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                98.4%
              </div>
              <span className="text-[10px] text-stone-500">Atendimento em campo e compras</span>
            </div>

          </div>

          {/* Table of Clients & Requests */}
          <div className="bg-white rounded-2xl border border-[#e7dfd1] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e7dfd1] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Base de Dados de Clientes para Auditoria e Relatórios
                </h3>
                <p className="text-xs text-stone-500">
                  Dados consolidados com contatos, históricos e protocolos gerados
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-[#faf7f2] text-stone-600 uppercase font-semibold text-[10px] tracking-wider border-b border-[#e7dfd1]">
                  <tr>
                    <th className="p-3">Protocolo</th>
                    <th className="p-3">Cliente / Contato</th>
                    <th className="p-3">Empresa / Departamento</th>
                    <th className="p-3">Localização</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7dfd1]">
                  {tickets.map(t => (
                    <tr key={t.id} className="hover:bg-[#faf7f2] transition">
                      <td className="p-3 font-mono font-bold text-[#c85a32]">
                        {t.ticketNumber}
                        {t.trackingCode && (
                          <span className="block text-[10px] text-stone-500 font-mono">
                            {t.trackingCode}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <strong className="text-stone-900 block">{t.clientName}</strong>
                        <span className="text-[11px] text-stone-500">{t.clientPhone}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-stone-900 font-medium block">{t.clientCompany}</span>
                        <span className="text-[11px] text-stone-500">{t.department || 'Operações'}</span>
                      </td>
                      <td className="p-3 text-[11px] max-w-[200px] truncate text-stone-600" title={t.location}>
                        {t.location}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          t.type === 'servico' ? 'bg-[#fdf2ed] text-[#c85a32] border border-[#f5d6c6]' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3 capitalize font-medium text-emerald-800">
                        {t.status.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSearchedTicketId(t.id);
                            setSearchInput(t.ticketNumber);
                            setViewMode('track');
                          }}
                          className="px-2.5 py-1 rounded bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 text-[11px] font-semibold border border-[#e7dfd1] transition"
                        >
                          Ver no Portal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-[#e7dfd1] shadow-2xl bg-white">
            <img src={previewImage} alt="Evidência ampliada" className="w-full h-auto object-contain max-h-[80vh]" />
            <div className="p-3 bg-[#faf7f2] border-t border-[#e7dfd1] flex items-center justify-between text-xs text-stone-700">
              <span className="font-medium">Evidência Fotográfica Original CorpServices</span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="px-3 py-1 rounded bg-[#c85a32] text-white font-bold"
              >
                Fechar ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
