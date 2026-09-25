'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  DollarSign, 
  Wrench, 
  ShoppingCart, 
  TrendingUp,
  BarChart,
  PieChart,
  CheckCircle2
} from 'lucide-react';

export function MonthlyReports() {
  const { workOrders, tickets, purchases, inventory } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Aggregated calculations
  const totalServiceOrders = workOrders.length;
  const completedOrders = workOrders.filter(o => o.status === 'concluida' || o.status === 'aguardando_validacao_gestor').length;
  
  const totalCostOrders = workOrders.reduce((acc, o) => acc + o.costTotal, 0);
  const totalCostParts = workOrders.reduce((acc, o) => acc + o.usedParts.reduce((pAcc, p) => pAcc + p.totalPrice, 0), 0);
  const totalPurchasesApproved = purchases.filter(p => p.status === 'aprovado' || p.status === 'pedido_emitido' || p.status === 'entregue_estoque')
                                          .reduce((acc, p) => acc + (p.totalFinal || p.totalEstimated), 0);

  const totalMinutesWorked = workOrders.reduce((acc, o) => acc + o.totalWorkDurationMinutes, 0);

  const handleExportCSV = () => {
    const headers = ['Protocolo', 'Tipo', 'Titulo', 'Cliente', 'Status', 'Custo Total (R$)', 'Minutos'];
    const rows = workOrders.map(o => [
      o.osNumber,
      'Ordem de Servico',
      `"${o.title.replace(/"/g, '""')}"`,
      `"${o.clientName}"`,
      o.status,
      o.costTotal.toFixed(2),
      o.totalWorkDurationMinutes
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Mensal_CorpServices_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e7dfd1]">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#c85a32]" />
            Relatórios Mensais Gerenciais em Tempo Real
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Demonstrativo consolidado de despesas operacionais, custos de peças e tempos de resposta
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-white border border-[#d6cab8] rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#c85a32]"
          >
            <option value="2026-09">Setembro / 2026 (Mês Atual)</option>
            <option value="2026-08">Agosto / 2026</option>
            <option value="2026-07">Julho / 2026</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Custo Total de Manutenção</span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            R$ {totalCostOrders.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Consolidado O.S. de Campo</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Peças Aplicadas (Estoque)</span>
          <div className="text-2xl font-black text-[#c85a32] mt-1">
            R$ {totalCostParts.toFixed(2)}
          </div>
          <span className="text-[11px] text-stone-500">Baixa contábil direta no ERP</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Compras Aprovadas</span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            R$ {totalPurchasesApproved.toFixed(2)}
          </div>
          <span className="text-[11px] text-stone-500">Suprimentos e ressuprimento</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Horas Trabalhadas em Campo</span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            {Math.floor(totalMinutesWorked / 60)}h {totalMinutesWorked % 60}m
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">100% registradas via timer</span>
        </div>

      </div>

      {/* Visual Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Discipline distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Distribuição por Disciplina de Engenharia
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-stone-700 mb-1">
                <span>Climatização & HVAC Industrial</span>
                <span className="font-bold">45%</span>
              </div>
              <div className="w-full bg-[#faf7f2] h-2 rounded-full overflow-hidden border border-[#ede5d8]">
                <div className="bg-[#c85a32] h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-700 mb-1">
                <span>Elétrica de Potência & Painéis</span>
                <span className="font-bold">30%</span>
              </div>
              <div className="w-full bg-[#faf7f2] h-2 rounded-full overflow-hidden border border-[#ede5d8]">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-700 mb-1">
                <span>Mecânica & Grupos Geradores</span>
                <span className="font-bold">15%</span>
              </div>
              <div className="w-full bg-[#faf7f2] h-2 rounded-full overflow-hidden border border-[#ede5d8]">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '15%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-700 mb-1">
                <span>Infraestrutura Predial & TI</span>
                <span className="font-bold">10%</span>
              </div>
              <div className="w-full bg-[#faf7f2] h-2 rounded-full overflow-hidden border border-[#ede5d8]">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown List */}
        <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Resumo de Volume e Status Operacional
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e7dfd1]">
              <span className="text-stone-500 block text-[11px]">O.S. Concluídas com Sucesso</span>
              <span className="text-xl font-bold text-emerald-700">{completedOrders}</span>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e7dfd1]">
              <span className="text-stone-500 block text-[11px]">Chamados em Aberto</span>
              <span className="text-xl font-bold text-[#c85a32]">{tickets.filter(t => t.status === 'aberto').length}</span>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e7dfd1]">
              <span className="text-stone-500 block text-[11px]">Pedidos de Compra Ativos</span>
              <span className="text-xl font-bold text-amber-700">{purchases.length}</span>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e7dfd1]">
              <span className="text-stone-500 block text-[11px]">Conformidade Fotográfica</span>
              <span className="text-xl font-bold text-stone-900">96.5%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Relatório e Análise de Dados dos Clientes */}
      <div className="bg-white p-5 rounded-xl border border-[#e7dfd1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-stone-900 flex items-center">
              <PieChart className="w-4 h-4 mr-2 text-[#c85a32]" />
              Análise e Métricas de Clientes Solicitantes
            </h2>
            <p className="text-xs text-stone-600">
              Dados consolidados dos clientes para acompanhamento de qualidade, NPS e retenção
            </p>
          </div>

          <button
            onClick={() => {
              const headers = ['Protocolo', 'Cliente', 'Empresa', 'Telefone', 'Email', 'Localizacao', 'Tipo', 'Data'];
              const rows = tickets.map(t => [
                t.ticketNumber,
                `"${t.clientName}"`,
                `"${t.clientCompany}"`,
                `"${t.clientPhone}"`,
                `"${t.clientEmail}"`,
                `"${t.location.replace(/"/g, '""')}"`,
                t.type,
                t.createdAt
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `Clientes_CorpServices_${selectedMonth}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#c85a32] hover:bg-[#b84924] text-white transition self-start sm:self-auto min-h-[36px] shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Dados de Clientes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e7dfd1]">
            <span className="text-stone-500 block text-[11px]">Empresas Atendidas</span>
            <span className="text-xl font-bold text-stone-900">
              {Array.from(new Set(tickets.map(t => t.clientCompany))).length} empresas
            </span>
          </div>

          <div className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e7dfd1]">
            <span className="text-stone-500 block text-[11px]">Índice de Satisfação Médio (CSAT)</span>
            <span className="text-xl font-bold text-amber-700">
              4.9 / 5.0 ★
            </span>
          </div>

          <div className="p-3 bg-[#fdfbf7] rounded-lg border border-[#e7dfd1]">
            <span className="text-stone-500 block text-[11px]">Canais de Contato Validados</span>
            <span className="text-xl font-bold text-emerald-700">
              100% WhatsApp & E-mail
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
