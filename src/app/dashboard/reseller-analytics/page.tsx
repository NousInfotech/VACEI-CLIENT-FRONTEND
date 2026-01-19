"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dropdown } from "@/components/Dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  DollarSign,
  ChevronDown,
  Link2,
  LineChart,
  Search,
  Share2,
  Users,
  Plus,
} from "lucide-react";
import CreateClientModal from "./components/CreateClientModal";

interface ResellerSignup {
  id: string;
  name: string;
  incorporated: boolean;
  signupDate: string;
  revenueAmount: number;
}

const COMMISSION_RATE = 0.15;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function generateResellerId() {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return random;
}

export default function ResellerAnalyticsPage() {
  const [signups] = useState<ResellerSignup[]>(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const iso = (offsetDays: number) =>
      new Date(now.getTime() - offsetDays * dayMs).toISOString();

    return [
      {
        id: "RSL-001",
        name: "Aurora Labs",
        incorporated: true,
        signupDate: iso(0),
        revenueAmount: 2400,
      },
      {
        id: "RSL-002",
        name: "Brightwave Consulting",
        incorporated: true,
        signupDate: iso(2),
        revenueAmount: 1800,
      },
      {
        id: "RSL-003",
        name: "Nova Ventures",
        incorporated: false,
        signupDate: iso(6),
        revenueAmount: 950,
      },
      {
        id: "RSL-004",
        name: "PixelForge Studio",
        incorporated: true,
        signupDate: iso(12),
        revenueAmount: 3200,
      },
      {
        id: "RSL-005",
        name: "Harborline Holdings",
        incorporated: false,
        signupDate: iso(28),
        revenueAmount: 4100,
      },
      {
        id: "RSL-006",
        name: "Skybridge Digital",
        incorporated: true,
        signupDate: iso(45),
        revenueAmount: 1500,
      },
    ];
  });
  const [resellerId, setResellerId] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("resellerId");
    if (stored) {
      setResellerId(stored);
      return;
    }
    const generated = generateResellerId();
    setResellerId(generated);
    window.localStorage.setItem("resellerId", generated);
  }, []);

  const baseSignupUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_PORTAL_SIGNUP_URL ||
        `${window.location.origin}/signup`
      : process.env.NEXT_PUBLIC_PORTAL_SIGNUP_URL || "";

  const signupUrl =
    resellerId && baseSignupUrl
      ? `${baseSignupUrl}?resellerId=${resellerId}`
      : "";

  const withCommission = useMemo(
    () =>
      signups.map((signup) => {
        const commission = (signup.revenueAmount || 0) * COMMISSION_RATE;
        return {
          ...signup,
          commission,
        };
      }),
    [signups]
  );

  const metrics = useMemo(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    let allTime = withCommission.length;
    let totalEarnings = 0;

    withCommission.forEach((signup) => {
      const date = new Date(signup.signupDate);
      const diffMs = now.getTime() - date.getTime();
      if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      ) {
        today += 1;
      }
      if (diffMs >= 0 && diffMs <= 7 * dayMs) {
        thisWeek += 1;
      }
      if (diffMs >= 0 && diffMs <= 30 * dayMs) {
        thisMonth += 1;
      }
      totalEarnings += signup.commission;
    });

    return {
      today,
      thisWeek,
      thisMonth,
      allTime,
      totalEarnings,
    };
  }, [withCommission]);

  const tableState = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = withCommission.filter((signup) => {
      if (!query) return true;
      const nameMatch = signup.name.toLowerCase().includes(query);
      const commissionString = currencyFormatter
        .format(signup.commission)
        .toLowerCase();
      const commissionMatch =
        commissionString.includes(query) ||
        signup.commission.toFixed(2).includes(query);
      return nameMatch || commissionMatch;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(startIndex, startIndex + pageSize);

    const totalEarningsFiltered = filtered.reduce(
      (sum, signup) => sum + signup.commission,
      0
    );

    return {
      pageItems,
      total,
      totalPages,
      currentPage,
      startIndex,
      totalEarningsFiltered,
    };
  }, [withCommission, search, page, pageSize]);

  const handleCopy = async () => {
    if (!signupUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(signupUrl);
      }
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("idle");
    }
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (
      nextPage < 1 ||
      nextPage > tableState.totalPages ||
      nextPage === tableState.currentPage
    ) {
      return;
    }
    setPage(nextPage);
  };

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
      <PageHeader
        title="Reseller Analytics"
        subtitle="Track your signups, earnings, and share your unique signup link."
        actions={
          <Button onClick={() => setIsCreateClientModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Client
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-card shadow-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Today
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary-color-new">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-brand-body">
            {metrics.today}
          </div>
          <div className="text-xs text-muted-foreground">
            Signups today
          </div>
        </div>

        <div className="bg-card border border-border rounded-card shadow-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              This week
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary-color-new">
              <LineChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-brand-body">
            {metrics.thisWeek}
          </div>
          <div className="text-xs text-muted-foreground">
            Signups in the last 7 days
          </div>
        </div>

        <div className="bg-card border border-border rounded-card shadow-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              This month
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary-color-new">
              <LineChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-brand-body">
            {metrics.thisMonth}
          </div>
          <div className="text-xs text-muted-foreground">
            Signups in the last 30 days
          </div>
        </div>

        <div className="bg-card border border-border rounded-card shadow-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              All time
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary-color-new">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-brand-body">
            {metrics.allTime}
          </div>
          <div className="text-xs text-muted-foreground">
            Total signups from your link
          </div>
        </div>

        <div className="bg-card border border-border rounded-card shadow-md p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total earnings
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary-color-new">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-primary-color-new">
            {currencyFormatter.format(metrics.totalEarnings)}
          </div>
          <div className="text-xs text-muted-foreground">
            Commission at 15% on all signups
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary-color-new">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-brand-body">
              Reseller signup link
            </h2>
            <p className="text-sm text-muted-foreground">
              Share this link to invite users to sign up through your reseller
              channel.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <Input
            readOnly
            value={signupUrl || "Signup link will appear here once available."}
            className="flex-1 text-xs sm:text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-light text-primary-color-new"
              onClick={handleCopy}
              disabled={!signupUrl}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copyState === "copied" ? "Copied" : "Copy"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="hidden sm:inline-flex bg-light text-primary-color-new"
              disabled={!signupUrl}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {resellerId && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="px-2 py-0.5 uppercase tracking-wide">
              Reseller ID: {resellerId}
            </Badge>
            <span>Commission rate: {(COMMISSION_RATE * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-card shadow-md p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-brand-body">
              Signup users
            </h2>
            <p className="text-sm text-muted-foreground">
              View users who signed up via your reseller link and their earned
              commission.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or commission amount"
                value={search}
                onChange={handleSearchChange}
                className="w-full sm:w-60"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rows per page</span>
              <Dropdown
                className="w-auto min-w-[80px]"
                fullWidth={true}
                align="left"
                side="bottom"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 min-w-[80px] justify-between px-2"
                  >
                    {pageSize}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                }
                items={[
                  {
                    id: "5",
                    label: "5",
                    onClick: () => {
                      setPageSize(5);
                      setPage(1);
                    },
                  },
                  {
                    id: "10",
                    label: "10",
                    onClick: () => {
                      setPageSize(10);
                      setPage(1);
                    },
                  },
                  {
                    id: "20",
                    label: "20",
                    onClick: () => {
                      setPageSize(20);
                      setPage(1);
                    },
                  },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Total users: {tableState.total}
          </span>
          <span>
            Total earnings in view:{" "}
            {currencyFormatter.format(tableState.totalEarningsFiltered)}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-muted/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">S. No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Incorporated</TableHead>
                <TableHead className="w-[160px] text-right">
                  Commission earned
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableState.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    No signups yet. Share your reseller link to start earning
                    commission.
                  </TableCell>
                </TableRow>
              ) : (
                tableState.pageItems.map((signup, index) => (
                  <TableRow key={signup.id}>
                    <TableCell>
                      {tableState.startIndex + index + 1}
                    </TableCell>
                    <TableCell>{signup.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          signup.incorporated
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-destructive/10 text-destructive border-destructive/30"
                        }
                      >
                        {signup.incorporated ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {currencyFormatter.format(signup.commission)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {tableState.totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 text-xs text-muted-foreground">
            <div>
              Page {tableState.currentPage} of {tableState.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(tableState.currentPage - 1)}
                disabled={tableState.currentPage === 1}
                className="px-3 py-1.5 border border-border rounded-md text-brand-body hover:bg-brand-muted disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(tableState.currentPage + 1)}
                disabled={tableState.currentPage === tableState.totalPages}
                className="px-3 py-1.5 border border-border rounded-md text-brand-body hover:bg-brand-muted disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={() => setIsCreateClientModalOpen(false)}
        resellerId={resellerId}
      />
    </section>
  );
}
