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

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Rodrigo Silva (Admin)',
    email: 'admin@corpservices.com.br',
    role: 'admin',
    department: 'TI & Administração Geral',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '(11) 99999-8888',
    permissions: {
      canApproveOS: true,
      canApprovePurchases: true,
      canManageInventory: true,
      canViewReports: true,
      canManageUsers: true
    }
  },
  {
    id: 'usr-gestor-1',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@corpservices.com.br',
    role: 'gestor',
    department: 'Gerência de Operações & Manutenção',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '(11) 98765-4321',
    permissions: {
      canApproveOS: true,
      canApprovePurchases: true,
      canManageInventory: true,
      canViewReports: true,
      canManageUsers: false
    }
  },
  {
    id: 'usr-tecnico-1',
    name: 'Roberto Silveira (Téc. Senior)',
    email: 'roberto.silveira@corpservices.com.br',
    role: 'tecnico',
    department: 'Equipe Técnica de Campo #04',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '(11) 99123-5566',
    permissions: {
      canApproveOS: false,
      canApprovePurchases: false,
      canManageInventory: false,
      canViewReports: false,
      canManageUsers: false
    }
  },
  {
    id: 'usr-comprador-1',
    name: 'Juliana Fagundes',
    email: 'juliana.fagundes@corpservices.com.br',
    role: 'comprador',
    department: 'Departamento de Compras & Suprimentos',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '(11) 97654-8899',
    permissions: {
      canApproveOS: false,
      canApprovePurchases: true,
      canManageInventory: true,
      canViewReports: false,
      canManageUsers: false
    }
  },
  {
    id: 'usr-cliente-1',
    name: 'Mariana Duarte (Industrial Alfa S.A.)',
    email: 'mariana.duarte@alfa-ind.com.br',
    role: 'cliente',
    department: 'Supervisão de Manutenção Predial',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '(11) 99345-1234',
    permissions: {
      canApproveOS: false,
      canApprovePurchases: false,
      canManageInventory: false,
      canViewReports: false,
      canManageUsers: false
    }
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    code: 'ELET-DISJ-32A',
    name: 'Disjuntor Bipolar Din 32A Curva C Schneider',
    category: 'Elétrica & Proteção',
    currentStock: 4,
    minimumStock: 10,
    maximumStock: 50,
    unit: 'UN',
    costPrice: 42.50,
    sellPrice: 68.00,
    locationShelf: 'Rua B - Prateleira 03',
    supplier: 'EletroDistribuidora Paulista',
    lastRestockDate: '2026-08-15',
    status: 'critico'
  },
  {
    id: 'inv-002',
    code: 'CLIM-FILT-G4',
    name: 'Manta Filtrante Sintética G4 1m x 2m',
    category: 'Climatização & HVAC',
    currentStock: 18,
    minimumStock: 15,
    maximumStock: 60,
    unit: 'ROLO',
    costPrice: 85.00,
    sellPrice: 135.00,
    locationShelf: 'Rua A - Prateleira 01',
    supplier: 'Filtros Industriais Brasil',
    lastRestockDate: '2026-09-02',
    status: 'normal'
  },
  {
    id: 'inv-003',
    code: 'LUB-IND-ISO68',
    name: 'Óleo Hidráulico e Lubrificante ISO VG 68 20L',
    category: 'Mecânica & Hidráulica',
    currentStock: 2,
    minimumStock: 8,
    maximumStock: 25,
    unit: 'BOMBONA',
    costPrice: 280.00,
    sellPrice: 410.00,
    locationShelf: 'Depósito Químicos - Box 02',
    supplier: 'PetroLub Suprimentos',
    lastRestockDate: '2026-08-20',
    status: 'critico'
  },
  {
    id: 'inv-004',
    code: 'CAB-NET-CAT6',
    name: 'Cabo de Rede UTP Cat6 Furukawa 305m Azul',
    category: 'Telecom & TI',
    currentStock: 12,
    minimumStock: 6,
    maximumStock: 30,
    unit: 'CX',
    costPrice: 620.00,
    sellPrice: 890.00,
    locationShelf: 'Rua C - Prateleira 05',
    supplier: 'Redes Telecom Express',
    lastRestockDate: '2026-09-10',
    status: 'normal'
  },
  {
    id: 'inv-005',
    code: 'VALV-RET-1POL',
    name: 'Válvula de Retenção Portinhola Bronze 1 Polegada',
    category: 'Hidráulica Predial',
    currentStock: 5,
    minimumStock: 6,
    maximumStock: 20,
    unit: 'UN',
    costPrice: 110.00,
    sellPrice: 175.00,
    locationShelf: 'Rua B - Prateleira 02',
    supplier: 'Metais & Conexões Docol/Deca',
    lastRestockDate: '2026-08-28',
    status: 'alerta_baixo'
  },
  {
    id: 'inv-006',
    code: 'CONT-ELET-25A',
    name: 'Contator de Potência Tripolar 25A 220V WEG',
    category: 'Elétrica & Automação',
    currentStock: 14,
    minimumStock: 8,
    maximumStock: 40,
    unit: 'UN',
    costPrice: 145.00,
    sellPrice: 230.00,
    locationShelf: 'Rua B - Prateleira 04',
    supplier: 'WEG Distribuição Brasil',
    lastRestockDate: '2026-09-12',
    status: 'normal'
  }
];

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TCK-2026-0891',
    trackingCode: 'TRK-0891',
    type: 'servico',
    title: 'Falha intermitente e superaquecimento no Chiller Principal - Bloco B',
    description: 'O chiller modelo Carrier 30XA apresentou alarme de alta pressão e desarme automático por 3 vezes nesta manhã, elevando a temperatura da sala de servidores para 26°C.',
    urgency: 'critica',
    status: 'convertido_os',
    clientName: 'Mariana Duarte',
    clientEmail: 'mariana.duarte@alfa-ind.com.br',
    clientPhone: '(11) 99345-1234',
    clientCompany: 'Industrial Alfa S.A.',
    department: 'Supervisão de Manutenção Predial & CPD',
    location: 'Unidade Tamboré - Barueri/SP, Bloco B, Cobertura Técnica',
    equipmentName: 'Chiller Parafuso Carrier 30XA',
    equipmentSerial: 'CR-30XA-9921',
    aiTriageSummary: 'Triagem Bot IA: Chamado crítico de Climatização/HVAC com risco de paralisação de CPD. Classificado como SERVIÇO com necessidade de atendimento emergencial em campo (SLA 2h).',
    aiSuggestedCategory: 'Climatização Industrial',
    aiConfidence: 0.98,
    files: [
      {
        id: 'file-001',
        name: 'painel_alarme_pressao.jpg',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        size: '1.8 MB',
        type: 'image',
        category: 'antes',
        uploadedAt: '2026-09-25 08:15',
        uploadedBy: 'Mariana Duarte (Cliente)'
      }
    ],
    createdAt: '2026-09-25 08:15:00',
    updatedAt: '2026-09-25 08:30:00',
    convertedToId: 'os-001',
    estimatedCost: 1200.00,
    messages: [
      {
        id: 'msg-001',
        ticketId: 'tkt-001',
        senderName: 'Mariana Duarte',
        senderRole: 'cliente',
        message: 'Bom dia! A temperatura no data center continua subindo, já está em 26.5°C. Conseguem previsão de chegada do técnico?',
        timestamp: '2026-09-25 08:25:00'
      },
      {
        id: 'msg-002',
        ticketId: 'tkt-001',
        senderName: 'Carlos Mendes (Gestor Operacional)',
        senderRole: 'gestor',
        message: 'Olá Mariana! Aprovamos seu chamado em caráter emergencial e despachamos a OS-2026-00412. O técnico sênior Roberto Silveira já está no local efetuando os testes de pressão.',
        timestamp: '2026-09-25 08:35:00'
      },
      {
        id: 'msg-003',
        ticketId: 'tkt-001',
        senderName: 'Roberto Silveira (Técnico de Campo)',
        senderRole: 'tecnico',
        message: 'Mariana, detectei sujeira pesada na serpentina e o disjuntor de comando atuando por sobreaquecimento. Já estou iniciando a limpeza química.',
        timestamp: '2026-09-25 09:52:00'
      }
    ]
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TCK-2026-0892',
    trackingCode: 'TRK-0892',
    type: 'compra',
    title: 'Solicitação de Lote Emergencial de Filtros G4 e Contatores WEG',
    description: 'Solicito a aquisição imediata de reposição para 10 rolos de Manta G4 e 6 contatores WEG 25A para manutenção preventiva da linha de envase programada para o próximo final de semana.',
    urgency: 'alta',
    status: 'convertido_compra',
    clientName: 'Mariana Duarte',
    clientEmail: 'mariana.duarte@alfa-ind.com.br',
    clientPhone: '(11) 99345-1234',
    clientCompany: 'Industrial Alfa S.A.',
    department: 'Linha de Envase Farmacêutico',
    location: 'Almoxarifado Central - Galpão 03',
    equipmentName: 'Sistema de Ventilação e Quadros de Força',
    aiTriageSummary: 'Triagem Bot IA: Identificada requisição de aquisição de peças e insumos de manutenção. Encaminhado diretamente para a aba de Solicitações de Compras para aprovação e cotação com fornecedores homologados.',
    aiSuggestedCategory: 'Suprimentos & Peças de Reposição',
    aiConfidence: 0.96,
    files: [
      {
        id: 'file-002',
        name: 'especificacao_tecnica_filtros.pdf',
        url: '#',
        size: '420 KB',
        type: 'pdf',
        category: 'manual',
        uploadedAt: '2026-09-25 09:00',
        uploadedBy: 'Mariana Duarte'
      }
    ],
    createdAt: '2026-09-25 09:00:00',
    updatedAt: '2026-09-25 09:20:00',
    convertedToId: 'pur-001',
    estimatedCost: 2450.00,
    messages: [
      {
        id: 'msg-004',
        ticketId: 'tkt-002',
        senderName: 'Juliana Fagundes (Compradora)',
        senderRole: 'suporte',
        message: 'Mariana, recebi sua requisição de compra PED-COMP-2026-00412. Já estou consultando 3 fornecedores homologados (Filtros Brasil, WEG e EletroPaulista) para melhor prazo de entrega.',
        timestamp: '2026-09-25 09:25:00'
      }
    ]
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TCK-2026-0893',
    trackingCode: 'TRK-0893',
    type: 'servico',
    title: 'Queda de disjuntor geral do setor administrativo após ligação de ar-condicionado',
    description: 'Sempre que o setor da contabilidade liga as máquinas de 30.000 BTUs, o disjuntor do quadro QD-04 desarma, deixando 18 estações de trabalho sem energia.',
    urgency: 'alta',
    status: 'aberto',
    clientName: 'Fernando Alcantara',
    clientEmail: 'fernando.adm@logisticaexpress.com',
    clientPhone: '(11) 98111-2233',
    clientCompany: 'Logística Express Hub',
    department: 'Administração & Contabilidade',
    location: 'Prédio Administrativo - 2º Andar, Quadro QD-04',
    equipmentName: 'Quadro de Distribuição QD-04',
    aiTriageSummary: 'Triagem Bot IA: Sobrecarga em circuito elétrico ou fadiga de disjuntor termomagnético. Recomenda-se envio de técnico com alicate amperímetro e disjuntores de reposição.',
    aiSuggestedCategory: 'Elétrica Predial',
    aiConfidence: 0.94,
    files: [
      {
        id: 'file-003',
        name: 'quadro_disjuntor_qd04.jpg',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        size: '2.1 MB',
        type: 'image',
        category: 'antes',
        uploadedAt: '2026-09-25 09:45',
        uploadedBy: 'Fernando Alcantara'
      }
    ],
    createdAt: '2026-09-25 09:45:00',
    updatedAt: '2026-09-25 09:45:00',
    estimatedCost: 450.00,
    messages: [
      {
        id: 'msg-005',
        ticketId: 'tkt-003',
        senderName: 'Fernando Alcantara',
        senderRole: 'cliente',
        message: 'Chamado aberto com foto do quadro. Aguardo posicionamento da equipe técnica.',
        timestamp: '2026-09-25 09:46:00'
      }
    ]
  },
  {
    id: 'tkt-004',
    ticketNumber: 'TCK-2026-0894',
    trackingCode: 'TRK-0894',
    type: 'compra',
    title: 'Compra de 20 bombonas de Óleo Lubrificante ISO VG 68 para Prensa Hidráulica',
    description: 'Estoque do óleo de viscosidade 68 atingiu nível crítico (apenas 2 unidades no estoque mínimo de 8). Necessário pedido de ressuprimento urgente.',
    urgency: 'critica',
    status: 'aberto',
    clientName: 'Almoxarifado CorpServices',
    clientEmail: 'suprimentos@corpservices.com.br',
    clientPhone: '(11) 97654-8899',
    clientCompany: 'CorpServices Interno',
    department: 'Manutenção Mecânica Pesada',
    location: 'Armazém Central Setor B',
    equipmentName: 'Prensas Hidráulicas Industriais Schuler',
    aiTriageSummary: 'Triagem Bot IA: Sugestão automatizada de compra gerada por alerta de estoque mínimo. Risco iminente de desabastecimento.',
    aiSuggestedCategory: 'Ressuprimento de Estoque',
    aiConfidence: 0.99,
    files: [],
    createdAt: '2026-09-25 10:10:00',
    updatedAt: '2026-09-25 10:10:00',
    estimatedCost: 5600.00
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'os-001',
    osNumber: 'OS-2026-00412',
    ticketId: 'tkt-001',
    title: 'Manutenção Corretiva Emergencial - Chiller Carrier 30XA',
    description: 'Diagnosticar e solucionar desarme por alta pressão no condensador, higienizar aletas da serpentina e calibrar pressostato de proteção.',
    urgency: 'critica',
    status: 'em_execucao',
    clientName: 'Mariana Duarte',
    clientPhone: '(11) 99345-1234',
    clientAddress: 'Av. Industrial, 4500 - Tamboré, Barueri/SP',
    equipmentName: 'Chiller Parafuso Carrier 30XA',
    equipmentSerial: 'CR-30XA-9921',
    assignedTechnicianId: 'usr-tecnico-1',
    assignedTechnicianName: 'Roberto Silveira (Téc. Senior)',
    checklist: [
      { id: 'chk-1', task: 'Verificação da tensão trifásica e balanceamento de carga', completed: true, completedAt: '2026-09-25 09:30' },
      { id: 'chk-2', task: 'Leitura de pressão de sucção e descarga do fluido R-134a', completed: true, completedAt: '2026-09-25 09:45' },
      { id: 'chk-3', task: 'Registro fotográfico das condições da serpentina (Antes)', completed: true, requiredPhoto: true, completedAt: '2026-09-25 09:50' },
      { id: 'chk-4', task: 'Limpeza química das serpentinas condensadoras com desengraxante biodegradável', completed: false, requiredPhoto: true },
      { id: 'chk-5', task: 'Substituição do sensor transdutor de pressão com defeito', completed: false },
      { id: 'chk-6', task: 'Teste de estanqueidade e medição do superaquecimento útil', completed: false },
      { id: 'chk-7', task: 'Registro fotográfico pós-serviço e coleta de assinatura digital', completed: false, requiredPhoto: true }
    ],
    timeEntries: [
      {
        id: 'time-1',
        startedAt: '2026-09-25 09:15:00',
        pausedAt: '2026-09-25 10:00:00',
        durationMinutes: 45,
        pauseReason: 'Aguardando liberação de acesso do SESMT da fábrica',
        technicianName: 'Roberto Silveira'
      },
      {
        id: 'time-2',
        startedAt: '2026-09-25 10:15:00',
        durationMinutes: 38,
        technicianName: 'Roberto Silveira'
      }
    ],
    totalWorkDurationMinutes: 83,
    isTimerActive: true,
    timerStartedAt: '2026-09-25 10:15:00',
    usedParts: [
      {
        inventoryItemId: 'inv-001',
        code: 'ELET-DISJ-32A',
        name: 'Disjuntor Bipolar Din 32A Curva C Schneider',
        quantity: 1,
        unitPrice: 68.00,
        totalPrice: 68.00
      }
    ],
    files: [
      {
        id: 'file-os-01',
        name: 'evidencia_antes_sujeira_serpentina.jpg',
        url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop&q=80',
        size: '2.4 MB',
        type: 'image',
        category: 'antes',
        uploadedAt: '2026-09-25 09:50',
        uploadedBy: 'Roberto Silveira',
        description: 'Condição inicial do trocador de calor com acúmulo de poeira e fuligem.',
        osId: 'os-001'
      }
    ],
    createdAt: '2026-09-25 08:35:00',
    scheduledDate: '2026-09-25',
    costTotal: 680.00,
    erpSyncStatus: 'sincronizado',
    erpWorkOrderId: 'ERP-WO-88741'
  },
  {
    id: 'os-002',
    osNumber: 'OS-2026-00410',
    title: 'Manutenção Preventiva Trimestral - Gerador de Emergência 450kVA',
    description: 'Troca de filtros de óleo diesel, verificação do banco de baterias de partida, reaperto de conexões do alternador e teste de transferência em carga.',
    urgency: 'media',
    status: 'aguardando_validacao_gestor',
    clientName: 'Construtora Metropolitana S.A.',
    clientPhone: '(11) 97788-9900',
    clientAddress: 'Rua Funchal, 200 - Vila Olímpia, São Paulo/SP',
    equipmentName: 'Grupo Gerador Stemac Cummins 450kVA',
    equipmentSerial: 'STM-CUM-450-77',
    assignedTechnicianId: 'usr-tecnico-1',
    assignedTechnicianName: 'Roberto Silveira (Téc. Senior)',
    checklist: [
      { id: 'chk-201', task: 'Inspeção visual e teste de densidade das baterias', completed: true, completedAt: '2026-09-24 14:00' },
      { id: 'chk-202', task: 'Drenagem do óleo do cárter e troca dos filtros separadores', completed: true, completedAt: '2026-09-24 15:10' },
      { id: 'chk-203', task: 'Teste de partida automática e chave de transferência QTA', completed: true, completedAt: '2026-09-24 16:20' }
    ],
    timeEntries: [
      {
        id: 'time-201',
        startedAt: '2026-09-24 13:30:00',
        pausedAt: '2026-09-24 17:00:00',
        durationMinutes: 210,
        technicianName: 'Roberto Silveira'
      }
    ],
    totalWorkDurationMinutes: 210,
    isTimerActive: false,
    usedParts: [
      {
        inventoryItemId: 'inv-003',
        code: 'LUB-IND-ISO68',
        name: 'Óleo Hidráulico e Lubrificante ISO VG 68 20L',
        quantity: 1,
        unitPrice: 410.00,
        totalPrice: 410.00
      }
    ],
    files: [
      {
        id: 'file-os-02',
        name: 'gerador_antes_servico.jpg',
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
        size: '1.9 MB',
        type: 'image',
        category: 'antes',
        uploadedAt: '2026-09-24 13:40',
        uploadedBy: 'Roberto Silveira',
        osId: 'os-002'
      },
      {
        id: 'file-os-03',
        name: 'gerador_finalizado_operando.jpg',
        url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
        size: '2.2 MB',
        type: 'image',
        category: 'depois',
        uploadedAt: '2026-09-24 16:50',
        uploadedBy: 'Roberto Silveira',
        osId: 'os-002'
      }
    ],
    digitalSignature: {
      technicianName: 'Roberto Silveira',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><path d="M20 50 Q 80 10, 140 60 T 260 40" stroke="%231e3a8a" stroke-width="3" fill="none"/></svg>',
      signedAt: '2026-09-24 17:05:00',
      clientRepresentativeName: 'Marcos Vinicius (Engenheiro Residente)',
      validationHash: 'CORP-SEC-SHA256-8A9F32BC719E40AA',
      deviceInfo: 'Samsung Galaxy Tab Active Pro (Corp-App v3.2 - Offline Sync Engine)'
    },
    createdAt: '2026-09-24 10:00:00',
    scheduledDate: '2026-09-24',
    costTotal: 1450.00,
    erpSyncStatus: 'sincronizado',
    erpWorkOrderId: 'ERP-WO-88712'
  }
];

export const INITIAL_PURCHASES: PurchaseRequest[] = [
  {
    id: 'pur-001',
    purchaseNumber: 'PED-COMP-2026-0089',
    ticketId: 'tkt-002',
    title: 'Aquisição de Mantas Filtrantes G4 e Contatores WEG 25A',
    justification: 'Atendimento ao ticket TCK-2026-0892 para parada programada de manutenção da Industrial Alfa S.A.',
    urgency: 'alta',
    status: 'cotacao_em_andamento',
    requestedBy: 'Juliana Fagundes (Comprador)',
    assignedBuyerId: 'usr-comprador-1',
    assignedBuyerName: 'Juliana Fagundes',
    items: [
      {
        id: 'pitem-1',
        name: 'Manta Filtrante Sintética G4 1m x 2m',
        code: 'CLIM-FILT-G4',
        quantity: 10,
        unit: 'ROLO',
        estimatedUnitPrice: 85.00,
        finalUnitPrice: 81.50,
        supplier: 'Filtros Industriais Brasil Ltda'
      },
      {
        id: 'pitem-2',
        name: 'Contator de Potência Tripolar 25A 220V WEG',
        code: 'CONT-ELET-25A',
        quantity: 6,
        unit: 'UN',
        estimatedUnitPrice: 145.00,
        finalUnitPrice: 138.00,
        supplier: 'WEG Eletrodistribuição'
      }
    ],
    totalEstimated: 1720.00,
    totalFinal: 1643.00,
    selectedSupplier: 'Filtros Industriais Brasil & WEG Eletro',
    supplierQuoteNotes: 'Negociado desconto de 5% à vista com faturamento para 28 dias após entrega.',
    createdAt: '2026-09-25 09:20:00',
    neededByDate: '2026-09-28',
    erpSyncStatus: 'pendente',
    files: []
  },
  {
    id: 'pur-002',
    purchaseNumber: 'PED-COMP-2026-0085',
    title: 'Reposição Emergencial: 20x Bombonas de Óleo Hidráulico ISO VG 68',
    justification: 'Alerta crítico de estoque gerado pelo Bot IA de Estoque da CorpServices.',
    urgency: 'critica',
    status: 'aprovado',
    requestedBy: 'Carlos Mendes (Gestor)',
    assignedBuyerId: 'usr-comprador-1',
    assignedBuyerName: 'Juliana Fagundes',
    items: [
      {
        id: 'pitem-3',
        name: 'Óleo Hidráulico e Lubrificante ISO VG 68 20L',
        code: 'LUB-IND-ISO68',
        quantity: 20,
        unit: 'BOMBONA',
        estimatedUnitPrice: 280.00,
        finalUnitPrice: 275.00,
        supplier: 'PetroLub Suprimentos Industriais'
      }
    ],
    totalEstimated: 5600.00,
    totalFinal: 5500.00,
    selectedSupplier: 'PetroLub Suprimentos Industriais',
    supplierQuoteNotes: 'Fornecedor confirmou frete CIF com entrega em 24 horas úteis no armazém central.',
    createdAt: '2026-09-24 16:00:00',
    neededByDate: '2026-09-26',
    approvedAt: '2026-09-24 17:30:00',
    managerApprovalNotes: 'Aprovado pelo gestor Carlos Mendes. Centro de Custo: Manutenção Industrial 2040.',
    erpPurchaseOrderId: 'ERP-OC-99321',
    erpSyncStatus: 'sincronizado',
    files: []
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-25 10:15:00',
    userName: 'Roberto Silveira',
    userRole: 'tecnico',
    action: 'TIMER_RETOMADO',
    entityType: 'OS',
    entityId: 'OS-2026-00412',
    details: 'Técnico retomou o cronômetro de execução após liberação de acesso pelo cliente.',
    ipAddress: '189.102.44.12'
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-25 09:50:00',
    userName: 'Roberto Silveira',
    userRole: 'tecnico',
    action: 'FOTO_ANEXADA',
    entityType: 'OS',
    entityId: 'OS-2026-00412',
    details: 'Anexo de registro fotográfico na categoria "Antes" via câmera móvel com carimbo de hora.',
    ipAddress: '189.102.44.12'
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-25 08:35:00',
    userName: 'Carlos Mendes',
    userRole: 'gestor',
    action: 'CONVERSAO_TICKET_EM_OS',
    entityType: 'TICKET',
    entityId: 'TCK-2026-0891',
    details: 'Ticket convertido em Ordem de Serviço #OS-2026-00412 e despachado para Roberto Silveira.',
    ipAddress: '177.18.230.88'
  },
  {
    id: 'aud-004',
    timestamp: '2026-09-25 08:15:00',
    userName: 'Bot IA CorpServices',
    userRole: 'cliente',
    action: 'TRIAGEM_IA_CONCLUIDA',
    entityType: 'TICKET',
    entityId: 'TCK-2026-0891',
    details: 'Cliente Mariana Duarte finalizou triagem via Bot IA. Classificado como SERVIÇO Crítico.',
    ipAddress: '201.83.19.104'
  },
  {
    id: 'aud-005',
    timestamp: '2026-09-24 17:30:00',
    userName: 'Carlos Mendes',
    userRole: 'gestor',
    action: 'APROVACAO_PEDIDO_COMPRA',
    entityType: 'COMPRA',
    entityId: 'PED-COMP-2026-0085',
    details: 'Gestor aprovou compra de R$ 5.500,00 de óleo lubrificante para reposição de estoque.',
    ipAddress: '177.18.230.88'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '🚨 Chamado Crítico em Atendimento',
    message: 'Técnico Roberto Silveira está executando a OS #OS-2026-00412 no Chiller da Industrial Alfa.',
    type: 'urgente',
    targetRole: 'gestor',
    relatedEntityId: 'os-001',
    relatedEntityType: 'os',
    createdAt: '2026-09-25 10:15',
    read: false
  },
  {
    id: 'notif-2',
    title: '⚠️ Alerta de Estoque Crítico',
    message: 'Disjuntor Bipolar Din 32A com apenas 4 unidades disponíveis (mínimo: 10).',
    type: 'alerta',
    targetRole: 'comprador',
    relatedEntityId: 'inv-001',
    relatedEntityType: 'estoque',
    createdAt: '2026-09-25 09:30',
    read: false
  },
  {
    id: 'notif-3',
    title: '✅ Validação de OS Pendente',
    message: 'OS #OS-2026-00410 no Gerador 450kVA concluída com assinatura digital aguardando sua validação.',
    type: 'info',
    targetRole: 'gestor',
    relatedEntityId: 'os-002',
    relatedEntityType: 'os',
    createdAt: '2026-09-24 17:05',
    read: true
  }
];

export const INITIAL_ERP_CONFIG: ERPConfig = {
  systemName: 'TOTVS Protheus',
  isConnected: true,
  endpointUrl: 'https://api-erp.corpservices.com.br/v2/integration',
  lastSyncTimestamp: '2026-09-25 10:00:15',
  autoSyncOrders: true,
  autoSyncPurchases: true,
  autoSyncStock: true,
  costCenterDefault: 'CC-2040-MANUT-OPERACIONAL',
  fiscalCompanyId: '14.882.109/0001-44'
};

export const INITIAL_OPERATIONAL_GOALS: OperationalGoals = {
  targetSlaPercentage: 96,
  currentSlaPercentage: 98.2,
  targetMttrHours: 4.0,
  currentMttrHours: 2.8,
  targetPhotoCompliancePercentage: 100,
  currentPhotoCompliancePercentage: 96.5,
  targetCompletedOsCount: 120,
  currentCompletedOsCount: 94,
  targetInventoryStockoutCount: 0,
  currentInventoryStockoutCount: 2
};
