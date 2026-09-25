'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AttachedFile } from '@/types';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Wrench, 
  ShoppingCart, 
  AlertTriangle, 
  Camera, 
  Paperclip, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  Layers,
  Phone,
  User,
  MapPin
} from 'lucide-react';

interface ClientTriageChatProps {
  onTicketCreated?: (ticketId: string, type: 'servico' | 'compra') => void;
}

export function ClientTriageChat({ onTicketCreated }: ClientTriageChatProps) {
  const { createTicketFromTriage, currentUser } = useApp();

  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState(currentUser.name);
  const [clientEmail, setClientEmail] = useState(currentUser.email);
  const [clientPhone, setClientPhone] = useState('(11) 98765-4321');
  const [clientCompany, setClientCompany] = useState('Edifício Prime Tower / Condomínio Corporate');
  const [location, setLocation] = useState('Torre B - 14º Andar - Sala de Servidores');
  const [equipmentName, setEquipmentName] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedTicketResult, setGeneratedTicketResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Demo Suggestions for user to test instantly
  const quickSuggestions = [
    {
      title: 'Chiller com vazamento e alta temperatura',
      desc: 'Chiller Carrier 30XW com vazamento de fluido refrigerante e temperatura subindo na sala de dados.',
      typeHint: 'servico',
      equipment: 'Chiller Principal Carrier',
      location: 'Cobertura Técnica - Bloco A'
    },
    {
      title: 'Compra emergencial de disjuntores e cabos',
      desc: 'Precisamos de 10 disjuntores bipolares 32A Schneider e 50 metros de cabo flexível 6mm antichama.',
      typeHint: 'compra',
      equipment: 'Painel Elétrico Geral',
      location: 'Almoxarifado / Subsolo 1'
    },
    {
      title: 'Falha intermitente no Gerador de Emergência',
      desc: 'Gerador Stemac 250kVA falhou no teste semanal de partida automática. Bateria com tensão baixa.',
      typeHint: 'servico',
      equipment: 'Gerador Stemac Diesel',
      location: 'Cabine Primária - Térreo'
    }
  ];

  const handleApplySuggestion = (sug: typeof quickSuggestions[0]) => {
    setDescription(sug.desc);
    setEquipmentName(sug.equipment);
    setLocation(sug.location);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newFile: AttachedFile = {
        id: `att-${Date.now()}`,
        name: file.name,
        url: reader.result as string,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.includes('image') ? 'image' : 'pdf',
        category: 'antes',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        uploadedBy: clientName
      };
      setAttachedFiles(prev => [...prev, newFile]);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Por favor, descreva a falha ou o material solicitado.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Call Gemini API Route for structured qualification
      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription: description,
          equipmentName,
          location,
          clientCompany,
          clientName,
        })
      });

      if (!res.ok) {
        throw new Error('Falha ao se comunicar com a IA');
      }

      const aiData = await res.json();

      // Create Ticket in State
      const created = createTicketFromTriage({
        type: aiData.type || (description.toLowerCase().includes('compr') ? 'compra' : 'servico'),
        title: aiData.title || `Chamado: ${equipmentName || 'Manutenção Predial'}`,
        description,
        urgency: aiData.urgency || 'alta',
        status: 'aberto',
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        location,
        equipmentName,
        aiTriageSummary: aiData.summary || 'Triagem automática CorpServices.',
        aiSuggestedCategory: aiData.suggestedCategory || 'Manutenção Geral',
        aiConfidence: aiData.confidence || 0.98,
        files: attachedFiles,
        estimatedCost: aiData.estimatedCost || 750
      });

      setGeneratedTicketResult({
        ...created,
        replyToClient: aiData.replyToClient,
        suggestedChecklist: aiData.suggestedChecklist || []
      });

    } catch (err: any) {
      console.error('Falha na triagem:', err);
      // Contingency local ticket
      const isPurchase = description.toLowerCase().includes('compr') || description.toLowerCase().includes('peça');
      const created = createTicketFromTriage({
        type: isPurchase ? 'compra' : 'servico',
        title: `Solicitação: ${equipmentName || 'Atendimento'}`,
        description,
        urgency: 'alta',
        status: 'aberto',
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        location,
        equipmentName,
        aiTriageSummary: `Triagem automática CorpServices: Solicitação categorizada como ${isPurchase ? 'COMPRAS' : 'SERVIÇOS'}.`,
        aiSuggestedCategory: isPurchase ? 'Suprimentos & Peças' : 'Manutenção Geral',
        aiConfidence: 0.95,
        files: attachedFiles,
        estimatedCost: 800
      });

      setGeneratedTicketResult({
        ...created,
        replyToClient: 'Seu chamado foi registrado e já está na fila de aprovação e despacho da CorpServices.',
        suggestedChecklist: ['Inspeção no local', 'Validação das peças', 'Registro de fotos']
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setAttachedFiles([]);
    setGeneratedTicketResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e7dfd1] shadow-xs">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#c85a32] to-[#df8c6f] flex items-center justify-center shrink-0 shadow-md shadow-[#c85a32]/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                Triagem Inteligente com Bot IA
              </h1>
              <span className="text-xs bg-[#fdf2ed] text-[#c85a32] font-semibold px-2 py-0.5 rounded border border-[#f5d6c6] flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-[#c85a32]" /> Powered by Gemini
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              O Bot IA analisa sua solicitação em linguagem natural, classifica automaticamente em 
              <strong className="text-stone-900"> Serviços em Campo</strong> ou 
              <strong className="text-stone-900"> Solicitação de Compras</strong>, avalia a urgência e gera um Ticket estruturado com rastreabilidade total.
            </p>
          </div>
        </div>
      </div>

      {!generatedTicketResult ? (
        <form onSubmit={handleSubmitTriage} className="space-y-4">
          
          {/* Client & Enterprise Location Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7dfd1] shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-[#c85a32]" />
              1. Identificação do Solicitante e Local
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nome do Solicitante</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Empresa / Cliente ERP</label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={e => setClientCompany(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Localização Física / Endereço / Setor</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Equipamento ou Sistema</label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={e => setEquipmentName(e.target.value)}
                  placeholder="Ex: Chiller, Gerador, Quadro Elétrico"
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Problem & Requirements with Quick Suggestions */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7dfd1] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#c85a32]" />
                2. Relato do Chamado ou Necessidade de Compra
              </h2>
              <span className="text-[11px] text-stone-500">
                A IA detecta automaticamente se é Serviço ou Compra
              </span>
            </div>

            {/* Describe the problem below */}

            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Descreva detalhadamente o ocorrido, falha ou itens necessários:
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Exemplo: Chiller Carrier parou com alarme de alta pressão, temperatura da sala de servidores está subindo rapidamente. Necessário atendimento urgente."
                className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-xl p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32] focus:bg-white"
                required
              />
            </div>

            {/* Attached Photos / Documents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700 flex items-center">
                  <Camera className="w-3.5 h-3.5 mr-1.5 text-[#c85a32]" />
                  Registros Fotográficos e Documentos (Câmera ou Upload)
                </label>
                <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 rounded-lg text-xs border border-[#d6cab8] transition">
                  <Paperclip className="w-3.5 h-3.5 text-[#c85a32]" />
                  <span>Anexar Foto / Documento</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {attachedFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {attachedFiles.map(f => (
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
                  Nenhuma imagem anexada. Você pode anexar fotos do equipamento danificado ou orçamentos.
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#fdf2f2] border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Bot IA Processando e Qualificando Chamado...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Iniciar Triagem com Bot IA e Gerar Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

        </form>
      ) : (
        /* Result Screen - Structured Ticket Created */
        <div className="bg-white border border-[#e7dfd1] rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in zoom-in-95">
          
          <div className="flex items-center justify-between pb-4 border-b border-[#e7dfd1]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
                  Triagem Concluída com Sucesso
                </span>
                <h2 className="text-lg font-bold text-stone-900">
                  Ticket #{generatedTicketResult.ticketNumber}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                generatedTicketResult.type === 'servico'
                  ? 'bg-[#fdf2ed] text-[#c85a32] border border-[#f5d6c6]'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {generatedTicketResult.type === 'servico' ? (
                  <><Wrench className="w-3.5 h-3.5 mr-1" /> Chamado de Serviços</>
                ) : (
                  <><ShoppingCart className="w-3.5 h-3.5 mr-1" /> Solicitação de Compras</>
                )}
              </span>
            </div>
          </div>

          {/* AI Bot Feedback Message */}
          <div className="p-4 rounded-xl bg-[#faf7f2] border border-[#e7dfd1] space-y-2">
            <div className="flex items-center space-x-2 text-[#c85a32] text-xs font-semibold">
              <Bot className="w-4 h-4" />
              <span>Resposta do Bot IA CorpServices:</span>
            </div>
            <p className="text-xs text-stone-800 leading-relaxed italic">
              &quot;{generatedTicketResult.replyToClient}&quot;
            </p>
          </div>

          {/* Ticket Technical Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#faf7f2] border border-[#e7dfd1] space-y-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Parecer Técnico do Bot IA para o Gestor
              </span>
              <p className="text-stone-800 leading-relaxed">
                {generatedTicketResult.aiTriageSummary}
              </p>
              
              <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-white text-stone-800 border border-[#e7dfd1]">
                  Urgência: <strong className="text-rose-700 uppercase">{generatedTicketResult.urgency}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-stone-800 border border-[#e7dfd1]">
                  Categoria: <strong>{generatedTicketResult.aiSuggestedCategory}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white text-stone-800 border border-[#e7dfd1]">
                  Custo Estimado: <strong>R$ {generatedTicketResult.estimatedCost?.toFixed(2)}</strong>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#faf7f2] border border-[#e7dfd1] space-y-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Ações Recomendadas (Checklist Sugerido)
              </span>
              <ul className="space-y-1.5 text-stone-700">
                {generatedTicketResult.suggestedChecklist?.map((item: string, i: number) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Routing Notification */}
          <div className="p-3 rounded-lg bg-[#faf7f2] border border-[#e7dfd1] text-xs text-stone-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#c85a32] shrink-0" />
              <span>
                O ticket foi catalogado como <strong>{generatedTicketResult.ticketNumber}</strong>. Código de rastreamento: <strong className="font-mono text-stone-900">{generatedTicketResult.trackingCode || generatedTicketResult.ticketNumber}</strong>.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleReset}
              className="text-xs text-stone-600 hover:text-stone-900 transition py-2 min-h-[44px]"
            >
              ← Abrir Outro Chamado
            </button>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedTicketResult.trackingCode || generatedTicketResult.ticketNumber);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 font-semibold text-xs border border-[#e7dfd1] transition min-h-[44px]"
              >
                <span>Copiar Protocolo</span>
              </button>

              {onTicketCreated && (
                <button
                  onClick={() => onTicketCreated(generatedTicketResult.id, generatedTicketResult.type)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs shadow-xs transition min-h-[44px]"
                >
                  <span>Ir para o Campo de Chamados ({generatedTicketResult.type === 'servico' ? 'Serviços' : 'Compras'})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
