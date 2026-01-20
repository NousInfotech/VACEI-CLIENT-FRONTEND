"use client"

import React from 'react'
import { MessageSquare } from 'lucide-react'

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

const ServiceMessages: React.FC<ServiceMessagesProps> = ({ serviceName, messages }) => {
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
        {messages.length > 0 ? (
          messages.map((message) => (
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
