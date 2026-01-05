'use client';

import { useEffect, useState } from "react";
import Image from "next/image";

export default function TaxPage() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const [company, setCompany] = useState<any>(null);
    const [taxData, setTaxData] = useState<any>(null);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [loadingTax, setLoadingTax] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token") || "";

        const fetchCompany = async () => {
            try {
                const res = await fetch(`${backendUrl}company`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Failed to fetch company`);
                const data = await res.json();
                setCompany(data);
            } catch (error) {
                console.error("Company fetch error:", error);
            } finally {
                setLoadingCompany(false);
            }
        };

        const fetchTaxData = async () => {
            try {
                const res = await fetch(`${backendUrl}tax`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Failed to fetch tax data`);
                const data = await res.json();
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
        <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md mb-5">
            <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">Tax Agencies</h3>
            <ul className="list-disc ml-5 space-y-2">
                {items.map((agency) => (
                    <li key={agency.Id} className="rounded bg-brand-body">
                        <p><span className="font-semibold"> {agency.DisplayName}</span></p>

                    </li>
                ))}
            </ul>
        </div>
    );

    // Styled render for Tax Rates
    const renderTaxRates = (items: any[]) => (
        <div className="bg-card shadow p-5 rounded mb-5">
            <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">Tax Rates</h3>
            <ul className="list-disc ml-5 space-y-1">
                {items.map((rate) => (
                    <li key={rate.Id} className="text-gray-800 font-semibold">
                        {rate.Name} : {rate.RateValue}%
                    </li>
                ))}
            </ul>
        </div>
    );

    // Extract data from taxData
    const taxAgencyItems =
        taxData?.find((d: any) => d.entityType === "TaxAgency")?.jsonData?.TaxAgency || [];
    const taxRateItems =
        taxData?.find((d: any) => d.entityType === "TaxRate")?.jsonData?.TaxRate || [];

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">Tax</h1>

                <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto mt-2 transition-all duration-300 hover:shadow-md mb-3">
                    <div className="flex gap-4 items-center">
                        <div className="image">
                            <Image src="/tax.svg" alt="Recurring Expenses" width={120} height={120} />
                        </div>
                        <div className="content">
                            <h2 className="text-xl leading-normal text-brand-body capitalize font-semibold mb-2">Let's keep working on your taxes</h2>
                            <p>Please review and complete the sections listed below.</p>
                        </div>
                    </div>
                </div>

                <div className="flex lg:flex-row flex-col gap-5">
                    {/* Tax Profile */}
                    <div className="flex-4/5 bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto mt-2 transition-all duration-300 hover:shadow-md mb-5 h-max">
                        <div className="flex gap-4 justify-between items-center">
                            <div>
                                <h2 className="text-xl leading-normal text-brand-body capitalize font-medium">Tax Related Data</h2>

                            </div>
                            {/*  <button className="bg-primary h-max text-card-foreground px-3 py-1.5 hover:bg-dark-primary hover:text-card-foreground transition-all duration-200">
                Continue Working
              </button> */}
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
                                // Changed text-red-500 to text-muted-foreground for "No tax data found."
                                <p className="text-muted-foreground text-sm">No tax data found.</p>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1/5 bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto mt-2 transition-all duration-300 hover:shadow-md mb-5 h-max">
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
                            <div className="flex flex-col gap-2 leading-4">
                                <p className="text-brand-body mb-0">Company Name</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.companyName || '—'}</p>

                                <p className="text-brand-body mb-0">Legal Name</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.legalName || '—'}</p>

                                <p className="text-brand-body mb-0">Email</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.email || '—'}</p>

                                <p className="text-brand-body mb-0">Address</p>
                                <p className="font-bold mb-2">{company.simplifiedProfile?.address || '—'}</p>

                                <p className="text-brand-body mb-0">Start Date</p>
                                <p className="font-bold">{company.simplifiedProfile?.startDate || '—'}</p>
                            </div>
                        ) : (
                            // Changed text-red-500 to text-muted-foreground for "No company data found."
                            <p className="text-muted-foreground text-sm">No company data found.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}