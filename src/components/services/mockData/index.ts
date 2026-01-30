export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface DocumentRequest {
  _id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  documents: { name: string; url?: string }[];
  multipleDocuments: any[];
}

export interface ComplianceItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: 'filed' | 'upcoming' | 'due_today' | 'overdue' | 'pending';
  authority: string;
  description: string;
}

export interface ServiceMockData {
  serviceSlug: string;
  serviceName: string;
  description: string;
  milestones: Milestone[];
  documentRequests: DocumentRequest[];
  complianceItems: ComplianceItem[];
  messages: any[];
  // Additional fields for specific services
  filings?: any[]; // For MBR
  periods?: any[]; // For VAT
  team?: any[];    // For Team tab
  etb?: any;
  adjustments?: any[];
  reclassifications?: any[];
  financialStatements?: any;
  leadSheets?: any[];
  summaryData?: any; // For custom dashboard summaries
  
  // Dashboard / Overview specific data
  dashboardStats?: any[];
  recentActivity?: { action: string; date: string }[];
  quickAccessDocs?: { name: string; date?: string; url?: string; createdAt?: string; title?: string }[];
  
  // Service-specific Overview sections
  incorporationProgress?: { step: string; status: 'completed' | 'in_progress' | 'pending' }[];
  auditProgress?: { step: string; status: 'completed' | 'in_progress' | 'pending' }[];
  liquidationProcess?: { step: string; status: 'completed' | 'in_progress' | 'pending' | string }[];
  businessPlanMilestones?: { label: string; status: string }[];
  corporateServicesStatus?: { type: string; holder: string; status: string; expiry: string }[];
  payrollOverview?: { 
    totalEmployees: number;
    activeThisPeriod: number;
    pendingChanges: number;
    recentEmployees: { name: string; role: string; status: string }[];
  };
  cfoEngagementsList?: { name: string; start: string; status: string; end: string }[];
  libraryItems?: any[]; // For service-specific library
}

import { accountingBookingMock } from './accountingBookingMock';
import { auditMock } from './auditMock';
import { businessPlansMock } from './businessPlansMock';
import { cfoMock } from './cfoMock';
import { corporateMock } from './corporateMock';
import { incorporationMock } from './incorporationMock';
import { liquidationMock } from './liquidationMock';
import { mbrMock } from './mbrMock';
import { payrollMock } from './payrollMock';
import { taxMock } from './taxMock';
import { vatMock } from './vatMock';

export const ALL_SERVICE_MOCKS: Record<string, ServiceMockData> = {
  bookkeeping: accountingBookingMock,
  audit: auditMock,
  'business-plans': businessPlansMock,
  cfo: cfoMock,
  'csp-mbr': corporateMock,
  incorporation: incorporationMock,
  liquidation: liquidationMock,
  'mbr-filing': mbrMock,
  payroll: payrollMock,
  tax: taxMock,
  vat: vatMock,
};
