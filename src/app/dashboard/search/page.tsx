'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { search } from '@/api/searchService';
import Link from 'next/link';
import { SearchResponse, SearchResultItem } from '@/interfaces/index';

const RESULTS_PER_PAGE = 10;
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Helper function to get an icon based on type (using simple SVG for example)
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Task':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'Document':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25m-4.5-4.5h5.25" />
        </svg>
      );
    case 'Meeting':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
        </svg>
      );
    default:
      return null;
  }
};

// Skeleton loading component for a single search result item
const SearchResultSkeleton = () => (
  <li className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 animate-pulse">
    <div className="p-3 -m-3 rounded-md">
      <div className="flex items-center justify-between mb-1">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
    </div>
  </li>
);

function SearchContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [page, setPage] = useState(1);
  const [apiResults, setApiResults] = useState<SearchResultItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  useEffect(() => {
    setPage(1); // Reset page when query changes
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setApiResults([]);
      setTotalCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    if (!token) {
      setApiResults([]);
      setTotalCount(0);
      setLoading(false);
      setError('Authentication token missing. Please log in.');
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response: SearchResponse = await search(searchQuery, backendUrl, token, page, RESULTS_PER_PAGE);

        if (!response.success) {
          throw new Error(response.message || 'Search failed');
        }

        setApiResults(response.data || []);
        setTotalCount(response.totalCount || 0);

      } catch (err: any) {
        console.error('Search failed:', err);
        setError(err.message || 'Failed to fetch search results.');
        setApiResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, backendUrl, token, page]);

  const totalPages = Math.ceil(totalCount / RESULTS_PER_PAGE);

  return (
    <section className="mx-auto max-w-[1400px] w-full pt-5">
      <div className="bg-card border border-border rounded-[10px] px-5 py-6 overflow-hidden">
        <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">
          Search Results
          {searchQuery && (
            <span className="text-xl font-normal text-muted-foreground ml-3">
              for "{searchQuery}"
            </span>
          )}
        </h1>

        <div className="bg-card border border-border rounded-[10px] shadow-md overflow-hidden p-6">
          {loading ? (
            // Render skeleton loaders when loading is true
            <ul>
              {[...Array(RESULTS_PER_PAGE)].map((_, index) => (
                <SearchResultSkeleton key={index} />
              ))}
            </ul>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p className="text-lg font-medium">{error}</p>
            </div>
          ) : apiResults.length > 0 ? (
            <ul>
              {apiResults.map((result: SearchResultItem) => (
                <li key={result.id} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <Link
                    href={result.link}
                    className="block p-3 -m-3 rounded-md hover:bg-brand-body focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-medium text-gray-800">{result.title}</h2>
                        {result.type && (
                          <span className="flex items-center text-xs font-semibold text-brand-body bg-brand-muted px-3 py-1 rounded-full uppercase">
                            {getTypeIcon(result.type)}
                            {result.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
                      {result.type === 'Task' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Status:</span> {result.status} | <span className="font-medium">Category:</span> {result.category} | <span className="font-medium">Created By:</span> {result.createdBy}
                        </p>
                      )}
                      {result.type === 'Document' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Uploaded By:</span> {result.uploadedBy} | <span className="font-medium">Status:</span> {result.status} | <span className="font-medium">Year:</span> {result.year}
                        </p>
                      )}
                      {result.type === 'Meeting' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Client:</span> {result.client} | <span className="font-medium">Accountant:</span> {result.accountant} | <span className="font-medium">Time:</span> {new Date(result.startTime!).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p className="text-lg font-medium">No results found</p>
              {searchQuery ? (
                <p className="text-sm text-muted-foreground">for "{searchQuery}".</p>
              ) : (
                <p className="text-sm text-muted-foreground">Use "?q=yourquery" in the URL to search.</p>
              )}
            </div>
          )}

          {totalPages > 1 && !loading && ( // Only show pagination if not loading
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-brand-body bg-card hover:bg-brand-body disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-brand-body bg-card hover:bg-brand-body disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading Search Results...</div>}>
      <SearchContent />
    </Suspense>
  );
}