"use client"

import React, { useState } from 'react'
import { 
  User, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  Edit, 
  Trash2,
  Building2,
  Globe,
  Mail,
  Phone
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card2"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PillTabs from '../shared/PillTabs'
import { Company } from '@/api/auditService'

const Involvements = ({data}: {data: Company}) => {
  const [activeSubTab, setActiveSubTab] = useState<'shareholders' | 'representatives'>('shareholders')

  const tabs = [
    { id: 'shareholders', label: 'Shareholders', icon: User },
    { id: 'representatives', label: 'Representatives', icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PillTabs 
        tabs={tabs} 
        activeTab={activeSubTab} 
        onTabChange={(id: any) => setActiveSubTab(id)} 
      />

      <div className="mt-4">
        {activeSubTab === 'shareholders' ? (
          <div className="grid grid-cols-1 gap-4">
            {(() => {
                const shareholders = data.involvements?.filter(inv => 
                    inv.role.includes('SHAREHOLDER') || 
                    ((inv.classA || 0) + (inv.classB || 0) + (inv.classC || 0) + (inv.ordinary || 0) > 0)
                ) || [];
                
                if (shareholders.length === 0) {
                    return (
                        <div className="text-center py-8 text-gray-500">
                          <p>No shareholders found.</p>
                        </div>
                    );
                }

                return shareholders.map((inv, idx) => {
                    const totalShares = (inv.classA || 0) + (inv.classB || 0) + (inv.classC || 0) + (inv.ordinary || 0);
                    const isCompany = !!inv.holderCompany;
                    const party = inv.person || inv.holderCompany;

                    return (
                        <Card
                        key={inv.id || `sh-${idx}`}
                        className="bg-white/80 border border-indigo-100 rounded-0 shadow-sm hover:bg-white/70 transition-all"
                        >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-0 flex items-center justify-center ${isCompany ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {isCompany ? <Building2 size={20} /> : <User size={20} />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                        {party?.name}
                                    </h4>
                                    {isCompany && <p className="text-[10px] text-gray-400 font-mono">Reg: {inv.holderCompany?.registrationNumber}</p>}
                                </div>
                                </div>
                                
                                <div className="mb-4 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {(inv.classA || 0) > 0 && (
                                        <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-0 px-3 py-1 flex flex-col items-center">
                                            <span className="text-sm font-medium">Class A: {(inv.classA || 0).toLocaleString()}</span>
                                            {inv.classAPaidUpPercentage != null && (
                                                <span className="text-[11px] border border-blue-300 rounded-md px-2 py-0.5 text-blue-500 font-bold">{inv.classAPaidUpPercentage}% Paid</span>
                                            )}
                                        </div>
                                    )}
                                    {(inv.classB || 0) > 0 && (
                                        <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-0 px-3 py-1 flex flex-col items-center">
                                            <span className="text-sm font-medium">Class B: {(inv.classB || 0).toLocaleString()}</span>
                                            {inv.classBPaidUpPercentage != null && (
                                                <span className="text-[11px] border border-blue-300 rounded-md px-2 py-0.5 text-blue-500 font-bold">{inv.classBPaidUpPercentage}% Paid</span>
                                            )}
                                        </div>
                                    )}
                                    {(inv.classC || 0) > 0 && (
                                        <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-0 px-3 py-1 flex flex-col items-center">
                                            <span className="text-sm font-medium">Class C: {(inv.classC || 0).toLocaleString()}</span>
                                            {inv.classCPaidUpPercentage != null && (
                                                <span className="text-[11px] border border-blue-300 rounded-md px-2 py-0.5 text-blue-500 font-bold">{inv.classCPaidUpPercentage}% Paid</span>
                                            )}
                                        </div>
                                    )}
                                    {(inv.ordinary || 0) > 0 && (
                                        <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-0 px-3 py-1 flex flex-col items-center">
                                            <span className="text-sm font-medium">Ordinary: {(inv.ordinary || 0).toLocaleString()}</span>
                                            {inv.ordinaryPaidUpPercentage != null && (
                                                <span className="text-[11px] border border-blue-300 rounded-md px-2 py-0.5 text-blue-500 font-bold">{inv.ordinaryPaidUpPercentage}% Paid</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 rounded-lg px-3 py-1 text-sm font-semibold"
                                    >
                                    Total: {totalShares.toLocaleString()}
                                    </Badge>

                                    <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 rounded-lg px-3 py-1 text-sm font-semibold"
                                    >
                                    Share: {(data.issuedShares > 0 ? (totalShares / data.issuedShares) * 100 : 0).toFixed(2)}%
                                    </Badge>
                                </div>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span>{party?.address}</span>
                                </div>
                                {!isCompany && inv.person?.nationality && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Globe className="h-3 w-3" />
                                    <span>{inv.person.nationality}</span>
                                    </div>
                                )}
                                {!isCompany && inv.person?.email && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    <span>{inv.person.email}</span>
                                    </div>
                                )}
                                {!isCompany && inv.person?.phone && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Phone className="h-3 w-3" />
                                    <span>{inv.person.phone}</span>
                                    </div>
                                )}
                                </div>
                            </div>
                            </div>
                        </CardContent>
                        </Card>
                    );
                });
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {(() => {
                const representatives = data.involvements?.filter(inv => inv.role.some(r => r !== 'SHAREHOLDER')) || [];

                if (representatives.length === 0) {
                    return (
                        <div className="text-center py-8 text-gray-500">
                          <p>No representatives found.</p>
                        </div>
                    );
                }

                return representatives.map((inv, idx) => {
                    const isCompany = !!inv.holderCompany;
                    const party = inv.person || inv.holderCompany;

                    return (
                        <Card
                        key={inv.id || `rep-${idx}`}
                        className="bg-white/80 border border-indigo-100 rounded-xl shadow-sm hover:bg-white/70 transition-all"
                        >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompany ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {isCompany ? <Building2 size={20} /> : <ShieldCheck size={20} />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                        {party?.name}
                                    </h4>
                                    {isCompany && <p className="text-[10px] text-gray-400 font-mono">Reg: {inv.holderCompany?.registrationNumber}</p>}
                                </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                {inv.role
                                    .filter(role => role !== 'SHAREHOLDER')
                                    .map((role, rIdx) => (
                                    <Badge 
                                        key={rIdx} 
                                        variant="outline"
                                        className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-0 px-3 py-1 text-sm font-medium flex items-center gap-1"
                                    >
                                        {role.replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                                </div>

                                <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span>{party?.address}</span>
                                </div>
                                {!isCompany && inv.person?.nationality && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Globe className="h-3 w-3" />
                                    <span>{inv.person.nationality}</span>
                                    </div>
                                )}
                                {!isCompany && inv.person?.email && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    <span>{inv.person.email}</span>
                                    </div>
                                )}
                                {!isCompany && inv.person?.phone && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Phone className="h-3 w-3" />
                                    <span>{inv.person.phone}</span>
                                    </div>
                                )}
                                </div>
                            </div>
                            </div>
                        </CardContent>
                        </Card>
                    );
                });
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default Involvements