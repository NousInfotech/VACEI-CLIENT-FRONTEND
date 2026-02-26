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

export const SERVICE_METADATA: Record<string, { icon: any; label: string; href: string; category?: string; description?: string; color?: string }> = {
  ACCOUNTING: {
    icon: Book02Icon,
    label: "Accounting & Bookkeeping",
    href: "/dashboard/services/bookkeeping",
    category: "Core Services",
    description: "Monthly bookkeeping, reconciliations and financial reporting.",
    color: "blue",
  },
  AUDITING: {
    icon: DocumentValidationIcon,
    label: "Audit",
    href: "/dashboard/services/audit",
    category: "Workspaces",
    description: "Statutory audit engagement, PBCs, and audit reports.",
    color: "indigo",
  },
  VAT: {
    icon: TaxesIcon,
    label: "VAT",
    href: "/dashboard/services/vat",
    category: "Core Services",
    description: "VAT period management, returns and submissions.",
    color: "green",
  },
  TAX: {
    icon: TaxesIcon,
    label: "Tax",
    href: "/dashboard/services/tax",
    category: "Core Services",
    description: "Corporate and personal tax compliance and advisory.",
    color: "green",
  },
  CSP: {
    icon: Building01Icon,
    label: "CSP",
    href: "/dashboard/services/csp-mbr",
    category: "Compliance & Corporate",
    description: "Corporate secretarial services, registry filings and MBR forms.",
    color: "teal",
  },
  PAYROLL: {
    icon: CashbackPoundIcon,
    label: "Payroll",
    href: "/dashboard/services/payroll",
    category: "Core Services",
    description: "Salary processing, statutory deductions, and payslips.",
    color: "purple",
  },
  CFO: {
    icon: Wallet01Icon,
    label: "CFO",
    href: "/dashboard/services/cfo",
    category: "Workspaces",
    description: "Strategic financial advisory and performance analysis.",
    color: "blue",
  },
  PROJECTS_TRANSACTIONS: {
    icon: TransactionIcon,
    label: "Project Transactions",
    href: "/dashboard/services/project-transactions",
    category: "Workspaces",
    description: "Capital projects, transactions, and data room management.",
    color: "pink",
  },
  TECHNOLOGY: {
    icon: InstallingUpdates02Icon,
    label: "Technology",
    href: "/dashboard/services/technology",
    category: "Workspaces",
    description: "Technology infrastructure, software solutions and support.",
    color: "blue",
  },
  GRANTS_AND_INCENTIVES: {
    icon: GiftIcon,
    label: "Grants & Incentives",
    href: "/dashboard/services/grants-incentives",
    category: "Workspaces",
    description: "Government grants, tax incentives and funding support.",
    color: "amber",
  },
  MBR: {
    icon: DocumentValidationIcon,
    label: "MBR Filings",
    href: "/dashboard/services/mbr-filing",
    category: "Compliance & Corporate",
    description: "Statutory filings and annual returns with the MBR.",
    color: "orange",
  },
  INCORPORATION: {
    icon: GitPullRequestIcon,
    label: "Incorporation",
    href: "/dashboard/services/incorporation",
    category: "Compliance & Corporate",
    description: "Legally forming new corporate entities in various jurisdictions.",
    color: "teal",
  },
  ADVISORY: {
    icon: DocumentValidationIcon,
    label: "Business Plans",
    href: "/dashboard/services/business-plans",
    category: "Workspaces",
    description: "Strategic planning, financial modelling and business plans.",
    color: "indigo",
  },
  REGULATED_LICENSES: {
    icon: DocumentValidationIcon,
    label: "Regulated Licenses",
    href: "/dashboard/services/regulated-licenses",
    category: "Workspaces",
    description: "License applications, renewals, and ongoing compliance.",
    color: "red",
  },
  LEGAL: {
    icon: DocumentValidationIcon,
    label: "Legal",
    href: "/dashboard/services/legal",
    category: "Workspaces",
    description: "Legal matters, document drafting, and regulatory approvals.",
    color: "red",
  },
  BANKING_PAYMENTS: {
    icon: CashbackPoundIcon,
    label: "Banking & Payments",
    href: "/dashboard/services/banking-payments",
    category: "Workspaces",
    description: "Bank account management, approvals, and payment workflows.",
    color: "blue",
  },
  CUSTOM: {
    icon: GitPullRequestIcon,
    label: "Custom Service",
    href: "/dashboard/services/custom",
    category: "Specialized",
    description: "Tailored services and projects specifically for your needs.",
    color: "slate",
  },
};

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
    children: [], // Populated dynamically
  },
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
  // {
  //   slug: "quickbooks-sync",
  //   icon: FileSyncIcon,
  //   label: "Quickbooks Sync",
  //   href: "/dashboard/quickbooks-sync",
  //   description: "Accounting software connection",
  //   children: [],
  //   section: "operations",
  // },
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
