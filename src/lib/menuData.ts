import { DashboardSquare02Icon,FileSyncIcon, TaskDaily01Icon, Book02Icon, ArrowRightDoubleIcon, CashbackPoundIcon, TransactionIcon, TaxesIcon, GitPullRequestIcon, DocumentValidationIcon, ProfileIcon, InstallingUpdates02Icon,NotificationIcon,InvoiceIcon, Message01Icon, Building01Icon, CreditCardIcon, UserCheck01Icon, GiftIcon } from '@hugeicons/core-free-icons';

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
        description: "Overview of your company's financial health",
    },
    {
        slug: "documents",
        icon: DocumentValidationIcon,
        label: "Documents",
        href: "/dashboard/documents",
        children: [],
        section: "primary",
        description: "Manage your company's documents",
    },
    {
        slug: "services-root",
        icon: GitPullRequestIcon,
        label: "Services",
        href: "#",
        section: "primary",
        description: "Access all accounting and professional services",
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
            },
            {
                slug: "payroll",
                icon: CashbackPoundIcon,
                label: "Payroll",
                href: "/dashboard/services/payroll",
                isActive: true,
            },
            {
                slug: "audit",
                icon: DocumentValidationIcon,
                label: "Audit",
                href: "/dashboard/services/audit",
                isActive: true,
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
                isActive: false,
                    },
                    {
                slug: "corporate-transactions",
                        icon: TransactionIcon,
                label: "Corporate Transactions",
                href: "/dashboard/services/corporate-transactions",
                isActive: false,
            },
        ]
    },
    {
        slug: "compliance",
        icon: TaxesIcon,
        label: "Compliance Calendar",
        href: "/dashboard/compliance",
        children: [],
        section: "primary",
        description: "Manage your company's compliance calendar",
    },
    {
        slug: "messages",
        icon: Message01Icon,
        label: "Messages",
        href: "/dashboard/messages",
        children: [],
        section: "primary",
        description: "Manage your company's messages",
    },
    {
        slug: "todo-list",
        icon: TaskDaily01Icon,
        label: "To-Do List",
        href: "/dashboard/todo-list",
        children: [],
        section: "operations",
        description: "Manage your company's to-do list",
    },
      {
        slug: "notifications",
        icon: NotificationIcon,
        label: "Alerts & Notifications",
        href: "/dashboard/notifications",
        children: [],
        section: "operations",
        description: "Manage your company's alerts and notifications",
    },
    {
       slug: "document-organizer",
        icon: DocumentValidationIcon,
        label: "Document Organizer",
        href: "#",
        description: "Manage your company's documents",
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
        description: "Manage your company's quickbooks sync",
        children: [],
        section: "operations",
    },
    {
        slug: "settings",
        icon: InstallingUpdates02Icon,
        label: "Settings",
        description: "Manage your company's settings",
        href: "#",
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
