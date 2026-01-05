"use client";

import { useEffect, useState } from "react";

interface Account {
  id: string;
  name: string;
  accountType?: string;
  accountSubType?: string;
  currentBalance: number;
  active: boolean;
}

const SkeletonRow = () => (
  <tr className="border-b border-border animate-pulse bg-brand-body">
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-300 rounded w-6"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-300 rounded w-40"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-300 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-300 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-5 bg-gray-300 rounded w-20"></div>
    </td>
  </tr>
);

export default function AccountsListContent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [accountTypeFilter, setAccountTypeFilter] = useState("");
  const [accountSubTypeFilter, setAccountSubTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", itemsPerPage.toString());
        if (searchQuery.trim()) params.append("search", searchQuery.trim());
        if (accountTypeFilter) params.append("accountType", accountTypeFilter);
        if (accountSubTypeFilter) params.append("accountSubType", accountSubTypeFilter);

        const res = await fetch(`${backendUrl}account?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setAccounts(data.accounts || []);
        setTotalItems(data.totalItems || 0);
        setTotalPages(Math.ceil((data.totalItems || 0) / itemsPerPage));
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        setAccounts([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [page, accountTypeFilter, accountSubTypeFilter, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Accounts</h1>

      {/* Filters Container */}
      
      <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md flex flex-wrap gap-6 items-end max-w-8xl">
        <div className="flex flex-col flex-grow min-w-[180px]">
          <label htmlFor="searchQuery" className="mb-1 text-brand-body font-medium">
            Account Name
          </label>
          <input
            id="searchQuery"
            type="text"
            placeholder="Search accounts..."
            className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col flex-grow min-w-[180px]">
          <label htmlFor="accountType" className="mb-1 text-brand-body font-medium">
            Account Type
          </label>
          <input
            id="accountType"
            type="text"
            placeholder="e.g. Asset, Income"
            className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={accountTypeFilter}
            onChange={(e) => {
              setAccountTypeFilter(e.target.value);
              setPage(1);
            }}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col flex-grow min-w-[180px]">
          <label htmlFor="accountSubType" className="mb-1 text-brand-body font-medium">
            Sub-Type
          </label>
          <input
            id="accountSubType"
            type="text"
            placeholder="e.g. Bank, Credit Card"
            className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={accountSubTypeFilter}
            onChange={(e) => {
              setAccountSubTypeFilter(e.target.value);
              setPage(1);
            }}
            autoComplete="off"
          />
        </div>

        
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
        <table className="w-full text-sm text-brand-body border-collapse">
          <thead className="text-xs text-brand-body uppercase bg-brand-muted">
            <tr>
              <th className="text-left px-6 py-3">S.No</th>
              <th className="text-left px-6 py-3">Account Name</th>
              <th className="text-left px-6 py-3">Account Type</th>
              <th className="text-left px-6 py-3">Sub-Type</th>
              <th className="text-left px-6 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : accounts.length > 0
              ? accounts.map((acc, index) => (
                  <tr key={acc.id} className="border-b border-border">
                    <td className="px-6 py-3">{(page - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-3">{acc.name}</td>
                    <td className="px-6 py-3">{acc.accountType || "-"}</td>
                    <td className="px-6 py-3">{acc.accountSubType || "-"}</td>
                    <td className="px-6 py-3">€{acc.currentBalance.toLocaleString()}</td>
                  </tr>
                ))
              : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No accounts found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>

        {!loading && (
          <div className="flex justify-end space-x-4 pt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 border border-border rounded disabled:opacity-40 hover:bg-brand-muted"
            >
              Prev
            </button>
            <span className="inline-block px-3 py-1 border border-border rounded">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 border border-border rounded disabled:opacity-40 hover:bg-brand-muted"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
