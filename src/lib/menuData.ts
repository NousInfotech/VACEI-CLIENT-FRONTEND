import { DashboardSquare02Icon,FileSyncIcon, TaskDaily01Icon, Book02Icon, ArrowRightDoubleIcon, CashbackPoundIcon, TransactionIcon, TaxesIcon, GitPullRequestIcon, DocumentValidationIcon, ProfileIcon, InstallingUpdates02Icon,NotificationIcon,InvoiceIcon } from '@hugeicons/core-free-icons';
export interface MenuItem {
    slug: string;
    icon: any;
    label: string;
    href: string;
    children?: MenuItem[];
}

export const menuData: MenuItem[] = [
    {
        slug: "dashboard",
        icon: DashboardSquare02Icon,
        label: "Dashboard",
        href: "/dashboard",
        children: [],
    },
    {
        slug: "todo-list",
        icon: TaskDaily01Icon,
        label: "To-Do List",
        href: "/dashboard/todo-list",
        children: [],
    },
      {
        slug: "notifications",
        icon: NotificationIcon,
        label: "Alerts & Notifications",
        href: "/dashboard/notifications",
        children: [],
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
            /* {
                slug: "#",
                icon: ArrowRightDoubleIcon,
                label: "Revenue Waterfall",
                href: "#"
            } */
        ],
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
    },
    {
        slug: "bank-transactions",
        icon: TransactionIcon,
        label: "Bank Transactions",
        href: "/dashboard/bank-transactions",
        children: [],
    },
      {
        slug: "invoices",
        icon: InvoiceIcon,
        label: "Invoice",
        href: "/dashboard/invoices",
        children: [],
    },
    {
        slug: "tax",
        icon: TaxesIcon,
        label: "Tax",
        href: "/dashboard/tax",
        children: [],
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
    },
    {
        slug: "general-ledger",
        icon: ProfileIcon,
        label: "General Ledger",
        href: "/dashboard/general-ledger",
        children: [],
    },
    {
        slug: "quickbooks-sync",
        icon: FileSyncIcon,
        label: "Quickbooks Sync",
        href: "/dashboard/quickbooks-sync",
        children: [],
    },
    {
        slug: "settings",
        icon: InstallingUpdates02Icon,
        label: "Settings",
        href: "/dashboard/settings",
        children: [],
    }
];
