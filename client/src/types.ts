// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'manager' | 'technician' | 'user';
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Equipment related types
export type EquipmentStatus = 'active' | 'maintenance' | 'decommissioning' | 'decommissioned';

export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  assetTag?: string;
  model: string;
  manufacturer: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  location?: string;
  department?: string;
  status: EquipmentStatus;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// Workflow related types
export type WorkflowStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: StepStatus;
  assignedTo?: User;
  completedBy?: User;
  completedAt?: string;
  notes?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  equipment: Equipment;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Report related types
export type ReportFormat = 'pdf' | 'csv' | 'excel';
export type ReportType = 'equipment-inventory' | 'decommission-summary' | 'audit-trail' | 'custom';
export type ReportStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';

export interface ReportSchedule {
  frequency: ReportFrequency;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  time?: string; // HH:MM format
  recipients: string[]; // Email addresses
  nextRun?: string;
  lastRun?: string;
}

export interface ReportParameters {
  dateRange?: {
    start: string;
    end: string;
  };
  equipmentStatus?: EquipmentStatus[];
  departments?: string[];
  locations?: string[];
  [key: string]: any;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  description?: string;
  format: ReportFormat;
  parameters: ReportParameters;
  status: ReportStatus;
  fileUrl?: string;
  schedule?: ReportSchedule;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and search types
export interface FilterOption {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: string | number | boolean | Date;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortOption;
  filters?: FilterOption[];
  search?: string;
} 