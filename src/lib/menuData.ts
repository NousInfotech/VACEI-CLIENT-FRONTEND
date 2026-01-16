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
    isActive?: boolean; // New: indicates if service is active
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
        slug: "documents",
        icon: DocumentValidationIcon,
        label: "Documents",
        href: "/dashboard/documents",
        children: [],
        section: "primary",
        description: "Store and access documents",
    },

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
            },
            {
                slug: "vat-tax",
                icon: TaxesIcon,
                label: "VAT & Tax",
                href: "/dashboard/services/vat",
                isActive: true,
                children: [
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
                slug: "payroll",
                icon: CashbackPoundIcon,
                label: "Payroll",
                href: "/dashboard/services/payroll",
                isActive: true,
                children: [
                    {
                        slug: "payroll(malta)",
                        icon: CashbackPoundIcon,
                        label: "Payroll (Malta)",
                        href: "/dashboard/services/payroll/malta",
                        isActive: true,
                    },
                ],
            },
            
             {
                slug: "client-facing-content",
                icon: Wallet01Icon,
                label: "CFO",
                href: "/dashboard/services/cfo",
                isActive: true,
            },
            {
                slug: "audit",
                icon: DocumentValidationIcon,
                label: "Audit",
                href: "/dashboard/services/audit",
                isActive: true,
                children: [
               
                    {
                        slug: "audit-engagement",
                        label: "Engagement",
                        href: "/dashboard/engagement",
                        icon: TaskDaily01Icon,
                    },
                ]
            },
           {
                slug: "csp",
                icon: Building01Icon,
                label: "Corporate Services (CSP)",
                href: "/dashboard/services/csp-mbr",
                isActive: true,
            },
                    {
                slug: "banking-payments",
                icon: CreditCardIcon,
                label: "Banking & Payments",
                href: "/dashboard/services/banking-payments",
                isActive: false,
                            },
                            {
                slug: "regulated-licences",
                icon: ProfileIcon,
                label: "Regulated Licences",
                href: "/dashboard/services/regulated-licences",
                isActive: false,
            },
                            {
                slug: "residency-mobility",
                icon: UserCheck01Icon,
                label: "Residency & Mobility",
                href: "/dashboard/services/residency-mobility",
                isActive: false,
                            },
                            {
                slug: "grants-incentives",
                icon: GiftIcon,
                label: "Grants & Incentives",
                href: "/dashboard/services/grants-incentives",
                isActive: true,
                    },
                    {
                slug: "corporate-transactions",
                        icon: TransactionIcon,
                label: "Corporate Transactions",
                href: "/dashboard/services/corporate-transactions",
                isActive: false,
            },
            {
                slug: "mbr-filing",
                icon: DocumentValidationIcon,
                label: "MBR Filing",
                href: "/dashboard/services/mbr-filing",
                isActive: true,
            },
            {
                slug: "incorporation",
                icon: GitPullRequestIcon,
                label: "Incorporation",
                href: "/dashboard/incorporation",
                isActive: true,
            },
            {
                slug: "business-plans",
                icon: DocumentValidationIcon,
                label: "Business Plans",
                href: "/dashboard/business-plans",
                isActive: true,
            },
            {
                slug: "liquidation",
                icon: Unlink03Icon,
                label: "Liquidation",
                href: "/dashboard/liquidation",
                isActive: true,
            },
        ]
    },
    {
        slug: "compliance-setup",
        icon: InstallingUpdates02Icon,
        label: "Compliance Setup",
        href: "/dashboard/compliance/setup",
        children: [],
        section: "primary",
        description: "Configure compliance anchors & active services",
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
    {
       slug: "document-organizer",
        icon: DocumentValidationIcon,
        label: "Document Organizer",
        href: "/dashboard/document-organizer/document-listing",
        description: "Auto-sort & organise files",
        children: [
            {
                slug: "upload",
                icon: ArrowRightDoubleIcon,
                label: "Upload Documents",
                href: "/dashboard/document-organizer/document-upload",
            },
            {
                slug: "listing",
                icon: ArrowRightDoubleIcon,
                label: "View Documents",
                href: "/dashboard/document-organizer/document-listing",
            },
        ],
        section: "operations",
    },
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
            {
                slug: "company-profile",
                icon: Building01Icon,
                label: "Company Profile",
                href: "/dashboard/settings/company-profile",
            },
            {
                slug: "users-permissions",
                icon: ProfileIcon,
                label: "Users & Permissions",
                href: "/dashboard/settings/users-permissions",
            },
            {
                slug: "preferences",
                icon: InstallingUpdates02Icon,
                label: "Preferences",
                href: "/dashboard/settings/preferences",
            },
        ],
    }
];
