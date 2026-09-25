'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveTab } from '@/types';
export type { ActiveTab };
import { 
  Bot, 
  Inbox, 
  Wrench, 
  ShoppingCart, 
  Boxes, 
  FileText, 
  FolderArchive, 
  Server, 
  History,
  Timer,
  TrendingUp,
  Sparkles,
  Search,
  Users
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { currentUserRole, tickets, workOrders, purchases, inventory, activeTimerOSId } = useApp();

  const pendingServiceTickets = tickets.filter(t => t.type === 'servico' && t.status === 'aberto').length;
  const pendingPurchaseTickets = tickets.filter(t => t.type === 'compra' && t.status === 'aberto').length;
  const pendingTicketsTotal = pendingServiceTickets + pendingPurchaseTickets;

  const runningOSCount = workOrders.filter(os => os.status === 'em_execucao' || os.status === 'aguardando_validacao_gestor').length;
  const criticalStockCount = inventory.filter(i => i.status === 'critico').length;
  const pendingPurchasesCount = purchases.filter(p => p.status === 'cotacao_em_andamento' || p.status === 'aguardando_aprovacao_gestor').length;

  const navItems = [
    {
      id: 'tracking' as ActiveTab,
      label: 'Portal do Cliente',
      sublabel: 'Rastreio de Protocolo & Chat',
      icon: Search,
      highlight: true,
      roles: ['admin', 'gestor', 'tecnico', 'comprador', 'cliente'],
      badge: 'Rastreio'
    },
    {
      id: 'triage' as ActiveTab,
      label: 'Triagem Bot IA',
      icon: Bot,
      highlight: true,
      roles: ['admin', 'gestor', 'tecnico', 'comprador', 'cliente'],
      badge: 'IA'
    },
    {
      id: 'tickets' as ActiveTab,
      label: 'Campo de Chamados',
      sublabel: 'Serviços & Compras',
      icon: Inbox,
      roles: ['admin', 'gestor', 'comprador', 'cliente'],
      badge: pendingTicketsTotal > 0 ? String(pendingTicketsTotal) : undefined,
      badgeColor: 'bg-[#c85a32]'
    },
    {
      id: 'workorders' as ActiveTab,
      label: currentUserRole === 'tecnico' ? 'Minhas Ordens de Serviço' : 'Ordens de Serviço (OS)',
      sublabel: 'Timer, Fotos e Assinatura',
      icon: Wrench,
      roles: ['admin', 'gestor', 'tecnico'],
      badge: runningOSCount > 0 ? `${runningOSCount} ativas` : undefined,
      badgeColor: 'bg-emerald-700'
    },
    {
      id: 'purchases' as ActiveTab,
      label: 'Pedidos de Compra',
      sublabel: 'Suprimentos & Cotação',
      icon: ShoppingCart,
      roles: ['admin', 'gestor', 'comprador'],
      badge: pendingPurchasesCount > 0 ? String(pendingPurchasesCount) : undefined,
      badgeColor: 'bg-amber-700'
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Controle de Estoque',
      sublabel: 'Almoxarifado & Peças',
      icon: Boxes,
      roles: ['admin', 'gestor', 'comprador', 'tecnico'],
      badge: criticalStockCount > 0 ? `${criticalStockCount} críticos` : undefined,
      badgeColor: 'bg-rose-700'
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'Metas Operacionais',
      sublabel: 'SLA & Produtividade',
      icon: TrendingUp,
      roles: ['admin', 'gestor'],
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Relatórios Mensais',
      sublabel: 'Gestão em Tempo Real',
      icon: FileText,
      roles: ['admin', 'gestor'],
    },
    {
      id: 'explorer' as ActiveTab,
      label: 'Explorador de Arquivos',
      sublabel: 'Fotos & Laudos das OS',
      icon: FolderArchive,
      roles: ['admin', 'gestor', 'tecnico', 'comprador'],
    },
    {
      id: 'erp' as ActiveTab,
      label: 'Integração ERP',
      sublabel: 'Sincronização Corporativa',
      icon: Server,
      roles: ['admin', 'gestor'],
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Histórico & Auditoria',
      sublabel: 'Rastreabilidade Total',
      icon: History,
      roles: ['admin', 'gestor'],
    },
    {
      id: 'users' as ActiveTab,
      label: 'Controle de Usuários',
      sublabel: 'Usuários & Permissões',
      icon: Users,
      roles: ['admin', 'gestor'],
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUserRole));

  return (
    <aside className="hidden md:flex w-64 bg-[#faf7f2] border-r border-[#e7dfd1] flex-col shrink-0 h-[calc(100vh-4rem)] select-none">
      
      {/* Role Banner / Context */}
      <div className="p-3.5 border-b border-[#e7dfd1] bg-[#f3ece2]/60">
        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
          Módulo de Acesso
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-bold text-stone-900">
            {currentUserRole === 'gestor' && 'Painel da Gestão'}
            {currentUserRole === 'tecnico' && 'Terminal de Campo'}
            {currentUserRole === 'comprador' && 'Central de Suprimentos'}
            {currentUserRole === 'cliente' && 'Portal do Cliente'}
          </span>
          {activeTimerOSId && (
            <span className="flex items-center space-x-1 text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-mono font-bold animate-pulse">
              <Timer className="w-3 h-3 text-emerald-700" />
              <span>TIMER ATIVO</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition text-xs font-medium ${
                isActive
                  ? 'bg-[#c85a32] text-white shadow-xs'
                  : 'text-stone-700 hover:bg-[#ede5d8] hover:text-stone-900'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-[#c85a32]' : 'text-stone-500'}`} />
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="truncate">{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="flex items-center text-[9px] bg-[#fdf2ed] text-[#c85a32] px-1.5 py-0.2 rounded font-semibold border border-[#f5d6c6]">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" /> IA
                      </span>
                    )}
                  </div>
                  {item.sublabel && (
                    <div className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-stone-500'}`}>
                      {item.sublabel}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.badgeColor 
                      ? `${item.badgeColor} text-white` 
                      : 'bg-[#e7dfd1] text-stone-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3.5 border-t border-[#e7dfd1] bg-[#f3ece2]/50 text-[11px] text-stone-600">
        <div className="flex items-center justify-between text-stone-800 font-semibold mb-1">
          <span>CorpServices v3.8</span>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-mono">100% Rastreável</span>
        </div>
        <p className="text-[10px] text-stone-500 leading-snug">
          Triagem com IA, assinaturas digitais com SHA-256 e sincronização offline com ERP.
        </p>
      </div>

    </aside>
  );
}
