'use client';

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { ActiveTab } from '@/types';
import { ClientTriageChat } from '@/components/triage/ClientTriageChat';
import { TicketsManager } from '@/components/tickets/TicketsManager';
import { WorkOrderList, WorkOrderDetail } from '@/components/workorders/WorkOrderList';
import { PurchasesManager } from '@/components/purchases/PurchasesManager';
import { InventoryManager } from '@/components/inventory/InventoryManager';
import { OperationsDashboard } from '@/components/dashboard/OperationsDashboard';
import { MonthlyReports } from '@/components/reports/MonthlyReports';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { ERPSyncCenter } from '@/components/erp/ERPSyncCenter';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { ClientTrackingPortal } from '@/components/tracking/ClientTrackingPortal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function MainAppContent() {
  const { activeTab, setActiveTab, toast } = useApp();
  const [selectedOSId, setSelectedOSId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trackingProtocol, setTrackingProtocol] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#c85a32] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-[#c85a32]">CorpServices</span>
          <span className="text-xs text-stone-500">Carregando sistema corporativo...</span>
        </div>
      </div>
    );
  }

  const handleTicketCreated = (ticketId?: string) => {
    setActiveTab('tickets');
  };

  const handleNavigateToTracking = (protocol: string) => {
    setTrackingProtocol(protocol);
    setActiveTab('tracking');
  };

  const handleNavigateToOS = (osId: string) => {
    setSelectedOSId(osId);
    setActiveTab('workorders');
  };

  const handleNavigateToPurchase = () => {
    setActiveTab('purchases');
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-stone-900 flex flex-col font-sans selection:bg-[#c85a32] selection:text-white">
      {/* Top Navigation */}
      <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Offline Status Banner */}
      <OfflineBanner />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedOSId(null);
          }} 
        />

        {/* Dynamic Workspace */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full pb-20 md:pb-8">
          
          {/* Active Tab View Rendering */}
          {activeTab === 'tracking' && (
            <ClientTrackingPortal 
              initialProtocol={trackingProtocol} 
              onNavigateToTriage={() => setActiveTab('triage')} 
            />
          )}

          {activeTab === 'triage' && (
            <ClientTriageChat onTicketCreated={handleTicketCreated} />
          )}

          {activeTab === 'tickets' && (
            <TicketsManager 
              onNavigateToOS={handleNavigateToOS} 
              onNavigateToPurchase={handleNavigateToPurchase} 
            />
          )}

          {activeTab === 'workorders' && (
            selectedOSId ? (
              <WorkOrderDetail 
                workOrderId={selectedOSId} 
                onBack={() => setSelectedOSId(null)} 
              />
            ) : (
              <WorkOrderList onSelectOS={(id) => setSelectedOSId(id)} />
            )
          )}

          {activeTab === 'purchases' && (
            <PurchasesManager />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager />
          )}

          {activeTab === 'dashboard' && (
            <OperationsDashboard />
          )}

          {activeTab === 'reports' && (
            <MonthlyReports />
          )}

          {activeTab === 'explorer' && (
            <FileExplorer />
          )}

          {activeTab === 'erp' && (
            <ERPSyncCenter />
          )}

          {activeTab === 'audit' && (
            <AuditTimeline />
          )}

        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedOSId(null);
        }} 
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedOSId(null);
        }} 
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)} 
      />

      {/* Toast Notification Box */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-5 right-4 left-4 sm:left-auto sm:right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`p-4 rounded-xl shadow-xl flex items-start space-x-3 border max-w-md ${
            toast.type === 'error' ? 'bg-[#fdf2f2] border-rose-200 text-rose-900' :
            toast.type === 'info' ? 'bg-[#fdf8f5] border-[#df8c6f]/40 text-stone-900' :
            'bg-[#f0f9f3] border-emerald-200 text-emerald-900'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-[#c85a32] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-xs text-stone-900">{toast.title}</h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-snug">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
