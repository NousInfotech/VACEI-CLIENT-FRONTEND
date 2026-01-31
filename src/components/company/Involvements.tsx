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
  Globe
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
            {(!data.shareHolders || data.shareHolders.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p>No shareholders found.</p>
              </div>
            ) : (
              data.shareHolders.map((sh, idx) => {
               const totalShares = sh.sharesData.reduce((acc, sd) => acc + sd.totalShares, 0)
               return (
                <Card
                  key={sh._id || `sh-${idx}`}
                  className="bg-white/80 border border-indigo-100 rounded-0 shadow-sm hover:bg-white/70 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-0 flex items-center justify-center text-blue-600">
                            <User size={20} />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 capitalize">
                            {sh.personId.name}
                          </h4>
                        </div>
                        
                        <div className="mb-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                          {sh.sharesData && sh.sharesData.length > 0 ? (
                            sh.sharesData.map((sd, sIdx) => (
                            <Badge
                              key={sIdx}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 rounded-0 px-3 py-1 text-sm font-medium"
                            >
                              {sd.class.length === 1 ? `Class ${sd.class}` : sd.class}: {sd.totalShares.toLocaleString()}
                            </Badge>
                            ))
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-600 border-gray-200 rounded-0 px-3 py-1 text-sm font-medium"
                            >
                              No shares assigned
                            </Badge>
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

                            {sh.paidUpSharesPercentage > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 border-purple-200 rounded-0 px-3 py-1 text-sm font-semibold"
                              >
                                Paid Up: {(sh.paidUpSharesPercentage || 0).toFixed(2)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{sh.personId.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Globe className="h-3 w-3" />
                            <span>{sh.personId.nationality}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
               )
            }))}

            {/* Corporate Shareholders */}
            {data.shareHoldingCompanies?.map((corp, idx) => {
               const totalShares = corp.sharesData.reduce((acc, sd) => acc + sd.totalShares, 0)
               return (
                <Card
                  key={corp._id || `corp-sh-${idx}`}
                  className="bg-white/80 border border-indigo-100 rounded-0 shadow-sm hover:bg-white/70 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-0 flex items-center justify-center text-indigo-600">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {corp.companyId.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-mono">Reg: {corp.companyId.registrationNumber}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4 space-y-3">
                          <div className="flex flex-wrap gap-2">
                          {corp.sharesData.map((sd, sIdx) => (
                            <Badge
                              key={sIdx}
                              variant="outline"
                              className="bg-indigo-50 text-indigo-700 border-indigo-200 rounded-0 px-3 py-1 text-sm font-medium"
                            >
                              {sd.class.length === 1 ? `Class ${sd.class}` : sd.class}: {sd.totalShares.toLocaleString()}
                            </Badge>
                          ))}
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

                            {(corp.paidUpSharesPercentage || 0) > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 border-purple-200 rounded-0 px-3 py-1 text-sm font-semibold"
                              >
                                Paid Up: {(corp.paidUpSharesPercentage || 0).toFixed(2)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
               )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.representationalSchema.map((rep, idx) => (
              <Card
                key={rep._id || `rep-${idx}`}
                className="bg-white/80 border border-indigo-100 rounded-xl shadow-sm hover:bg-white/70 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                          <ShieldCheck size={20} />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 capitalize">
                          {rep.personId.name}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {rep.role
                          .filter(role => role.toLowerCase() !== 'shareholder')
                          .map((role, rIdx) => (
                          <Badge 
                            key={rIdx} 
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-0 px-3 py-1 text-sm font-medium flex items-center gap-1"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{rep.personId.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Globe className="h-3 w-3" />
                        <span>{rep.personId.nationality}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Corporate Representatives */}
            {data.representationalCompany?.map((corpRep, idx) => (
              <Card
                key={corpRep._id || `corp-rep-${idx}`}
                className="bg-white/80 border border-indigo-100 rounded-xl shadow-sm hover:bg-white/70 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 capitalize">
                            {corpRep.companyId.name}
                          </h4>
                       <p className="text-[10px] text-gray-400 font-mono">Reg: {corpRep.companyId.registrationNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {corpRep.role
                          .filter(role => role.toLowerCase() !== 'shareholder')
                          .map((role, rIdx) => (
                          <Badge 
                            key={rIdx} 
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-100 rounded-0 px-3 py-1 text-sm font-medium flex items-center gap-1"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Involvements