import {
  DashboardSquare02Icon,
  FileSyncIcon,
  TaskDaily01Icon,
  Book02Icon,
  ArrowRightDoubleIcon,
  Wallet01Icon,
  CashbackPoundIcon,
  TransactionIcon,
  TaxesIcon,
  GitPullRequestIcon,
  DocumentValidationIcon,
  ProfileIcon,
  InstallingUpdates02Icon,
  NotificationIcon,
  InvoiceIcon,
  Message01Icon,
  Building01Icon,
  CreditCardIcon,
  UserCheck01Icon,
  GiftIcon,
  Unlink03Icon,
} from "@hugeicons/core-free-icons";

import { accountingBookingMock } from "../components/services/mockData/accountingBookingMock";
import { auditMock } from "../components/services/mockData/auditMock";
import { vatMock } from "../components/services/mockData/vatMock";
import { taxMock } from "../components/services/mockData/taxMock";
import { corporateMock } from "../components/services/mockData/corporateMock";
import { payrollMock } from "../components/services/mockData/payrollMock";
import { cfoMock } from "../components/services/mockData/cfoMock";
import { mbrMock } from "../components/services/mockData/mbrMock";
import { incorporationMock } from "../components/services/mockData/incorporationMock";
import { businessPlansMock } from "../components/services/mockData/businessPlansMock";
import { liquidationMock } from "../components/services/mockData/liquidationMock";
import { regulatedLicensesMock } from "../components/services/mockData/regulatedLicensesMock";
import { bankingPaymentsMock } from "../components/services/mockData/bankingPaymentsMock";

import { internationalStructuringMock } from "../components/services/mockData/internationalStructuringMock";
import { cryptoDigitalAssetsMock } from "../components/services/mockData/cryptoDigitalAssetsMock";

export type MenuSection = "primary" | "workspaces" | "operations" | "settings";

export interface MenuItem {
  slug: string;
  icon: any;
  label: string;
  href: string;
  children?: MenuItem[];
  section?: MenuSection;
  description?: string;
  isActive?: boolean;
  disabled?: boolean;
  count?: number;
  totalCount?: number;
}

export const menuData: MenuItem[] = [
  {
    slug: "dashboard",
    icon: DashboardSquare02Icon,
    label: "Dashboard",
    href: "/dashboard",
    children: [],
    section: "primary",
    description: "Company overview & status",
  },
  {
    slug: "company",
    icon: Building01Icon,
    label: "Company",
    href: "/dashboard/company",
    children: [],
    section: "primary",
    description: "Company overview & status",
  },
  {
    slug: "company-library",
    icon: Book02Icon,
    label: "Library",
    href: "/dashboard/library",
    children: [],
    section: "operations",
    description: "Documents for your companies",
  },
  // {
  //     slug: "global-library",
  //     icon: Book02Icon,
  //     label: "Global Library",
  //     href: "/dashboard/global-library",
  //     children: [],
  //     section: "primary",
  //     description: "Centralized document vault",
  // },
  // {
  //     slug: "documents",
  //     icon: DocumentValidationIcon,
  //     label: "Documents",
  //     href: "/dashboard/documents",
  //     children: [],
  //     section: "primary",
  //     description: "Store and access documents",
  // },

  {
    slug: "services-root",
    icon: GitPullRequestIcon,
    label: "Services",
    href: "/dashboard/services",
    section: "primary",
    description: "Accounting, audit & corporate services",
    children: [
      {
        slug: "accounting-bookkeeping",
        icon: Book02Icon,
        label: "Accounting & Bookkeeping",
        href: "/dashboard/services/bookkeeping",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "ab-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/bookkeeping?tab=document_requests",
          //   count: accountingBookingMock.documentRequests?.length || 0,
          //   totalCount: accountingBookingMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "ab-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/bookkeeping?tab=milestones",
          // },
          // {
          //   slug: "ab-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/bookkeeping?tab=library",
          // },
          // {
          //   slug: "ab-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/bookkeeping?tab=compliance_calendar",
          // },
          // {
          //   slug: "ab-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/bookkeeping?tab=messages",
          //   count: accountingBookingMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: accountingBookingMock.messages?.length || 0,
          // },
          {
            slug: "ab-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/bookkeeping?tab=accounting_filings",
          },
          {
            slug: "invoices",
            icon: InvoiceIcon,
            label: "Invoices",
            href: "/dashboard/invoices",
            isActive: true,
          },
          {
            slug: "bank-transactions",
            icon: TransactionIcon,
            label: "Bank Transactions",
            href: "/dashboard/bank-transactions",
            isActive: true,
          },
          {
            slug: "cash",
            icon: Wallet01Icon,
            label: "Cash",
            href: "/dashboard/cash",
            isActive: true,
          },
          {
            slug: "change-in-bank",
            icon: TransactionIcon,
            label: "Change in Bank Balances",
            href: "/dashboard/change-in-bank-balances",
            isActive: true,
          },
          {
            slug: "general-ledger",
            icon: Book02Icon,
            label: "General Ledger",
            href: "/dashboard/general-ledger",
            isActive: true,
          },
          {
            slug: "ap-ar-aging",
            icon: TransactionIcon,
            label: "AP/AR Aging",
            href: "#",
            isActive: true,
            children: [
              {
                slug: "ap-aging",
                label: "Accounts Payable",
                href: "/dashboard/ap-ar-aging/account-payble-aging",
                icon: TransactionIcon,
              },
              {
                slug: "ar-aging",
                label: "Accounts Receivable",
                href: "/dashboard/ap-ar-aging/account-receivable-aging",
                icon: TransactionIcon,
              },
            ],
          },
          {
            slug: "financial-statements",
            icon: DocumentValidationIcon,
            label: "Financial Statements",
            href: "#",
            isActive: true,
            children: [
              {
                slug: "balance-sheet",
                label: "Balance Sheet",
                href: "/dashboard/financial-statements/balance-sheet",
                icon: DocumentValidationIcon,
              },
              {
                slug: "profit-loss",
                label: "Profit & Loss",
                href: "/dashboard/financial-statements/profit-loss",
                icon: DocumentValidationIcon,
              },
              {
                slug: "cash-flow",
                label: "Cash Flow",
                href: "/dashboard/financial-statements/cash-flow-statement",
                icon: DocumentValidationIcon,
              },
            ],
          },
          {
            slug: "insights",
            icon: DashboardSquare02Icon,
            label: "Insights",
            href: "/dashboard/insights",
            isActive: true,
          },
        ], */
      },
      {
        slug: "audit",
        icon: DocumentValidationIcon,
        label: "Audit",
        href: "/dashboard/services/audit",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "audit-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/audit?tab=document_requests",
          //   count: auditMock.documentRequests?.length || 0,
          //   totalCount: auditMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "audit-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/audit?tab=milestones",
          // },
          // {
          //   slug: "audit-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/audit?tab=library",
          // },
          // {
          //   slug: "audit-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/audit?tab=compliance_calendar",
          // },
          {
            slug: "audit-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/audit?tab=audit_filings",
          },
          // {
          //   slug: "audit-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/audit?tab=messages",
          //   count: auditMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: auditMock.messages?.length || 0,
          // },
          {
            slug: "engagements",
            icon: CashbackPoundIcon,
            label: "Engagements",
            href: "/dashboard/engagements",
            isActive: true,
          },
        ], */
      },
      {
        slug: "vat",
        icon: TaxesIcon,
        label: "VAT",
        href: "/dashboard/services/vat",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "vat-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/vat?tab=document_requests",
          //   count: vatMock.documentRequests?.length || 0,
          //   totalCount: vatMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "vat-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/vat?tab=milestones",
          // },
          // {
          //   slug: "vat-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/vat?tab=library",
          // },
          // {
          //   slug: "vat-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/vat?tab=compliance_calendar",
          // },
          // {
          //   slug: "vat-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/vat?tab=messages",
          //   count: vatMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: vatMock.messages?.length || 0,
          // },
          {
            slug: "vat-periods",
            icon: TaxesIcon,
            label: "Filings",
            href: "/dashboard/services/vat?tab=vat_periods",
          },
          {
            slug: "vat-malta",
            icon: TaxesIcon,
            label: "VAT — Malta",
            href: "/dashboard/services/vat/malta",
            isActive: true,
          },
        ], */
      },
      {
        slug: "tax",
        icon: TaxesIcon,
        label: "Tax",
        href: "/dashboard/services/tax",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "tax-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/tax?tab=document_requests",
          //   count: taxMock.documentRequests?.length || 0,
          //   totalCount: taxMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "tax-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/tax?tab=milestones",
          // },
          // {
          //   slug: "tax-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/tax?tab=library",
          // },
          // {
          //   slug: "tax-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/tax?tab=compliance_calendar",
          // },
          {
            slug: "tax-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/tax?tab=tax_filings",
          },
          // {
          //   slug: "tax-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/tax?tab=messages",
          //   count: taxMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: taxMock.messages?.length || 0,
          // },
        ], */
      },
      {
        slug: "csp",
        icon: Building01Icon,
        label: "CSP",
        href: "/dashboard/services/csp-mbr",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "csp-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/csp-mbr?tab=document_requests",
          //   count: corporateMock.documentRequests?.length || 0,
          //   totalCount: corporateMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "csp-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/csp-mbr?tab=milestones",
          // },
          // {
          //   slug: "csp-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/csp-mbr?tab=library",
          // },
          // {
          //   slug: "csp-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/csp-mbr?tab=compliance_calendar",
          // },
          // {
          //   slug: "csp-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/csp-mbr?tab=messages",
          //   count: corporateMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: corporateMock.messages?.length || 0,
          // },
          {
            slug: "csp-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/csp-mbr?tab=corporate_filings",
          },
        ], */
      },
      {
        slug: "payroll",
        icon: CashbackPoundIcon,
        label: "Payroll",
        href: "/dashboard/services/payroll",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "payroll-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/payroll?tab=document_requests",
          //   count: payrollMock.documentRequests?.length || 0,
          //   totalCount: payrollMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "payroll-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/payroll?tab=milestones",
          // },
          // {
          //   slug: "payroll-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/payroll?tab=library",
          // },
          // {
          //   slug: "payroll-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/payroll?tab=compliance_calendar",
          // },

          // {
          //   slug: "payroll-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/payroll?tab=messages",
          //   count: payrollMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: payrollMock.messages?.length || 0,
          // },
          {
            slug: "payroll-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/payroll?tab=payroll_filings",
          },
          {
            slug: "payroll(malta)",
            icon: CashbackPoundIcon,
            label: "Payroll (Malta)",
            href: "/dashboard/services/payroll/malta",
            isActive: true,
          },
        ], */
      },

      {
        slug: "cfo",
        icon: Wallet01Icon,
        label: "CFO",
        href: "/dashboard/services/cfo",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "cfo-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/cfo?tab=document_requests",
          //   count: cfoMock.documentRequests?.length || 0,
          //   totalCount: cfoMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "cfo-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/cfo?tab=milestones",
          // },
          // {
          //   slug: "cfo-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/cfo?tab=library",
          // },
          // {
          //   slug: "cfo-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/cfo?tab=compliance_calendar",
          // },
          // {
          //   slug: "cfo-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/cfo?tab=messages",
          //   count: cfoMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: cfoMock.messages?.length || 0,
          // },
          {
            slug: "cfo-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/cfo?tab=cfo_filings",
          },
        ], */
      },
      {
        slug: "mbr-filing",
        icon: DocumentValidationIcon,
        label: "MBR Filings",
        href: "/dashboard/services/mbr-filing",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "mbr-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/mbr-filing?tab=document_requests",
          //   count: mbrMock.documentRequests?.length || 0,
          //   totalCount: mbrMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "mbr-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/mbr-filing?tab=milestones",
          // },
          // {
          //   slug: "mbr-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/mbr-filing?tab=library",
          // },
          // {
          //   slug: "mbr-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/mbr-filing?tab=compliance_calendar",
          // },
          // {
          //   slug: "mbr-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/mbr-filing?tab=messages",
          //   count: mbrMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: mbrMock.messages?.length || 0,
          // },
          {
            slug: "mbr-filing-list",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/mbr-filing?tab=filings",
          },
        ], */
      },
      {
        slug: "incorporation",
        icon: GitPullRequestIcon,
        label: "Incorporation",
        href: "/dashboard/services/incorporation",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "inc-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/incorporation?tab=document_requests",
          //   count: incorporationMock.documentRequests?.length || 0,
          //   totalCount: incorporationMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "inc-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/incorporation?tab=milestones",
          // },
          // {
          //   slug: "inc-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/incorporation?tab=library",
          // },
          // {
          //   slug: "inc-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/incorporation?tab=compliance_calendar",
          // },
          {
            slug: "incorporation-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/incorporation?tab=incorporation_filings",
          },
          // {
          //   slug: "inc-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/incorporation?tab=messages",
          //   count: incorporationMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: incorporationMock.messages?.length || 0,
          // },
        ], */
      },
      {
        slug: "business-plans",
        icon: DocumentValidationIcon,
        label: "Business Plans",
        href: "/dashboard/services/business-plans",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "bp-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/business-plans?tab=document_requests",
          //   count: businessPlansMock.documentRequests?.length || 0,
          //   totalCount: businessPlansMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "bp-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/business-plans?tab=milestones",
          // },
          // {
          //   slug: "bp-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/business-plans?tab=library",
          // },
          // {
          //   slug: "bp-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/business-plans?tab=compliance_calendar",
          // },
          {
            slug: "business-plans-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/business-plans?tab=business_plans_filings",
          },
          // {
          //   slug: "bp-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/business-plans?tab=messages",
          //   count: businessPlansMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: businessPlansMock.messages?.length || 0,
          // },
        ], */
      },
      {
        slug: "liquidation",
        icon: Unlink03Icon,
        label: "Liquidation",
        href: "/dashboard/services/liquidation",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "liq-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/liquidation?tab=document_requests",
          //   count: liquidationMock.documentRequests?.length || 0,
          //   totalCount: liquidationMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "liq-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/liquidation?tab=milestones",
          // },
          // {
          //   slug: "liq-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/liquidation?tab=library",
          // },
          // {
          //   slug: "liq-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/liquidation?tab=compliance_calendar",
          // },
          {
            slug: "liquidation-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/liquidation?tab=liquidation_filings",
          },
          // {
          //   slug: "liq-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/liquidation?tab=messages",
          //   count: liquidationMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: liquidationMock.messages?.length || 0,
          // },
        ], */
      },
      {
        slug: "regulated-licenses",
        icon: GitPullRequestIcon,
        label: "Regulated Licenses",
        href: "/dashboard/services/regulated-licenses",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "rl-dashboard",
          //   icon: DashboardSquare02Icon,
          //   label: "Dashboard",
          //   href: "/dashboard/services/regulated-licenses?tab=dashboard",
          // },
          // {
          //   slug: "rl-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/regulated-licenses?tab=document_requests",
          //   count: regulatedLicensesMock.documentRequests?.length || 0,
          //   totalCount: regulatedLicensesMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "rl-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/regulated-licenses?tab=milestones",
          // },
          // {
          //   slug: "rl-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/regulated-licenses?tab=library",
          // },
          // {
          //   slug: "rl-calendar",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/regulated-licenses?tab=compliance_calendar",
          // },
          // {
          //   slug: "rl-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/regulated-licenses?tab=messages",
          //   count: (regulatedLicensesMock.messages || []).filter((m: any) => !m.read).length || 0,
          //   totalCount: regulatedLicensesMock.messages?.length || 0,
          // },
          {
            slug: "rl-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/regulated-licenses?tab=regulated_licenses_filings",
          },
        ], */
      },
      {
        slug: "banking-payments",
        icon: CreditCardIcon,
        label: "Banking & Payments",
        href: "/dashboard/services/banking-payments",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "bp-dashboard",
          //   icon: DashboardSquare02Icon,
          //   label: "Dashboard",
          //   href: "/dashboard/services/banking-payments?tab=dashboard",
          // },
          // {
          //   slug: "bp-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/banking-payments?tab=document_requests",
          //   count: bankingPaymentsMock.documentRequests?.length || 0,
          //   totalCount: bankingPaymentsMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "bp-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/banking-payments?tab=milestones",
          // },
          // {
          //   slug: "bp-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/banking-payments?tab=library",
          // },
          // {
          //   slug: "bp-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/banking-payments?tab=compliance_calendar",
          // },
          // {
          //   slug: "bp-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/banking-payments?tab=messages",
          //   count: bankingPaymentsMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: bankingPaymentsMock.messages?.length || 0,
          // },
          {
            slug: "bp-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/banking-payments?tab=banking_payments_filings",
          },
        ], */
      },

      {
        slug: "international-structuring",
        icon: GitPullRequestIcon,
        label: "International Structuring",
        href: "/dashboard/services/international-structuring",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "is-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/international-structuring?tab=document_requests",
          //   count: internationalStructuringMock.documentRequests?.length || 0,
          //   totalCount: internationalStructuringMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "is-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/international-structuring?tab=milestones",
          // },
          // {
          //   slug: "is-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/international-structuring?tab=library",
          // },
          // {
          //   slug: "is-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/international-structuring?tab=compliance_calendar",
          // },
          // {
          //   slug: "is-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/international-structuring?tab=messages",
          //   count:
          //     internationalStructuringMock.messages?.filter((m) => !m.read).length ||
          //     0,
          //   totalCount: internationalStructuringMock.messages?.length || 0,
          // },
          {
            slug: "is-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/international-structuring?tab=filings",
          },
        ], */
      },

      {
        slug: "crypto-digital-assets",
        icon: Wallet01Icon,
        label: "Crypto & Digital Assets",
        href: "/dashboard/services/crypto-digital-assets",
        isActive: true,
        children: [], /* children: [
          // {
          //   slug: "crypto-docs",
          //   icon: DocumentValidationIcon,
          //   label: "Document Requests",
          //   href: "/dashboard/services/crypto-digital-assets?tab=document_requests",
          //   count: cryptoDigitalAssetsMock.documentRequests?.length || 0,
          //   totalCount: cryptoDigitalAssetsMock.documentRequests?.length || 0,
          // },
          // {
          //   slug: "crypto-milestones",
          //   icon: TaskDaily01Icon,
          //   label: "Milestones",
          //   href: "/dashboard/services/crypto-digital-assets?tab=milestones",
          // },
          // {
          //   slug: "crypto-lib",
          //   icon: Book02Icon,
          //   label: "Library",
          //   href: "/dashboard/services/crypto-digital-assets?tab=library",
          // },
          // {
          //   slug: "crypto-compliance",
          //   icon: TaxesIcon,
          //   label: "Compliance Calendar",
          //   href: "/dashboard/services/crypto-digital-assets?tab=compliance_calendar",
          // },
          // {
          //   slug: "crypto-messages",
          //   icon: Message01Icon,
          //   label: "Messages",
          //   href: "/dashboard/services/crypto-digital-assets?tab=messages",
          //   count:
          //     cryptoDigitalAssetsMock.messages?.filter((m) => !m.read).length || 0,
          //   totalCount: cryptoDigitalAssetsMock.messages?.length || 0,
          // },
          {
            slug: "crypto-filings",
            icon: TaskDaily01Icon,
            label: "Filings",
            href: "/dashboard/services/crypto-digital-assets?tab=filings",
          },
        ], */
      },


      // {
      //   slug: "regulated-licences",
      //   icon: ProfileIcon,
      //   label: "Regulated Licences",
      //   href: "/dashboard/services/regulated-licences?tab=dashboard",
      //   isActive: true,
      //   children: [
      //     {
      //       slug: "rl-dashboard",
      //       icon: DashboardSquare02Icon,
      //       label: "Dashboard",
      //       href: "/dashboard/services/regulated-licenses?tab=dashboard",
      //     },
      //     {
      //       slug: "rl-docs",
      //       icon: DocumentValidationIcon,
      //       label: "Document Requests",
      //       href: "/dashboard/services/regulated-licenses?tab=document_requests",
      //       count: regulatedLicensesMock.documentRequests?.length || 0,
      //       totalCount: regulatedLicensesMock.documentRequests?.length || 0,
      //     },
      //     {
      //       slug: "rl-milestones",
      //       icon: TaskDaily01Icon,
      //       label: "Milestones",
      //       href: "/dashboard/services/regulated-licenses?tab=milestones",
      //     },
      //     {
      //       slug: "rl-lib",
      //       icon: Book02Icon,
      //       label: "Library",
      //       href: "/dashboard/services/regulated-licenses?tab=library",
      //     },
      //     {
      //       slug: "rl-calendar",
      //       icon: TaxesIcon,
      //       label: "Compliance Calendar",
      //       href: "/dashboard/services/regulated-licenses?tab=compliance_calendar",
      //     },
      //     {
      //       slug: "rl-messages",
      //       icon: Message01Icon,
      //       label: "Messages",
      //       href: "/dashboard/services/regulated-licenses?tab=messages",
      //       count: (regulatedLicensesMock.messages || []).filter((m: any) => !m.read).length || 0,
      //       totalCount: regulatedLicensesMock.messages?.length || 0,
      //     },
      //     {
      //       slug: "rl-filings",
      //       icon: TaskDaily01Icon,
      //       label: "Filings",
      //       href: "/dashboard/services/regulated-licenses?tab=regulated_licenses_filings",
      //     },
      //   ],

      // },
      // {
      //   slug: "residency-mobility",
      //   icon: UserCheck01Icon,
      //   label: "Residency & Mobility",
      //   href: "/dashboard/services/residency-mobility",
      //   disabled: true,
      // },
      {
        slug: "grants-incentives",
        icon: GiftIcon,
        label: "Grants & Incentives",
        href: "/dashboard/services/grants-incentives",
        isActive: true,
      },
      // {
      //   slug: "corporate-transactions",
      //   icon: TransactionIcon,
      //   label: "Corporate Transactions",
      //   href: "/dashboard/services/corporate-transactions",
      //   disabled: true,
      // },
      // {
      //   slug: "library",
      //   icon: Book02Icon,
      //   label: "Library",
      //   href: "/dashboard/services#library",
      //   disabled: true,
      //   description: "Centralized document vault",
      // },
    ],
  },
  // {
  //     slug: "compliance-setup",
  //     icon: InstallingUpdates02Icon,
  //     label: "Compliance Setup",
  //     href: "/dashboard/compliance/setup",
  //     children: [],
  //     section: "primary",
  //     description: "Configure compliance anchors & active services",
  // },
  {
    slug: "compliance",
    icon: TaxesIcon,
    label: "Compliance Calendar",
    href: "/dashboard/compliance",
    children: [],
    section: "primary",
    description: "Statutory deadlines & filings",
  },
  {
    slug: "messages",
    icon: Message01Icon,
    label: "Messages",
    href: "/dashboard/messages",
    children: [],
    section: "primary",
    description: "Chat with your service team",
    count: 8,
    totalCount: 15,
  },
  {
    slug: "todo-list",
    icon: TaskDaily01Icon,
    label: "To-Do List",
    href: "/dashboard/todo-list",
    children: [],
    section: "operations",
    description: "Tasks requiring your action",
  },
  {
    slug: "notifications",
    icon: NotificationIcon,
    label: "Alerts & Notifications",
    href: "/dashboard/notifications",
    children: [],
    section: "operations",
    description: "Important updates & reminders",
  },
  // {
  //    slug: "document-organizer",
  //     icon: DocumentValidationIcon,
  //     label: "Document Organizer",
  //     href: "/dashboard/document-organizer/document-listing",
  //     description: "Auto-sort & organise files",
  //     children: [
  //         {
  //             slug: "upload",
  //             icon: ArrowRightDoubleIcon,
  //             label: "Upload Documents",
  //             href: "/dashboard/document-organizer/document-upload",
  //         },
  //         {
  //             slug: "listing",
  //             icon: ArrowRightDoubleIcon,
  //             label: "View Documents",
  //             href: "/dashboard/document-organizer/document-listing",
  //         },
  //     ],
  //     section: "operations",
  // },
  {
    slug: "quickbooks-sync",
    icon: FileSyncIcon,
    label: "Quickbooks Sync",
    href: "/dashboard/quickbooks-sync",
    description: "Accounting software connection",
    children: [],
    section: "operations",
  },
  // {
  //   slug: "support",
  //   icon: Message01Icon,
  //   label: "Support",
  //   description: "Direct chat with our support team",
  //   href: "/dashboard/support",
  //   section: "settings",
  //   children: [],
  // },
  {
    slug: "settings",
    icon: InstallingUpdates02Icon,
    label: "Settings",
    description: "Company & user preferences",
    href: "/dashboard/settings",
    section: "settings",
    children: [
      // {
      //     slug: "company-profile",
      //     icon: Building01Icon,
      //     label: "Company Profile",
      //     href: "/dashboard/settings/company-profile",
      // },
      // {
      //     slug: "users-permissions",
      //     icon: ProfileIcon,
      //     label: "Users & Permissions",
      //     href: "/dashboard/settings/users-permissions",
      // },
      // {
      //     slug: "preferences",
      //     icon: InstallingUpdates02Icon,
      //     label: "Preferences",
      //     href: "/dashboard/settings/preferences",
      // },
    ],
  },
];

export const globalMenuData: MenuItem[] = [
  {
    slug: "global-dashboard",
    icon: DashboardSquare02Icon,
    label: "Dashboard",
    href: "/global-dashboard",
    section: "primary",
    description: "Multi-company overview",
  },
  {
    slug: "companies",
    icon: Building01Icon,
    label: "Companies",
    href: "/global-dashboard/companies",
    section: "primary",
    description: "Manage all your companies",
  },
  {
    slug: "compliance",
    icon: TaxesIcon,
    label: "Compliance",
    href: "/global-dashboard/compliance",
    section: "primary",
    description: "Multi-company compliance overview",
  },
  {
    slug: "support",
    icon: Message01Icon,
    label: "Support",
    href: "/global-dashboard/support",
    section: "primary",
    description: "Help and assistance",
  },
  {
    slug: "messages",
    icon: Message01Icon,
    label: "Messages",
    href: "/global-dashboard/messages",
    section: "primary",
    description: "Unified message center",
  },
  {
    slug: "reseller-analytics",
    icon: TransactionIcon,
    label: "Reseller Analytics",
    href: "/global-dashboard/analytics",
    section: "primary",
    description: "Track signups and earnings",
  },
  {
    slug: "notifications",
    icon: NotificationIcon,
    label: "Alerts & Notifications",
    href: "/global-dashboard/alerts",
    section: "operations",
    description: "Important updates & reminders",
  },
  {
    slug: "global-library",
    icon: Book02Icon,
    label: "Global Library",
    href: "/global-dashboard/library",
    section: "operations",
    description: "Centralized document vault",
  },
  {
    slug: "settings",
    icon: InstallingUpdates02Icon,
    label: "Settings",
    href: "/global-dashboard/settings",
    section: "settings",
    description: "User preferences",
  },
];
