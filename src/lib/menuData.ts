import { DashboardSquare02Icon,FileSyncIcon, TaskDaily01Icon, Book02Icon, ArrowRightDoubleIcon, CashbackPoundIcon, TransactionIcon, TaxesIcon, GitPullRequestIcon, DocumentValidationIcon, ProfileIcon, InstallingUpdates02Icon,NotificationIcon,InvoiceIcon, Message01Icon } from '@hugeicons/core-free-icons';

export type MenuSection = "primary" | "workspaces" | "operations" | "settings";

export interface MenuItem {
    slug: string;
    icon: any;
    label: string;
    href: string;
    children?: MenuItem[];
    section?: MenuSection;
}

export const menuData: MenuItem[] = [
    {
        slug: "dashboard",
        icon: DashboardSquare02Icon,
        label: "Dashboard",
        href: "/dashboard",
        children: [],
        section: "primary",
    },
    {
        slug: "documents",
        icon: DocumentValidationIcon,
        label: "Documents",
        href: "/dashboard/documents",
        children: [],
        section: "primary",
    },
    {
        slug: "company",
        icon: DocumentValidationIcon,
        label: "Company",
        href: "/dashboard/company",
        children: [],
        section: "primary",
    },
    {
        slug: "engagement",
        icon: DocumentValidationIcon,
        label: "Engagement",
        href: "/dashboard/engagement",
        children: [],
        section: "primary",
    },
    {
        slug: "services",
        icon: GitPullRequestIcon,
        label: "Services",
        href: "/dashboard/services",
        children: [],
        section: "primary",
    },
    {
        slug: "compliance",
        icon: TaxesIcon,
        label: "Compliance Calendar",
        href: "/dashboard/compliance",
        children: [],
        section: "primary",
    },
    {
        slug: "messages",
        icon: Message01Icon,
        label: "Messages",
        href: "/dashboard/messages",
        children: [],
        section: "primary",
    },
    {
        slug: "todo-list",
        icon: TaskDaily01Icon,
        label: "To-Do List",
        href: "/dashboard/todo-list",
        children: [],
        section: "operations",
    },
    {
        slug: "notifications",
        icon: NotificationIcon,
        label: "Alerts & Notifications",
        href: "/dashboard/notifications",
        children: [],
        section: "operations",
    },
    {
        slug: "books",
        icon: Book02Icon,
        label: "Books",
        href: "/dashboard/financial-statements/profit-loss",
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
           /*  {
                slug: "change-in-bank-balances",
                icon: ArrowRightDoubleIcon,
                label: "Change in Bank Balances",
                href: "/dashboard/change-in-bank-balances",
            }, */
            {
                slug: "account-receivable-aging",
                icon: ArrowRightDoubleIcon,
                label: "AP/AR Aging",
                href: "/dashboard/ap-ar-aging/account-receivable-aging",
            },
            /* more financial reports can be added here */
        ],
        section: "workspaces",
    },
    {
        slug: "cash/accounts",
        icon: CashbackPoundIcon,
        label: "Cash",
        href: "/dashboard/cash/accounts",
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
        ],
        section: "workspaces",
    },
    {
        slug: "bank-transactions",
        icon: TransactionIcon,
        label: "Bank Transactions",
        href: "/dashboard/bank-transactions",
        children: [],
        section: "workspaces",
    },
      {
        slug: "invoices",
        icon: InvoiceIcon,
        label: "Invoice",
        href: "/dashboard/invoices",
        children: [],
        section: "workspaces",
    },
    {
        slug: "tax",
        icon: TaxesIcon,
        label: "Tax",
        href: "/dashboard/tax",
        children: [],
        section: "workspaces",
    },
    /* {
        slug: "#",
        icon: GitPullRequestIcon,
        label: "Requests",
        href: "#",
        children: [
            {
                slug: "#",
                icon: ArrowRightDoubleIcon,
                label: "Request VAT Return",
                href: "#",
            },
            {
                slug: "#",
                icon: ArrowRightDoubleIcon,
                label: "Request Payroll",
                href: "#",
            },
            {
                slug: "#",
                icon: ArrowRightDoubleIcon,
                label: "Request MBR Annual Return",
                href: "#"
            },
            {
                slug: "#",
                icon: ArrowRightDoubleIcon,
                label: "Request Financial Audit",
                href: "#"
            },
            {
                slug: "#",
                icon: ArrowRightDoubleIcon,
                label: "Request Tax Return",
                href: "#"
            },
        ],
    }, */
    {
        slug: "document-organizer",
        icon: DocumentValidationIcon,
        label: "Document Organizer",
        href: "#",
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
        slug: "general-ledger",
        icon: ProfileIcon,
        label: "General Ledger",
        href: "/dashboard/general-ledger",
        children: [],
        section: "workspaces",
    },
    {
        slug: "quickbooks-sync",
        icon: FileSyncIcon,
        label: "Quickbooks Sync",
        href: "/dashboard/quickbooks-sync",
        children: [],
        section: "operations",
    },
    {
        slug: "settings",
        icon: InstallingUpdates02Icon,
        label: "Settings",
        href: "/dashboard/settings",
        children: [],
        section: "settings",
    }
];
