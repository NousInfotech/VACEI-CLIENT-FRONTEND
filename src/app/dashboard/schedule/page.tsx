"use client";
import { useState, useEffect, useMemo, useCallback, JSX } from "react";
import MeetingCalendar from "@/components/MeetingCalendar"; // Adjust path as needed
import type { SlotInfo } from "react-big-calendar"; // Import types
import { fetchMeetings } from "@/api/meetingService"; // Make sure this is updated
import { fetchChatUsers } from "@/api/taskService";
import { useRouter } from "next/navigation";
import MeetingInfoPopup from "./components/SchedulePopUp"; // Import the new component
import { CalendarEvent } from "@/interfaces"; // Assuming CalendarEvent includes client and accountant objects directly
import { Dropdown } from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";
import DashboardCard from "@/components/DashboardCard";

export default function ParentComponent(): JSX.Element {
  const router = useRouter();

  const [date, setDate] = useState<Date>(new Date());
  const [meetings, setMeetings] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [accountants, setAccountants] = useState<any[]>([]); // Using any[] based on your original code's data structure { accountant: { id, name, email } }
  const [loadingAccountants, setLoadingAccountants] = useState<boolean>(true);
  const [accountantsError, setAccountantsError] = useState<string | null>(null);

  const [showMeetingInfoPopup, setShowMeetingInfoPopup] =
    useState<boolean>(false);
  const [selectedMeetingForPopup, setSelectedMeetingForPopup] =
    useState<CalendarEvent | null>(null);

  // State for selected accountant filter
  const [selectedAccountantId, setSelectedAccountantId] = useState<
    number | "all"
  >("all"); // "all" to represent no filter initially

  // Explicitly type the 'event' parameter
  const handleSelectEvent = useCallback((event: CalendarEvent): void => {
    setSelectedMeetingForPopup(event);
    setShowMeetingInfoPopup(true);
  }, []);

  // Helper to encode meeting ID
  const getEncodedMeetingId = useCallback((id: number): string => {
    return btoa(String(id));
  }, []);

  // --- FIX START ---
  const handleViewFromPopup = useCallback(
    (meetingId: number): void => {
      // Close the popup and clear selection first
      setShowMeetingInfoPopup(false);
      setSelectedMeetingForPopup(null);

      // Encode the meeting ID for the URL
      const encodedMeetingId = getEncodedMeetingId(meetingId);
      router.push(`/dashboard/schedule/view?meeting=${encodedMeetingId}`);
    },
    [router, getEncodedMeetingId] // Added getEncodedMeetingId to dependencies
  );
  // --- FIX END ---

  const handleEditFromPopup = useCallback(
    (meetingId: number): void => {
      setShowMeetingInfoPopup(false);
      setSelectedMeetingForPopup(null);
      const encodedEventIdBase64 = getEncodedMeetingId(meetingId); // Use the helper
      const urlSafeEncodedEventId = encodeURIComponent(encodedEventIdBase64);
      router.push(`/dashboard/schedule/form?meeting=${urlSafeEncodedEventId}`);
    },
    [router, getEncodedMeetingId] // Added getEncodedMeetingId to dependencies
  );

  const handleMeetingDeleted = useCallback(() => {
    if (selectedMeetingForPopup) {
      setMeetings((prevMeetings) =>
        prevMeetings.filter((m) => m.id !== selectedMeetingForPopup.id)
      );
      setSelectedMeetingForPopup(null); // Clear selection
      setShowMeetingInfoPopup(false); // Close popup
    }
  }, [selectedMeetingForPopup]);

  const handleClosePopup = useCallback((): void => {
    setShowMeetingInfoPopup(false);
    setSelectedMeetingForPopup(null);
  }, []);

  // loadMeetings now relies entirely on the API for filtering
  const loadMeetings = useCallback(
    async (filterAccountantId?: number | "all"): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchOptions: { accountantId?: number } = {};
        if (filterAccountantId !== "all" && typeof filterAccountantId === 'number') {
          fetchOptions = { accountantId: filterAccountantId };
        }
        // Call your updated fetchMeetings API function with the filter options
        const fetchedMeetings: CalendarEvent[] = await fetchMeetings(fetchOptions);

        const parsedMeetings = fetchedMeetings.map((meeting) => ({
          ...meeting,
          title: `${meeting.title}`, // Assuming title is string; if it's already a string, no change needed
          start: new Date(meeting.start),
          end: new Date(meeting.end),
        }));

        // Directly set the meetings returned from the API (which are already filtered)
        setMeetings(parsedMeetings);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching meetings.");
        }
        console.error("Failed to fetch meetings:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [] // Dependencies: None, as it's a data fetching function. It will be triggered by useEffect.
  );

  // Use a separate useEffect for accountants
  useEffect(() => {
    const loadAccountants = async (): Promise<void> => {
      setLoadingAccountants(true);
      setAccountantsError(null);
      try {
        // Assuming fetchChatUsers returns an array of objects, each having an 'accountant' property
        const chatUsers = await fetchChatUsers();
        setAccountants(chatUsers);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setAccountantsError(err.message);
        } else {
          setAccountantsError(
            "An unknown error occurred while fetching accountants."
          );
        }
        console.error("Failed to fetch accountants:", err);
      } finally {
        setLoadingAccountants(false);
      }
    };
    loadAccountants();
  }, []);

  // This useEffect will re-fetch meetings whenever selectedAccountantId changes
  useEffect(() => {
    console.log("selectedAccountantId changed, re-fetching meetings:", selectedAccountantId);
    loadMeetings(selectedAccountantId);
  }, [loadMeetings, selectedAccountantId]); // Dependencies: loadMeetings (stable) and selectedAccountantId

  // Memoize calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return meetings;
  }, [meetings]);

  const handleSelectSlot = useCallback(
    ({ start, end }: SlotInfo): void => {
      const startDate = start.toISOString();
      const endDate = end.toISOString();
      const encodedStartDate = encodeURIComponent(startDate);
      const encodedEndDate = encodeURIComponent(endDate);
      router.push(
        `/dashboard/schedule/form?start=${encodedStartDate}&end=${encodedEndDate}`
      );
    },
    [router]
  );

  const handleNavigate = useCallback((newDate: Date): void => {
    setDate(newDate);
  }, []);

  // Handler for when the accountant filter changes
  const handleAccountantFilterChange = useCallback(
    (value: string | number): void => {
      console.log("Dropdown change. New value:", value);
      // Convert to number if not "all", otherwise set to "all"
      setSelectedAccountantId(value === "all" ? "all" : Number(value));
    },
    []
  );

  return (
     <section className="mx-auto max-w-[1400px] w-full pt-5">
     <DashboardCard className="px-5 py-6">

        <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">Schedule Meeting</h1>


        <div className="flex justify-between items-center mb-4 mt-5">
          <div> </div>
          <div className="flex items-center space-x-2">
            <label
              htmlFor="accountantId"
              className="text-brand-body flex-shrink-0 w-15"
            >
              Filter by:
            </label>
            <Dropdown
              align="right"
              searchable={true}
              items={[
                { id: "all", label: "All Accountants", onClick: () => handleAccountantFilterChange("all") },
                ...accountants.map((item) => ({
                   id: item.accountant.id,
                   label: item.accountant.email,
                   onClick: () => handleAccountantFilterChange(item.accountant.id)
                }))
              ]}
              trigger={
                <div className={`border border-border rounded-lg px-3 py-2 bg-card flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors h-10 min-w-[200px] shadow-sm ${loadingAccountants ? 'opacity-50 pointer-events-none' : ''}`}>
                  <span className="text-sm text-gray-700 truncate">
                    {selectedAccountantId === "all" 
                      ? "All Accountants" 
                      : accountants.find(a => a.accountant.id === selectedAccountantId)?.accountant.email || "Select Accountant"
                    }
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              }
            />
          </div>
        </div>
        {(isLoading || loadingAccountants) && (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        )}
        {(error || accountantsError) && (
          <div className="text-red-500 bg-red-100 p-3 rounded-md">
            <p>Error: {error || accountantsError}</p>
            <p className="text-sm">Please try refreshing the page.</p>
          </div>
        )}

        {!isLoading && !error && !loadingAccountants && !accountantsError && (
          <>
            <MeetingCalendar
              events={calendarEvents}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              date={date}
              onNavigate={handleNavigate}
            />

            {/* Render the MeetingInfoPopup if active */}
            {showMeetingInfoPopup && selectedMeetingForPopup && (
              <MeetingInfoPopup
                meeting={selectedMeetingForPopup}
                accountants={[] as any}
                onClose={handleClosePopup}
                onEdit={handleEditFromPopup}
                onView={handleViewFromPopup} // Pass the new handler
                onMeetingDeleted={handleMeetingDeleted}
              />
            )}
          </>
        )}
      </DashboardCard>
    </section>
  );
}