"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import DashboardCard from "@/components/DashboardCard";
import { listComplianceCalendars } from "@/api/complianceCalendarService";
import { Building2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { listServiceRequests } from "@/api/serviceRequestService";
import { cn } from "@/lib/utils";

interface Company {
    id: string;
    name: string;
    registrationNumber?: string;
    overdueCount?: number;
    dueTodayCount?: number;
    dueSoonCount?: number;
    incorporationStatus?: boolean;
    kycStatus?: boolean;
    serviceRequestStatus?: string;
}

export default function CompanyListTable() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { setActiveCompanyId } = useActiveCompany();
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

                let serviceRequests: any[] = [];
                try {
                    const srRes = await listServiceRequests({ service: 'INCORPORATION' });
                    serviceRequests = srRes.data || srRes || [];
                } catch (srError) {
                    console.error("Failed to fetch service requests:", srError);
                }

                if (response.ok) {
                    const result = await response.json();
                    const data = result.data || result || [];
                    
                    setCompanies(data.map((c: any) => {
                        // Find the latest service request for this company
                        const sr = serviceRequests
                            .filter((r: any) => (r.companyId?._id || r.companyId?.id || r.companyId) === c.id)
                            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                        return {
                            id: c.id,
                            name: c.name,
                            registrationNumber: c.registrationNumber,
                            overdueCount: c.overdueComplianceCount || 0,
                            dueSoonCount: c.dueSoonComplianceCount || 0,
                            incorporationStatus: c.incorporationStatus ?? false,
                            kycStatus: c.kycStatus ?? false,
                            serviceRequestStatus: sr?.status || null
                        };
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch companies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardCard className="p-6 bg-white border-gray-200">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </DashboardCard>
        );
    }

    return (
        <DashboardCard className="overflow-hidden bg-white border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search companies..." 
                        className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <p className="text-sm text-gray-400 font-semibold uppercase tracking-widest">
                    Total: {filteredCompanies.length}
                </p>
            </div>

            <div className="overflow-x-auto">
                <Table className="border-collapse border border-gray-100">
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100">S.No</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100">Company Name</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100">Registration No</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100 text-center">Incorporated</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100 text-center">KYC</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCompanies.map((company, index) => (
                            <TableRow key={company.id} className="border-gray-100 hover:bg-transparent">
                                <TableCell className="text-xs font-bold text-gray-400 border border-gray-100">
                                    {(index + 1).toString().padStart(2, '0')}
                                </TableCell>
                                <TableCell className="font-bold text-gray-900 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        {company.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-semibold text-gray-600 border border-gray-100">
                                    {company.registrationNumber || "N/A"}
                                </TableCell>
                                <TableCell className="text-center border border-gray-100">
                                    <div className="flex justify-center">
                                        {company.incorporationStatus ? (
                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                                                Incorporated
                                            </span>
                                        ) : (
                                            <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-gray-100">
                                                Unincorporated
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center border border-gray-100">
                                    <div className="flex justify-center">
                                        {company.kycStatus ? (
                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-gray-100">
                                                Unverified
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right border border-gray-100">
                                    {company.incorporationStatus ? (
                                        <Button
                                            size="sm"
                                            className="rounded-xl h-9"
                                            onClick={() => {
                                                setActiveCompanyId(company.id);
                                                
                                                if (!company.kycStatus) {
                                                    // Rule: if incorporated but kyc pending -> go to kyc tab
                                                    // alert("Please complete KYC verification to access full features.");
                                                    router.push(`/global-dashboard/companies/${company.id}?tab=kyc&highlight=kyc`);
                                                } else {
                                                    // Both done -> normal View
                                                    router.push(`/global-dashboard/companies/${company.id}`);
                                                }
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="rounded-xl h-9 bg-primary"
                                            onClick={() => {
                                                setActiveCompanyId(company.id);
                                                // Rule: if incorporation pending -> go directly to incorporation tab
                                                router.push(`/global-dashboard/companies/${company.id}?tab=incorporation&highlight=incorporation`);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCompanies.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-gray-300 italic font-medium border border-gray-100">
                                    No companies found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DashboardCard>
    );
}
