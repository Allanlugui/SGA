'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { WorkOrder, OSStatus, DigitalSignature, AttachedFile, UsedPart } from '@/types';
import { CameraCaptureModal } from '@/components/camera/CameraCaptureModal';
import { DigitalSignatureModal } from '@/components/signature/DigitalSignatureModal';
import { ServiceReportModal } from '@/components/workorders/ServiceReportModal';
import { 
  Wrench, 
  Play, 
  Pause, 
  CheckCircle2, 
  Camera, 
  PenTool, 
  FileText, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  Plus, 
  Check, 
  ShieldCheck, 
  ChevronLeft, 
  Boxes, 
  Printer 
} from 'lucide-react';

interface WorkOrderDetailProps {
  workOrderId: string;
  onBack: () => void;
}

export function WorkOrderDetail({ workOrderId, onBack }: WorkOrderDetailProps) {
  const { 
    workOrders, 
    currentUserRole, 
    currentUser, 
    inventory, 
    startOSTimer, 
    pauseOSTimer, 
    toggleChecklistItem, 
    addPhotoToOS, 
    addPartToOS, 
    finishOSWithSignature, 
    validateAndCloseOS 
  } = useApp();

  const workOrder = workOrders.find(o => o.id === workOrderId);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('Intervalo para refeição / Almoço');
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  // Add Part State
  const [selectedInventoryId, setSelectedInventoryId] = useState(inventory[0]?.id || '');
  const [partQuantity, setPartQuantity] = useState(1);

  // Gestor Validation State
  const [validationNotes, setValidationNotes] = useState('Serviço realizado conforme padrões técnicos da CorpServices. Testes funcionais aprovados.');

  if (!workOrder) {
    return (
      <div className="p-8 text-center bg-white border border-[#e7dfd1] rounded-2xl text-stone-600">
        <p>Ordem de Serviço não encontrada.</p>
        <button onClick={onBack} className="mt-3 text-xs text-[#c85a32] hover:underline font-semibold">
          ← Voltar à lista de Ordens de Serviço
        </button>
      </div>
    );
  }

  const isTechnician = currentUserRole === 'tecnico' || currentUserRole === 'gestor';
  const isManager = currentUserRole === 'gestor';

  const handleConfirmPause = () => {
    pauseOSTimer(workOrder.id, pauseReason);
    setShowPauseModal(false);
  };

  const handleAddPartConfirm = () => {
    const item = inventory.find(i => i.id === selectedInventoryId);
    if (!item) return;

    const usedPart: UsedPart = {
      inventoryItemId: item.id,
      code: item.code,
      name: item.name,
      quantity: Number(partQuantity),
      unitPrice: item.sellPrice,
      totalPrice: item.sellPrice * Number(partQuantity)
    };

    addPartToOS(workOrder.id, usedPart);
    setShowAddPartModal(false);
  };

  const handleConfirmSignature = (signature: DigitalSignature) => {
    finishOSWithSignature(workOrder.id, signature);
    setShowSignatureModal(false);
    setShowReportModal(true);
  };

  const handleConfirmValidation = () => {
    validateAndCloseOS(workOrder.id, validationNotes);
  };

  const statusStyles: Record<OSStatus, { label: string; style: string }> = {
    pendente_atribuicao: { label: 'Pendente de Atribuição', style: 'bg-stone-100 text-stone-700' },
    agendada: { label: 'Agendada', style: 'bg-stone-100 text-stone-800 border border-stone-200' },
    em_deslocamento: { label: 'Técnico em Deslocamento', style: 'bg-amber-50 text-amber-800 border border-amber-200' },
    em_execucao: { label: 'Em Execução em Campo', style: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold animate-pulse' },
    pausada: { label: 'Pausada', style: 'bg-amber-50 text-amber-800 border border-amber-200' },
    aguardando_peca: { label: 'Aguardando Peça / Estoque', style: 'bg-rose-50 text-rose-800 border border-rose-200' },
    aguardando_validacao_gestor: { label: 'Aguardando Validação do Gestor', style: 'bg-[#fdf2ed] text-[#c85a32] border border-[#f5d6c6] font-bold' },
    concluida: { label: 'Concluída e Homologada', style: 'bg-emerald-100 text-emerald-900 border border-emerald-300' },
    reprovada: { label: 'Reprovada', style: 'bg-rose-100 text-rose-900' },
  };

  return (
    <div className="space-y-5">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e7dfd1]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white hover:bg-[#ede5d8] text-stone-700 border border-[#e7dfd1] transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[#c85a32] bg-[#fdf2ed] px-2.5 py-0.5 rounded border border-[#f5d6c6]">
                {workOrder.osNumber}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${statusStyles[workOrder.status].style}`}>
                {statusStyles[workOrder.status].label}
              </span>
              <span className="text-[10px] bg-[#faf7f2] text-stone-600 px-2 py-0.5 rounded font-mono border border-[#e7dfd1]">
                ERP: {workOrder.erpWorkOrderId}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
              {workOrder.title}
            </h1>
          </div>
        </div>

        {/* Global Action: Printable PDF Report */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-[#ede5d8] text-stone-800 border border-[#e7dfd1] transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#c85a32]" />
            <span>Visualizar Laudo Técnico (PDF)</span>
          </button>
        </div>
      </div>

      {/* MANAGER VALIDATION BANNER (If OS is waiting for manager validation) */}
      {workOrder.status === 'aguardando_validacao_gestor' && (
        <div className="p-4 rounded-xl bg-[#fdf2ed] border border-[#f5d6c6] shadow-xs space-y-3">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-6 h-6 text-[#c85a32] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-bold text-stone-900">
                Aprovação e Validação Final do Gestor Pendente
              </h2>
              <p className="text-xs text-stone-700 leading-relaxed mt-0.5">
                O técnico concluiu a execução em campo e coletou a assinatura digital autenticada com hash SHA-256. 
                {isManager 
                  ? ' Revise os registros fotográficos e confira o tempo de execução para homologar e encerrar a OS.' 
                  : ' Aguardando análise do gestor para encerramento.'}
              </p>
            </div>
          </div>

          {isManager && (
            <div className="pt-2 border-t border-[#f5d6c6] space-y-2">
              <label className="block text-xs font-semibold text-stone-800">
                Parecer Técnico do Gestor para Encerramento e Baixa no ERP:
              </label>
              <textarea
                rows={2}
                value={validationNotes}
                onChange={e => setValidationNotes(e.target.value)}
                className="w-full bg-white border border-[#d6cab8] rounded-lg p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#c85a32]"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleConfirmValidation}
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validar e Encerrar Ordem de Serviço</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STOPWATCH / PRODUCTIVITY TIMER CONTROL CARD */}
      <div className="bg-white p-5 rounded-2xl border border-[#e7dfd1] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              workOrder.isTimerActive 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse' 
                : 'bg-[#faf7f2] text-stone-500 border border-[#e7dfd1]'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-stone-500">
                Controle de Produtividade & Tempo de Execução em Campo
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-stone-900">
                  {Math.floor(workOrder.totalWorkDurationMinutes / 60)}h {String(workOrder.totalWorkDurationMinutes % 60).padStart(2, '0')}m
                </span>
                {workOrder.isTimerActive && (
                  <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200 animate-pulse">
                    ● CRONÔMETRO RODANDO
                  </span>
                )}
                {workOrder.status === 'pausada' && (
                  <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono border border-amber-200">
                    ⏸ CRONÔMETRO PAUSADO
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Timer Buttons (Technician view) */}
          {isTechnician && workOrder.status !== 'concluida' && workOrder.status !== 'aguardando_validacao_gestor' && (
            <div className="flex items-center space-x-2">
              {!workOrder.isTimerActive ? (
                <button
                  onClick={() => startOSTimer(workOrder.id)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{workOrder.status === 'pausada' ? 'Retomar Atendimento' : 'Iniciar Execução'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowPauseModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pausar</span>
                </button>
              )}

              <button
                onClick={() => setShowSignatureModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs transition"
              >
                <PenTool className="w-4 h-4" />
                <span>Finalizar & Assinar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main OS Body: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Scope, Context & Checklist */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* OS Client & Equipment Overview */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7dfd1] shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-[#c85a32]" />
              Dados da Ordem e Ativo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 text-stone-700">
                <div>
                  <span className="text-stone-500">Cliente Corporativo:</span>{' '}
                  <strong className="text-stone-900">{workOrder.clientName}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Endereço de Campo:</span>{' '}
                  <span className="text-stone-900">{workOrder.clientAddress}</span>
                </div>
                <div>
                  <span className="text-stone-500">Contato no Local:</span>{' '}
                  <span className="text-stone-900 font-mono">{workOrder.clientPhone}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-stone-700">
                <div>
                  <span className="text-stone-500">Equipamento / Ativo:</span>{' '}
                  <strong className="text-stone-900">{workOrder.equipmentName}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Nº de Série / Patrimônio:</span>{' '}
                  <span className="font-mono text-stone-800">{workOrder.equipmentSerial}</span>
                </div>
                <div>
                  <span className="text-stone-500">Técnico Designado:</span>{' '}
                  <span className="text-stone-900">{workOrder.assignedTechnicianName}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e7dfd1]">
              <span className="text-xs font-semibold text-stone-600 block mb-1">
                Escopo e Descrição do Trabalho:
              </span>
              <p className="text-xs text-stone-700 leading-relaxed bg-[#faf7f2] p-3 rounded-xl border border-[#e7dfd1]">
                {workOrder.description}
              </p>
            </div>
          </div>

          {/* Interactive Checklist for Field Execution */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7dfd1] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-700" />
                Checklist Obrigatório de Procedimentos
              </h2>
              <span className="text-xs font-semibold text-stone-600">
                {workOrder.checklist.filter(i => i.completed).length} de {workOrder.checklist.length} concluídos
              </span>
            </div>

            <div className="space-y-2">
              {workOrder.checklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => isTechnician && toggleChecklistItem(workOrder.id, item.id)}
                  className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    item.completed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-[#faf7f2] border-[#e7dfd1] text-stone-800 hover:bg-[#ede5d8]'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-xs">
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition shrink-0 ${
                      item.completed ? 'bg-emerald-700 text-white' : 'border border-[#d6cab8] bg-white'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={item.completed ? 'line-through text-stone-500 font-normal' : 'font-medium'}>
                      {item.task}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.requiredPhoto && (
                      <span className="flex items-center text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                        <Camera className="w-3 h-3 mr-1 text-amber-700" /> Requer Foto
                      </span>
                    )}
                    {item.completedAt && (
                      <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
                        {item.completedAt.slice(11, 16)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Photos & Used Parts */}
        <div className="space-y-5">
          
          {/* Photos and Evidence Section (Camera & Upload) */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7dfd1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center">
                <Camera className="w-4 h-4 mr-1.5 text-[#c85a32]" />
                Registros Fotográficos
              </h2>
              {isTechnician && (
                <button
                  onClick={() => setShowCameraModal(true)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#c85a32] hover:bg-[#b84924] text-white text-[11px] font-semibold transition shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tirar Foto</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {workOrder.files.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-[#faf7f2] border border-[#e7dfd1] text-xs text-stone-500">
                  Nenhuma evidência anexada. Use o botão acima para fotografar com a câmera do celular.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {workOrder.files.map(file => (
                    <div key={file.id} className="relative bg-[#faf7f2] rounded-xl p-1.5 border border-[#e7dfd1] space-y-1 group">
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-24 object-cover rounded-lg" 
                      />
                      <span className={`text-[9px] uppercase font-bold px-1 py-0.2 rounded block text-center ${
                        file.category === 'antes' ? 'bg-amber-50 text-amber-800' :
                        file.category === 'depois' ? 'bg-emerald-50 text-emerald-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {file.category || 'Geral'}
                      </span>
                      <p className="text-[10px] text-stone-600 truncate px-0.5">{file.description || file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Used Parts & Inventory Deductions */}
          <div className="bg-white p-5 rounded-2xl border border-[#e7dfd1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center">
                <Boxes className="w-4 h-4 mr-1.5 text-[#c85a32]" />
                Peças de Reposição Utilizadas
              </h2>
              {isTechnician && (
                <button
                  onClick={() => setShowAddPartModal(true)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#faf7f2] hover:bg-[#ede5d8] text-stone-800 text-[11px] font-semibold border border-[#e7dfd1] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Peça</span>
                </button>
              )}
            </div>

            {workOrder.usedParts.length === 0 ? (
              <p className="text-xs text-stone-500 italic p-3 bg-[#faf7f2] rounded-xl border border-[#e7dfd1] text-center">
                Nenhum componente ou peça retirado do estoque até o momento.
              </p>
            ) : (
              <div className="space-y-2">
                {workOrder.usedParts.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#e7dfd1] text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-stone-900">{p.name}</p>
                      <p className="text-[10px] text-stone-500 font-mono">
                        {p.code} • Qtd: {p.quantity} un x R$ {p.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-800">
                      R$ {p.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Digital Signature Badge if already signed */}
          {workOrder.digitalSignature && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Assinatura Digital Autenticada</span>
              </div>
              <p className="text-[11px] text-stone-700">
                Assinado por <strong>{workOrder.digitalSignature.technicianName}</strong> em {workOrder.digitalSignature.signedAt.slice(0, 16)}.
              </p>
              <div className="text-[9px] font-mono text-emerald-900 bg-white p-2 rounded-lg border border-emerald-200 break-all">
                Hash: {workOrder.digitalSignature.validationHash}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* PAUSE MODAL */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-md w-full p-5 space-y-3 shadow-xl text-stone-900">
            <h3 className="text-sm font-bold text-stone-900 flex items-center">
              <Pause className="w-4 h-4 mr-2 text-amber-700" />
              Pausar Cronômetro de Atendimento
            </h3>
            <p className="text-xs text-stone-600">
              Informe a justificativa operacional para registro no cálculo de MTTR e produtividade:
            </p>
            <select
              value={pauseReason}
              onChange={e => setPauseReason(e.target.value)}
              className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg p-2 text-xs text-stone-900"
            >
              <option value="Intervalo para refeição / Almoço">Intervalo para refeição / Almoço</option>
              <option value="Aguardando liberação de acesso pelo cliente">Aguardando liberação de acesso pelo cliente</option>
              <option value="Deslocamento para buscar ferramenta especial">Deslocamento para buscar ferramenta especial</option>
              <option value="Aguardando chegada de peças do fornecedor">Aguardando chegada de peças do fornecedor</option>
              <option value="Fim do expediente (Continua no próximo dia)">Fim do expediente (Continua no próximo dia)</option>
            </select>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowPauseModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPause}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              >
                Confirmar Pausa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PART MODAL */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e7dfd1] rounded-2xl max-w-md w-full p-5 space-y-3 shadow-xl text-stone-900">
            <h3 className="text-sm font-bold text-stone-900 flex items-center">
              <Boxes className="w-4 h-4 mr-2 text-[#c85a32]" />
              Baixar Peça do Estoque / Almoxarifado
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Selecionar Peça Disponível:</label>
                <select
                  value={selectedInventoryId}
                  onChange={e => setSelectedInventoryId(e.target.value)}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg p-2 text-xs text-stone-900"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.code} - {item.name} (Saldo: {item.quantity} {item.unit}) - R$ {item.sellPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Quantidade Utilizada:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={partQuantity}
                  onChange={e => setPartQuantity(Number(e.target.value))}
                  className="w-full bg-[#faf7f2] border border-[#d6cab8] rounded-lg p-2 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddPartModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:text-stone-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPartConfirm}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs"
              >
                Confirmar Saída
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}
      {showCameraModal && (
        <CameraCaptureModal
          osId={workOrder.id}
          onCapture={(file) => addPhotoToOS(workOrder.id, file)}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* SIGNATURE MODAL */}
      {showSignatureModal && (
        <DigitalSignatureModal
          technicianName={workOrder.assignedTechnicianName || currentUser.name}
          onConfirm={handleConfirmSignature}
          onCancel={() => setShowSignatureModal(false)}
        />
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <ServiceReportModal
          workOrder={workOrder}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
}

export function WorkOrderList({ onSelectOS }: { onSelectOS: (id: string) => void }) {
  const { workOrders, currentUserRole } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filteredOS = workOrders.filter(os => {
    if (filterStatus === 'todos') return true;
    return os.status === filterStatus;
  });

  return (
    <div className="space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e7dfd1]">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-[#c85a32]" />
            {currentUserRole === 'tecnico' ? 'Minhas Ordens de Serviço em Campo' : 'Painel de Ordens de Serviço (OS)'}
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Acompanhe o status em tempo real, cronômetro de atendimento, fotos de evidência e laudos técnicos
          </p>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-[#d6cab8] rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32]"
        >
          <option value="todos">Todos os Status</option>
          <option value="em_execucao">Em Execução (Timer Ativo)</option>
          <option value="agendada">Agendadas</option>
          <option value="aguardando_validacao_gestor">Aguardando Validação</option>
          <option value="concluida">Concluídas</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredOS.map(os => (
          <div
            key={os.id}
            onClick={() => onSelectOS(os.id)}
            className="bg-white hover:bg-[#faf7f2] p-4 rounded-xl border border-[#e7dfd1] hover:border-[#c85a32]/50 transition cursor-pointer shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#c85a32] bg-[#fdf2ed] px-2 py-0.5 rounded border border-[#f5d6c6]">
                  {os.osNumber}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  os.status === 'em_execucao' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse' :
                  os.status === 'aguardando_validacao_gestor' ? 'bg-[#fdf2ed] text-[#c85a32] border border-[#f5d6c6] font-bold' :
                  os.status === 'concluida' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  'bg-[#faf7f2] text-stone-700 border border-[#e7dfd1]'
                }`}>
                  {os.status.replace(/_/g, ' ')}
                </span>
                {os.isTimerActive && (
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold animate-pulse border border-emerald-300">
                    ⏱ CRONÔMETRO RODANDO
                  </span>
                )}
              </div>

              <h2 className="text-sm font-semibold text-stone-900">
                {os.title}
              </h2>

              <p className="text-xs text-stone-600 line-clamp-1">
                {os.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500 pt-1">
                <span>📍 {os.clientName}</span>
                <span>⚙️ {os.equipmentName}</span>
                <span>👤 Técnico: {os.assignedTechnicianName}</span>
                <span>⏱ Tempo trabalhado: {os.totalWorkDurationMinutes} min</span>
                <span>📸 {os.files.length} foto(s)</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center w-full md:w-auto">
              <button className="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white transition min-h-[44px] flex items-center justify-center space-x-1 shadow-xs">
                <span>Acessar OS em Campo</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
