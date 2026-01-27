import { DashboardSquare02Icon,FileSyncIcon, TaskDaily01Icon, Book02Icon, ArrowRightDoubleIcon, Wallet01Icon, CashbackPoundIcon, TransactionIcon, TaxesIcon, GitPullRequestIcon, DocumentValidationIcon, ProfileIcon, InstallingUpdates02Icon,NotificationIcon,InvoiceIcon, Message01Icon, Building01Icon, CreditCardIcon, UserCheck01Icon, GiftIcon, Unlink03Icon } from '@hugeicons/core-free-icons';

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
        slug: "global-library",
        icon: Book02Icon,
        label: "Global Library",
        href: "/dashboard/global-library",
        children: [],
        section: "primary",
        description: "Centralized document vault",
    },
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
                children: [
                    {
                        slug: "ab-docs",
                        icon: DocumentValidationIcon,
                        label: "Document Requests",
                        href: "/dashboard/services/bookkeeping?tab=document_requests",
                    },
                    {
                        slug: "ab-lib",
                        icon: Book02Icon,
                        label: "Library",
                        href: "/dashboard/services/bookkeeping?tab=library",
                    },
                    {
                        slug: "ab-compliance",
                        icon: TaxesIcon,
                        label: "Compliance Calendar",
                        href: "/dashboard/services/bookkeeping?tab=compliance_calendar",
                    },
                    {
                        slug: "ab-history",
                        icon: TaskDaily01Icon,
                        label: "Service History",
                        href: "/dashboard/services/bookkeeping?tab=service_history",
                    },
                    {
                        slug: "ab-messages",
                        icon: Message01Icon,
                        label: "Messages",
                        href: "/dashboard/services/bookkeeping?tab=messages",
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
                            }
                        ]
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
                            }
                        ]
                    },
                    {
                        slug: "insights",
                        icon: DashboardSquare02Icon,
                        label: "Insights",
                        href: "/dashboard/insights",
                        isActive: true,
                    },
                ]
            },
            {
                slug: "audit",
                icon: DocumentValidationIcon,
                label: "Audit",
                href: "/dashboard/services/audit",
                isActive: true,
                children: [
                    {
                        slug: "audit-docs",
                        icon: DocumentValidationIcon,
                        label: "Document Requests",
                        href: "/dashboard/services/audit?tab=document_requests",
                    },
                    {
                        slug: "audit-lib",
                        icon: Book02Icon,
                        label: "Library",
                        href: "/dashboard/services/audit?tab=library",
                    },
                    {
                        slug: "audit-compliance",
                        icon: TaxesIcon,
                        label: "Compliance Calendar",
                        href: "/dashboard/services/audit?tab=compliance_calendar",
                    },
                    {
                        slug: "audit-history",
                        icon: TaskDaily01Icon,
                        label: "Service History",
                        href: "/dashboard/services/audit?tab=service_history",
                    },
                    {
                        slug: "audit-messages",
                        icon: Message01Icon,
                        label: "Messages",
                        href: "/dashboard/services/audit?tab=messages",
                    },
                    {
                        slug: "engagements",
                        icon: CashbackPoundIcon,
                        label: "Engagements",
                        href: "/dashboard/engagements",
                        isActive: true,
                    }
                ]
            },
            {
                slug: "vat-tax",
                icon: TaxesIcon,
                label: "VAT & Tax",
                href: "/dashboard/services/vat",
                isActive: true,
                children: [
                    {
                        slug: "vat-docs",
                        icon: DocumentValidationIcon,
                        label: "Document Requests",
                        href: "/dashboard/services/vat?tab=document_requests",
                    },
                    {
                        slug: "vat-lib",
                        icon: Book02Icon,
                        label: "Library",
                        href: "/dashboard/services/vat?tab=library",
                    },
                    {
                        slug: "vat-compliance",
                        icon: TaxesIcon,
                        label: "Compliance Calendar",
                        href: "/dashboard/services/vat?tab=compliance_calendar",
                    },
                    {
                        slug: "vat-history",
                        icon: TaskDaily01Icon,
                        label: "Service History",
                        href: "/dashboard/services/vat?tab=service_history",
                    },
                    {
                        slug: "vat-messages",
                        icon: Message01Icon,
                        label: "Messages",
                        href: "/dashboard/services/vat?tab=messages",
                    },
                    {
                        slug: "vat-malta",
                        icon: TaxesIcon,
                        label: "VAT — Malta",
                        href: "/dashboard/services/vat/malta",
                        isActive: true,
                    }
                ]
            },
            {
                slug: "csp",
                icon: Building01Icon,
                label: "Corporate Services (CSP)",
                href: "/dashboard/services/csp-mbr",
                isActive: true,
                children: [
                    {
                        slug: "csp-docs",
                        icon: DocumentValidationIcon,
                        label: "Document Requests",
                        href: "/dashboard/services/csp-mbr?tab=document_requests",
                    },
                    {
                        slug: "csp-lib",
                        icon: Book02Icon,
                        label: "Library",
                        href: "/dashboard/services/csp-mbr?tab=library",
                    },
                    {
                        slug: "csp-compliance",
                        icon: TaxesIcon,
                        label: "Compliance Calendar",
                        href: "/dashboard/services/csp-mbr?tab=compliance_calendar",
                    },
                    {
                        slug: "csp-history",
                        icon: TaskDaily01Icon,
                        label: "Service History",
                        href: "/dashboard/services/csp-mbr?tab=service_history",
                    },
                    {
                        slug: "csp-messages",
                        icon: Message01Icon,
                        label: "Messages",
                        href: "/dashboard/services/csp-mbr?tab=messages",
                    }
                ]
            },
            {
                slug: "payroll",
                icon: CashbackPoundIcon,
                label: "Payroll",
                href: "/dashboard/services/payroll",
                isActive: true,
                children: [
                    {
                        slug: "payroll-docs",
                        icon: DocumentValidationIcon,
                        label: "Document Requests",
                        href: "/dashboard/services/payroll?tab=document_requests",
                    },
                    {
                        slug: "payroll-lib",
                        icon: Book02Icon,
                        label: "Library",
                        href: "/dashboard/services/payroll?tab=library",
                    },
                    {
                        slug: "payroll-compliance",
                        icon: TaxesIcon,
                        label: "Compliance Calendar",
                        href: "/dashboard/services/payroll?tab=compliance_calendar",
                    },
                    {
                        slug: "payroll-history",
                        icon: TaskDaily01Icon,
                        label: "Service History",
                        href: "/dashboard/services/payroll?tab=service_history",
                    },
                    {
                        slug: "payroll-messages",
                        icon: Message01Icon,
                        label: "Messages",
                        href: "/dashboard/services/payroll?tab=messages",
                    },
                    {
                        slug: "payroll(malta)",
                        icon: CashbackPoundIcon,
                        label: "Payroll (Malta)",
                        href: "/dashboard/services/payroll/malta",
                        isActive: true,
                    }
                ],
            },
            
            {
                slug: "client-facing-content",
                icon: Wallet01Icon,
                label: "CFO",
                href: "/dashboard/services/cfo",
                disabled: true,
                children: []
            },

         
            {
                slug: "banking-payments",
                icon: CreditCardIcon,
                label: "Banking & Payments",
                href: "/dashboard/services/banking-payments",
                disabled: true,
            },
            {
                slug: "regulated-licences",
                icon: ProfileIcon,
                label: "Regulated Licences",
                href: "/dashboard/services/regulated-licences",
                disabled: true,
            },
            {
                slug: "residency-mobility",
                icon: UserCheck01Icon,
                label: "Residency & Mobility",
                href: "/dashboard/services/residency-mobility",
                disabled: true,
            },
            {
                slug: "grants-incentives",
                icon: GiftIcon,
                label: "Grants & Incentives",
                href: "/dashboard/services/grants-incentives",
                disabled: true,
            },
            {
                slug: "corporate-transactions",
                icon: TransactionIcon,
                label: "Corporate Transactions",
                href: "/dashboard/services/corporate-transactions",
                disabled: true,
            },
            {
                slug: "mbr-filing",
                icon: DocumentValidationIcon,
                label: "MBR Filing",
                href: "/dashboard/services/mbr-filing",
                disabled: true,
            },
            {
                slug: "incorporation",
                icon: GitPullRequestIcon,
                label: "Incorporation",
                href: "/dashboard/incorporation",
                disabled: true,
            },
            {
                slug: "business-plans",
                icon: DocumentValidationIcon,
                label: "Business Plans",
                href: "/dashboard/business-plans",
                disabled: true,
            },
            {
                slug: "liquidation",
                icon: Unlink03Icon,
                label: "Liquidation",
                href: "/dashboard/liquidation",
                disabled: true,
            },
            {
                slug: "library",
                icon: Book02Icon,
                label: "Library",
                href: "/dashboard/services#library",
                disabled: true,
                description: "Centralized document vault",
            },
        ]
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
    },
    {
        slug: "reseller-analytics",
        icon: TransactionIcon,
        label: "Reseller Analytics",
        href: "/dashboard/reseller-analytics",
        children: [],
        section: "primary",
        description: "Track signups and commission earnings",
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
    }
];
