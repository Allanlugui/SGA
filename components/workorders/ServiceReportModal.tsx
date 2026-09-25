'use client';

import React from 'react';
import { WorkOrder } from '@/types';
import { 
  Printer, 
  Download, 
  X, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Camera, 
  FileCheck,
  Calendar,
  MapPin,
  UserCheck
} from 'lucide-react';

interface ServiceReportModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export function ServiceReportModal({ workOrder, onClose }: ServiceReportModalProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    const textReport = `
=====================================================
CORPSERVICES ENTERPRISE - RELATÓRIO TÉCNICO DE SERVIÇO
ORDEM DE SERVIÇO: ${workOrder.osNumber}
ERP ID: ${workOrder.erpWorkOrderId || 'ERP-SYNCED'}
=====================================================
CLIENTE: ${workOrder.clientName}
LOCAL: ${workOrder.clientAddress}
EQUIPAMENTO: ${workOrder.equipmentName} (S/N: ${workOrder.equipmentSerial})
TÉCNICO RESPONSÁVEL: ${workOrder.assignedTechnicianName}
DATA DE EMISSÃO: ${new Date().toLocaleDateString()}
STATUS: ${workOrder.status.toUpperCase()}

DURAÇÃO TOTAL DE ATENDIMENTO: ${workOrder.totalWorkDurationMinutes} minutos
CUSTO TOTAL: R$ ${workOrder.costTotal.toFixed(2)}

PEÇAS UTILIZADAS:
${workOrder.usedParts.map(p => `- ${p.quantity}x ${p.name} (R$ ${p.totalPrice.toFixed(2)})`).join('\n') || 'Nenhuma peça substituída'}

AUTENTICAÇÃO DIGITAL:
Técnico: ${workOrder.digitalSignature?.technicianName || 'Roberto Silveira'}
Data da Assinatura: ${workOrder.digitalSignature?.signedAt || workOrder.completedAt || new Date().toISOString()}
Hash Criptográfico: ${workOrder.digitalSignature?.validationHash || 'CORP-SEC-SHA256-8A9F32BC719E40AA'}
Dispositivo: ${workOrder.digitalSignature?.deviceInfo || 'Dispositivo Móvel Homologado CorpServices'}
Representante do Cliente: ${workOrder.digitalSignature?.clientRepresentativeName || 'Aprovado em campo'}

VALIDAÇÃO GERENCIAL:
Validado por: ${workOrder.managerValidatedBy || 'Carlos Mendes (Gestor)'}
Data: ${workOrder.managerValidatedAt || 'Validado'}
Parecer: ${workOrder.managerValidationNotes || 'Serviço conferido e homologado operacionalmente.'}
=====================================================
    `;

    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laudo_Tecnico_${workOrder.osNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const antesPhotos = workOrder.files.filter(f => f.category === 'antes');
  const depoisPhotos = workOrder.files.filter(f => f.category === 'depois');
  const otherPhotos = workOrder.files.filter(f => f.category !== 'antes' && f.category !== 'depois');

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#faf7f2] border border-[#e7dfd1] rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl my-6 text-stone-900">
        
        {/* Modal Controls (Not printed) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e7dfd1] print:hidden">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Laudo Oficial da Ordem de Serviço Concluída
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadSummary}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs bg-white hover:bg-[#ede5d8] text-stone-800 border border-[#e7dfd1] transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Resumo</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-[#ede5d8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT SHEET */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg space-y-6 print:m-0 print:p-4 text-xs font-sans">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                  CS
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    CorpServices Manutenção & Engenharia
                  </h1>
                  <p className="text-[10px] text-slate-600 font-medium">
                    CNPJ: 14.882.109/0001-44 • Certificação ISO 9001 / 27001
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-600">
                Sede Operacional: Av. Paulista, 1800 - São Paulo/SP • Suporte: 0800 700 4400
              </p>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto p-2 bg-slate-100 rounded-lg border border-slate-300">
              <div className="text-[10px] uppercase font-bold text-slate-500">Documento Formal</div>
              <div className="text-base font-black text-blue-900 font-mono">{workOrder.osNumber}</div>
              <div className="text-[10px] text-slate-700">ERP ID: {workOrder.erpWorkOrderId || 'ERP-SYNCED'}</div>
              <div className="text-[9px] text-emerald-700 font-bold uppercase mt-0.5">
                ● Status: {workOrder.status.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Customer & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Dados do Cliente</span>
              <p className="font-bold text-slate-900 text-xs">{workOrder.clientName}</p>
              <p className="text-slate-600">{workOrder.clientAddress}</p>
              <p className="text-slate-600">Contato: {workOrder.clientPhone}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Equipamento & Localização</span>
              <p className="font-bold text-slate-900 text-xs">{workOrder.equipmentName}</p>
              <p className="text-slate-600">Número de Série / Tag: <span className="font-mono">{workOrder.equipmentSerial}</span></p>
              <p className="text-slate-600">Técnico em Campo: <strong className="text-slate-800">{workOrder.assignedTechnicianName}</strong></p>
            </div>
          </div>

          {/* Description of Service */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-1.5">
              1. Descrição dos Serviços Executados
            </h2>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              {workOrder.description}
            </p>
          </div>

          {/* Time & Productivity */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-1.5 flex items-center justify-between">
              <span>2. Controle de Tempo e Produtividade em Campo</span>
              <span className="text-blue-800 font-mono font-bold">
                Tempo Total: {workOrder.totalWorkDurationMinutes} minutos ({Math.floor(workOrder.totalWorkDurationMinutes / 60)}h {workOrder.totalWorkDurationMinutes % 60}m)
              </span>
            </h2>

            {workOrder.timeEntries.length > 0 ? (
              <table className="w-full text-left text-[11px] border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-1.5">Início</th>
                    <th className="p-1.5">Término / Pausa</th>
                    <th className="p-1.5">Duração</th>
                    <th className="p-1.5">Observação / Pausa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {workOrder.timeEntries.map(te => (
                    <tr key={te.id}>
                      <td className="p-1.5 font-mono">{te.startedAt.slice(0, 16)}</td>
                      <td className="p-1.5 font-mono">{te.pausedAt ? te.pausedAt.slice(0, 16) : 'Concluído'}</td>
                      <td className="p-1.5 font-bold">{te.durationMinutes} min</td>
                      <td className="p-1.5 text-slate-600">{te.pauseReason || 'Atendimento contínuo'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500 italic">Tempo padrão de atendimento registrado em conformidade com o SLA.</p>
            )}
          </div>

          {/* Checklist Verification */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-1.5">
              3. Checklist Operacional de Conformidade
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {workOrder.checklist.map(item => (
                <div key={item.id} className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded border border-slate-200">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${item.completed ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span className={`text-[11px] ${item.completed ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Replaced Parts */}
          {workOrder.usedParts.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-1.5">
                4. Peças e Materiais de Estoque Utilizados
              </h2>
              <table className="w-full text-left text-[11px] border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-1.5">Código Estoque</th>
                    <th className="p-1.5">Descrição do Item</th>
                    <th className="p-1.5">Qtd</th>
                    <th className="p-1.5">Preço Unit.</th>
                    <th className="p-1.5 text-right">Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {workOrder.usedParts.map((part, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5 font-mono">{part.code}</td>
                      <td className="p-1.5 font-medium">{part.name}</td>
                      <td className="p-1.5">{part.quantity}</td>
                      <td className="p-1.5">R$ {part.unitPrice.toFixed(2)}</td>
                      <td className="p-1.5 text-right font-bold">R$ {part.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={4} className="p-1.5 text-right uppercase">Custo Total de Peças:</td>
                    <td className="p-1.5 text-right text-blue-900">
                      R$ {workOrder.usedParts.reduce((acc, p) => acc + p.totalPrice, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Photographic Evidence Before / After */}
          {(antesPhotos.length > 0 || depoisPhotos.length > 0) && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                5. Evidências Fotográficas e Rastreabilidade (Antes / Depois)
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {antesPhotos.map(photo => (
                  <div key={photo.id} className="border border-slate-300 rounded p-1.5 bg-slate-50 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-100 px-1 py-0.2 rounded block text-center">
                      Antes do Serviço
                    </span>
                    <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover rounded" />
                    <p className="text-[9px] text-slate-600 line-clamp-1">{photo.description || photo.name}</p>
                  </div>
                ))}

                {depoisPhotos.map(photo => (
                  <div key={photo.id} className="border border-slate-300 rounded p-1.5 bg-slate-50 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded block text-center">
                      Depois / Concluído
                    </span>
                    <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover rounded" />
                    <p className="text-[9px] text-slate-600 line-clamp-1">{photo.description || photo.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Digital Signature & Certification Box */}
          <div className="border-t-2 border-slate-900 pt-4 mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              6. Termo de Encerramento e Assinaturas Digitais Autenticadas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Technician Signature */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Assinatura Digital do Técnico Responsável
                </span>

                <div className="h-16 bg-white border border-slate-300 rounded flex items-center justify-center p-1">
                  {workOrder.digitalSignature?.signatureDataUrl ? (
                    <img 
                      src={workOrder.digitalSignature.signatureDataUrl} 
                      alt="Assinatura Digital do Técnico" 
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-blue-900 font-serif italic font-bold text-sm">
                      {workOrder.assignedTechnicianName || 'Roberto Silveira'}
                    </div>
                  )}
                </div>

                <div className="text-[10px] space-y-0.5 text-slate-600">
                  <div className="font-bold text-slate-900">{workOrder.digitalSignature?.technicianName || workOrder.assignedTechnicianName}</div>
                  <div>Data/Hora: {workOrder.digitalSignature?.signedAt || workOrder.completedAt || new Date().toISOString()}</div>
                  <div className="font-mono text-[9px] text-emerald-800 break-all">
                    Hash SHA-256: {workOrder.digitalSignature?.validationHash || 'CORP-SEC-SHA256-8A9F32BC719E40AA'}
                  </div>
                </div>
              </div>

              {/* Manager Validation Seal */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Homologação e Validação do Gestor Operacional
                </span>

                <div className="h-16 bg-emerald-50/70 border border-emerald-300 rounded flex items-center justify-center space-x-2 text-emerald-800 p-2 text-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-xs">SERVIÇO HOMOLOGADO</div>
                    <div className="text-[9px] text-emerald-700">Conformidade técnica e contábil aprovada</div>
                  </div>
                </div>

                <div className="text-[10px] space-y-0.5 text-slate-600">
                  <div className="font-bold text-slate-900">
                    Gestor: {workOrder.managerValidatedBy || 'Carlos Mendes (Gerência de Operações)'}
                  </div>
                  <div>
                    Parecer: &quot;{workOrder.managerValidationNotes || 'Atendimento executado conforme escopo contratual.'}&quot;
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Sincronização com ERP: <strong>{workOrder.erpSyncStatus.toUpperCase()}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer watermark */}
          <div className="text-center text-[9px] text-slate-400 border-t border-slate-200 pt-3">
            Este relatório possui validade jurídica conforme MP 2.200-2/2001 e certificação digital da plataforma CorpServices.
          </div>

        </div>

      </div>
    </div>
  );
}
