'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardCard from "@/components/DashboardCard";

export default function TaxPage() {
    const [company, setCompany] = useState<any>(null);
    const [taxData, setTaxData] = useState<any>(null);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [loadingTax, setLoadingTax] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const { mockGetCompany } = await import('@/api/mockApiService');
                const data = await mockGetCompany();
                setCompany(data);
            } catch (error) {
                console.error("Company fetch error:", error);
            } finally {
                setLoadingCompany(false);
            }
        };

        const fetchTaxData = async () => {
            try {
                const { mockGetTaxData } = await import('@/api/mockApiService');
                const data = await mockGetTaxData();
                setTaxData(data);
            } catch (error) {
                console.error("Tax fetch error:", error);
            } finally {
                setLoadingTax(false);
            }
        };

        fetchCompany();
        fetchTaxData();
    }, []);

    // Styled render for Tax Agencies
    const renderTaxAgencies = (items: any[]) => (
        <DashboardCard className="p-4 mb-5">
            <h3 className="text-xl leading-normal text-brand-body capitalize font-medium mb-4">Tax Agencies</h3>
            <ul className="list-disc ml-5 space-y-2">
                {items.map((agency) => (
                    <li key={agency.Id} className="text-gray-800">
                        <span className="font-semibold">{agency.DisplayName}</span>
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );

    // Styled render for Tax Rates
    const renderTaxRates = (items: any[]) => (
        <DashboardCard className="p-4 mb-5">
            <h3 className="text-xl leading-normal text-brand-body capitalize font-medium mb-4">Tax Rates</h3>
            <ul className="list-disc ml-5 space-y-2">
                {items.map((rate) => (
                    <li key={rate.Id} className="text-gray-800 font-semibold">
                        {rate.Name} : {rate.RateValue}%
                    </li>
                ))}
            </ul>
        </DashboardCard>
    );

    // Extract data from taxData
    const taxAgencyItems =
        taxData?.find((d: any) => d.entityType === "TaxAgency")?.jsonData?.TaxAgency || [];
    const taxRateItems =
        taxData?.find((d: any) => d.entityType === "TaxRate")?.jsonData?.TaxRate || [];

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <DashboardCard className="p-4">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium mb-4">Tax</h1>

                <DashboardCard className="p-4 mb-3">
                    <div className="flex gap-4 items-center">
                        <div className="image">
                            <Image src="/tax.svg" alt="Recurring Expenses" width={120} height={120} />
                        </div>
                        <div className="content">
                            <h2 className="text-xl leading-normal text-brand-body capitalize font-semibold mb-2">Let's keep working on your taxes</h2>
                            <p className="text-muted-foreground text-sm">Please review and complete the sections listed below.</p>
                        </div>
                    </div>
                </DashboardCard>

                <div className="flex lg:flex-row flex-col gap-5">
                    {/* Tax Profile */}
                    <DashboardCard className="flex-4/5 p-4 mb-5 h-max">
                        <div className="flex gap-4 justify-between items-center">
                            <div>
                                <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">Tax Related Data</h2>
                            </div>
                        </div>

                        <div className="mt-5">
                            {loadingTax ? (
                                <p className="text-muted-foreground text-sm">Loading tax data...</p>
                            ) : taxData ? (
                                <>
                                    {renderTaxAgencies(taxAgencyItems)}
                                    {renderTaxRates(taxRateItems)}
                                </>
                            ) : (
                                <p className="text-muted-foreground text-sm">No tax data found.</p>
                            )}
                        </div>
                    </DashboardCard>

                    {/* Contact Info */}
                    <DashboardCard className="flex-1/5 p-4 mb-5 h-max">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">Contact Info</h2>
                            <p className="text-xs text-rose-800 font-medium">Current</p>
                        </div>
                        <hr className="my-2 border-border" />

                        {loadingCompany ? (
                            <div className="animate-pulse space-y-3">
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                                </div>
                            </div>
                        ) : company ? (
                            <div className="flex flex-col gap-2 leading-4 text-sm">
                                <p className="text-brand-body mb-0 semibold">Company Name</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.companyName || '—'}</p>

                                <p className="text-brand-body mb-0 semibold">Legal Name</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.legalName || '—'}</p>

                                <p className="text-brand-body mb-0 semibold">Email</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.email || '—'}</p>

                                <p className="text-brand-body mb-0 semibold">Address</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.address || '—'}</p>

                                <p className="text-brand-body mb-0 semibold">Start Date</p>
                                <p className="font-bold">{company.simplifiedProfile?.startDate || '—'}</p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No company data found.</p>
                        )}
                    </DashboardCard>
                </div>
            </DashboardCard>
        </section>
    );
}