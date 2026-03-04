// components/SettingsContent.jsx
'use client';

import { useEffect, useState,Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { useAlert } from '@/app/context/AlertContext';
import Image from 'next/image';
import { syncItems } from './components/syncItems'; // Assuming this defines your sync items
import { checkQuickbooksAuth, syncQuickbooksData } from '@/api/quickbooksApi'; // Import the new API functions
import { PageHeader } from '@/components/shared/PageHeader';

function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { setAlert } = useAlert();
    const [authenticated, setAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [lastAuthenticated, setLastAuthenticated] = useState<Date | null>(null);
    const [realmId, setRealmId] = useState<string | null>(null);

    // State for syncing buttons
    const [syncStatus, setSyncStatus] = useState({
        syncing: false,
        syncingCompany: false,
        syncingAccountsData: false,
        syncingCashFlowTrend: false,
        syncBankBalance: false,
        syncingRecurringExpenses: false,
        syncingInvoiceData: false,
        syncChartAccounts: false,
        syncingJournal: false,
        syncingTransaction: false,
        syncApArAging: false,
        syncingTax: false,
    });

    useEffect(() => {
        const error = searchParams.get('error');
        const connected = searchParams.get('connected');

        if (error) {
            try {
                setAlert({ message: decodeURIComponent(error), variant: 'danger' });
            } catch {
                setAlert({ message: 'An error occurred. Please try again later.', variant: 'danger' });
            }
        }

        const checkAuthentication = async () => {
            setIsCheckingAuth(true);
            try {
                const { mockCheckQuickbooksAuth } = await import('@/api/mockApiService');
                const { success, data } = await mockCheckQuickbooksAuth();

                if (success && data.isValid === true && data.intuitAccount?.updatedAt) {
                    localStorage.setItem('accessToken', data.intuitAccount.accessToken);
                    setAuthenticated(true);
                    setLastAuthenticated(new Date(data.intuitAccount.updatedAt));
                    setRealmId(data.intuitAccount.realmId || null);

                    if (connected === '1') {
                        // Remove 'connected' param and reload to prevent showing success on refresh
                        const url = new URL(window.location.href);
                        url.searchParams.delete('connected');
                        window.history.replaceState(null, '', url.toString());
                        window.location.reload();
                        return;
                    }
                } else {
                    setAuthenticated(false);
                    setLastAuthenticated(null);
                    setRealmId(null);
                    if (!success) {
                        setAlert({ message: 'QuickBooks authentication check failed', variant: 'danger' });
                    }
                }
            } catch (err) {
                setAlert({ message: 'An unexpected error occurred during authentication check.', variant: 'danger' });
                setAuthenticated(false);
                setLastAuthenticated(null);
                setRealmId(null);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuthentication();
    }, [searchParams]);

    const handleBookkeepingRedirect = () => {
        // Mock redirect - no actual backend URL needed
        console.log('QuickBooks redirect (mocked)');
    };

    // Generic sync handler
    const handleSync = async (
        endpoint: string,
        syncingKey: keyof typeof syncStatus,
        successMessage: string,
        failureMessage: string
    ) => {
        setSyncStatus(prev => ({ ...prev, [syncingKey]: true }));

        try {
            const { mockSyncQuickbooksData } = await import('@/api/mockApiService');
            const { success, data } = await mockSyncQuickbooksData(endpoint);

            if (success) {
                setAlert({ message: successMessage, variant: 'success' });
            } else {
                setAlert({ message: data?.message || failureMessage, variant: 'danger' });
            }
        } catch (err) {
            setAlert({ message: `An unexpected error occurred during ${failureMessage.toLowerCase()}`, variant: 'danger' });
        } finally {
            setSyncStatus(prev => ({ ...prev, [syncingKey]: false }));
        }
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-4">
            <PageHeader
                title="Quickbooks Sync"
                subtitle="Sync your financial data from QuickBooks to VACEI."
            />
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">

                {isCheckingAuth ? (
                    <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md mb-5">
                        <div className="flex gap-4 items-center">
                            <Image
                                src="/progress.gif"
                                alt="Checking authentication..."
                                width={100}
                                height={100}
                            />
                            <h2 className="text-xl font-bold text-green-700 mb-2">Checking authentication...</h2>
                        </div>
                    </div>
                ) : authenticated ? (
                    <>
                        <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md mb-4">
                            <div className="flex gap-4 justify-between items-center">
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-brand-body">
                                        Last authenticated:{' '}
                                        <span className="text-brand-body font-normal">
                                            {lastAuthenticated ? format(lastAuthenticated, "yyyy-MM-dd HH:mm:ss 'IST'") : 'N/A'}
                                        </span>
                                    </p>
                                    <p className="text-sm text-brand-body font-semibold">
                                        Realm ID: <span className="text-brand-body font-normal">{realmId || 'Unavailable'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* <div className="bg-card shadow p-5 h-max mb-4 flex justify-between items-center">
                            <p>
                                Your QuickBooks account is connected. You can re-authenticate at any time to refresh
                                the connection or update your account permissions.
                            </p>
                            <button
                                onClick={handleBookkeepingRedirect}
                                className="bg-primary h-max text-card-foreground px-3 py-1.5 hover:bg-dark-primary transition-all duration-200 cursor-pointer"
                                disabled={syncStatus.syncing}
                            >
                                Re-authenticate QuickBooks
                            </button>
                        </div>
                     */}
                        {syncItems.map(({ title, description, endpoint, syncingKey, successMsg, failureMsg }) => {
                            const syncingState = syncStatus[syncingKey];
                            return (
                                <div key={syncingKey} className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md h-max mb-4">
                                    <div className="flex gap-4 justify-between items-center">
                                        <div className="flex-4/5">
                                            <h2 className="text-xl font-semibold text-brand-body mb-1">{title}</h2>
                                            <p className="text-brand-body">{description}</p>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleSync(endpoint, syncingKey, successMsg, failureMsg)}
                                            className="bg-sidebar-background h-max text-sidebar-foreground px-4 py-1.5 hover:bg-sidebar-hover transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-full shadow-md"
                                            disabled={syncingState}
                                        >
                                            {syncingState ? 'Syncing...' : 'Sync'}
                                        </button>
                                    </div>
                                    {syncingState && (
                                        <div className="mt-4 space-y-2">
                                            <div className="w-full h-4 bg-gray-200 animate-pulse rounded-0"></div>
                                            <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded-0"></div>
                                            <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded-0"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <div className="bg-sidebar-background border border-green-800 border-s-6 rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                        <p className='text-green-800 font-medium'>
                            Once your account is synced you will be able to manually sync quickbooks items here.
                        </p>
                        {/* <button
                            onClick={handleBookkeepingRedirect}
                            className="bg-primary h-max text-card-foreground px-3 py-1.5 hover:bg-dark-primary transition-all duration-200 cursor-pointer"
                            disabled={syncStatus.syncing}
                        >
                            Authenticate QuickBooks
                        </button> */}
                    </div>
                )}

              

            </div>
        </section>
    );
}

export default function Settings() {
    return (
        <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsContent />
        </Suspense>
    );
}