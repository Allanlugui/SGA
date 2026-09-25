'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  User, 
  Layers, 
  FileText, 
  Tag
} from 'lucide-react';

export function AuditTimeline() {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState('TODOS');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());

    const matchesEntity = filterEntity === 'TODOS' || log.entityType === filterEntity;

    return matchesSearch && matchesEntity;
  });

  const entityBadges: Record<string, { label: string; style: string }> = {
    TICKET: { label: 'Ticket', style: 'bg-blue-950 text-blue-300 border-blue-800' },
    OS: { label: 'Ordem de Serviço', style: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    COMPRA: { label: 'Compras', style: 'bg-amber-950 text-amber-300 border-amber-800' },
    ESTOQUE: { label: 'Estoque', style: 'bg-purple-950 text-purple-300 border-purple-800' },
    ERP: { label: 'Integração ERP', style: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    SISTEMA: { label: 'Sistema', style: 'bg-slate-800 text-slate-300 border-slate-700' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <History className="w-5 h-5 mr-2 text-blue-400" />
            Trilha de Auditoria & Histórico de Operações
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro imutável de todas as ações operacionais, alterações de status, fotos anexadas e aprovações
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Rastreabilidade em Conformidade com Auditoria ISO</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuário, ação, protocolo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Entidade:</span>
          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todas as Entidades</option>
            <option value="TICKET">Tickets de Chamados</option>
            <option value="OS">Ordens de Serviço (OS)</option>
            <option value="COMPRA">Pedidos de Compra</option>
            <option value="ESTOQUE">Movimentações de Estoque</option>
            <option value="ERP">Sincronizações ERP</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md p-5 space-y-4">
        {filteredLogs.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">
            Nenhum registro de auditoria encontrado com os filtros selecionados.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {filteredLogs.map(log => {
              const badge = entityBadges[log.entityType] || { label: log.entityType, style: 'bg-slate-800 text-slate-300' };

              return (
                <div key={log.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 group-hover:scale-125 transition" />

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badge.style}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {log.entityId}
                        </span>
                        <span className="text-xs font-semibold text-blue-400">
                          {log.action}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {log.timestamp}
                        </span>
                        <span>IP: {log.ipAddress || '189.102.44.12'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Usuário Responsável: <strong className="text-white">{log.userName}</strong> ({log.userRole.toUpperCase()})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
