'use client';

import { useRouter } from 'next/navigation';
import TopTransactions from "./components/TopTransactions";

export default function BankTransactions() {
    const router = useRouter();

    const handleViewAllClick = () => {
        router.push('/dashboard/bank-transactions/view-all');
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-black capitalize font-medium">Bank Transactions</h1>

                <div className="bg-white border border-blue-200/50 rounded-[16px] p-4 shadow-sm w-full mx-auto transition-all duration-300 hover:shadow-md mt-5">

                    <div className="mt-4">
                        <TopTransactions />
                    </div>
                </div>
            </div>
        </section>
    );
}
