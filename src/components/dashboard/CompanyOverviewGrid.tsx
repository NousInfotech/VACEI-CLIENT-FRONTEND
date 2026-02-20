"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/DashboardCard";
import { Building2, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Company {
    id: string;
    name: string;
    registrationNumber?: string;
    riskLevel?: "Low" | "Medium" | "High";
    overdueCount?: number;
    dueSoonCount?: number;
}

export default function CompanyOverviewGrid() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            try {
                const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
                const token = localStorage.getItem('token');
                
                const response = await fetch(`${backendUrl}companies`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const result = await response.json();
                    const data = result.data || result || [];
                    setCompanies(data.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        registrationNumber: c.registrationNumber,
                        riskLevel: "Low", // Mock risk level for now
                        overdueCount: c.overdueComplianceCount || 0,
                        dueSoonCount: c.dueSoonComplianceCount || 0
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch companies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <DashboardCard key={i} className="p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                    </DashboardCard>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
                <DashboardCard key={company.id} className="p-6 flex flex-col justify-between border-gray-200 shadow-sm bg-white">
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                <Building2 className="w-6 h-6 text-gray-900" />
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                company.riskLevel === "Low" ? "bg-success/10 text-success border-success/20" :
                                company.riskLevel === "Medium" ? "bg-warning/10 text-warning border-warning/20" :
                                "bg-destructive/10 text-destructive border-destructive/20"
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    company.riskLevel === "Low" ? "bg-success" :
                                    company.riskLevel === "Medium" ? "bg-warning" : "bg-destructive"
                                }`} />
                                {company.riskLevel} Risk
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                                {company.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                <span>Reg No:</span>
                                <span className="text-gray-900">{company.registrationNumber || "N/A"}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overdue</p>
                                <p className={`text-xl font-bold ${company.overdueCount && company.overdueCount > 0 ? "text-destructive" : "text-gray-300"}`}>
                                    {company.overdueCount || 0}
                                </p>
                            </div>
                            <div className="space-y-1 border-l border-gray-50 pl-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Soon</p>
                                <p className={`text-xl font-bold ${company.dueSoonCount && company.dueSoonCount > 0 ? "text-warning" : "text-gray-300"}`}>
                                    {company.dueSoonCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button 
                            className="w-full justify-between rounded-xl h-11"
                            onClick={() => {
                                localStorage.setItem("vacei-active-company", company.id);
                                router.push(`/dashboard`);
                            }}
                        >
                            View Company Dashboard
                            <ArrowRight size={16} />
                        </Button>
                    </div>
                </DashboardCard>
            ))}
        </div>
    );
}
