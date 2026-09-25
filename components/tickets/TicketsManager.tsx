'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Ticket, TicketType, TicketUrgency } from '@/types';
import { 
  Inbox, 
  Wrench, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  Image as ImageIcon,
  Bot,
  ChevronRight,
  Send, 
  MessageSquare,
  Star
} from 'lucide-react';

interface TicketsManagerProps {
  onNavigateToOS?: (osId: string) => void;
  onNavigateToPurchase?: (purchaseId: string) => void;
}

export function TicketsManager({ onNavigateToOS, onNavigateToPurchase }: TicketsManagerProps) {
  const { 
    tickets, 
    currentUserRole, 
    currentUser,
    users, 
    resolveTicketDirect, 
    convertTicketToOS, 
    convertTicketToPurchase,
    addTicketMessage
  } = useApp();

  const [activeTab, setActiveTab] = useState<TicketType>('servico');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('todas');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [managerReplyText, setManagerReplyText] = useState('');

  // Modals for Manager Actions
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');

  const [showOSModal, setShowOSModal] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState(users.find(u => u.role === 'tecnico')?.id || '');
  const [osScheduledDate, setOsScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [osNotes, setOsNotes] = useState('');

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState(users.find(u => u.role === 'comprador')?.id || '');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Filter tickets by active tab (Serviço vs Compra)
  const tabTickets = tickets.filter(t => t.type === activeTab);

  const filteredTickets = tabTickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.equipmentName && t.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesUrgency = filterUrgency === 'todas' || t.urgency === filterUrgency;

    return matchesSearch && matchesUrgency;
  });

  const serviceCount = tickets.filter(t => t.type === 'servico').length;
  const purchaseCount = tickets.filter(t => t.type === 'compra').length;

  const handleOpenResolve = (t: Ticket) => {
    setSelectedTicket(t);
    setResolveNotes('');
    setShowResolveModal(true);
  };

  const handleConfirmResolve = () => {
    if (!selectedTicket || !resolveNotes.trim()) return;
    resolveTicketDirect(selectedTicket.id, resolveNotes);
    setShowResolveModal(false);
    setSelectedTicket(null);
  };

  const handleOpenConvertOS = (t: Ticket) => {
    setSelectedTicket(t);
    setOsNotes('');
    setShowOSModal(true);
  };

  const handleConfirmConvertOS = () => {
    if (!selectedTicket) return;
    const osId = convertTicketToOS(selectedTicket.id, selectedTechId, osScheduledDate, osNotes);
    setShowOSModal(false);
    setSelectedTicket(null);
    if (onNavigateToOS) onNavigateToOS(osId);
  };

  const handleOpenConvertPurchase = (t: Ticket) => {
    setSelectedTicket(t);
    setPurchaseNotes('');
    setShowPurchaseModal(true);
  };

  const handleConfirmConvertPurchase = () => {
    if (!selectedTicket) return;
    const purId = convertTicketToPurchase(selectedTicket.id, selectedBuyerId, purchaseNotes);
    setShowPurchaseModal(false);
    setSelectedTicket(null);
    if (onNavigateToPurchase) onNavigateToPurchase(purId);
  };

  const urgencyBadges: Record<TicketUrgency, { label: string; style: string }> = {
    critica: { label: 'Crítica', style: 'bg-rose-50 text-rose-800 border-rose-200' },
    alta: { label: 'Alta', style: 'bg-amber-50 text-amber-800 border-amber-200' },
    media: { label: 'Média', style: 'bg-[#faf7f2] text-stone-800 border-[#e7dfd1]' },
    baixa: { label: 'Baixa', style: 'bg-stone-50 text-stone-600 border-stone-200' },
  };

  const statusLabels: Record<string, { label: string; style: string }> = {
    aberto: { label: 'Aberto (Pendente Decisão)', style: 'bg-stone-100 text-stone-800 border-stone-200' },
    convertido_os: { label: 'Convertido em O.S.', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    convertido_compra: { label: 'Convertido em Compra', style: 'bg-amber-50 text-amber-800 border-amber-200' },
    resolvido_direto: { label: 'Resolvido pelo Gestor', style: 'bg-[#faf7f2] text-stone-700 border-[#e7dfd1]' },
    concluido: { label: 'Concluído e Validado', style: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#e7dfd1]">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center">
            <Inbox className="w-5 h-5 mr-2 text-[#c85a32]" />
            Campo de Chamados CorpServices
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Gestão segregada entre Serviços em Campo e Solicitações de Compras para triagem e despacho
          </p>
        </div>

        {/* Tab Switcher - Segregated tabs */}
        <div className="flex bg-[#faf7f2] p-1 rounded-xl border border-[#e7dfd1]">
          <button
            onClick={() => setActiveTab('servico')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'servico'
                ? 'bg-[#c85a32] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Chamados de Serviços</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
              activeTab === 'servico' ? 'bg-white/20 text-white' : 'bg-[#e7dfd1] text-stone-700'
            }`}>
              {serviceCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('compra')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'compra'
                ? 'bg-[#c85a32] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Solicitações de Compras</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
              activeTab === 'compra' ? 'bg-white/20 text-white' : 'bg-[#e7dfd1] text-stone-700'
            }`}>
              {purchaseCount}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-[#e7dfd1] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por protocolo, título, cliente..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-500" />
          <span className="text-xs text-stone-600 font-medium">Urgência:</span>
          <select
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            className="bg-[#faf7f2] border border-[#d6cab8] rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32]"
          >
            <option value="todas">Todas as Urgências</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#e7dfd1] rounded-xl text-stone-500 text-xs">
            Nenhum ticket encontrado nesta categoria com os filtros selecionados.
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const urgencyInfo = urgencyBadges[ticket.urgency];
            const statusInfo = statusLabels[ticket.status] || { label: ticket.status, style: 'bg-[#faf7f2] text-stone-700 border-[#e7dfd1]' };

            return (
              <div
                key={ticket.id}
                className="bg-white hover:bg-[#faf7f2] p-4 rounded-xl border border-[#e7dfd1] hover:border-[#c85a32]/50 transition shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  
                  {/* Left Column: Identification & Title */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#c85a32] bg-[#fdf2ed] px-2 py-0.5 rounded border border-[#f5d6c6]">
                        {ticket.ticketNumber}
                      </span>
                      {ticket.trackingCode && (
                        <span className="font-mono text-[10px] font-bold text-stone-600 bg-[#faf7f2] px-1.5 py-0.5 rounded border border-[#e7dfd1]">
                          {ticket.trackingCode}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${urgencyInfo.style}`}>
                        {urgencyInfo.label}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusInfo.style}`}>
                        {statusInfo.label}
                      </span>
                      {ticket.aiSuggestedCategory && (
                        <span className="text-[10px] bg-[#faf7f2] text-stone-700 px-2 py-0.5 rounded border border-[#e7dfd1]">
                          {ticket.aiSuggestedCategory}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm text-stone-900 line-clamp-1">
                      {ticket.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1 text-stone-400" />
                        {ticket.clientName} ({ticket.clientCompany})
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-stone-400" />
                        {ticket.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-stone-400" />
                        {ticket.createdAt}
                      </span>
                      {ticket.files.length > 0 && (
                        <span className="flex items-center text-[#c85a32] font-medium">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {ticket.files.length} anexo(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Manager Decision Buttons & Actions */}
                  <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e7dfd1]">
                    
                    {/* Only Gestor can resolve or convert pending tickets */}
                    {currentUserRole === 'gestor' && ticket.status === 'aberto' && (
                      <div className="flex items-center space-x-1.5">
                        
                        <button
                          onClick={() => handleOpenResolve(ticket)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 text-xs font-medium border border-[#e7dfd1] transition"
                        >
                          Resolver Direto
                        </button>

                        {ticket.type === 'servico' ? (
                          <button
                            onClick={() => handleOpenConvertOS(ticket)}
                            className="px-3 py-1.5 rounded-lg bg-[#c85a32] hover:bg-[#b84924] text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                          >
                            <Wrench className="w-3.5 h-3.5 mr-1" />
                            <span>Gerar O.S.</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenConvertPurchase(ticket)}
                            className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            <span>Gerar Pedido</span>
                          </button>
                        )}

                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-1.5 rounded-lg bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-700 hover:text-stone-900 border border-[#e7dfd1] text-xs transition flex items-center"
                      title="Ver detalhes completos do ticket"
                    >
                      <span className="hidden sm:inline mr-1 text-[11px] font-medium">Detalhes</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RESOLVE DIRECT MODAL */}
      {showResolveModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-stone-900">
            <h2 className="text-base font-bold text-stone-900 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-700" />
              Resolver Chamado Diretamente (Gestão)
            </h2>
            <p className="text-xs text-stone-600">
              Você está prestes a encerrar o ticket <strong>{selectedTicket.ticketNumber}</strong> sem a necessidade de deslocamento de equipe de campo ou compras.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Parecer de Resolução / Justificativa Operacional:
              </label>
              <textarea
                rows={3}
                value={resolveNotes}
                onChange={e => setResolveNotes(e.target.value)}
                placeholder="Exemplo: Esclarecimento técnico prestado via telefone; reinicialização remota do disjuntor efetuada pelo cliente."
                className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs"
              >
                Confirmar Resolução
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT TO OS MODAL */}
      {showOSModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-stone-900">
            <h2 className="text-base font-bold text-stone-900 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-[#c85a32]" />
              Gerar Ordem de Serviço (OS) em Campo
            </h2>
            <p className="text-xs text-stone-600">
              Despachar ticket <strong>{selectedTicket.ticketNumber}</strong> para a equipe técnica de campo com cronômetro, checklist e relatório com assinatura digital.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Atribuir ao Técnico Responsável:
                </label>
                <select
                  value={selectedTechId}
                  onChange={e => setSelectedTechId(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32]"
                >
                  {users.filter(u => u.role === 'tecnico' || u.role === 'gestor').map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Data Prevista de Execução:
                </label>
                <input
                  type="date"
                  value={osScheduledDate}
                  onChange={e => setOsScheduledDate(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Instruções Específicas do Gestor ao Técnico (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={osNotes}
                  onChange={e => setOsNotes(e.target.value)}
                  placeholder="Ex: Levar manômetro digital e EPIs de altura."
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowOSModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmConvertOS}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs"
              >
                Criar e Despachar O.S.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONVERT TO PURCHASE MODAL */}
      {showPurchaseModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-stone-900">
            <h2 className="text-base font-bold text-stone-900 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-amber-700" />
              Converter em Solicitação de Compra
            </h2>
            <p className="text-xs text-stone-600">
              Encaminhar ticket <strong>{selectedTicket.ticketNumber}</strong> para o Comprador responsável iniciar mapa de cotação e validação orçamentária.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Atribuir ao Comprador:
                </label>
                <select
                  value={selectedBuyerId}
                  onChange={e => setSelectedBuyerId(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32]"
                >
                  {users.filter(u => u.role === 'comprador' || u.role === 'gestor').map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Diretrizes de Compra / Especificação Técnica:
                </label>
                <textarea
                  rows={2}
                  value={purchaseNotes}
                  onChange={e => setPurchaseNotes(e.target.value)}
                  placeholder="Ex: Exigir certificação Inmetro e garantia mínima de 12 meses."
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmConvertPurchase}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-xs"
              >
                Gerar Pedido de Compras
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TICKET DETAIL MODAL */}
      {selectedTicket && !showOSModal && !showResolveModal && !showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd1]">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-[#c85a32] bg-[#fdf2ed] px-2.5 py-1 rounded border border-[#f5d6c6]">
                  {selectedTicket.ticketNumber}
                </span>
                <span className="text-xs font-bold uppercase text-stone-600">
                  [{selectedTicket.type === 'servico' ? 'Chamado de Serviço' : 'Solicitação de Compra'}]
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-stone-500 hover:text-stone-900 text-xs font-bold"
              >
                Fechar ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h3 className="text-base font-bold text-stone-900">{selectedTicket.title}</h3>
                <p className="text-stone-700 mt-1 leading-relaxed bg-[#faf7f2] p-3 rounded-lg border border-[#e7dfd1]">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#faf7f2] rounded-lg border border-[#e7dfd1]">
                <div>
                  <span className="text-stone-500 block">Cliente / Empresa:</span>
                  <span className="text-stone-900 font-medium">{selectedTicket.clientName} ({selectedTicket.clientCompany})</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Telefone:</span>
                  <span className="text-stone-900 font-medium">{selectedTicket.clientPhone}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Local:</span>
                  <span className="text-stone-900 font-medium">{selectedTicket.location}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Equipamento:</span>
                  <span className="text-stone-900 font-medium">{selectedTicket.equipmentName || 'Não especificado'}</span>
                </div>
              </div>

              {selectedTicket.aiTriageSummary && (
                <div className="p-3 rounded-lg bg-[#faf7f2] border border-[#e7dfd1] text-stone-800">
                  <span className="font-bold flex items-center mb-1 text-[#c85a32]">
                    <Bot className="w-3.5 h-3.5 mr-1" /> Parecer do Bot IA CorpServices:
                  </span>
                  <p>{selectedTicket.aiTriageSummary}</p>
                </div>
              )}

              {selectedTicket.files.length > 0 && (
                <div>
                  <span className="text-stone-700 font-semibold block mb-1">Arquivos e Fotos Anexadas:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedTicket.files.map(f => (
                      <div key={f.id} className="bg-[#faf7f2] rounded-lg p-2 border border-[#e7dfd1]">
                        {f.type === 'image' ? (
                          <img src={f.url} alt={f.name} className="w-full h-24 object-cover rounded mb-1" />
                        ) : (
                          <div className="h-24 bg-white rounded flex items-center justify-center mb-1">
                            <FileText className="w-8 h-8 text-[#c85a32]" />
                          </div>
                        )}
                        <p className="text-[10px] text-stone-900 truncate font-medium">{f.name}</p>
                        <p className="text-[9px] text-stone-500">{f.size}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Thread with the Customer */}
              <div className="pt-2 border-t border-[#e7dfd1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 flex items-center text-xs">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-[#c85a32]" />
                    Comunicação com o Cliente / Solicitante ({selectedTicket.messages?.length || 0})
                  </span>
                  {selectedTicket.trackingCode && (
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Rastreio: {selectedTicket.trackingCode}
                    </span>
                  )}
                </div>

                <div className="bg-[#faf7f2] p-3 rounded-xl border border-[#e7dfd1] max-h-48 overflow-y-auto space-y-2">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map(m => (
                      <div key={m.id} className={`text-[11px] p-2 rounded-lg ${
                        m.senderRole === 'cliente' 
                          ? 'bg-white border border-[#e7dfd1] text-stone-800' 
                          : 'bg-[#fdf2ed] border border-[#f5d6c6] text-stone-900 ml-4'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] text-stone-500 mb-0.5">
                          <strong className={m.senderRole === 'cliente' ? 'text-amber-800' : 'text-[#c85a32]'}>
                            {m.senderName} ({m.senderRole})
                          </strong>
                          <span>{m.timestamp.slice(11, 16) || m.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-stone-500 italic text-center py-2">
                      Nenhuma mensagem trocada ainda com o cliente.
                    </p>
                  )}
                </div>

                {/* Reply Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!managerReplyText.trim() || !selectedTicket) return;
                    addTicketMessage(
                      selectedTicket.id,
                      managerReplyText.trim(),
                      'gestor',
                      `${currentUser.name} (Gestor CorpServices)`
                    );
                    setManagerReplyText('');
                  }}
                  className="flex items-center space-x-2 pt-1"
                >
                  <input
                    type="text"
                    value={managerReplyText}
                    onChange={e => setManagerReplyText(e.target.value)}
                    placeholder="Responder diretamente ao cliente no portal..."
                    className="flex-1 bg-white border border-[#d6cab8] rounded-lg px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] min-h-[40px]"
                  />
                  <button
                    type="submit"
                    disabled={!managerReplyText.trim()}
                    className="px-4 py-2 rounded-lg bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs transition disabled:opacity-40 flex items-center space-x-1 min-h-[40px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>

              {/* Customer Rating if available */}
              {selectedTicket.clientRating && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center text-xs">
                      <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                      Avaliação do Cliente (CSAT): {selectedTicket.clientRating.stars} de 5 estrelas
                    </span>
                    <span className="text-[10px] text-stone-500">{selectedTicket.clientRating.submittedAt?.slice(0, 10)}</span>
                  </div>
                  {selectedTicket.clientRating.feedback && (
                    <p className="text-[11px] text-stone-700 italic">
                      &quot;{selectedTicket.clientRating.feedback}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#e7dfd1]">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg text-xs bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 border border-[#e7dfd1] min-h-[40px]"
              >
                Voltar à Lista
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
