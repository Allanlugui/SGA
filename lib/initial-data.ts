import { 
  User, 
  Ticket, 
  WorkOrder, 
  PurchaseRequest, 
  InventoryItem, 
  AuditLog, 
  NotificationItem, 
  ERPConfig, 
  OperationalGoals 
} from '@/types';

export const INITIAL_USERS: User[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];
export const INITIAL_TICKETS: Ticket[] = [];
export const INITIAL_WORK_ORDERS: WorkOrder[] = [];
export const INITIAL_PURCHASES: PurchaseRequest[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_ERP_CONFIG: ERPConfig = {
  systemName: 'TOTVS Protheus',
  isConnected: false,
  endpointUrl: '',
  lastSyncTimestamp: '',
  autoSyncOrders: false,
  autoSyncPurchases: false,
  autoSyncStock: false,
  costCenterDefault: '',
  fiscalCompanyId: ''
};
export const INITIAL_OPERATIONAL_GOALS: OperationalGoals = {
  targetSlaPercentage: 0,
  currentSlaPercentage: 0,
  targetMttrHours: 0,
  currentMttrHours: 0,
  targetPhotoCompliancePercentage: 0,
  currentPhotoCompliancePercentage: 0,
  targetCompletedOsCount: 0,
  currentCompletedOsCount: 0,
  targetInventoryStockoutCount: 0,
  currentInventoryStockoutCount: 0
};
