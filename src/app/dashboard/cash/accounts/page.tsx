'use client';

import { useEffect, useState } from "react";
import TotalBalanceChart from '@/components/TotalBalanceChart';
import { useRouter } from 'next/navigation';

export default function Accounts() {
    const router = useRouter();
    const [banks, setBanks] = useState([]);
    const [creditCards, setCreditCards] = useState([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

            try {
                const res = await fetch(`${backendUrl}account/getBankData`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                const accounts = data.accounts || [];
                const masterCurrentBalance = data.masterCurrentBalance || 0;

                const bankAccounts = accounts.filter(
                    (acc: any) => acc.accountType === 'Bank' && acc.active
                );

                const creditCardAccounts = accounts.filter(
                    (acc: any) => acc.accountType === 'Credit Card' && acc.active
                );

                setBanks(bankAccounts);
                setCreditCards(creditCardAccounts);
                setTotalBalance(masterCurrentBalance);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleViewAll = () => {
        router.push('/dashboard/cash/accounts/all-accounts');  // Replace with your accounts page route
    };
    // Simple skeleton loader component for list items
    const SkeletonItem = () => (
        <li className="animate-pulse flex justify-between py-3">
            <div className="flex items-center gap-2">
                <div className="bg-gray-300 rounded w-10 h-10"></div>
                <div className="space-y-2">
                    <div className="bg-gray-300 rounded h-4 w-24 mb-1"></div>
                    <div className="bg-gray-300 rounded h-3 w-16"></div>
                </div>
            </div>
            <div className="bg-gray-300 rounded h-5 w-16"></div>
        </li>
    );

    // Skeleton for total balance number
    const SkeletonBalance = () => (
        <div className="bg-gray-300 animate-pulse rounded h-8 w-32"></div>
    );

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-black capitalize font-medium">Accounts</h1>

                <div className="flex lg:flex-row flex-col gap-5 mt-3">
                    <div className="flex-2/5 bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md h-max">
                        <div className="flex flex-col space-y-1 mb-2">
                            <h2 className="text-xl leading-normal text-black capitalize font-medium">My Accounts</h2>
                        </div>
                        <hr className="border-t border-gray-200 mb-3" />

                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-semibold text-sky-800">Total Balance</h3>
                            {loading ? (
                                <SkeletonBalance />
                            ) : (
                                <span className="text-xl font-semibold text-green-600">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'EUR',
                                    }).format(totalBalance)}
                                </span>
                            )}
                        </div>

                        <hr className="my-3 border-t border-gray-200" />

                        {/* Bank Accounts */}
                        <div>
                            <h3 className="text-sm font-medium text-black mb-3">Bank Accounts</h3>
                            <ul className="space-y-2">
                                {loading
                                    ? Array(3).fill(null).map((_, i) => <SkeletonItem key={i} />)
                                    : banks.map((bank: any) => (
                                        <li key={bank.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="icon flex align-middle border px-3 border-gray-300 py-2 rounded leading-0">
                                                    <i className="fi fi-rr-bank text-gray-600 text-xl"></i>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{bank.name}</p>
                                                    <p className="text-xs text-gray-400">Updated recently</p>
                                                </div>
                                            </div>
                                            <span className="text-base font-semibold text-primary">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                }).format(bank.currentBalance ?? 0)}
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        
                        <hr className="my-3 border-t border-gray-200" />

                        {/* Credit Cards */}
                        <div>
                            <h3 className="text-sm font-medium text-black">Credit Cards</h3>
                            <ul className="space-y-2">
                                {loading
                                    ? Array(2).fill(null).map((_, i) => <SkeletonItem key={i} />)
                                    : creditCards.map((card: any) => (
                                        <li key={card.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="icon flex align-middle border px-3 border-gray-300 py-2 rounded leading-0">
                                                    <i className="fi fi-rr-credit-card text-gray-600 text-xl"></i>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{card.name}</p>
                                                    <p className="text-xs text-gray-400">Updated recently</p>
                                                </div>
                                            </div>
                                            <span className="text-base font-semibold text-primary">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                }).format((card.currentBalance ?? 0).toLocaleString())}

                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex-3/5">
                        <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md mb-5">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl leading-normal text-black capitalize font-medium">Accounts</h2>
                                <button
                                    onClick={handleViewAll}
                                    className="px-4 py-2 rounded-md transition-colors cursor-pointer bg-sky-700 text-white hover:bg-sky-800"
                                >
                                    View All Accounts
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
                            <div className="flex justify-between mb-3">
                                <h3 className="text-xl leading-normal text-black capitalize font-medium">Total Balance</h3>
                                <div className="text-end flex items-center gap-3">
                                    {loading ? (
                                        <SkeletonBalance />
                                    ) : (
                                        <>
                                            <span className="text-xl block font-semibold">

                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'EUR',
                                                }).format(totalBalance)}
                                            </span>
                                            <span className="h-fit items-end px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-700 text-white">
                                                Estimated
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <hr className="my-3 border-t border-gray-100" />
                            {!loading && <TotalBalanceChart />}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
