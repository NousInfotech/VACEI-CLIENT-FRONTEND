import { DashboardSquare02Icon,FileSyncIcon, TaskDaily01Icon, Book02Icon, ArrowRightDoubleIcon, CashbackPoundIcon, TransactionIcon, TaxesIcon, GitPullRequestIcon, DocumentValidationIcon, ProfileIcon, InstallingUpdates02Icon,NotificationIcon,InvoiceIcon, Message01Icon } from '@hugeicons/core-free-icons';

export type MenuSection = "primary" | "workspaces" | "operations" | "settings";

export interface MenuItem {
    slug: string;
    icon: any;
    label: string;
    href: string;
    children?: MenuItem[];
    section?: MenuSection;
    description?: string;
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
        description: "Access all audit and accounting services",
        children: [
            {
                slug: "services-main",
                icon: GitPullRequestIcon,
                label: "Services",
                href: "/dashboard/services",
            },
            {
                slug: "audit",
                icon: GitPullRequestIcon,
                label: "Audit",
                href: "#",
                children: [
                    {
                        slug: "engagement",
                        icon: DocumentValidationIcon,
                        label: "Engagement",
                        href: "/dashboard/engagement",
                    },
                    {
                        slug: "company",
                        icon: DocumentValidationIcon,
                        label: "Company",
                        href: "/dashboard/company",
                    },
                ]
            },
            {
                slug: "accounting",
                icon: Book02Icon,
                label: "Accounting",
                href: "#",
                children: [
                    {
                        slug: "books",
                        icon: Book02Icon,
                        label: "Books",
                        href: "#",
                        children: [
                            {
                                slug: "profit-loss",
                                icon: ArrowRightDoubleIcon,
                                label: "Financial Statement",
                                href: '/dashboard/financial-statements/profit-loss',
                            },
                            {
                                slug: "insights",
                                icon: ArrowRightDoubleIcon,
                                label: "Insights",
                                href: "/dashboard/insights",
                            },
                            {
                                slug: "account-receivable-aging",
                                icon: ArrowRightDoubleIcon,
                                label: "AP/AR Aging",
                                href: "/dashboard/ap-ar-aging/account-receivable-aging",
                            },
                        ]
                    },
                    {
                        slug: "cash",
                        icon: CashbackPoundIcon,
                        label: "Cash",
                        href: "#",
                        children: [
                            {
                                slug: "cash/accounts",
                                icon: ArrowRightDoubleIcon,
                                label: "Accounts",
                                href: "/dashboard/cash/accounts",
                            },
                            {
                                slug: "change-in-cash",
                                icon: ArrowRightDoubleIcon,
                                label: "Change in Cash",
                                href: "/dashboard/cash/change-in-cash",
                            },
                            {
                                slug: "cash-spend",
                                icon: ArrowRightDoubleIcon,
                                label: "Cash Spend",
                                href: "/dashboard/cash/cash-spend"
                            }
                        ]
                    },
                    {
                        slug: "bank-transactions",
                        icon: TransactionIcon,
                        label: "Bank Transactions",
                        href: "/dashboard/bank-transactions",
                    },
                    {
                        slug: "invoices",
                        icon: InvoiceIcon,
                        label: "Invoice",
                        href: "/dashboard/invoices",
                    },
                    {
                        slug: "tax",
                        icon: TaxesIcon,
                        label: "Tax",
                        href: "/dashboard/tax",
                    },
                    {
                        slug: "general-ledger",
                        icon: ProfileIcon,
                        label: "General Ledger",
                        href: "/dashboard/general-ledger",
                    },
                ]
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
        href: "/dashboard/settings",
        children: [],
        section: "settings",
    }
];
