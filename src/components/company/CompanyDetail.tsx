"use client"
import React from 'react'
import { useCompany } from './hooks/useCompany'
import { Building2, Hash, Milestone, Factory, Calendar, DollarSign, BarChart3, PieChart as PieIcon, Locate, Map, MapPin, Globe, Euro, Calendar1 } from 'lucide-react'

const CompanyDetail = () => {
  const { company: data } = useCompany()

  if (!data) {
    return null
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'n/a';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'n/a';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Building2 size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-semibold">{data.name}</h2>
            <div className="flex items-center space-x-2 text-gray-500 mt-1">
              <p>Registration Number:</p>
              <span className="font-mono text-sm">{data.registrationNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <PieIcon size={20} />
            <h3 className="font-semibold">Authorized Shares</h3>
          </div>
          <p className="text-2xl font-medium">{(data.authorizedShares || 0).toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-1">Total shares authorized</p>
        </div>

        {data.perShareValue && (
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center space-x-2 text-indigo-600 mb-2">
              <Euro size={20} />
              <h3 className="font-semibold">Per Share Value</h3>
            </div>
            <p className="text-2xl font-medium">
              {typeof data.perShareValue === 'object' ? `${data.perShareValue.value} ${data.perShareValue.currency}` : data.perShareValue}
            </p>
            <p className="text-gray-500 text-sm mt-1">Nominal value per share</p>
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center space-x-2 text-violet-600 mb-2">
            <BarChart3 size={20} />
            <h3 className="font-semibold">Issued Shares</h3>
          </div>
          <p className="text-2xl font-medium">{(data.issuedShares || 0).toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-1">Total shares currently issued</p>
        </div>
      </div>
      
      {/* Shares Breakdown Section */}
      {data.totalShares && data.totalShares.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.totalShares.map((share: any, index: number) => (
            <div key={index} className="bg-gray-50 p-2 rounded-xl border-gray-200 flex items-center justify-center gap-2 border">
              <p className="text-sm font-medium ">
                {share.class === 'Ordinary' ? 'Ordinary' : `Class ${share.class}`}:
              </p>
              <p className="text-sm font-medium ">{share.totalShares.toLocaleString()}</p>
            </div> 
            ))}
          </div>
        </div>
      )}

      {/* Additional Details Section */}
      <div className="flex flex-col gap-12">
          <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Address</p>
                    <p className="text-gray-900 text-xl font-light">{data.address}</p>
                  </div>
                </div>
                {data.industry && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Globe className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Industry</p>
                      <p className="text-gray-900 text-xl font-light">{data.industry}</p>
                    </div>
                  </div>
                )}
                {(data.companyStartedAt || data.incorporationDate) && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Calendar1 className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Incorporation Date</p>
                      <p className="text-gray-900 text-xl font-light">
                        {formatDate(data.companyStartedAt || data.incorporationDate)}
                      </p>
                    </div>
                  </div>
                )}
                {data.description && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Description</p>
                      <p className="text-gray-900 text-xl font-light">{data.description}</p>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>
    
  )
}

export default CompanyDetail