"use client"

import React from 'react'
import EngagementSummary, { EngagementAction, EngagementStatus, WorkflowStatus } from './EngagementSummary'
import BackButton from '../shared/BackButton'

interface ServiceEngagementProps {
  serviceSlug: string
}

const serviceData: Record<string, {
  name: string
  description: string
  status: EngagementStatus
  cycle: string
  workflowStatus: WorkflowStatus
  neededFromUser?: string
  actions: EngagementAction[]
}> = {
  'bookkeeping': {
    name: 'Accounting & Bookkeeping',
    description: 'Ongoing maintenance of financial records, including ledger management and reporting.',
    status: 'on_track',
    cycle: 'January 2026',
    workflowStatus: 'in_progress',
    neededFromUser: 'Please upload bank statements for the previous month.',
    actions: [{ type: 'upload', label: 'Upload Statements' }]
  },
  'vat': {
    name: 'VAT & Tax',
    description: 'Preparation and filing of VAT returns and ensuring tax compliance.',
    status: 'due_soon',
    cycle: 'Q1 2026',
    workflowStatus: 'waiting',
    neededFromUser: 'Action required: Review and confirm your VAT return for the period.',
    actions: [
      { type: 'confirm', label: 'Confirm VAT Return' },
      { type: 'schedule', label: 'Talk to Tax Consultant' }
    ]
  },
  'payroll': {
    name: 'Payroll',
    description: 'Processing salaries, tax deductions, and statutory filings for employees.',
    status: 'on_track',
    cycle: 'January 2026',
    workflowStatus: 'submitted',
    actions: [{ type: 'schedule', label: 'Change Payroll Details' }]
  },
  'cfo': {
    name: 'CFO Services',
    description: 'Strategic financial advisory, budgeting, and performance analysis.',
    status: 'on_track',
    cycle: 'Project: Budgeting 2026',
    workflowStatus: 'in_progress',
    neededFromUser: 'Please provide the sales forecast for the upcoming quarter.',
    actions: [{ type: 'schedule', label: 'Strategy Meeting' }]
  },
  'audit': {
    name: 'Statutory Audit',
    description: 'Independent examination of financial statements to ensure accuracy and compliance.',
    status: 'action_required',
    cycle: 'FY 2025',
    workflowStatus: 'waiting',
    neededFromUser: 'Missing documents: Management Representation Letter.',
    actions: [
      { type: 'upload', label: 'Upload Letter' },
      { type: 'schedule', label: 'Pre-Audit Call' }
    ]
  },
  'csp-mbr': {
    name: 'Corporate Services',
    description: 'Support with company secretarial, registry filings, and corporate governance.',
    status: 'on_track',
    cycle: 'Annual Return 2025',
    workflowStatus: 'completed',
    actions: []
  },
  'grants-incentives': {
    name: 'Grants & Incentives',
    description: 'Exploration and application for government and institutional grants.',
    status: 'due_soon',
    cycle: 'Grant: R&D Tax Credit',
    workflowStatus: 'waiting',
    neededFromUser: 'Upload project technical reports for the grant application.',
    actions: [{ type: 'upload', label: 'Upload Reports' }]
  },
  'mbr-filing': {
    name: 'MBR Filing',
    description: 'Handling official filings with the Malta Business Registry.',
    status: 'on_track',
    cycle: 'January 2026',
    workflowStatus: 'in_progress',
    actions: []
  },
  'incorporation': {
    name: 'Incorporation',
    description: 'Process of legally forming a new corporate entity.',
    status: 'on_track',
    cycle: 'New Incorporation',
    workflowStatus: 'submitted',
    neededFromUser: 'Waiting for registry approval. No actions needed.',
    actions: []
  },
  'business-plans': {
    name: 'Business Plans',
    description: 'Development of professional business plans and financial projections.',
    status: 'action_required',
    cycle: 'Project: Strategic Plan',
    workflowStatus: 'waiting',
    neededFromUser: 'Please review the draft plan and provide feedback.',
    actions: [{ type: 'schedule', label: 'Review Session' }]
  },
  'liquidation': {
    name: 'Liquidation',
    description: 'Formal process of closing a company and distributing its assets.',
    status: 'on_track',
    cycle: 'Liquidation Process',
    workflowStatus: 'in_progress',
    actions: [{ type: 'schedule', label: 'Consult Liquidator' }]
  }
}

const ServiceEngagement: React.FC<ServiceEngagementProps> = ({ serviceSlug }) => {
  const data = serviceData[serviceSlug] || {
    name: 'Service Engagement',
    description: 'Engagement overview for our corporate services.',
    status: 'on_track' as EngagementStatus,
    cycle: 'Ongoing',
    workflowStatus: 'in_progress' as WorkflowStatus,
    actions: []
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white">
      <EngagementSummary 
        serviceName={data.name}
        description={data.description}
        status={data.status}
        cycle={data.cycle}
        workflowStatus={data.workflowStatus}
        neededFromUser={data.neededFromUser}
        actions={data.actions}
      />
    </div>
  )
}

export default ServiceEngagement
