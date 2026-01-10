'use client';

import { useState, useEffect } from 'react';
import { Dropdown } from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";

function SkeletonTransaction() {
  return (
    <div className="flex justify-between items-center p-4 border-l-2 shadow-md animate-pulse bg-brand-muted border-border">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded bg-gray-300"></div>
        <div className="flex flex-col space-y-2">
          <div className="w-20 h-3 bg-gray-300 rounded"></div>
          <div className="w-40 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="w-16 h-4 bg-gray-300 rounded"></div>
    </div>
  );
}
  
export default function TopTransactions() {
  type Transaction = {
    id: string;
    type: 'income' | 'expense';
    date: string;
    description: string;
    amount: number;
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noDataFound, setNoDataFound] = useState(false); // New state for 'no data found'

  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        setNoDataFound(false); // Clear no data found state

        const token = localStorage.getItem('token');
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          type,
        }).toString();

        const res = await fetch(`${backendUrl}transaction?${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // If the response is not OK, it's an HTTP error
          const errorText = await res.text(); // Attempt to get more detail from response body
          throw new Error(`Failed to fetch transactions: ${res.status} ${res.statusText} - ${errorText || 'Unknown error'}`);
        }

        const data = await res.json();

        // Check if data.transactions is an array and if it's empty or has items
        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(data.transactions);
          setTotalPages(data.totalPages || 1);
          setNoDataFound(false); // Ensure noDataFound is false if data is received
        } else {
          // If response is OK but transactions array is empty or not an array
          setTransactions([]);
          setTotalPages(1); // Reset total pages if no data
          setNoDataFound(true); // Set noDataFound to true
        }

        // Clamp page if API returns a lower totalPages after filter change
        if (page > (data.totalPages || 1)) {
          setPage(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Transactions fetch error:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while loading transactions.');
        }
        setTransactions([]); // Clear transactions on error
        setTotalPages(1); // Reset total pages on error
        setNoDataFound(false); // If there's an error, it's not "no data found" but an actual error
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [type, page]);

  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));
  const handleTypeChange = (value: string) => {
    setType(value);
    setPage(1); // reset page when filter changes
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex justify-between items-center">
        <Dropdown
          align="left"
          label={type === 'all' ? 'All' : type === 'income' ? 'Income' : 'Expense'}
          searchable={true}
          items={[
            { id: 'all', label: 'All', onClick: () => handleTypeChange('all') },
            { id: 'income', label: 'Income', onClick: () => handleTypeChange('income') },
            { id: 'expense', label: 'Expense', onClick: () => handleTypeChange('expense') },
          ]}
          trigger={
            <div className="border border-border rounded-lg px-3 py-2 bg-card flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors h-10 min-w-[120px] shadow-sm">
              <span className="text-sm text-gray-700 truncate capitalize">
                {type}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            </div>
          }
        />

        <div className="space-x-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={handleNext}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Transactions Display Area */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <SkeletonTransaction key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-muted-foreground text-center py-8 font-medium"> {/* Changed text-red-600 to text-muted-foreground */}
          <p className="mb-2">Oops! Something went wrong.</p>
          <p>{error}</p>
          <p className="mt-4">Please try again later.</p>
        </div>
      ) : noDataFound ? (
        <div className="text-center text-muted-foreground py-8 font-medium">
          No transactions found for the selected criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex justify-between items-center p-4 border-l-2 shadow-md transition-transform duration-300 hover:scale-[1.01] ${transaction.type === 'income'
                  ? 'bg-card border-[#00799c]'
                  : 'bg-card border-[#b11107]'
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center shadow-md ${transaction.type === 'income'
                      ? 'bg-[#e0f3f7] text-[#00799c]'
                      : 'bg-[#fce8e7] text-[#b11107]'
                    }`}
                  style={{ fontSize: '1.25rem' }}
                >
                  <i
                    className={`leading-0 fi ${transaction.type === 'income'
                        ? 'fi-rr-arrow-trend-up'
                        : 'fi-rr-arrow-trend-down'
                      }`}
                  ></i>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {transaction.description}
                  </span>
                </div>
              </div>

              <div
                className={`text-sm font-semibold ${transaction.amount < 0 ? 'text-[#b11107]' : 'text-[#00799c]'
                  }`}
              >
                €{Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}