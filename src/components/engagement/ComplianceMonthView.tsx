"use client"

import React, { useMemo } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, setHours, setMinutes } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
})

type ComplianceStatus = "filed" | "upcoming" | "due_today" | "overdue"

interface ComplianceEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: ComplianceStatus
  authority?: string
}

interface ComplianceMonthViewProps {
  items: Array<{
    id: string
    complianceId: string
    title: string
    status: ComplianceStatus
    dueDate: string
    authority: string
  }>
}

function mapToCalendarEvent(item: {
  id: string
  complianceId: string
  title: string
  status: ComplianceStatus
  dueDate: string
  authority: string
}): ComplianceEvent {
  const d = new Date(item.dueDate)
  return {
    id: item.id,
    title: item.title,
    start: setMinutes(setHours(new Date(d), 9), 0),
    end: setMinutes(setHours(new Date(d), 10), 0),
    status: item.status,
    authority: item.authority,
  }
}

export default function ComplianceMonthView({ items }: ComplianceMonthViewProps) {
  const [date, setDate] = React.useState(new Date())

  const events = useMemo(
    () => items.map(mapToCalendarEvent),
    [items]
  )

  const eventPropGetter = React.useCallback(
    (event: ComplianceEvent) => {
      const colors: Record<ComplianceStatus, { style: React.CSSProperties }> = {
        filed: { style: { backgroundColor: "#10b981", color: "#fff" } },
        overdue: { style: { backgroundColor: "#ef4444", color: "#fff" } },
        due_today: { style: { backgroundColor: "#f97316", color: "#fff" } },
        upcoming: { style: { backgroundColor: "#3b82f6", color: "#fff" } },
      }
      return colors[event.status] ?? { style: {} }
    },
    []
  )

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
      selectable={false}
      views={[Views.MONTH]}
      defaultView={Views.MONTH}
      view={Views.MONTH}
      date={date}
      onNavigate={setDate}
      onSelectEvent={() => {}}
      eventPropGetter={eventPropGetter}
    />
  )
}
