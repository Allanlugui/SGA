'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveTab, UserRole } from '@/types';
import { 
  X, 
  Bot, 
  Inbox, 
  Wrench, 
  ShoppingCart, 
  Boxes, 
  TrendingUp, 
  FileText, 
  FolderArchive, 
  Server, 
  History, 
  Search, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Building2,
  ChevronRight
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function MobileDrawer({ isOpen, onClose, activeTab, setActiveTab }: MobileDrawerProps) {
  const { 
    currentUserRole, 
    switchRole, 
    isOnline, 
    offlineQueueCount, 
    toggleOfflineSimulation, 
    syncOfflineQueue, 
    isSyncing
  } = useApp();

  if (!isOpen) return null;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    { id: 'tracking' as ActiveTab, label: 'Portal do Cliente & Acompanhar', sub: 'Rastreio de Protocolo & Chat', icon: Search, roles: ['gestor', 'tecnico', 'comprador', 'cliente'], highlight: true },
    { id: 'triage' as ActiveTab, label: 'Triagem Bot IA (Novo Chamado)', sub: 'Classificação Instantânea', icon: Bot, roles: ['gestor', 'tecnico', 'comprador', 'cliente'], badge: 'IA' },
    { id: 'tickets' as ActiveTab, label: 'Campo de Chamados', sub: 'Serviços & Compras', icon: Inbox, roles: ['gestor', 'comprador', 'cliente'] },
    { id: 'workorders' as ActiveTab, label: 'Ordens de Serviço (OS)', sub: 'Timer, Fotos e Assinatura', icon: Wrench, roles: ['gestor', 'tecnico'] },
    { id: 'purchases' as ActiveTab, label: 'Pedidos de Compra', sub: 'Suprimentos & Cotações', icon: ShoppingCart, roles: ['gestor', 'comprador'] },
    { id: 'inventory' as ActiveTab, label: 'Controle de Estoque', sub: 'Peças & Almoxarifado', icon: Boxes, roles: ['gestor', 'comprador', 'tecnico'] },
    { id: 'dashboard' as ActiveTab, label: 'Metas Operacionais', sub: 'SLA e Produtividade', icon: TrendingUp, roles: ['gestor'] },
    { id: 'reports' as ActiveTab, label: 'Relatórios Mensais', sub: 'Custos e Análise de Clientes', icon: FileText, roles: ['gestor'] },
    { id: 'explorer' as ActiveTab, label: 'Explorador de Arquivos', sub: 'Fotos & Laudos das OS', icon: FolderArchive, roles: ['gestor', 'tecnico', 'comprador'] },
    { id: 'erp' as ActiveTab, label: 'Integração ERP', sub: 'TOTVS / SAP / Senior', icon: Server, roles: ['gestor'] },
    { id: 'audit' as ActiveTab, label: 'Histórico & Auditoria', sub: 'Rastreabilidade Total', icon: History, roles: ['gestor'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUserRole));

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs animate-in fade-in"
      />

      {/* Drawer Body */}
      <div className="relative w-4/5 max-w-xs bg-[#faf7f2] border-r border-[#e7dfd1] text-stone-900 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#e7dfd1] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#c85a32] to-[#df8c6f] flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-stone-900">CorpServices</span>
              <p className="text-[10px] text-stone-500">Menu Móvel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#f3ece2] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Engine Bar */}
        <div className="p-3 border-b border-[#e7dfd1] bg-[#f3ece2]/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={toggleOfflineSimulation}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-medium text-xs transition flex-1 ${
                isOnline 
                  ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' 
                  : 'text-amber-900 bg-amber-100 border border-amber-300 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-700" />}
              <span>{isOnline ? 'Online (Rede OK)' : 'Offline (Simulado)'}</span>
            </button>

            {offlineQueueCount > 0 && (
              <button
                onClick={() => syncOfflineQueue()}
                disabled={isSyncing}
                className="ml-2 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#c85a32] text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{offlineQueueCount}</span>
              </button>
            )}
          </div>
        </div>

        {/* User Role Quick Switcher */}
        <div className="p-3 border-b border-[#e7dfd1] bg-[#f3ece2]/30">
          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
            Alternar Perfil Operacional:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['gestor', 'tecnico', 'comprador', 'cliente'] as UserRole[]).map(role => (
              <button
                key={role}
                onClick={() => {
                  switchRole(role);
                  onClose();
                }}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-center transition ${
                  currentUserRole === role
                    ? 'bg-[#c85a32] text-white shadow-xs'
                    : 'bg-white border border-[#e7dfd1] text-stone-700 hover:bg-[#ede5d8]'
                }`}
              >
                {role === 'gestor' && 'Gestor'}
                {role === 'tecnico' && 'Técnico'}
                {role === 'comprador' && 'Comprador'}
                {role === 'cliente' && 'Cliente'}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition min-h-[44px] ${
                  isActive
                    ? 'bg-[#c85a32] text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:bg-[#ede5d8] hover:text-stone-900'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-[#c85a32]' : 'text-stone-500'}`} />
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate flex items-center space-x-1.5">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-[#fdf2ed] text-[#c85a32] px-1 rounded font-bold border border-[#f5d6c6]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.sub && (
                      <p className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-stone-500'}`}>
                        {item.sub}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-3.5 border-t border-[#e7dfd1] bg-[#f3ece2]/50 text-[10px] text-stone-500">
          <p>CorpServices v3.8 • Mobile Optimized</p>
          <p>Sincronização offline e criptografia SHA-256</p>
        </div>

      </div>
    </div>
  );
}
