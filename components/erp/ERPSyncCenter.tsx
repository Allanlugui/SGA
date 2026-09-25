'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Link2, 
  Layers, 
  FileCheck, 
  Settings,
  ShieldCheck,
  Send
} from 'lucide-react';

export function ERPSyncCenter() {
  const { erpConfig, syncERPNow, isSyncing, workOrders, purchases } = useApp();

  const [systemName, setSystemName] = useState(erpConfig.systemName);
  const [costCenter, setCostCenter] = useState(erpConfig.costCenterDefault);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e7dfd1]">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center">
            <Server className="w-5 h-5 mr-2 text-[#c85a32]" />
            Integração com Sistema ERP Corporativo
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Sincronização bidirecional de Ordens de Serviço, Pedidos de Compras, baixa contábil de estoque e centros de custo
          </p>
        </div>

        <button
          onClick={() => syncERPNow()}
          disabled={isSyncing}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando com ERP...' : 'Forçar Sincronização Agora'}</span>
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-stone-900">Status da Conexão: ONLINE</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono border border-emerald-200">
                  HTTP 200 OK
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Conectado ao <strong>{erpConfig.systemName}</strong> via API Gateway Corporativo seguro (TLS 1.3).
              </p>
            </div>
          </div>

          <div className="text-xs text-right text-stone-500">
            <div>Última Sincronização:</div>
            <strong className="text-stone-900 font-mono">{erpConfig.lastSyncTimestamp}</strong>
          </div>
        </div>
      </div>

      {/* ERP Modules and Sync Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-[#c85a32]" />
              Módulo de Manutenção (OS)
            </span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ATIVO</span>
          </div>
          <p className="text-stone-600">
            Ordens de serviço abertas no CorpServices geram ordens de manutenção automáticas no módulo SIGAMNT / PM.
          </p>
          <div className="text-[11px] text-stone-500 font-mono">
            {workOrders.filter(o => o.erpSyncStatus === 'sincronizado').length} OS sincronizadas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 flex items-center">
              <FileCheck className="w-4 h-4 mr-1.5 text-amber-700" />
              Módulo de Compras & Suprimentos
            </span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ATIVO</span>
          </div>
          <p className="text-stone-600">
            Pedidos aprovados pelo gestor são integrados como Solicitação de Compra (SC) no módulo SIGACOM / MM.
          </p>
          <div className="text-[11px] text-stone-500 font-mono">
            {purchases.length} solicitações mapeadas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e7dfd1] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 flex items-center">
              <Database className="w-4 h-4 mr-1.5 text-indigo-700" />
              Contábil & Estoque Físico
            </span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ATIVO</span>
          </div>
          <p className="text-stone-600">
            Baixa de peças utilizadas em campo deduz saldo contábil imediatamente no Almoxarifado Central.
          </p>
          <div className="text-[11px] text-stone-500 font-mono">
            Centro de Custo: {erpConfig.costCenterDefault}
          </div>
        </div>

      </div>

      {/* Integration Endpoint & Parameter Settings */}
      <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center">
          <Settings className="w-4 h-4 mr-1.5 text-[#c85a32]" />
          Configurações de Comunicação e Endpoints ERP
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-600 font-medium mb-1">Sistema ERP em Uso:</label>
            <select
              value={systemName}
              onChange={e => setSystemName(e.target.value as any)}
              className="w-full bg-white border border-[#d6cab8] rounded-lg p-2 text-stone-900 focus:border-[#c85a32] focus:outline-none"
            >
              <option value="TOTVS Protheus">TOTVS Protheus v12 (REST API)</option>
              <option value="SAP S/4HANA">SAP S/4HANA (BAPI / OData)</option>
              <option value="Senior ERP">Senior ERP / Mega</option>
              <option value="Omie Corporativo">Omie Corporativo</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1">Centro de Custo Padrão para Manutenção:</label>
            <input
              type="text"
              value={costCenter}
              onChange={e => setCostCenter(e.target.value)}
              className="w-full bg-white border border-[#d6cab8] rounded-lg p-2 text-stone-900 focus:border-[#c85a32] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-600 font-medium mb-1">Webhook Endpoint URL:</label>
            <input
              type="text"
              readOnly
              value={erpConfig.endpointUrl}
              className="w-full bg-[#faf7f2] border border-[#e7dfd1] rounded-lg p-2 text-stone-500 font-mono text-[11px] select-all"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
