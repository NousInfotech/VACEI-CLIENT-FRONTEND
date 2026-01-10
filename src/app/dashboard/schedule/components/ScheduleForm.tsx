// components/MeetingForm.tsx
import React from 'react';
import { TextInputProps } from '@/interfaces';
import { MeetingFormProps } from "@/interfaces";
import { Dropdown } from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";

// Helper function to generate time options for select dropdowns
const generateTimeOptions = (): Date[] => {
    const times: Date[] = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const date = new Date();
            date.setHours(hour, minute, 0, 0);
            times.push(date);
        }
    }
    return times;
};

const TIME_OPTIONS = generateTimeOptions();

// Helper function to format time for select dropdown values
const formatTimeForSelect = (dateObj: Date | null): string => {
    return (dateObj instanceof Date && !isNaN(dateObj.getTime())) ? dateObj.toTimeString().substring(0, 5) : '';
};

// Reusable TextInput component for consistency
const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, error, placeholder, className, type = 'text', textarea = false }) => (
    <div className={`mt-5 mb-5 ${className}`}> {/* Increased mb for better spacing */}
        <label htmlFor={label} className="block text-brand-body text-sm font-medium mb-2"> {/* Font-medium for label */}
            {label}
        </label>
        {textarea ? (
            <textarea
                id={label}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4} // Default rows for textarea
                className={`
                    shadow-md block w-full px-3 py-2
                    border rounded-md
                    text-brand-body placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-primary
                    sm:text-sm
                    ${error ? 'border-red-500' : 'border-border'}
                    transition ease-in-out duration-150
                `}
            />
        ) : (
            <input
                id={label}
                type={type}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`
                    shadow-md block w-full px-3 py-2
                    border rounded-md
                    text-brand-body placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-primary
                    sm:text-sm
                    ${error ? 'border-red-500' : 'border-border'}
                    transition ease-in-out duration-150
                `}
            />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>} {/* Smaller text for errors */}
    </div>
);

// Reusable TimeSelect component
const TimeSelect: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}> = ({ id, label, value, onChange, error }) => (
    <div className="mb-5">
        <label htmlFor={id} className="block text-brand-body text-sm font-medium mb-2">
            {label}:
        </label>
        <Dropdown
            className="w-full"
            fullWidth={true}
            align="left"
            searchable={true}
            items={TIME_OPTIONS.map((time) => ({
                id: formatTimeForSelect(time),
                label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                onClick: () => onChange(formatTimeForSelect(time))
            }))}
            trigger={
                <div className={`border border-border rounded-lg px-3 py-2 bg-card flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors h-10 w-full shadow-sm ${error ? 'border-red-500' : ''}`}>
                    <span className="text-sm text-gray-700 truncate">
                        {TIME_OPTIONS.find(t => formatTimeForSelect(t) === value)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) || `Select a ${label.toLowerCase()} time`}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
            }
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const MeetingForm: React.FC<MeetingFormProps> = ({
    meetingDetails,
    accountants,
    validationErrors,
    isSubmitting,
    onFormChange,
    onSubmit,
    onCancel,
}) => {
    const selectedDateOnly: Date | null = meetingDetails.start
        ? (meetingDetails.start instanceof Date && !isNaN(meetingDetails.start.getTime())
            ? new Date(meetingDetails.start.getFullYear(), meetingDetails.start.getMonth(), meetingDetails.start.getDate())
            : null)
        : null;

    const selectedDateDisplay = selectedDateOnly ?
        selectedDateOnly.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) :
        'N/A';

    return (
        <form onSubmit={onSubmit} className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <div className="md:col-span-2">
                <TextInput
                    label="Meeting Title"
                    value={meetingDetails.title}
                    onChange={(value) => onFormChange('title', value)}
                    error={validationErrors.title}
                    placeholder="e.g., Client Onboarding Call"
                />
            </div>
            
            <div className="md:col-span-2">
                <TextInput
                    label="Description"
                    value={meetingDetails.description || ''}
                    onChange={(value) => onFormChange('description', value)}
                    error={validationErrors.description}
                    placeholder="Briefly describe the purpose of the meeting..."
                    textarea
                />
            </div>

            <div className="mb-5">
                <label htmlFor="accountantId" className="block text-brand-body text-sm font-medium mb-2">
                    Assign Accountant:
                </label>
                <Dropdown
                    className="w-full"
                    fullWidth={true}
                    align="left"
                    searchable={true}
                    items={accountants.map((item) => ({
                        id: item.accountant.id,
                        label: `${item.accountant.name || item.accountant.username} (${item.accountant.email})`,
                        onClick: () => onFormChange('accountantId', item.accountant.id)
                    }))}
                    trigger={
                        <div className={`border border-border rounded-lg px-3 py-2 bg-card flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors h-10 w-full shadow-sm ${validationErrors.accountantId ? 'border-red-500' : ''}`}>
                            <span className="text-sm text-gray-700 truncate">
                                {accountants.find(a => a.accountant.id === meetingDetails.accountantId) 
                                    ? `${accountants.find(a => a.accountant.id === meetingDetails.accountantId)?.accountant.name || accountants.find(a => a.accountant.id === meetingDetails.accountantId)?.accountant.username} (${accountants.find(a => a.accountant.id === meetingDetails.accountantId)?.accountant.email})`
                                    : "Select an Accountant"
                                }
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                    }
                />
                {validationErrors.accountantId && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.accountantId}</p>
                )}
            </div>

            <div className="mb-5">
                <label className="block text-brand-body text-sm font-medium mb-2">
                    Selected Date:
                </label>
                <input
                    type="text"
                    value={selectedDateDisplay}
                    className="shadow-md block w-full px-3 py-2 h-10
                               border border-border rounded-lg
                               text-brand-body bg-brand-muted cursor-not-allowed
                               sm:text-sm"
                    readOnly
                />
            </div>

            <TimeSelect
                id="startTime"
                label="Start Time"
                value={formatTimeForSelect(meetingDetails.start)}
                onChange={(value) => onFormChange('start', value)}
                error={validationErrors.start || validationErrors.timeConflict}
            />

            <TimeSelect
                id="endTime"
                label="End Time"
                value={formatTimeForSelect(meetingDetails.end)}
                onChange={(value) => onFormChange('end', value)}
                error={validationErrors.end || validationErrors.timeConflict}
            />

            <div className="mb-5">
                <label htmlFor="status" className="block text-brand-body text-sm font-medium mb-2">
                    Status
                </label>
                <Dropdown
                    className="w-full"
                    fullWidth={true}
                    align="left"
                    items={[
                        { id: 1, label: "Active", onClick: () => onFormChange('status', 1) },
                        { id: 0, label: "Inactive/Cancelled", onClick: () => onFormChange('status', 0) },
                    ]}
                    trigger={
                        <div className={`border border-border rounded-lg px-3 py-2 bg-card flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors h-10 w-full shadow-sm ${validationErrors.status ? 'border-red-500' : ''}`}>
                            <span className="text-sm text-gray-700 truncate">
                                {meetingDetails.status === 1 ? "Active" : "Inactive/Cancelled"}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        </div>
                    }
                />
                {validationErrors.status && <p className="mt-1 text-xs text-red-600">{validationErrors.status}</p>}
            </div>

            <div className="pt-4 flex justify-end space-x-3"> {/* Added pt-4 for top padding */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 border border-border rounded-md
                               text-brand-body bg-card
                               hover:bg-brand-body focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                               transition duration-150 ease-in-out text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 ritext-primary-foreground rounded-lg
                               border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                               transition duration-150 ease-in-out disabled:opacity-50 text-sm font-medium shadow-md"
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default MeetingForm;