import { Activity, ActivityStatus, ActivityType, Customer, CustomerStatus, Deal, DealStage, Supplier, SupplierStatus, Campaign, CampaignStatus, Product, ProductCategory, User, UserRole } from './types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Acme Corp',
    email: 'contact@acmecorp.com',
    phone: '555-1001',
    company: 'Acme Corp',
    status: CustomerStatus.Active,
    notes: 'Long-standing client, always pays on time. Interested in new product line.',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'cust-2',
    name: 'Globex Inc.',
    email: 'info@globex.com',
    phone: '555-2002',
    company: 'Globex Inc.',
    status: CustomerStatus.Lead,
    notes: 'New lead from recent conference. Needs follow-up call next week.',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
  {
    id: 'cust-3',
    name: 'Cyberdyne Systems',
    email: 'sales@cyberdyne.net',
    phone: '555-3003',
    company: 'Cyberdyne Systems',
    status: CustomerStatus.Active,
    notes: 'Valuable partner, exploring expansion opportunities.',
    ownerId: 'user-sales2', // Owned by Sales User 2
  },
  {
    id: 'cust-4',
    name: 'Initech Solutions',
    email: 'support@initech.com',
    phone: '555-4004',
    company: 'Initech Solutions',
    status: CustomerStatus.Prospect,
    notes: 'Potential client, needs a demo. Budget seems tight.',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
  {
    id: 'cust-5',
    name: 'Umbrella Corp',
    email: 'contact@umbrellacorp.com',
    phone: '555-5005',
    company: 'Umbrella Corp',
    status: CustomerStatus.Inactive,
    notes: 'Old client, no recent activity.',
    ownerId: 'user-admin', // Owned by Admin
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Tech Parts Ltd.',
    contactPerson: 'Alice Smith',
    email: 'alice@techparts.com',
    phone: '555-6001',
    company: 'Tech Parts Ltd.',
    status: SupplierStatus.Preferred,
    notes: 'Primary supplier for electronic components. Reliable and cost-effective.',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'sup-2',
    name: 'Office Supplies Co.',
    contactPerson: 'Bob Johnson',
    email: 'bob@officesupplies.net',
    phone: '555-6002',
    company: 'Office Supplies Co.',
    status: SupplierStatus.Active,
    notes: 'Regular supplier for office consumables. Good prices.',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal-1',
    name: 'Acme Corp - Software License',
    customerId: 'cust-1',
    value: 15000,
    stage: DealStage.Proposal,
    closeDate: '2024-07-31',
    notes: 'Sent initial proposal, waiting for feedback. Follow-up expected next week.',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'deal-2',
    name: 'Globex Inc. - Cloud Migration',
    customerId: 'cust-2',
    value: 50000,
    stage: DealStage.Qualification,
    closeDate: '2024-08-15',
    notes: 'Initial discussion positive. Need to schedule a deep-dive meeting.',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
  {
    id: 'deal-3',
    name: 'Cyberdyne Systems - Hardware Upgrade',
    customerId: 'cust-3',
    value: 25000,
    stage: DealStage.Negotiation,
    closeDate: '2024-07-20',
    notes: 'Client requested a discount. Reviewing options with management.',
    ownerId: 'user-sales2', // Owned by Sales User 2
  },
  {
    id: 'deal-4',
    name: 'Acme Corp - New Product Rollout',
    customerId: 'cust-1',
    value: 30000,
    stage: DealStage.Won,
    closeDate: '2024-06-25',
    notes: 'Deal won last month. Client very happy with the service.',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'deal-5',
    name: 'Initech Solutions - Support Contract',
    customerId: 'cust-4',
    value: 10000,
    stage: DealStage.Proposal,
    closeDate: '2024-09-01',
    notes: 'Drafted support contract.',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Call with Acme Corp',
    type: ActivityType.Call,
    status: ActivityStatus.Pending,
    dueDate: '2024-07-15',
    notes: 'Discuss proposal details for software license.',
    customerId: 'cust-1',
    dealId: 'deal-1',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'act-2',
    title: 'Meeting with Globex Inc.',
    type: ActivityType.Meeting,
    status: ActivityStatus.Pending,
    dueDate: '2024-07-18',
    notes: 'Deep-dive into cloud migration requirements.',
    customerId: 'cust-2',
    dealId: 'deal-2',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
  {
    id: 'act-3',
    title: 'Send follow-up email to Cyberdyne Systems',
    type: ActivityType.Email,
    status: ActivityStatus.Completed,
    dueDate: '2024-07-08',
    notes: 'Sent updated pricing information.',
    customerId: 'cust-3',
    dealId: 'deal-3',
    ownerId: 'user-sales2', // Owned by Sales User 2
  },
  {
    id: 'act-4',
    title: 'Prepare demo for Initech Solutions',
    type: ActivityType.Task,
    status: ActivityStatus.Pending,
    dueDate: '2024-07-16',
    notes: 'Focus on integration features.',
    customerId: 'cust-4',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
  {
    id: 'act-5',
    title: 'Order components from Tech Parts Ltd.',
    type: ActivityType.Task,
    status: ActivityStatus.Completed,
    dueDate: '2024-07-01',
    notes: 'Placed order for new batch of chips.',
    supplierId: 'sup-1',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'act-6',
    title: 'Review Q3 strategy with Jane',
    type: ActivityType.Meeting,
    status: ActivityStatus.Pending,
    dueDate: '2024-07-22',
    notes: 'Discuss sales goals for the next quarter.',
    ownerId: 'user-admin', // Owned by Admin
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Summer Product Launch',
    description: 'Campaign to promote the new summer product line to existing active customers.',
    status: CampaignStatus.Active,
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    linkedCustomerIds: ['cust-1', 'cust-3'],
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'camp-2',
    name: 'Lead Nurturing Q3',
    description: 'Automated email sequence for new leads generated in Q3.',
    status: CampaignStatus.Planning,
    startDate: '2024-07-15',
    endDate: '2024-09-30',
    linkedCustomerIds: ['cust-2', 'cust-4'],
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'CRM Pro License',
    description: 'Annual license for CRM Pro software with advanced features.',
    price: 1200,
    category: ProductCategory.Software,
    sku: 'SW-CRM-PRO-2024',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'prod-2',
    name: 'Cloud Migration Service',
    description: 'Full service for migrating on-premise infrastructure to cloud platforms.',
    price: 15000,
    category: ProductCategory.Service,
    sku: 'SVC-CLOUD-MIG',
    ownerId: 'user-sales1', // Owned by Sales User 1
  },
  {
    id: 'prod-3',
    name: 'Enterprise Hardware Pack',
    description: 'Bundle of servers and network equipment for large organizations.',
    price: 25000,
    category: ProductCategory.Hardware,
    sku: 'HW-ENT-BUNDLE',
    ownerId: 'user-admin', // Owned by Admin
  },
  {
    id: 'prod-4',
    name: 'Strategic Consulting Hour',
    description: 'One hour of expert strategic consulting on business growth.',
    price: 300,
    category: ProductCategory.Consulting,
    sku: 'SVC-CONSULT-HR',
    ownerId: 'user-sales2', // Owned by Sales User 2
  },
];

export const INITIAL_USERS: User[] = [
  { id: 'user-admin', username: 'Admin User', email: 'admin@example.com', password: 'password', role: UserRole.Admin },
  { id: 'user-sales1', username: 'Sales Rep One', email: 'sales1@example.com', password: 'password', role: UserRole.Sales },
  { id: 'user-sales2', username: 'Sales Rep Two', email: 'sales2@example.com', password: 'password', role: UserRole.Sales },
  { id: 'user-viewer', username: 'Viewer Only', email: 'viewer@example.com', password: 'password', role: UserRole.Viewer },
];

// Gemini AI model name
export const GEMINI_MODEL = 'gemini-2.5-flash';
export const DEFAULT_COMMISSION_RATE = 0.10; // 10%

export const DEAL_STAGE_PROBABILITIES: { [key in DealStage]: number } = {
  [DealStage.Prospecting]: 0.10,
  [DealStage.Qualification]: 0.30,
  [DealStage.Proposal]: 0.50,
  [DealStage.Negotiation]: 0.75,
  [DealStage.Won]: 1.00,
  [DealStage.Lost]: 0.00,
};