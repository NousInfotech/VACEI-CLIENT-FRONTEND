"use client"

import React from 'react'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  timestamp: string
  type: 'system' | 'user'
}

interface ServiceMessagesProps {
  serviceName: string
  messages: Message[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

const DEFAULT_MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Welcome to the engagement! We are ready to start processing your request.', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'system' },
  { id: '2', text: 'Please ensure all monthly documents are uploaded by the 5th of each month.', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), type: 'system' },
  { id: '3', text: 'We have received your recent document upload. Our team is currently reviewing it.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'system' },
  { id: '4', text: 'Your VAT return for Q4 has been prepared and is ready for your review.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'system' },
  { id: '5', text: 'Hi, I have a question about the recent payroll filing.', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'user' },
  { id: '6', text: 'Sure! Please go ahead. We are here to help.', timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), type: 'system' },
  { id: '7', text: 'Does this cover the new employees as well?', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), type: 'user' },
  { id: '8', text: 'Yes, it includes all active employees in our system as of the last cutoff.', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), type: 'system' },
]

const ServiceMessages: React.FC<ServiceMessagesProps> = ({ serviceName, messages = [] }) => {
  const displayMessages = messages.length > 0 ? messages : DEFAULT_MOCK_MESSAGES

  return (
    <div className="bg-card border border-border rounded-0 shadow-md p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-brand-body uppercase">
          💬 {serviceName} MESSAGES
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">All {serviceName.toLowerCase()}-related communication appears here.</p>
      
      <div className="p-3 rounded-lg bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground mb-2">
          <strong className="text-brand-body">You&apos;ll be notified when:</strong>
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• New updates are available</li>
          <li>• Documents are processed</li>
          <li>• Actions are required from your side</li>
          <li>• Statutory submissions are completed</li>
        </ul>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {displayMessages.length > 0 ? (
          displayMessages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg border ${
                message.type === "system" 
                  ? "bg-muted/30 border-muted" 
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <p className="text-sm text-brand-body">{message.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(message.timestamp)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">No messages for this service yet.</p>
        )}
      </div>
    </div>
  )
}

export default ServiceMessages
