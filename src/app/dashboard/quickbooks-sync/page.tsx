// components/SettingsContent.jsx
'use client';

import { useEffect, useState,Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import AlertMessage from '../../../components/AlertMessage';
import Image from 'next/image';
import { syncItems } from './components/syncItems'; // Assuming this defines your sync items
import { checkQuickbooksAuth, syncQuickbooksData } from '@/api/quickbooksApi'; // Import the new API functions

function SettingsContent() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const router = useRouter();
    const searchParams = useSearchParams();

    const [alert, setAlert] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
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
                setAlert({ text: decodeURIComponent(error), type: 'danger' });
            } catch {
                setAlert({ text: 'An error occurred. Please try again later.', type: 'danger' });
            }
        }

        const checkAuthentication = async () => {
            setIsCheckingAuth(true);
            setAlert(null); // Clear previous alerts
            try {
                const { success, data, error: authError } = await checkQuickbooksAuth(backendUrl);

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
                    if (authError) {
                        setAlert({ text: authError, type: 'danger' });
                    }
                }
            } catch (err) {
                setAlert({ text: 'An unexpected error occurred during authentication check.', type: 'danger' });
                setAuthenticated(false);
                setLastAuthenticated(null);
                setRealmId(null);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuthentication();
    }, [searchParams, backendUrl]);

    const handleBookkeepingRedirect = () => {
        router.push(backendUrl + 'quickbooks');
    };

    // Generic sync handler
    const handleSync = async (
        endpoint: string,
        syncingKey: keyof typeof syncStatus,
        successMessage: string,
        failureMessage: string
    ) => {
        setSyncStatus(prev => ({ ...prev, [syncingKey]: true }));
        setAlert(null);

        try {
            const { success, data, error: syncError } = await syncQuickbooksData(backendUrl, endpoint);

            if (success) {
                setAlert({ text: successMessage, type: 'success' });
            } else {
                setAlert({ text: data?.message || syncError || failureMessage, type: 'danger' });
            }
        } catch (err) {
            setAlert({ text: `An unexpected error occurred during ${failureMessage.toLowerCase()}`, type: 'danger' });
        } finally {
            setSyncStatus(prev => ({ ...prev, [syncingKey]: false }));
        }
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-black capitalize font-medium mb-3">Quickbooks Sync</h1>

                {alert && (
                    <AlertMessage
                        message={alert.text}
                        variant={alert.type}
                        onClose={() => setAlert(null)}
                    />
                )}

                {isCheckingAuth ? (
                    <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md mb-5">
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
                        <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md mb-4">
                            <div className="flex gap-4 justify-between items-center">
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-sky-800">
                                        Last authenticated:{' '}
                                        <span className="text-black font-normal">
                                            {lastAuthenticated ? format(lastAuthenticated, "yyyy-MM-dd HH:mm:ss 'IST'") : 'N/A'}
                                        </span>
                                    </p>
                                    <p className="text-sm text-sky-800 font-semibold">
                                        Realm ID: <span className="text-black font-normal">{realmId || 'Unavailable'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* <div className="bg-white shadow p-5 h-max mb-4 flex justify-between items-center">
                            <p>
                                Your QuickBooks account is connected. You can re-authenticate at any time to refresh
                                the connection or update your account permissions.
                            </p>
                            <button
                                onClick={handleBookkeepingRedirect}
                                className="bg-primary h-max text-white px-3 py-1.5 hover:bg-dark-primary transition-all duration-200 cursor-pointer"
                                disabled={syncStatus.syncing}
                            >
                                Re-authenticate QuickBooks
                            </button>
                        </div>
                     */}
                        {syncItems.map(({ title, description, endpoint, syncingKey, successMsg, failureMsg }) => {
                            const syncingState = syncStatus[syncingKey];
                            return (
                                <div key={syncingKey} className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md h-max mb-4">
                                    <div className="flex gap-4 justify-between items-center">
                                        <div className="flex-4/5">
                                            <h2 className="text-xl font-semibold text-sky-800 mb-1">{title}</h2>
                                            <p className="text-black">{description}</p>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleSync(endpoint, syncingKey, successMsg, failureMsg)}
                                            className="bg-green-800 h-max text-white px-4 py-1.5 hover:bg-green-900 transition-all duration-200 disabled:opacity-50 cursor-pointer rounded-full"
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
                    <div className="bg-green-50 border border-green-800 border-s-6 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
                        <p className='text-green-800 font-medium'>
                            Once your account is synced you will be able to manually sync quickbooks items here.
                        </p>
                        {/* <button
                            onClick={handleBookkeepingRedirect}
                            className="bg-primary h-max text-white px-3 py-1.5 hover:bg-dark-primary transition-all duration-200 cursor-pointer"
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