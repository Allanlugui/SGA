'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { 
  Building2, 
  Wifi, 
  RefreshCw, 
  Bell, 
  Database,
  Menu
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const { 
    currentUser, 
    currentUserRole, 
    isSyncing,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    erpConfig,
    syncERPNow
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; color: string; desc: string }> = {
    admin: { label: 'Administrador (TI)', color: 'bg-rose-700 text-white', desc: 'Controle Total, Usuários, Permissões, Auditoria' },
    gestor: { label: 'Gestor Operacional', color: 'bg-[#c85a32] text-white', desc: 'Aprovações, Despacho, Metas, Auditoria' },
    tecnico: { label: 'Técnico de Campo', color: 'bg-emerald-700 text-white', desc: 'Execução de OS, Timer, Câmera, Assinatura' },
    comprador: { label: 'Comprador (Suprimentos)', color: 'bg-amber-700 text-white', desc: 'Cotações, Pedidos de Compra, Estoque' },
    cliente: { label: 'Cliente / Solicitante', color: 'bg-stone-800 text-white', desc: 'Triagem Bot IA, Abertura e Status' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e7dfd1] text-stone-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Corporate ID */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="md:hidden p-2 rounded-lg bg-[#faf7f2] text-stone-700 hover:text-stone-900 hover:bg-[#f3ece2] transition border border-[#e7dfd1] min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-5 h-5 text-stone-700" />
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-tr from-[#c85a32] to-[#df8c6f] flex items-center justify-center shadow-md shadow-[#c85a32]/20 shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900">CorpServices</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#fdf2ed] text-[#c85a32] border border-[#f5d6c6] hidden xs:inline">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Gestão de Ordens de Serviço, Chamados e Suprimentos
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Production Network Status Badge */}
          <div className="flex items-center space-x-2 bg-[#faf7f2] px-3 py-1.5 rounded-lg border border-[#e7dfd1] text-xs">
            <Wifi className="w-4 h-4 text-emerald-600" />
            <span className="text-stone-700 font-semibold hidden md:inline">Rede Conectada</span>
          </div>

          {/* ERP Sync Quick Status */}
          <div className="hidden lg:flex items-center space-x-2 bg-[#faf7f2] px-3 py-1.5 rounded-lg border border-[#e7dfd1] text-xs">
            <Database className="w-3.5 h-3.5 text-[#c85a32]" />
            <span className="text-stone-700 font-medium">{erpConfig.systemName}</span>
            <button 
              onClick={() => syncERPNow()}
              title="Sincronizar com ERP agora"
              disabled={isSyncing}
              className="text-stone-500 hover:text-[#c85a32] transition"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#c85a32]' : ''}`} />
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg bg-[#faf7f2] hover:bg-[#f3ece2] text-stone-700 hover:text-stone-900 transition border border-[#e7dfd1]"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4 text-stone-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c85a32] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e7dfd1] rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#e7dfd1]">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-stone-900">Central de Alertas</span>
                    <span className="text-xs bg-[#f3ece2] text-stone-700 px-2 py-0.5 rounded-md font-mono">
                      {unreadCount} novos
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-[#c85a32] hover:underline font-medium"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#f3ece2] mt-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-stone-500 py-4 text-center">Nenhuma notificação no momento.</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition ${
                          n.read ? 'opacity-60 hover:bg-[#faf7f2]' : 'bg-[#fdfbf7] hover:bg-[#f7f4ee] text-stone-900 font-medium border-l-2 border-[#c85a32]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-stone-900">{n.title}</span>
                          <span className="text-[10px] text-stone-400">{n.createdAt}</span>
                        </div>
                        <p className="text-stone-600 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Container (Static/Production) */}
          <div className="flex items-center space-x-2 bg-[#faf7f2] p-1.5 pr-3 rounded-lg border border-[#e7dfd1]">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-7 h-7 rounded-full object-cover border border-[#d6cab8]"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-stone-900 leading-tight flex items-center space-x-1.5">
                <span>{currentUser.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${roleLabels[currentUserRole].color}`}>
                  {currentUserRole}
                </span>
              </div>
              <div className="text-[10px] text-stone-500 truncate max-w-[150px]">
                {currentUser.department}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
