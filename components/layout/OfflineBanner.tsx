'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, offlineQueueCount, syncOfflineQueue, isSyncing } = useApp();

  if (isOnline && offlineQueueCount === 0) return null;

  return (
    <div className={`w-full py-2.5 px-4 text-xs flex items-center justify-between transition-colors shadow-xs z-30 ${
      !isOnline 
        ? 'bg-[#fff8f0] border-b border-[#ffd8a8] text-[#8c400d]' 
        : 'bg-[#fdf8f5] border-b border-[#df8c6f]/40 text-stone-800'
    }`}>
      <div className="flex items-center space-x-2 truncate">
        {!isOnline ? (
          <WifiOff className="w-4 h-4 text-[#c85a32] shrink-0 animate-pulse" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-[#c85a32] shrink-0" />
        )}
        <span className="truncate font-medium">
          {!isOnline ? (
            <>
              <strong className="text-stone-900">Modo Offline Ativo:</strong> Você está sem conexão ou em área remota. Fotos, tickets e mensagens estão sendo salvos localmente.
            </>
          ) : (
            <>
              <strong className="text-stone-900">Conexão restabelecida:</strong> Existem {offlineQueueCount} alteração(ões) pendente(s) de sincronização com o ERP.
            </>
          )}
        </span>
      </div>

      {offlineQueueCount > 0 && (
        <button
          onClick={() => syncOfflineQueue()}
          disabled={isSyncing}
          className="ml-2 shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#c85a32] hover:bg-[#b84924] text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 min-h-[32px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sincronizar ({offlineQueueCount})</span>
        </button>
      )}
    </div>
  );
}
