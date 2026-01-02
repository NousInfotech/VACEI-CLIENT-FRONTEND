import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
    //output: 'standalone', // Change from 'export' to 'standalone'
    pageExtensions: ['ts', 'tsx'],
    eslint: {
      ignoreDuringBuilds: true, // Ignore ESLint errors during the build process
      
  },
   async rewrites() {
    return [
        {
            source: '/dashboard/todo-list',
            destination: '/dashboard/todo-list'
        },
        {
            source: '/dashboard/financial-statements',
            destination: '/dashboard/financial-statements'
        },
        {
            source: '/dashboard/insights',
            destination: '/dashboard/insights'
        },
        {
            source: '/dashboard/transaction-requests',
            destination: '/dashboard/transaction-requests'
        },
        {
            source: '/dashboard/change-in-bank-balances',
            destination: '/dashboard/change-in-bank-balances'
        },
        {
            source: '/dashboard/cash',
            destination: '/dashboard/cash'
        },
        {
            source: '/dashboard/cash/accounts',
            destination: '/dashboard/cash/accounts'
        },
        {
            source: '/dashboard/cash/change-in-cash',
            destination: '/dashboard/cash/change-in-cash'
        },
        {
            source: '/dashboard/bank-transactions',
            destination: '/dashboard/bank-transactions'
        },
        {
            source: '/dashboard/tax',
            destination: '/dashboard/tax'
        },
        {
            source: '/dashboard/document-organizer',
            destination: '/dashboard/document-organizer'
        },
        {
            source: '/dashboard/settings',
            destination: '/dashboard/settings'
        },
    ]
},
};

export default nextConfig;
