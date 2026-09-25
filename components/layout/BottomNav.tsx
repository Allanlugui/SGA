'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ActiveTab } from '@/types';
import { 
  Bot, 
  Inbox, 
  Wrench, 
  Search, 
  Menu
} from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
}

export function BottomNav({ activeTab, setActiveTab, onOpenMobileMenu }: BottomNavProps) {
  const { tickets, workOrders, activeTimerOSId } = useApp();

  const pendingTicketsCount = tickets.filter(t => t.status === 'aberto').length;
  const runningOSCount = workOrders.filter(o => o.status === 'em_execucao' || o.status === 'aguardando_validacao_gestor').length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e7dfd1] shadow-lg pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        
        {/* 1. Triagem IA */}
        <button
          onClick={() => setActiveTab('triage')}
          className={`flex flex-col items-center justify-center relative min-h-[48px] py-1 transition ${
            activeTab === 'triage' ? 'text-[#c85a32] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 text-[8px] bg-[#c85a32] text-white px-1 rounded-full font-bold">
              IA
            </span>
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Triagem</span>
        </button>

        {/* 2. Chamados */}
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex flex-col items-center justify-center relative min-h-[48px] py-1 transition ${
            activeTab === 'tickets' ? 'text-[#c85a32] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Inbox className="w-5 h-5" />
            {pendingTicketsCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] bg-[#c85a32] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {pendingTicketsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Chamados</span>
        </button>

        {/* 3. OS em Campo */}
        <button
          onClick={() => setActiveTab('workorders')}
          className={`flex flex-col items-center justify-center relative min-h-[48px] py-1 transition ${
            activeTab === 'workorders' ? 'text-[#c85a32] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Wrench className="w-5 h-5" />
            {activeTimerOSId ? (
              <span className="absolute -top-1 -right-2 text-[8px] bg-emerald-600 text-white font-bold px-1 rounded-full animate-pulse">
                TIMER
              </span>
            ) : runningOSCount > 0 ? (
              <span className="absolute -top-1 -right-2 text-[9px] bg-emerald-700 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {runningOSCount}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">OS Campo</span>
        </button>

        {/* 4. Portal Cliente (Acompanhar) */}
        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex flex-col items-center justify-center relative min-h-[48px] py-1 transition ${
            activeTab === 'tracking' ? 'text-[#c85a32] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Acompanhar</span>
        </button>

        {/* 5. Menu Mais */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center relative min-h-[48px] py-1 text-stone-500 hover:text-stone-800 transition"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Mais</span>
        </button>

      </div>
    </div>
  );
}
