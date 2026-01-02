// MeetingCalendar.tsx
"use client";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { MeetingCalendarProps, } from "@/interfaces";
// Import types directly from react-big-calendar
import type {
  SlotInfo,
  Event as RbcEvent,
  View,
  NavigateAction,
} from "react-big-calendar";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const locales = { "en-US": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});



export default function MeetingCalendar({
  events,
  onSelectSlot,
  onSelectEvent,
  date,
  onNavigate,
}: MeetingCalendarProps) {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
      selectable
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      views={[Views.MONTH]} // Only MONTH view is allowed now
      defaultView={Views.MONTH}
      view={Views.MONTH} // Force the view to MONTH
      date={date}
      onNavigate={onNavigate}
    />
  );
}
