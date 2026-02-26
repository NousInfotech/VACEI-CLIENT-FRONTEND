"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import DashboardCard from "@/components/DashboardCard";
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

interface Company {
    id: string;
    name: string;
    registrationNumber?: string;
    overdueCount?: number;
    dueTodayCount?: number;
    dueSoonCount?: number;
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

                if (response.ok) {
                    const result = await response.json();
                    const data = result.data || result || [];
                    setCompanies(data.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        registrationNumber: c.registrationNumber,
                        overdueCount: c.overdueComplianceCount || 0,
                        dueTodayCount: c.dueTodayComplianceCount || 0,
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
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100 text-center">Overdue</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100 text-center">Due Today</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100 text-center">Due Soon</TableHead>
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
                                    <span className={`text-sm font-bold ${company.overdueCount && company.overdueCount > 0 ? "text-destructive" : "text-gray-300"}`}>
                                        {company.overdueCount || 0}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center border border-gray-100">
                                    <span className={`text-sm font-bold ${company.dueTodayCount && company.dueTodayCount > 0 ? "text-warning" : "text-gray-300"}`}>
                                        {company.dueTodayCount || 0}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center border border-gray-100">
                                    <span className={`text-sm font-bold ${company.dueSoonCount && company.dueSoonCount > 0 ? "text-warning" : "text-gray-300"}`}>
                                        {company.dueSoonCount || 0}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right border border-gray-100">
                                    <Button
                                        size="sm"
                                        className="rounded-xl h-9"
                                        onClick={() => {
                                            setActiveCompanyId(company.id);
                                            router.push(`/dashboard`);
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCompanies.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-gray-300 italic font-medium border border-gray-100">
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
