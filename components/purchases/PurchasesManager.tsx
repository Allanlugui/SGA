'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PurchaseRequest, PurchaseStatus } from '@/types';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileText, 
  DollarSign, 
  Truck, 
  Boxes, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export function PurchasesManager() {
  const { purchases, currentUserRole, currentUser, updatePurchaseStatus } = useApp();

  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRequest | null>(null);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [managerApprovalNotes, setManagerApprovalNotes] = useState('');

  const statusLabels: Record<PurchaseStatus, { label: string; style: string }> = {
    solicitado: { label: 'Solicitado', style: 'bg-blue-950 text-blue-300 border border-blue-800' },
    cotacao_em_andamento: { label: 'Cotação em Andamento', style: 'bg-amber-950 text-amber-300 border border-amber-800' },
    aguardando_aprovacao_gestor: { label: 'Aguardando Aprovação do Gestor', style: 'bg-purple-950 text-purple-300 border border-purple-800 font-bold' },
    aprovado: { label: 'Aprovado pelo Gestor', style: 'bg-emerald-950 text-emerald-300 border border-emerald-800' },
    pedido_emitido: { label: 'Pedido Emitido ao Fornecedor', style: 'bg-indigo-950 text-indigo-300 border border-indigo-800' },
    em_transito: { label: 'Em Transporte / Logística', style: 'bg-cyan-950 text-cyan-300 border border-cyan-800' },
    entregue_estoque: { label: 'Entregue no Almoxarifado', style: 'bg-emerald-900 text-emerald-200 border border-emerald-700' },
    cancelado: { label: 'Cancelado', style: 'bg-rose-950 text-rose-300' },
  };

  const isBuyer = currentUserRole === 'comprador' || currentUserRole === 'gestor';
  const isManager = currentUserRole === 'gestor';

  const handleAdvanceStatus = (purchase: PurchaseRequest, nextStatus: PurchaseStatus) => {
    updatePurchaseStatus(purchase.id, nextStatus, nextStatus === 'aprovado' ? managerApprovalNotes : quoteNotes);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-amber-400" />
            Central de Solicitações e Pedidos de Compra
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fluxo de suprimentos: requisição do cliente/IA, cotação com fornecedores, aprovação do gestor e entrada no estoque
          </p>
        </div>
      </div>

      {/* Purchases List */}
      <div className="grid grid-cols-1 gap-4">
        {purchases.map(purchase => {
          const statusInfo = statusLabels[purchase.status];

          return (
            <div
              key={purchase.id}
              className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {purchase.purchaseNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusInfo.style}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      ERP: {purchase.erpPurchaseOrderId || 'Pendente de Faturamento'}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-white">
                    {purchase.title}
                  </h2>

                  <p className="text-xs text-slate-400">
                    {purchase.justification}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                    <span>👤 Solicitante: {purchase.requestedBy}</span>
                    <span>📦 Compradora: {purchase.assignedBuyerName}</span>
                    <span>📅 Necessidade: {purchase.neededByDate}</span>
                    <span>💰 Orçamento Estimado: <strong className="text-white">R$ {purchase.totalEstimated.toFixed(2)}</strong></span>
                    {purchase.totalFinal && (
                      <span className="text-emerald-400 font-bold">
                        Valor Negociado: R$ {purchase.totalFinal.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status progression actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
                  
                  {/* Buyer action: Submit quote to manager */}
                  {purchase.status === 'cotacao_em_andamento' && isBuyer && (
                    <button
                      onClick={() => handleAdvanceStatus(purchase, 'aguardando_aprovacao_gestor')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Cotação para Aprovação do Gestor</span>
                    </button>
                  )}

                  {/* Manager action: Approve budget */}
                  {purchase.status === 'aguardando_aprovacao_gestor' && isManager && (
                    <button
                      onClick={() => handleAdvanceStatus(purchase, 'aprovado')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Aprovar Pedido de Compra</span>
                    </button>
                  )}

                  {/* Buyer action: Issue order to supplier */}
                  {purchase.status === 'aprovado' && isBuyer && (
                    <button
                      onClick={() => handleAdvanceStatus(purchase, 'pedido_emitido')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Emitir Pedido ao Fornecedor</span>
                    </button>
                  )}

                  {/* Warehouse / Buyer: Confirm delivery to stock */}
                  {(purchase.status === 'pedido_emitido' || purchase.status === 'em_transito') && isBuyer && (
                    <button
                      onClick={() => handleAdvanceStatus(purchase, 'entregue_estoque')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Confirmar Entrada no Estoque</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedPurchase(purchase)}
                    className="px-3 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-slate-800 transition"
                  >
                    Ver Cotação
                  </button>

                </div>
              </div>

              {/* Items summary table */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                  Itens Requisitados & Fornecedor Selecionado:
                </span>
                <div className="space-y-1">
                  {purchase.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-slate-300">
                      <span>• {item.quantity} {item.unit} - {item.name} ({item.supplier || purchase.selectedSupplier || 'Em cotação'})</span>
                      <span className="font-mono text-slate-200">
                        R$ {((item.finalUnitPrice || item.estimatedUnitPrice) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {purchase.supplierQuoteNotes && (
                  <div className="mt-2 text-[11px] text-amber-300/90 italic border-t border-slate-800 pt-1.5">
                    Negociação do Comprador: &quot;{purchase.supplierQuoteNotes}&quot;
                  </div>
                )}
                {purchase.managerApprovalNotes && (
                  <div className="mt-1 text-[11px] text-emerald-300/90 italic">
                    Parecer de Aprovação do Gestor: &quot;{purchase.managerApprovalNotes}&quot;
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-mono font-bold text-amber-400 text-sm">{selectedPurchase.purchaseNumber}</span>
              <button onClick={() => setSelectedPurchase(null)} className="text-slate-400 hover:text-white text-xs">
                Fechar ✕
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{selectedPurchase.title}</h3>
              <p className="text-xs text-slate-300 mt-1">{selectedPurchase.justification}</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Fornecedor Selecionado:</span>
                <span className="text-white font-medium">{selectedPurchase.selectedSupplier || 'Em Cotação'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comprador Responsável:</span>
                <span className="text-white font-medium">{selectedPurchase.assignedBuyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Negociado:</span>
                <span className="text-emerald-400 font-bold">R$ {(selectedPurchase.totalFinal || selectedPurchase.totalEstimated).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-1.5 rounded-lg text-xs bg-slate-800 text-white"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
