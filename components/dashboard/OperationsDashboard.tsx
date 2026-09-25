'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Wrench, 
  ShieldCheck, 
  Users, 
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';

export function OperationsDashboard() {
  const { operationalGoals, workOrders, tickets, inventory, users } = useApp();

  const technicians = users.filter(u => u.role === 'tecnico' || u.role === 'gestor');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Dashboard de Metas Operacionais & Produtividade
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoramento em tempo real de KPIs de engenharia, cumprimento de SLA e metas mensais CorpServices
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Competência: <strong>Setembro / 2026</strong></span>
        </div>
      </div>

      {/* Main KPI Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* SLA Card */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">SLA de Atendimento</span>
            <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Acima da Meta
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{operationalGoals.currentSlaPercentage}%</span>
            <span className="text-xs text-slate-400">meta: ≥ {operationalGoals.targetSlaPercentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, operationalGoals.currentSlaPercentage)}%` }} 
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            98.2% dos chamados críticos e emergenciais atendidos dentro da janela de SLA contratada.
          </p>
        </div>

        {/* MTTR Card */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">MTTR (Tempo Médio)</span>
            <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              -30% vs Meta
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{operationalGoals.currentMttrHours}h</span>
            <span className="text-xs text-slate-400">meta: ≤ {operationalGoals.targetMttrHours}h</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(operationalGoals.currentMttrHours / operationalGoals.targetMttrHours) * 100}%` }} 
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Tempo médio de resolução entre abertura do chamado e encerramento técnico homologado.
          </p>
        </div>

        {/* Photographic Compliance */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">Evidência Fotográfica</span>
            <span className="text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              Conformidade
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{operationalGoals.currentPhotoCompliancePercentage}%</span>
            <span className="text-xs text-slate-400">meta: {operationalGoals.targetPhotoCompliancePercentage}%</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${operationalGoals.currentPhotoCompliancePercentage}%` }} 
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Percentual de OS com registro fotográfico obrigatório de &quot;Antes&quot; e &quot;Depois&quot; via câmera móvel.
          </p>
        </div>

        {/* Volume of Completed OS */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">O.S. Concluídas</span>
            <span className="text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
              78% da Meta
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{operationalGoals.currentCompletedOsCount}</span>
            <span className="text-xs text-slate-400">meta: {operationalGoals.targetCompletedOsCount} OS</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(operationalGoals.currentCompletedOsCount / operationalGoals.targetCompletedOsCount) * 100}%` }} 
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            94 manutenções concluídas no mês atual com laudo técnico e assinatura digital coletada.
          </p>
        </div>

      </div>

      {/* Team Productivity & Field Hours Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Productivity Table */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-blue-400" />
              Produtividade das Equipes de Campo (Tempo de Execução)
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Rastreável</span>
          </div>

          <div className="space-y-3 text-xs">
            {technicians.map(tech => {
              const techOS = workOrders.filter(os => os.assignedTechnicianId === tech.id);
              const totalMin = techOS.reduce((acc, o) => acc + o.totalWorkDurationMinutes, 0);

              return (
                <div key={tech.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={tech.avatar} alt={tech.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                    <div>
                      <span className="font-semibold text-white block">{tech.name}</span>
                      <span className="text-[10px] text-slate-400">{tech.department}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">
                      {Math.floor(totalMin / 60)}h {totalMin % 60}m em campo
                    </span>
                    <span className="text-[10px] text-blue-400">
                      {techOS.length} O.S. atribuídas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Efficiency & Strategic Insights */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
            Índice de Qualidade & Auditoria das Manutenções
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">Taxa de Primeira Resolução (First Time Fix)</span>
                <span className="text-[10px] text-slate-400">Resolução no primeiro atendimento sem retrabalho</span>
              </div>
              <span className="text-base font-bold text-emerald-400 font-mono">94.8%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">Laudos com Assinatura Digital Válida</span>
                <span className="text-[10px] text-slate-400">Autenticação com hash SHA-256 e certificado</span>
              </div>
              <span className="text-base font-bold text-blue-400 font-mono">100.0%</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">Ruptura de Estoque Crítico</span>
                <span className="text-[10px] text-slate-400">Itens com estoque zerado no almoxarifado</span>
              </div>
              <span className="text-base font-bold text-amber-400 font-mono">2 itens</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
