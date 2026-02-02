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
  caseId?: string;
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
  accountingFilings?: any[]; // For Accounting
  auditFilings?: any[]; // For Audit
  taxFilings?: any[]; // For Tax
  incorporationFilings?: any[]; // For Incorporation
  businessPlansFilings?: any[]; // For Business Plans
  liquidationFilings?: any[]; // For Liquidation
  bankAccounts?: any[]; // For Banking & Payments
  payments?: any[]; // For Banking & Payments
  bankingPaymentsFilings?: any[]; // For Banking & Payments
  regulatedLicensesFilings?: {
    id: string;
    title: string;
    type: string;
    regulator: string;
    submissionDate: string;
    status: string;
    documents: string[];
    queryRounds?: number;
  }[];
  licenseCases?: {
    id: string;
    licenseType: string;
    regulator: string;
    caseType: string;
    status: string;
    targetDate: string;
  }[];
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
  corporateServicesStatus?: { 
    type: string; 
    holder: string; 
    status: string; 
    startDate?: string | null;
    expiry: string | null;
    service_status?: string;
    documents?: string[];
    open?: boolean;
  }[];
  payrollOverview?: { 
    totalEmployees: number;
    activeThisPeriod: number;
    pendingChanges: number;
    recentEmployees: { name: string; role: string; status: string }[];
  };
  cfoEngagementsList?: { name: string; start: string; status: string; end: string }[];
  cfoFilings?: {
    service: string;
    frequency: string;
    currentPeriod: string;
    status: string;
    nextDeliverable: string;
    service_status: string;
    documents: string[];
    open: boolean;
  }[];
  libraryItems?: any[]; // For service-specific library
  currentPeriod?: string;
  lastUpdate?: string;
  nextStep?: string;
  actionNeeded?: {
    type: 'payment_approval' | 'document_request' | 'signature_request' | string;
    title: string;
    description: string;
    ctaLabel: string;
    count?: number;
  };
}

import { accountingBookingMock } from './accountingBookingMock';
import { auditMock } from './auditMock';
import { bankingPaymentsMock } from './bankingPaymentsMock';
import { businessPlansMock } from './businessPlansMock';
import { cfoMock } from './cfoMock';
import { corporateMock } from './corporateMock';
import { incorporationMock } from './incorporationMock';
import { liquidationMock } from './liquidationMock';
import { mbrMock } from './mbrMock';
import { payrollMock } from './payrollMock';
import { regulatedLicensesMock } from './regulatedLicensesMock';
import { taxMock } from './taxMock';
import { vatMock } from './vatMock';

export const ALL_SERVICE_MOCKS: Record<string, ServiceMockData> = {
  bookkeeping: accountingBookingMock,
  'banking-payments': bankingPaymentsMock,
  audit: auditMock,
  'business-plans': businessPlansMock,
  cfo: cfoMock,
  'csp-mbr': corporateMock,
  incorporation: incorporationMock,
  liquidation: liquidationMock,
  'mbr-filing': mbrMock,
  payroll: payrollMock,
  'regulated-licenses': regulatedLicensesMock,
  tax: taxMock,
  vat: vatMock,
};
