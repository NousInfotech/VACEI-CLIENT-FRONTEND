'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { search } from '@/api/searchService';
import Link from 'next/link';
import { SearchResponse, SearchResultItem } from '@/interfaces/index';
import { menuData, MenuItem } from '@/lib/menuData';

const RESULTS_PER_PAGE = 10;
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/?$/, "/") || 'http://localhost:5000/';

// Function to recursively flatten menu items into search index
const flattenMenuItems = (items: MenuItem[], parentLabel?: string): SearchResultItem[] => {
  const results: SearchResultItem[] = [];
  
  for (const item of items) {
    // Skip items without valid hrefs
    if (!item.href || item.href === '#' || item.href.startsWith('#')) {
      // Still process children even if parent has no href
      if (item.children && item.children.length > 0) {
        results.push(...flattenMenuItems(item.children, item.label));
      }
      continue;
    }
    
    // Determine type based on href pattern
    let type: 'Service' | 'Page' = 'Page';
    if (item.href.includes('/services/')) {
      type = 'Service';
    }
    
    // Create search result item
    const searchItem: SearchResultItem = {
      id: item.slug || item.href,
      title: item.label,
      description: item.description || `${item.label}${parentLabel ? ` - ${parentLabel}` : ''}`,
      type: type,
      link: item.href,
      category: parentLabel || (type === 'Service' ? 'Service' : 'Page'),
      status: item.isActive ? 'Available' : undefined
    };
    
    results.push(searchItem);
    
    // Recursively process children
    if (item.children && item.children.length > 0) {
      results.push(...flattenMenuItems(item.children, item.label));
    }
  }
  
  return results;
};

// Additional manual entries for specific services/pages not in menu (e.g., dynamic routes)
const additionalSearchItems: SearchResultItem[] = [
  {
    id: 'share-transfer-mbr',
    title: 'Share Transfer',
    description: 'Transfer shares between shareholders - MBR Filing service',
    type: 'Service',
    link: '/dashboard/services/mbr-filing/share_transfer',
    category: 'MBR Filing',
    status: 'Available'
  },
  {
    id: 'share-transfer-request',
    title: 'Share Transfer Request',
    description: 'Submit a share transfer request form',
    type: 'Service',
    link: '/dashboard/services/mbr-filing/share_transfer/request',
    category: 'MBR Filing',
    status: 'Available'
  },
  {
    id: 'liquidation',
    title: 'Liquidation',
    description: 'Liquidation and wind-down services',
    type: 'Service',
    link: '/dashboard/liquidation',
    category: 'Corporate',
    status: 'Available'
  }
];

// Build client-side search index from menu data + additional items
// This ensures ALL menu items are searchable automatically
const buildClientSideSearchIndex = (): SearchResultItem[] => {
  const menuItems = flattenMenuItems(menuData);
  // Combine menu items with additional items, removing duplicates by link
  const allItems = [...menuItems, ...additionalSearchItems];
  const uniqueItems = allItems.filter((item, index, self) =>
    index === self.findIndex((t) => t.link === item.link)
  );
  return uniqueItems;
};

// Client-side search index - built from menu data
const clientSideSearchIndex: SearchResultItem[] = buildClientSideSearchIndex();

// Client-side search function
const searchClientSide = (query: string): SearchResultItem[] => {
  if (!query || query.trim().length === 0) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0);
  
  if (queryWords.length === 0) return [];
  
  const results = clientSideSearchIndex.filter(item => {
    const searchableText = `${item.title} ${item.description} ${item.category} ${item.type}`.toLowerCase();
    
    // Check if all query words match (all words must be present)
    // Also check if the full query phrase matches for better results
    const fullQueryMatch = searchableText.includes(lowerQuery);
    const allWordsMatch = queryWords.every(word => searchableText.includes(word));
    
    return fullQueryMatch || allWordsMatch;
  });
  
  // Sort results: exact phrase matches first, then word matches
  return results.sort((a, b) => {
    const aText = `${a.title} ${a.description}`.toLowerCase();
    const bText = `${b.title} ${b.description}`.toLowerCase();
    const aExact = aText.includes(lowerQuery);
    const bExact = bText.includes(lowerQuery);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });
};

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
    case 'Service':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      );
    case 'Page':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
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
  const [clientResults, setClientResults] = useState<SearchResultItem[]>([]);
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
      setClientResults([]);
      setTotalCount(0);
      setError(null);
      setLoading(false);
      return;
    }

    // Always perform client-side search FIRST
    const clientSideResults = searchClientSide(searchQuery);
    
    // Set client results immediately
    setClientResults(clientSideResults);
    setTotalCount(clientSideResults.length); // Set initial count

    if (!token) {
      setApiResults([]);
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
          // If API fails, still show client-side results
          setApiResults([]);
          setError(null); // Don't show error if we have client-side results
          return;
        }

        const results = response.data || [];
        const apiCount = response.totalCount || results.length;
        
        // Separate API and client results for display
        // Remove client-side results that duplicate API results
        const apiResultLinks = new Set(results.map(r => r.link));
        const filteredClientResults = clientSideResults.filter(r => !apiResultLinks.has(r.link));
        
        setApiResults(results);
        setClientResults(filteredClientResults);
        setTotalCount(apiCount + filteredClientResults.length);

      } catch (err: any) {
        console.error('❌ Search failed with error:', err);
        // If API fails, still show client-side results
        setApiResults([]);
        setError(null); // Don't show error if we have client-side results
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
          ) : (apiResults.length > 0 || clientResults.length > 0) ? (
            <ul>
              {/* Show client-side results first (services/pages) */}
              {clientResults.map((result: SearchResultItem) => (
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
                      {result.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Category:</span> {result.category}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
              {/* Show API results (tasks, documents, meetings) */}
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
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm text-muted-foreground mt-2">for "{searchQuery}"</p>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Using different keywords or shorter search terms</li>
                  <li>Checking spelling</li>
                  <li>Searching for specific document types, tasks, or meetings</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p className="text-lg font-medium">Enter a search query</p>
              <p className="text-sm text-muted-foreground mt-2">Use the search bar above to find documents, tasks, or meetings</p>
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

import { ListSkeleton } from '@/components/shared/CommonSkeletons';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-7xl mx-auto">
        <ListSkeleton count={4} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}