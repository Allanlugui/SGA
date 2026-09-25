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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-400" />
            Integração com Sistema ERP Corporativo
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sincronização bidirecional de Ordens de Serviço, Pedidos de Compras, baixa contábil de estoque e centros de custo
          </p>
        </div>

        <button
          onClick={() => syncERPNow()}
          disabled={isSyncing}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando com ERP...' : 'Forçar Sincronização Agora'}</span>
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">Status da Conexão: ONLINE</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
                  HTTP 200 OK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Conectado ao <strong>{erpConfig.systemName}</strong> via API Gateway Corporativo seguro (TLS 1.3).
              </p>
            </div>
          </div>

          <div className="text-xs text-right text-slate-400">
            <div>Última Sincronização:</div>
            <strong className="text-white font-mono">{erpConfig.lastSyncTimestamp}</strong>
          </div>
        </div>
      </div>

      {/* ERP Modules and Sync Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-blue-400" />
              Módulo de Manutenção (OS)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">ATIVO</span>
          </div>
          <p className="text-slate-400">
            Ordens de serviço abertas no CorpServices geram ordens de manutenção automáticas no módulo SIGAMNT / PM.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            {workOrders.filter(o => o.erpSyncStatus === 'sincronizado').length} OS sincronizadas
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center">
              <FileCheck className="w-4 h-4 mr-1.5 text-amber-400" />
              Módulo de Compras & Suprimentos
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">ATIVO</span>
          </div>
          <p className="text-slate-400">
            Pedidos aprovados pelo gestor são integrados como Solicitação de Compra (SC) no módulo SIGACOM / MM.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            {purchases.length} solicitações mapeadas
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center">
              <Database className="w-4 h-4 mr-1.5 text-indigo-400" />
              Contábil & Estoque Físico
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">ATIVO</span>
          </div>
          <p className="text-slate-400">
            Baixa de peças utilizadas em campo deduz saldo contábil imediatamente no Almoxarifado Central.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            Centro de Custo: {erpConfig.costCenterDefault}
          </div>
        </div>

      </div>

      {/* Integration Endpoint & Parameter Settings */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
          <Settings className="w-4 h-4 mr-1.5 text-blue-400" />
          Configurações de Comunicação e Endpoints ERP
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Sistema ERP em Uso:</label>
            <select
              value={systemName}
              onChange={e => setSystemName(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="TOTVS Protheus">TOTVS Protheus v12 (REST API)</option>
              <option value="SAP S/4HANA">SAP S/4HANA (BAPI / OData)</option>
              <option value="Senior ERP">Senior ERP / Mega</option>
              <option value="Omie Corporativo">Omie Corporativo</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Centro de Custo Padrão para Manutenção:</label>
            <input
              type="text"
              value={costCenter}
              onChange={e => setCostCenter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 font-medium mb-1">Webhook Endpoint URL:</label>
            <input
              type="text"
              readOnly
              value={erpConfig.endpointUrl}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-400 font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
