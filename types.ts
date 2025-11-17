export enum CustomerStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Lead = 'Lead',
  Prospect = 'Prospect',
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  notes?: string;
  ownerId?: string; // Added for multi-user support
}

export enum SupplierStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Preferred = 'Preferred',
  Blacklisted = 'Blacklisted',
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  company: string;
  status: SupplierStatus;
  notes?: string;
  ownerId?: string; // Added for multi-user support
}

export enum DealStage {
  Prospecting = 'Prospecting',
  Qualification = 'Qualification',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  Won = 'Won',
  Lost = 'Lost',
}

export interface Deal {
  id: string;
  name: string;
  customerId: string; // Link to customer
  value: number;
  stage: DealStage;
  closeDate: string; // YYYY-MM-DD
  notes?: string;
  ownerId?: string; // Added for multi-user support
}

export enum ActivityType {
  Call = 'Call',
  Meeting = 'Meeting',
  Email = 'Email',
  Task = 'Task',
}

export enum ActivityStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  customerId?: string; // Optional link to customer
  dealId?: string; // Optional link to deal
  supplierId?: string; // Optional link to supplier
  ownerId?: string; // Added for multi-user support
}

export enum CampaignStatus {
  Planning = 'Planning',
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  linkedCustomerIds: string[]; // Link to multiple customers
  ownerId?: string; // Added for multi-user support
}

export enum ProductCategory {
  Software = 'Software',
  Hardware = 'Hardware',
  Service = 'Service',
  Consulting = 'Consulting',
  Other = 'Other',
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  sku: string; // Stock Keeping Unit
  ownerId?: string; // Added for multi-user support
}

export enum UserRole {
  Admin = 'Admin',
  Sales = 'Sales',
  Viewer = 'Viewer',
}

export interface User {
  id: string;
  username: string;
  email: string; // Using email as the login identifier
  password: string; // In a real app, this would be hashed
  role: UserRole;
}

export type View = 'dashboard' | 'customers' | 'deals' | 'activities' | 'suppliers' | 'commissions' | 'campaigns' | 'products' | 'register' | 'settings';

export interface SortConfig<T> {
  key: keyof T;
  direction: 'ascending' | 'descending';
}

export type CustomLabels = Record<string, string>; // New type for custom labels

export interface AppContextType {
  customers: Customer[];
  deals: Deal[];
  activities: Activity[];
  suppliers: Supplier[]; // New
  campaigns: Campaign[]; // New
  products: Product[]; // New
  users: User[]; // New: For multi-user
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (deal: Deal) => void;
  deleteDeal: (id: string) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
  addSupplier: (supplier: Supplier) => void; // New
  updateSupplier: (supplier: Supplier) => void; // New
  deleteSupplier: (id: string) => void; // New
  addCampaign: (campaign: Campaign) => void; // New
  updateCampaign: (campaign: Campaign) => void; // New
  deleteCampaign: (id: string) => void; // New
  addProduct: (product: Product) => void; // New
  updateProduct: (product: Product) => void; // New
  deleteProduct: (id: string) => void; // New
  addUser: (user: User) => void; // New: For multi-user
  setView: (view: View) => void;
  loggedInUser: User | null; // Changed to User object
  loggedInUserRole: UserRole | null; // New: User role
  onLogout: () => void; // New
  isSidebarOpen: boolean; // New
  toggleSidebar: () => void; // New
}