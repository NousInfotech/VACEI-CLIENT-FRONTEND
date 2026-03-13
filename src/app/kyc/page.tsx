"use client"

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Building2, MapPin, Hash, Globe, CheckCircle2, AlertCircle,
  Upload, FileText, Loader2, RefreshCw, ShieldCheck, XCircle,
  ChevronDown, ChevronUp, Download, LayoutDashboard, Users,
  Clock, Mail, Shield
} from 'lucide-react'
import PillTabs from '@/components/shared/PillTabs'
import {
  fetchKycDetails,
  resendKycEmail,
  type KycDetails
} from '@/api/kycService'
import CompanyDetailTab from './components/CompanyDetailTab'
import KycSectionTab from './components/KycSectionTab'
import { KycProvider, useKyc } from './context/KycContext'

// ─── Main Page ────────────────────────────────────────────────────────────────
function KycPageContent() {
  const { details, loading, error, expired, token, refreshKyc } = useKyc()
  const [activeTab, setActiveTab] = useState('kyc')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const handleResend = async () => {
    setResending(true)
    setResendMsg(null)
    const result = await resendKycEmail(token)
    setResendMsg({ text: result.message, ok: result.success })
    setResending(false)
  }

  const tabs = [
    { id: 'company', label: 'Company Details', icon: Building2 },
    { id: 'kyc', label: 'KYC Documents', icon: Shield },
  ]

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
          <ShieldCheck size={32} className="text-white animate-pulse" />
        </div>
        <p className="text-lg font-bold text-gray-900">Identifying KYC Request</p>
        <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your details...</p>
      </div>
    )
  }

  // ── Expired token ─────────────────────────────────────────────────────────
  if (expired || (error && !details)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            {expired ? <Clock size={40} className="text-red-500" /> : <XCircle size={40} className="text-red-500" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {expired ? 'Link Expired' : 'Link Invalid'}
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {error || 'This security link is no longer valid. Please request a new verification email.'}
          </p>

          {expired && (
            <div className="space-y-4">
              <button
                onClick={handleResend}
                disabled={resending || !!resendMsg?.ok}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-60 transition-all w-full justify-center shadow-lg shadow-blue-100"
              >
                {resending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                {resending ? 'Sending Request...' : 'Resend Verification Email'}
              </button>

              {resendMsg && (
                <div className={`mt-4 text-sm font-semibold p-4 rounded-xl flex items-center gap-2 ${resendMsg.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {resendMsg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {resendMsg.text}
                </div>
              )}
              {resendMsg?.ok && (
                <p className="text-xs text-gray-400 mt-3 font-medium italic">A new link has been sent to your registered email.</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!details) return null

  const { companyDetails, documentRequest } = details

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Identity Verification</h1>
            {companyDetails && (
              <p className="text-xs text-gray-500 font-semibold truncate uppercase tracking-wider">{companyDetails.name}</p>
            )}
          </div>
          <div className="hidden sm:block">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-xs ${
              details.involvementKyc.status === 'VERIFIED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : details.involvementKyc.status === 'IN_REVIEW'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {details.involvementKyc.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto px-6 mt-8">
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
          {/* Welcome Section */}
          <div className="p-8 pb-0">
            <h2 className="text-4xl font-light text-gray-900">
              Welcome{details.involvementKyc.person?.name ? `, ${details.involvementKyc.person.name}` : ''}
            </h2>
            <p className="mt-2 text-base text-gray-500 leading-relaxed">
              To ensure the security of our corporate services, please review the company details and upload required documentation for <strong>{companyDetails?.name || 'verification'}</strong>.
            </p>

            {/* Tab Navigation */}
            <div className="mt-5 border-b border-gray-100">
              <PillTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-8 bg-gray-50/30">
            {activeTab === 'company' && companyDetails && (
              <CompanyDetailTab company={companyDetails} />
            )}

            {activeTab === 'company' && !companyDetails && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Building2 size={48} className="mb-4 opacity-20" />
                <p className="font-semibold text-lg">Detailed information unavailable</p>
              </div>
            )}

            {activeTab === 'kyc' && (
              <KycSectionTab
                docRequest={documentRequest}
                clientName={details.involvementKyc.person?.name || `${details.clientUserDetails?.firstName} ${details.clientUserDetails?.lastName}`}
                roles={details.involvementKyc.role}
                involvementStatus={details.involvementKyc.status}
                requestStatus={details.documentRequest.status}
              />
            )}
          </div>
        </div>

        {/* Support Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <ShieldCheck size={16} /> 
            Secured and Encrypted KYC Verification Portal
          </p>
        </div>
      </div>
    </div>
  )
}

function KycPageWrapper() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  return (
    <KycProvider token={token}>
      <KycPageContent />
    </KycProvider>
  )
}

export default function KycPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
          <ShieldCheck size={32} className="text-white animate-pulse" />
        </div>
        <p className="text-lg font-bold text-gray-900">Identifying KYC Request</p>
        <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your details...</p>
      </div>
    }>
      <KycPageWrapper />
    </Suspense>
  )
}
