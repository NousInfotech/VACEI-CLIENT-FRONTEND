"use client"

import React, { useState, useEffect } from 'react'
import { Receipt, AlertCircle } from 'lucide-react'
import DashboardCard from "@/components/DashboardCard"
import EmptyState from '../shared/EmptyState'
import { TableSkeleton } from "../shared/CommonSkeletons"
import { useEngagement } from './hooks/useEngagement'

const TaxTab = () => {
  const { engagement } = useEngagement()
  const [loading, setLoading] = useState(true)
  const [taxData, setTaxData] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    const fetchTaxData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
        const token = localStorage.getItem("token") || ""

        // Fetch tax data
        const taxRes = await fetch(`${backendUrl}tax`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (taxRes.ok) {
          const tax = await taxRes.json()
          setTaxData(tax)
        }

        // Fetch company data
        const companyRes = await fetch(`${backendUrl}company`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (companyRes.ok) {
          const comp = await companyRes.json()
          setCompany(comp)
        }
      } catch (error) {
        console.error("Tax data fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTaxData()
  }, [])

  const renderTaxAgencies = (items: any[]) => {
    if (!items || items.length === 0) return null
    return (
      <DashboardCard className="p-4 mb-5">
        <h3 className="text-xl leading-normal text-brand-body capitalize font-medium mb-4">Tax Agencies</h3>
        <ul className="list-disc ml-5 space-y-2">
          {items.map((agency, index) => (
            <li key={agency.Id || index} className="text-gray-800">
              <span className="font-semibold">{agency.DisplayName || agency.name || 'N/A'}</span>
            </li>
          ))}
        </ul>
      </DashboardCard>
    )
  }

  const renderTaxRates = (items: any[]) => {
    if (!items || items.length === 0) return null
    return (
      <DashboardCard className="p-4 mb-5">
        <h3 className="text-xl leading-normal text-brand-body capitalize font-medium mb-4">Tax Rates</h3>
        <ul className="list-disc ml-5 space-y-2">
          {items.map((rate, index) => (
            <li key={rate.Id || index} className="text-gray-800 font-semibold">
              {rate.Name || rate.name || 'N/A'} : {rate.RateValue || rate.rate || 0}%
            </li>
          ))}
        </ul>
      </DashboardCard>
    )
  }

  // Extract data from taxData
  const taxAgencyItems =
    taxData?.find((d: any) => d.entityType === "TaxAgency")?.jsonData?.TaxAgency || []
  const taxRateItems =
    taxData?.find((d: any) => d.entityType === "TaxRate")?.jsonData?.TaxRate || []

  if (loading) {
    return <TableSkeleton rows={5} />
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md mb-5 p-6">
        <div>
          <h2 className="text-3xl font-semibold">Tax Information</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            View tax-related data and rates for this engagement
          </p>
        </div>
        <div className="p-4 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-green-200">
          <Receipt size={32} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-5">
        {/* Tax Profile */}
        <DashboardCard className="p-6">
          <div className="flex gap-4 justify-between items-center mb-5">
            <div>
              <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">Tax Related Data</h3>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading tax data...</p>
            ) : taxData ? (
              <>
                {renderTaxAgencies(taxAgencyItems)}
                {renderTaxRates(taxRateItems)}
                {taxAgencyItems.length === 0 && taxRateItems.length === 0 && (
                  <p className="text-muted-foreground text-sm">No tax data available.</p>
                )}
              </>
            ) : (
              <EmptyState
                icon={AlertCircle}
                title="No Tax Data"
                description="No tax data found for this engagement."
              />
            )}
          </div>
        </DashboardCard>

        {/* Contact Info */}
        <DashboardCard className="p-6 h-max">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl leading-normal text-brand-body capitalize font-medium">Contact Info</h3>
            <p className="text-xs text-rose-800 font-medium">Current</p>
          </div>
          <hr className="my-2 border-border mb-4" />

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
              </div>
            </div>
          ) : company ? (
            <div className="flex flex-col gap-3 leading-4 text-sm">
              <div>
                <p className="text-brand-body mb-1 font-medium">Company Name</p>
                <p className="font-bold">{company.simplifiedProfile?.companyName || '—'}</p>
              </div>

              <div>
                <p className="text-brand-body mb-1 font-medium">Legal Name</p>
                <p className="font-bold">{company.simplifiedProfile?.legalName || '—'}</p>
              </div>

              <div>
                <p className="text-brand-body mb-1 font-medium">Email</p>
                <p className="font-bold">{company.simplifiedProfile?.email || '—'}</p>
              </div>

              <div>
                <p className="text-brand-body mb-1 font-medium">Address</p>
                <p className="font-bold">{company.simplifiedProfile?.address || '—'}</p>
              </div>

              <div>
                <p className="text-brand-body mb-1 font-medium">Start Date</p>
                <p className="font-bold">{company.simplifiedProfile?.startDate || '—'}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No company data found.</p>
          )}
        </DashboardCard>
      </div>
    </div>
  )
}

export default TaxTab

