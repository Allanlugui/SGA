export type UserRole = 'gestor' | 'tecnico' | 'comprador' | 'cliente';

export type ActiveTab = 
  | 'triage' 
  | 'tickets' 
  | 'workorders' 
  | 'purchases' 
  | 'inventory' 
  | 'dashboard' 
  | 'reports' 
  | 'explorer' 
  | 'erp' 
  | 'audit'
  | 'tracking';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  phone?: string;
}

export type TicketType = 'servico' | 'compra';

export type TicketUrgency = 'baixa' | 'media' | 'alta' | 'critica';

export type TicketStatus = 
  | 'aberto' 
  | 'em_triagem' 
  | 'aprovado_gestor' 
  | 'convertido_os' 
  | 'convertido_compra' 
  | 'resolvido_direto' 
  | 'concluido' 
  | 'cancelado';

export interface AttachedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: 'image' | 'pdf' | 'doc';
  category?: 'antes' | 'durante' | 'depois' | 'nota_fiscal' | 'manual' | 'geral';
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  osId?: string;
  ticketId?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderName: string;
  senderRole: 'cliente' | 'suporte' | 'gestor' | 'tecnico';
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: AttachedFile[];
  isInternalOnly?: boolean;
}

export interface ClientRating {
  stars: number; // 1 to 5
  feedback?: string;
  submittedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  trackingCode?: string; // Código de rastreamento amigável (ex: TRK-0891)
  type: TicketType;
  title: string;
  description: string;
  urgency: TicketUrgency;
  status: TicketStatus;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  department?: string;
  location: string;
  equipmentName?: string;
  equipmentSerial?: string;
  aiTriageSummary?: string;
  aiSuggestedCategory?: string;
  aiConfidence?: number;
  files: AttachedFile[];
  createdAt: string;
  updatedAt: string;
  convertedToId?: string; // OS ID or Purchase ID
  resolutionNotes?: string;
  estimatedCost?: number;
  messages?: TicketMessage[];
  clientRating?: ClientRating;
}

export type OSStatus = 
  | 'pendente_atribuicao' 
  | 'agendada' 
  | 'em_deslocamento' 
  | 'em_execucao' 
  | 'pausada' 
  | 'aguardando_peca' 
  | 'aguardando_validacao_gestor' 
  | 'concluida' 
  | 'reprovada';

export interface OSTimeEntry {
  id: string;
  startedAt: string;
  pausedAt?: string;
  durationMinutes: number;
  pauseReason?: string;
  technicianName: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  requiredPhoto?: boolean;
  completedAt?: string;
}

export interface UsedPart {
  inventoryItemId: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DigitalSignature {
  technicianName: string;
  signatureDataUrl: string;
  signedAt: string;
  clientRepresentativeName?: string;
  clientSignatureDataUrl?: string;
  validationHash: string;
  deviceInfo: string;
}

export interface WorkOrder {
  id: string;
  osNumber: string;
  ticketId?: string;
  title: string;
  description: string;
  urgency: TicketUrgency;
  status: OSStatus;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  equipmentName: string;
  equipmentSerial: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  checklist: ChecklistItem[];
  timeEntries: OSTimeEntry[];
  totalWorkDurationMinutes: number;
  isTimerActive: boolean;
  timerStartedAt?: string;
  usedParts: UsedPart[];
  files: AttachedFile[];
  digitalSignature?: DigitalSignature;
  managerValidationNotes?: string;
  managerValidatedBy?: string;
  managerValidatedAt?: string;
  createdAt: string;
  scheduledDate: string;
  completedAt?: string;
  costTotal: number;
  erpSyncStatus: 'sincronizado' | 'pendente' | 'erro';
  erpWorkOrderId?: string;
}

export type PurchaseStatus = 
  | 'solicitado' 
  | 'cotacao_em_andamento' 
  | 'aguardando_aprovacao_gestor' 
  | 'aprovado' 
  | 'pedido_emitido' 
  | 'em_transito' 
  | 'entregue_estoque' 
  | 'cancelado';

export interface PurchaseItem {
  id: string;
  name: string;
  code?: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  finalUnitPrice?: number;
  supplier?: string;
}

export interface PurchaseRequest {
  id: string;
  purchaseNumber: string;
  ticketId?: string;
  workOrderId?: string;
  title: string;
  justification: string;
  urgency: TicketUrgency;
  status: PurchaseStatus;
  requestedBy: string;
  assignedBuyerId?: string;
  assignedBuyerName?: string;
  items: PurchaseItem[];
  totalEstimated: number;
  totalFinal?: number;
  selectedSupplier?: string;
  supplierQuoteNotes?: string;
  managerApprovalNotes?: string;
  createdAt: string;
  neededByDate: string;
  approvedAt?: string;
  deliveredAt?: string;
  erpPurchaseOrderId?: string;
  erpSyncStatus: 'sincronizado' | 'pendente' | 'erro';
  files: AttachedFile[];
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  costPrice: number;
  sellPrice: number;
  locationShelf: string;
  supplier: string;
  lastRestockDate: string;
  status: 'normal' | 'alerta_baixo' | 'critico';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'TICKET' | 'OS' | 'COMPRA' | 'ESTOQUE' | 'ERP' | 'SISTEMA';
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'urgente' | 'info' | 'sucesso' | 'alerta';
  targetRole?: UserRole | 'all';
  relatedEntityId?: string;
  relatedEntityType?: 'ticket' | 'os' | 'compra' | 'estoque';
  createdAt: string;
  read: boolean;
}

export interface ERPConfig {
  systemName: 'SAP S/4HANA' | 'TOTVS Protheus' | 'Senior ERP' | 'Omie Corporativo';
  isConnected: boolean;
  endpointUrl: string;
  lastSyncTimestamp: string;
  autoSyncOrders: boolean;
  autoSyncPurchases: boolean;
  autoSyncStock: boolean;
  costCenterDefault: string;
  fiscalCompanyId: string;
}

export interface OperationalGoals {
  targetSlaPercentage: number;
  currentSlaPercentage: number;
  targetMttrHours: number;
  currentMttrHours: number;
  targetPhotoCompliancePercentage: number;
  currentPhotoCompliancePercentage: number;
  targetCompletedOsCount: number;
  currentCompletedOsCount: number;
  targetInventoryStockoutCount: number;
  currentInventoryStockoutCount: number;
}
