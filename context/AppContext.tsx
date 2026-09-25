'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  User, 
  UserRole, 
  ActiveTab,
  Ticket, 
  WorkOrder, 
  PurchaseRequest, 
  InventoryItem, 
  AuditLog, 
  NotificationItem, 
  ERPConfig, 
  OperationalGoals,
  OSStatus,
  PurchaseStatus,
  DigitalSignature,
  AttachedFile,
  UsedPart,
  TicketMessage
} from '@/types';
import { 
  INITIAL_USERS, 
  INITIAL_TICKETS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_PURCHASES, 
  INITIAL_INVENTORY, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ERP_CONFIG, 
  INITIAL_OPERATIONAL_GOALS 
} from '@/lib/initial-data';

interface AppContextType {
  currentUser: User;
  currentUserRole: UserRole;
  switchRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  users: User[];
  tickets: Ticket[];
  workOrders: WorkOrder[];
  purchases: PurchaseRequest[];
  inventory: InventoryItem[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  erpConfig: ERPConfig;
  operationalGoals: OperationalGoals;
  isOnline: boolean;
  offlineQueueCount: number;
  isSyncing: boolean;
  activeTimerOSId: string | null;
  toggleOfflineSimulation: () => void;
  syncOfflineQueue: () => Promise<void>;
  createTicketFromTriage: (ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => Ticket;
  resolveTicketDirect: (ticketId: string, notes: string) => void;
  convertTicketToOS: (ticketId: string, technicianId: string, scheduledDate: string, notes?: string) => string;
  convertTicketToPurchase: (ticketId: string, buyerId?: string, notes?: string) => string;
  updateOSStatus: (osId: string, status: OSStatus) => void;
  toggleChecklistItem: (osId: string, checkId: string) => void;
  startOSTimer: (osId: string) => void;
  pauseOSTimer: (osId: string, reason: string) => void;
  finishOSWithSignature: (osId: string, signature: DigitalSignature) => void;
  validateAndCloseOS: (osId: string, validationNotes: string) => void;
  addPhotoToOS: (osId: string, photo: AttachedFile) => void;
  addPartToOS: (osId: string, part: UsedPart) => void;
  updatePurchaseStatus: (purchaseId: string, status: PurchaseStatus, notes?: string) => void;
  createPurchaseFromRecommendation: (rec: any) => string;
  updateInventoryStock: (itemId: string, newStock: number) => void;
  syncERPNow: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addTicketMessage: (ticketId: string, message: string, senderRole?: 'cliente' | 'suporte' | 'gestor' | 'tecnico', senderName?: string, attachments?: AttachedFile[]) => void;
  rateTicket: (ticketId: string, stars: number, feedback?: string) => void;
  addAuditRecord: (action: string, entityType: any, entityId: string, details: string) => void;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { title: string; message: string; type: 'success' | 'error' | 'info' } | null;
  allAttachedFiles: AttachedFile[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'corpservices_v1_';

function getInitialState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}role`);
        if (saved && ['admin', 'gestor', 'tecnico', 'comprador', 'cliente'].includes(saved)) {
          return saved as UserRole;
        }
      } catch {}
    }
    return 'admin'; // Start with admin as default so they see the new admin user and user management tool immediately!
  });

  const [users] = useState<User[]>(INITIAL_USERS);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => getInitialState('offline_queue', []));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Entities with safe lazy initializers
  const [tickets, setTickets] = useState<Ticket[]>(() => getInitialState('tickets', INITIAL_TICKETS));
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => getInitialState('os', INITIAL_WORK_ORDERS));
  const [purchases, setPurchases] = useState<PurchaseRequest[]>(() => getInitialState('purchases', INITIAL_PURCHASES));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getInitialState('inventory', INITIAL_INVENTORY));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getInitialState('audit', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [erpConfig, setErpConfig] = useState<ERPConfig>(INITIAL_ERP_CONFIG);
  const [operationalGoals] = useState<OperationalGoals>(INITIAL_OPERATIONAL_GOALS);
  const [activeTimerOSId, setActiveTimerOSId] = useState<string | null>('os-001');

  const showToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Sync Offline Queue
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 800));

    const count = offlineQueue.length;
    setOfflineQueue([]);
    setIsSyncing(false);

    showToast('Sincronização Concluída', `${count} alterações locais foram sincronizadas com o servidor corporativo.`, 'success');
  }, [offlineQueue.length, showToast]);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}tickets`, JSON.stringify(tickets));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}os`, JSON.stringify(workOrders));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}purchases`, JSON.stringify(purchases));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}inventory`, JSON.stringify(inventory));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}audit`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}offline_queue`, JSON.stringify(offlineQueue));
    } catch (e) {
      console.warn('Erro ao persistir dados locais:', e);
    }
  }, [tickets, workOrders, purchases, inventory, auditLogs, offlineQueue]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Conexão Restabelecida', 'O dispositivo voltou a ficar online. Sincronizando dados...', 'info');
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Modo Offline Ativado', 'Sem conectividade. Todas as alterações serão salvas localmente com segurança.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast, syncOfflineQueue]);

  // Timer interval for active OS
  useEffect(() => {
    if (!activeTimerOSId) return;

    const interval = setInterval(() => {
      setWorkOrders(prev => prev.map(os => {
        if (os.id === activeTimerOSId && os.isTimerActive) {
          return {
            ...os,
            totalWorkDurationMinutes: os.totalWorkDurationMinutes + 1
          };
        }
        return os;
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, [activeTimerOSId]);

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    return currentUserRole === 'tecnico' ? 'workorders' :
           currentUserRole === 'comprador' ? 'purchases' :
           currentUserRole === 'cliente' ? 'triage' : 'dashboard';
  });

  const currentUser = users.find(u => u.role === currentUserRole) || users[0] || {
    id: 'guest',
    name: 'Visitante',
    email: 'visitante@corpservices.com',
    role: 'cliente',
    department: 'Visitante',
    avatar: '',
    permissions: {
      canApproveOS: false,
      canApprovePurchases: false,
      canManageInventory: false,
      canViewReports: false,
      canManageUsers: false
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentUserRole(role);
    if (role === 'tecnico') setActiveTab('workorders');
    else if (role === 'comprador') setActiveTab('purchases');
    else if (role === 'cliente') setActiveTab('triage');
    else setActiveTab('dashboard');

    localStorage.setItem(`${STORAGE_KEY_PREFIX}role`, role);
    showToast('Perfil Alterado', `Você agora está navegando com permissões de ${role.toUpperCase()}.`, 'info');
  };

  const toggleOfflineSimulation = () => {
    setIsOnline(prev => {
      const next = !prev;
      if (!next) {
        showToast('Modo Offline Simulado', 'Você ativou a simulação de campo sem sinal de internet.', 'info');
      } else {
        showToast('Modo Online Restaurado', 'Simulação finalizada. Sincronizando fila...', 'success');
        syncOfflineQueue();
      }
      return next;
    });
  };

  const addAuditRecord = useCallback((action: string, entityType: any, entityId: string, details: string) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formatted,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      ipAddress: '189.102.44.12'
    };

    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser]);

  // Create Ticket from Bot IA
  const createTicketFromTriage = useCallback((ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): Ticket => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const seq = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TCK-${now.getFullYear()}-${seq}`;
    const trackingCode = `TRK-${seq}`;

    const newTicket: Ticket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber,
      trackingCode,
      status: 'aberto',
      messages: ticketData.messages || [
        {
          id: `msg-${Date.now()}-init`,
          ticketId: `tkt-${Date.now()}`,
          senderName: 'Bot IA CorpServices',
          senderRole: 'suporte',
          message: `Olá ${ticketData.clientName}! Seu chamado foi registrado com o protocolo ${ticketNumber} (Código de Rastreio: ${trackingCode}). Nossa equipe e bot de IA estão acompanhando seu caso.`,
          timestamp: formatted
        }
      ],
      createdAt: formatted,
      updatedAt: formatted
    };

    setTickets(prev => [newTicket, ...prev]);

    // Push notification to Manager
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `⚡ Novo Ticket (${newTicket.type === 'servico' ? 'Serviço' : 'Compra'})`,
      message: `${newTicket.ticketNumber}: "${newTicket.title}" aberto por ${newTicket.clientName}.`,
      type: newTicket.urgency === 'critica' || newTicket.urgency === 'alta' ? 'urgente' : 'info',
      targetRole: 'gestor',
      relatedEntityId: newTicket.id,
      relatedEntityType: 'ticket',
      createdAt: formatted,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditRecord(
      'CRIACAO_TICKET_IA', 
      'TICKET', 
      ticketNumber, 
      `Ticket gerado via triagem Bot IA classificado como [${newTicket.type.toUpperCase()} - Urgência ${newTicket.urgency.toUpperCase()}].`
    );

    showToast('Ticket Gerado com Sucesso', `${ticketNumber} direcionado para a aba de ${newTicket.type === 'servico' ? 'Serviços' : 'Compras'}.`, 'success');

    if (!isOnline) {
      setOfflineQueue(prev => [...prev, { action: 'CREATE_TICKET', payload: newTicket }]);
    }

    return newTicket;
  }, [addAuditRecord, isOnline, showToast]);

  // Resolve Ticket Directly
  const resolveTicketDirect = (ticketId: string, notes: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'resolvido_direto',
          resolutionNotes: notes,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      addAuditRecord(
        'TICKET_RESOLVIDO_DIRETO',
        'TICKET',
        ticket.ticketNumber,
        `Gestor ${currentUser.name} resolveu diretamente o chamado: "${notes}".`
      );
      showToast('Chamado Resolvido', `Ticket ${ticket.ticketNumber} concluído e arquivado com sucesso.`, 'success');
    }
  };

  // Add Message to Ticket Chat (Customer ↔ Support / Admin)
  const addTicketMessage = (
    ticketId: string, 
    messageText: string, 
    senderRole: 'cliente' | 'suporte' | 'gestor' | 'tecnico' = currentUser.role === 'cliente' ? 'cliente' : 'gestor',
    senderName: string = currentUser.name,
    attachments?: AttachedFile[]
  ) => {
    if (!messageText.trim() && (!attachments || attachments.length === 0)) return;

    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticketId,
      senderName,
      senderRole,
      senderAvatar: currentUser.avatar,
      message: messageText,
      timestamp: formatted,
      attachments
    };

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId || t.ticketNumber === ticketId || t.trackingCode === ticketId) {
        return {
          ...t,
          messages: [...(t.messages || []), newMessage],
          updatedAt: formatted
        };
      }
      return t;
    }));

    const ticket = tickets.find(t => t.id === ticketId || t.ticketNumber === ticketId || t.trackingCode === ticketId);
    if (ticket) {
      if (senderRole === 'cliente') {
        // Notification for manager/support
        setNotifications(prev => [{
          id: `notif-${Date.now()}`,
          title: `💬 Nova Mensagem no Ticket ${ticket.ticketNumber}`,
          message: `${senderName}: "${messageText.slice(0, 80)}${messageText.length > 80 ? '...' : ''}"`,
          type: 'info',
          targetRole: 'gestor',
          relatedEntityId: ticket.id,
          relatedEntityType: 'ticket',
          createdAt: formatted,
          read: false
        }, ...prev]);
      }

      addAuditRecord(
        'MENSAGEM_CHAT_TICKET',
        'TICKET',
        ticket.ticketNumber,
        `Mensagem enviada por [${senderRole.toUpperCase()}] ${senderName}: "${messageText.slice(0, 60)}".`
      );

      if (!isOnline) {
        setOfflineQueue(prev => [...prev, { action: 'ADD_TICKET_MESSAGE', ticketId: ticket.id, message: newMessage }]);
      }
    }
  };

  // Submit Client Rating / Feedback
  const rateTicket = (ticketId: string, stars: number, feedback?: string) => {
    const now = new Date().toISOString();
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId || t.ticketNumber === ticketId || t.trackingCode === ticketId) {
        return {
          ...t,
          clientRating: {
            stars,
            feedback,
            submittedAt: now
          }
        };
      }
      return t;
    }));

    showToast('Avaliação Registrada', `Agradecemos por avaliar nosso atendimento com ${stars} estrelas!`, 'success');
  };

  // Convert Ticket to Work Order (OS)
  const convertTicketToOS = (ticketId: string, technicianId: string, scheduledDate: string, notes?: string): string => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return '';

    const tech = users.find(u => u.id === technicianId) || users[1];
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const seq = Math.floor(100 + Math.random() * 900);
    const osNumber = `OS-${now.getFullYear()}-00${seq}`;
    const osId = `os-${Date.now()}`;

    const newOS: WorkOrder = {
      id: osId,
      osNumber,
      ticketId: ticket.id,
      title: ticket.title,
      description: ticket.description + (notes ? `\n\nInstruções do Gestor: ${notes}` : ''),
      urgency: ticket.urgency,
      status: 'agendada',
      clientName: ticket.clientName,
      clientPhone: ticket.clientPhone,
      clientAddress: ticket.location,
      equipmentName: ticket.equipmentName || 'Equipamento Geral',
      equipmentSerial: ticket.equipmentSerial || 'S/N-GERAL',
      assignedTechnicianId: tech.id,
      assignedTechnicianName: tech.name,
      checklist: [
        { id: `chk-${Date.now()}-1`, task: 'Inspeção de segurança e isolamento da área', completed: false },
        { id: `chk-${Date.now()}-2`, task: 'Registro fotográfico das condições iniciais (Antes)', completed: false, requiredPhoto: true },
        { id: `chk-${Date.now()}-3`, task: 'Diagnóstico técnico e execução do reparo', completed: false },
        { id: `chk-${Date.now()}-4`, task: 'Testes de funcionamento e medições elétricas/mecânicas', completed: false },
        { id: `chk-${Date.now()}-5`, task: 'Registro fotográfico pós-serviço e coleta de assinatura digital', completed: false, requiredPhoto: true }
      ],
      timeEntries: [],
      totalWorkDurationMinutes: 0,
      isTimerActive: false,
      usedParts: [],
      files: [...ticket.files],
      createdAt: formatted,
      scheduledDate,
      costTotal: ticket.estimatedCost || 600,
      erpSyncStatus: 'sincronizado',
      erpWorkOrderId: `ERP-WO-${Math.floor(80000 + Math.random() * 10000)}`
    };

    setWorkOrders(prev => [newOS, ...prev]);

    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: 'convertido_os',
      convertedToId: osId,
      updatedAt: formatted
    } : t));

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: '🛠️ Nova Ordem de Serviço Atribuída',
      message: `${osNumber} atribuída a você para o cliente ${ticket.clientCompany || ticket.clientName}.`,
      type: 'urgente',
      targetRole: 'tecnico',
      relatedEntityId: osId,
      relatedEntityType: 'os',
      createdAt: formatted,
      read: false
    }, ...prev]);

    addAuditRecord(
      'CONVERSAO_TICKET_EM_OS',
      'OS',
      osNumber,
      `Ticket ${ticket.ticketNumber} convertido em OS despachada para o técnico ${tech.name}.`
    );

    showToast('OS Despachada com Sucesso', `Ordem de Serviço ${osNumber} gerada e atribuída a ${tech.name}.`, 'success');

    if (!isOnline) {
      setOfflineQueue(prev => [...prev, { action: 'CONVERT_TO_OS', payload: newOS }]);
    }

    return osId;
  };

  // Convert Ticket to Purchase Order
  const convertTicketToPurchase = (ticketId: string, buyerId?: string, notes?: string): string => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return '';

    const buyer = users.find(u => u.id === buyerId) || users[2];
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const seq = Math.floor(100 + Math.random() * 900);
    const purchaseNumber = `PED-COMP-${now.getFullYear()}-00${seq}`;
    const purchaseId = `pur-${Date.now()}`;

    const newPurchase: PurchaseRequest = {
      id: purchaseId,
      purchaseNumber,
      ticketId: ticket.id,
      title: ticket.title,
      justification: ticket.description + (notes ? `\n\nDiretrizes do Gestor: ${notes}` : ''),
      urgency: ticket.urgency,
      status: 'cotacao_em_andamento',
      requestedBy: `${currentUser.name} (${currentUser.role})`,
      assignedBuyerId: buyer.id,
      assignedBuyerName: buyer.name,
      items: [
        {
          id: `pitem-${Date.now()}-1`,
          name: ticket.equipmentName ? `Peças e Insumos para ${ticket.equipmentName}` : 'Itens solicitados via ticket',
          quantity: 1,
          unit: 'LOTE',
          estimatedUnitPrice: ticket.estimatedCost || 1200.00
        }
      ],
      totalEstimated: ticket.estimatedCost || 1200.00,
      createdAt: formatted,
      neededByDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 3).padStart(2, '0')}`,
      erpSyncStatus: 'pendente',
      files: [...ticket.files]
    };

    setPurchases(prev => [newPurchase, ...prev]);

    setTickets(prev => prev.map(t => t.id === ticketId ? {
      ...t,
      status: 'convertido_compra',
      convertedToId: purchaseId,
      updatedAt: formatted
    } : t));

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: '📦 Novo Pedido de Compra Atribuído',
      message: `${purchaseNumber}: "${ticket.title}" encaminhado para cotação de suprimentos.`,
      type: 'urgente',
      targetRole: 'comprador',
      relatedEntityId: purchaseId,
      relatedEntityType: 'compra',
      createdAt: formatted,
      read: false
    }, ...prev]);

    addAuditRecord(
      'CONVERSAO_TICKET_EM_COMPRA',
      'COMPRA',
      purchaseNumber,
      `Ticket ${ticket.ticketNumber} convertido em Pedido de Compras encaminhado para ${buyer.name}.`
    );

    showToast('Pedido de Compra Gerado', `${purchaseNumber} direcionado para a compradora ${buyer.name}.`, 'success');

    return purchaseId;
  };

  // OS Technician Operations
  const updateOSStatus = (osId: string, status: OSStatus) => {
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId) {
        return { ...os, status };
      }
      return os;
    }));

    const os = workOrders.find(o => o.id === osId);
    if (os) {
      addAuditRecord(
        'ATUALIZACAO_STATUS_OS',
        'OS',
        os.osNumber,
        `Status da OS alterado para [${status.toUpperCase()}] por ${currentUser.name}.`
      );
    }
  };

  const toggleChecklistItem = (osId: string, checkId: string) => {
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          checklist: os.checklist.map(item => {
            if (item.id === checkId) {
              const nextCompleted = !item.completed;
              return {
                ...item,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString() : undefined
              };
            }
            return item;
          })
        };
      }
      return os;
    }));
  };

  const startOSTimer = (osId: string) => {
    const now = new Date().toISOString();
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          status: 'em_execucao',
          isTimerActive: true,
          timerStartedAt: now
        };
      }
      return os;
    }));

    setActiveTimerOSId(osId);
    const os = workOrders.find(o => o.id === osId);
    if (os) {
      addAuditRecord('TIMER_INICIADO', 'OS', os.osNumber, `Técnico ${currentUser.name} iniciou o cronômetro de execução da OS.`);
      showToast('Cronômetro Ativado', `Tempo de execução registrado em tempo real para a ${os.osNumber}.`, 'info');
    }
  };

  const pauseOSTimer = (osId: string, reason: string) => {
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId && os.isTimerActive) {
        const started = os.timerStartedAt ? new Date(os.timerStartedAt).getTime() : Date.now();
        const durationMin = Math.max(1, Math.round((Date.now() - started) / 60000));
        
        const newEntry = {
          id: `time-${Date.now()}`,
          startedAt: os.timerStartedAt || new Date().toISOString(),
          pausedAt: new Date().toISOString(),
          durationMinutes: durationMin,
          pauseReason: reason || 'Pausa operacional',
          technicianName: currentUser.name
        };

        return {
          ...os,
          isTimerActive: false,
          status: 'pausada',
          timeEntries: [...os.timeEntries, newEntry],
          totalWorkDurationMinutes: os.totalWorkDurationMinutes + durationMin
        };
      }
      return os;
    }));

    setActiveTimerOSId(null);
    const os = workOrders.find(o => o.id === osId);
    if (os) {
      addAuditRecord('TIMER_PAUSADO', 'OS', os.osNumber, `Cronômetro pausado por motivo: "${reason}".`);
      showToast('Cronômetro Pausado', `Motivo: ${reason}`, 'info');
    }
  };

  const finishOSWithSignature = (osId: string, signature: DigitalSignature) => {
    const now = new Date().toISOString();
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          status: 'aguardando_validacao_gestor',
          isTimerActive: false,
          digitalSignature: signature,
          completedAt: now
        };
      }
      return os;
    }));

    setActiveTimerOSId(null);

    const os = workOrders.find(o => o.id === osId);
    if (os) {
      setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        title: '✅ OS Concluída pelo Técnico',
        message: `${os.osNumber} finalizada com assinatura digital por ${currentUser.name}. Aguardando sua validação e encerramento.`,
        type: 'sucesso',
        targetRole: 'gestor',
        relatedEntityId: os.id,
        relatedEntityType: 'os',
        createdAt: now,
        read: false
      }, ...prev]);

      addAuditRecord(
        'OS_FINALIZADA_TECNICO',
        'OS',
        os.osNumber,
        `Técnico concluiu a OS e assinou digitalmente. Hash de autenticidade: ${signature.validationHash}.`
      );

      showToast('OS Finalizada com Sucesso', `Assinatura digital registrada. Encaminhada para validação do Gestor.`, 'success');

      if (!isOnline) {
        setOfflineQueue(prev => [...prev, { action: 'FINISH_OS', osId, signature }]);
      }
    }
  };

  // Manager final validation & close
  const validateAndCloseOS = (osId: string, validationNotes: string) => {
    const now = new Date().toISOString();
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          status: 'concluida',
          managerValidationNotes: validationNotes,
          managerValidatedBy: currentUser.name,
          managerValidatedAt: now
        };
      }
      return os;
    }));

    const os = workOrders.find(o => o.id === osId);
    if (os) {
      if (os.ticketId) {
        setTickets(prev => prev.map(t => t.id === os.ticketId ? {
          ...t,
          status: 'concluido',
          resolutionNotes: `OS ${os.osNumber} validada e encerrada pelo gestor ${currentUser.name}.`
        } : t));
      }

      addAuditRecord(
        'VALIDACAO_E_ENCERRAMENTO_OS',
        'OS',
        os.osNumber,
        `Gestor ${currentUser.name} validou a OS e encerrou o processo com o parecer: "${validationNotes}".`
      );

      showToast('OS Validada e Encerrada', `Ordem de Serviço ${os.osNumber} foi formalmente validada e arquivada no ERP.`, 'success');
    }
  };

  const addPhotoToOS = (osId: string, photo: AttachedFile) => {
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          files: [photo, ...os.files]
        };
      }
      return os;
    }));

    const os = workOrders.find(o => o.id === osId);
    if (os) {
      addAuditRecord(
        'EVIDENCIA_FOTOGRAFICA_ANEXADA',
        'OS',
        os.osNumber,
        `Foto anexada na categoria "${photo.category || 'geral'}" por ${currentUser.name}. Rastreabilidade garantida.`
      );
      showToast('Evidência Fotográfica Salva', `Foto registrada na OS ${os.osNumber}.`, 'success');

      if (!isOnline) {
        setOfflineQueue(prev => [...prev, { action: 'ADD_PHOTO', osId, photo }]);
      }
    }
  };

  const addPartToOS = (osId: string, part: UsedPart) => {
    setWorkOrders(prev => prev.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          usedParts: [...os.usedParts, part],
          costTotal: os.costTotal + part.totalPrice
        };
      }
      return os;
    }));

    setInventory(prev => prev.map(item => {
      if (item.id === part.inventoryItemId) {
        const remaining = Math.max(0, item.currentStock - part.quantity);
        return {
          ...item,
          currentStock: remaining,
          status: remaining <= item.minimumStock ? (remaining <= 2 ? 'critico' : 'alerta_baixo') : 'normal'
        };
      }
      return item;
    }));

    addAuditRecord(
      'BAIXA_ESTOQUE_EM_OS',
      'ESTOQUE',
      part.code,
      `Baixa de ${part.quantity} un de "${part.name}" utilizada na OS.`
    );

    showToast('Peça Adicionada à OS', `${part.quantity} un de ${part.name} deduzida do estoque.`, 'success');
  };

  // Purchase updates
  const updatePurchaseStatus = (purchaseId: string, status: PurchaseStatus, notes?: string) => {
    const now = new Date().toISOString();
    setPurchases(prev => prev.map(p => {
      if (p.id === purchaseId) {
        return {
          ...p,
          status,
          ...(status === 'aprovado' ? { approvedAt: now, managerApprovalNotes: notes } : {}),
          ...(status === 'entregue_estoque' ? { deliveredAt: now } : {})
        };
      }
      return p;
    }));

    const pur = purchases.find(p => p.id === purchaseId);
    if (pur) {
      addAuditRecord(
        'ATUALIZACAO_STATUS_COMPRA',
        'COMPRA',
        pur.purchaseNumber,
        `Status de compra alterado para [${status.toUpperCase()}] por ${currentUser.name}. ${notes ? `Notas: ${notes}` : ''}`
      );
      showToast('Pedido de Compra Atualizado', `${pur.purchaseNumber} atualizado para ${status}.`, 'success');
    }
  };

  const createPurchaseFromRecommendation = (rec: any): string => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const seq = Math.floor(100 + Math.random() * 900);
    const purchaseNumber = `PED-COMP-${now.getFullYear()}-00${seq}`;
    const purchaseId = `pur-${Date.now()}`;

    const newPurchase: PurchaseRequest = {
      id: purchaseId,
      purchaseNumber,
      title: `Reposição de Estoque: ${rec.itemName}`,
      justification: `Gerado automaticamente via Bot IA de Compras CorpServices. Motivo: ${rec.reason}`,
      urgency: rec.priority || 'alta',
      status: 'aguardando_aprovacao_gestor',
      requestedBy: 'Bot IA de Compras',
      assignedBuyerId: users[2].id,
      assignedBuyerName: users[2].name,
      items: [
        {
          id: `pitem-${Date.now()}`,
          name: rec.itemName,
          code: rec.itemCode,
          quantity: rec.suggestedQuantity,
          unit: 'UN',
          estimatedUnitPrice: rec.estimatedBudget / (rec.suggestedQuantity || 1),
          supplier: rec.supplier
        }
      ],
      totalEstimated: rec.estimatedBudget,
      selectedSupplier: rec.supplier,
      createdAt: formatted,
      neededByDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 5).padStart(2, '0')}`,
      erpSyncStatus: 'pendente',
      files: []
    };

    setPurchases(prev => [newPurchase, ...prev]);

    addAuditRecord(
      'SUGESTAO_COMPRA_BOT_IA',
      'COMPRA',
      purchaseNumber,
      `Bot IA gerou requisição de compra para reposição de ${rec.suggestedQuantity} unidades de "${rec.itemName}".`
    );

    showToast('Requisição de Compra Criada', `${purchaseNumber} adicionada à lista de compras para aprovação.`, 'success');

    return purchaseId;
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const status = newStock <= item.minimumStock ? (newStock <= 2 ? 'critico' : 'alerta_baixo') : 'normal';
        return {
          ...item,
          currentStock: newStock,
          status,
          lastRestockDate: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));

    const item = inventory.find(i => i.id === itemId);
    if (item) {
      addAuditRecord(
        'AJUSTE_MANUAL_ESTOQUE',
        'ESTOQUE',
        item.code,
        `Estoque de ${item.name} ajustado para ${newStock} ${item.unit} por ${currentUser.name}.`
      );
      showToast('Estoque Atualizado', `${item.name}: saldo atualizado para ${newStock} ${item.unit}.`, 'success');
    }
  };

  const syncERPNow = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1200));

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setErpConfig(prev => ({
      ...prev,
      isConnected: true,
      lastSyncTimestamp: now
    }));

    setWorkOrders(prev => prev.map(os => ({ ...os, erpSyncStatus: 'sincronizado' })));
    setPurchases(prev => prev.map(p => ({ ...p, erpSyncStatus: 'sincronizado' })));

    setIsSyncing(false);

    addAuditRecord(
      'SINCRONIZACAO_ERP',
      'ERP',
      erpConfig.systemName,
      `Sincronização bidirecional concluída com sucesso com o ${erpConfig.systemName}. Centros de custo e O.S. atualizadas.`
    );

    showToast('ERP Sincronizado', `Todos os dados foram sincronizados com ${erpConfig.systemName}.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const allAttachedFiles: AttachedFile[] = [
    ...tickets.flatMap(t => t.files.map(f => ({ ...f, ticketId: t.id }))),
    ...workOrders.flatMap(os => os.files.map(f => ({ ...f, osId: os.id }))),
    ...purchases.flatMap(p => p.files.map(f => ({ ...f, description: `Anexo de Compra ${p.purchaseNumber}` })))
  ];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentUserRole,
        switchRole,
        activeTab,
        setActiveTab,
        users,
        tickets,
        workOrders,
        purchases,
        inventory,
        auditLogs,
        notifications,
        erpConfig,
        operationalGoals,
        isOnline,
        offlineQueueCount: offlineQueue.length,
        isSyncing,
        activeTimerOSId,
        toggleOfflineSimulation,
        syncOfflineQueue,
        createTicketFromTriage,
        resolveTicketDirect,
        convertTicketToOS,
        convertTicketToPurchase,
        updateOSStatus,
        toggleChecklistItem,
        startOSTimer,
        pauseOSTimer,
        finishOSWithSignature,
        validateAndCloseOS,
        addPhotoToOS,
        addPartToOS,
        updatePurchaseStatus,
        createPurchaseFromRecommendation,
        updateInventoryStock,
        syncERPNow,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addTicketMessage,
        rateTicket,
        addAuditRecord,
        showToast,
        toast,
        allAttachedFiles
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
