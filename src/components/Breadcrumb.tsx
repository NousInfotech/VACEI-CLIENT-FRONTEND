// components/Breadcrumb.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  href?: string;
  label: string;
}

export default function Breadcrumb() {
  const pathname = usePathname(); // current URL path, e.g. /dashboard/clients/123
  const segments = pathname.split('/').filter(Boolean); // remove empty segments

  // Helper to convert slug to readable label (e.g. 'clients' => 'Clients')
  const toLabel = (slug: string) =>
    slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Build breadcrumb items with hrefs
  const items: BreadcrumbItem[] = segments.map((segment, idx) => {
    // accumulate href parts
    const href = '/' + segments.slice(0, idx + 1).join('/');

    return {
      href,
      label: toLabel(segment),
    };
  });

  // Optionally, you can prepend a "Home" item manually:
  items.unshift({ href: '/', label: 'Home' });

  // Last item should not have href (current page)
  items[items.length - 1].href = undefined;

  return (
    <nav className="text-sm mb-3" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 text-gray-600">
        {items.map(({ href, label }, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="inline-flex items-center">
              {!isLast && href ? (
                <>
                  <Link href={href} className="hover:text-blue-600">
                    {label}
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                </>
              ) : (
                <span
                  className="text-gray-900 font-semibold"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
