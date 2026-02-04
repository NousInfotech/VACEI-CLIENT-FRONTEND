export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "completed" | "in_progress" | "pending";
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
  status: "filed" | "upcoming" | "due_today" | "overdue" | "pending";
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

  // Filings / Periods
  filings?: any[];
  periods?: any[];
  accountingFilings?: any[];
  auditFilings?: any[];
  taxFilings?: any[];
  incorporationFilings?: any[];
  businessPlansFilings?: any[];
  liquidationFilings?: any[];
  bankingPaymentsFilings?: any[];

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

  team?: any[];

  // Accounting / Finance
  etb?: any;
  adjustments?: any[];
  reclassifications?: any[];
  financialStatements?: any;
  leadSheets?: any[];

  summaryData?: any;

  // Dashboard Data
  dashboardStats?: any[];
  recentActivity?: { action: string; date: string }[];
  quickAccessDocs?: {
    name: string;
    date?: string;
    url?: string;
    createdAt?: string;
    title?: string;
  }[];

  // Service Overview Sections
  incorporationProgress?: {
    step: string;
    status: "completed" | "in_progress" | "pending";
  }[];

  auditProgress?: {
    step: string;
    status: "completed" | "in_progress" | "pending";
  }[];

  liquidationProcess?: {
    step: string;
    status: "completed" | "in_progress" | "pending" | string;
  }[];

  businessPlanMilestones?: {
    label: string;
    status: string;
  }[];

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

  cfoEngagementsList?: {
    name: string;
    start: string;
    status: string;
    end: string;
  }[];

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

  libraryItems?: any[];

  currentPeriod?: string;
  lastUpdate?: string;
  nextStep?: string;

  actionNeeded?: {
    type:
      | "payment_approval"
      | "document_request"
      | "signature_request"
      | string;
    title: string;
    description: string;
    ctaLabel: string;
    count?: number;
  };
}

// ===============================
// Imports
// ===============================

import { accountingBookingMock } from "./accountingBookingMock";
import { auditMock } from "./auditMock";
import { bankingPaymentsMock } from "./bankingPaymentsMock";
import { businessPlansMock } from "./businessPlansMock";
import { cfoMock } from "./cfoMock";
import { corporateMock } from "./corporateMock";
import { incorporationMock } from "./incorporationMock";
import { liquidationMock } from "./liquidationMock";
import { mbrMock } from "./mbrMock";
import { payrollMock } from "./payrollMock";
import { regulatedLicensesMock } from "./regulatedLicensesMock";
import { taxMock } from "./taxMock";
import { vatMock } from "./vatMock";

import { internationalStructuringMock } from "./internationalStructuringMock";
import { cryptoDigitalAssetsMock } from "./cryptoDigitalAssetsMock";

// ===============================
// Service Registry
// ===============================

export const ALL_SERVICE_MOCKS: Record<string, ServiceMockData> = {
  // Core Services
  bookkeeping: accountingBookingMock,
  "banking-payments": bankingPaymentsMock,
  audit: auditMock,
  "business-plans": businessPlansMock,
  cfo: cfoMock,
  "csp-mbr": corporateMock,
  incorporation: incorporationMock,
  liquidation: liquidationMock,
  "mbr-filing": mbrMock,
  payroll: payrollMock,
  "regulated-licenses": regulatedLicensesMock,
  tax: taxMock,
  vat: vatMock,

  "international-structuring": internationalStructuringMock,
  "crypto-digital-assets": cryptoDigitalAssetsMock,
};
