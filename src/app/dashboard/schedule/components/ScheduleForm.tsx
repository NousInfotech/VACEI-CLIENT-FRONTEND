// components/MeetingForm.tsx
import React from 'react';
import { TextInputProps } from '@/interfaces';
import { MeetingFormProps } from "@/interfaces";

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
    <div className="mb-5"> {/* Consistent mb for better spacing */}
        <label htmlFor={id} className="block text-brand-body text-sm font-medium mb-2">
            {label}:
        </label>
        <div className="relative"> {/* Added relative for custom arrow */}
            <select
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    appearance-none block w-full px-3 py-2 pr-8 // pr-8 for arrow space
                    border rounded-md shadow-md
                    text-brand-body leading-tight
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-primary
                    bg-card
                    sm:text-sm
                    ${error ? 'border-red-500' : 'border-border'}
                    transition ease-in-out duration-150
                `}
            >
                <option value="">{`Select a ${label.toLowerCase()} time`}</option>
                {TIME_OPTIONS.map((time, index) => (
                    <option key={index} value={formatTimeForSelect(time)}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </option>
                ))}
            </select>
            {/* Custom arrow for select dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground"> {/* Adjusted text-brand-body to text-muted-foreground for a softer arrow */}

            </div>
        </div>
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
        <form onSubmit={onSubmit} className="w-full space-y-5"> {/* Added space-y-5 for consistent vertical spacing */}
            <TextInput
                label="Meeting Title"
                value={meetingDetails.title}
                onChange={(value) => onFormChange('title', value)}
                error={validationErrors.title}
                placeholder="e.g., Client Onboarding Call"
            />
            <TextInput
                label="Description"
                value={meetingDetails.description || ''} // <--- Add this change
                onChange={(value) => onFormChange('description', value)}
                error={validationErrors.description}
                placeholder="Briefly describe the purpose of the meeting..."
                textarea
            />

            <div> {/* Wrapped accountant select in a div for consistent spacing */}
                <label htmlFor="accountantId" className="block text-brand-body text-sm font-medium mb-2">
                    Assign Accountant:
                </label>
                <div className="relative"> {/* Added relative for custom arrow */}
                    <select
                        id="accountantId"
                        name="accountantId"
                        value={meetingDetails.accountantId || ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFormChange('accountantId', e.target.value)}
                        className={`
                            appearance-none block w-full px-3 py-2 pr-8
                            border rounded-md shadow-md
                            text-brand-body leading-tight
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-primary
                            bg-card
                            sm:text-sm
                            ${validationErrors.accountantId ? 'border-red-500' : 'border-border'}
                            transition ease-in-out duration-150
                        `}
                    >
                        <option value="">Select an Accountant</option>
                        {accountants.length > 0 ? (
                            accountants.map((item) => (
                                <option key={item.accountant.id} value={item.accountant.id}>
                                    {`${item.accountant.name} (${item.accountant.email})`}
                                </option>
                            ))
                        ) : (
                            <option disabled>No accountants available.</option>
                        )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">

                    </div>
                </div>
                {validationErrors.accountantId && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.accountantId}</p>
                )}
                {accountants.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">No accountants found. Please ensure data is loaded correctly.</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="w-full sm:w-1/2">
                    <label className="block text-brand-body text-sm font-medium mb-2">
                        Selected Date:
                    </label>
                    <input
                        type="text"
                        value={selectedDateDisplay}
                        className="shadow-md block w-full px-3 py-2
                                   border border-border rounded-md
                                   text-brand-body bg-brand-muted cursor-not-allowed
                                   sm:text-sm"
                        readOnly
                    />
                </div>
                <div className="w-full sm:w-1/2">
                    <TimeSelect
                        id="startTime"
                        label="Start Time"
                        value={formatTimeForSelect(meetingDetails.start)}
                        onChange={(value) => onFormChange('start', value)}
                        error={validationErrors.start || validationErrors.timeConflict}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="w-full sm:w-1/2">
                    <TimeSelect
                        id="endTime"
                        label="End Time"
                        value={formatTimeForSelect(meetingDetails.end)}
                        onChange={(value) => onFormChange('end', value)}
                        error={validationErrors.end || validationErrors.timeConflict}
                    />
                </div>
                <div className="w-full sm:w-1/2">
                    <label htmlFor="status" className="block text-brand-body text-sm font-medium mb-2">
                        Status
                    </label>
                    <div className="relative">
                        <select
                            id="status"
                            name="status"
                            value={meetingDetails.status}
                            onChange={(e) => onFormChange('status', parseInt(e.target.value, 10))}
                            className={`
                                appearance-none block w-full px-3 py-2 pr-8
                                border rounded-md shadow-md
                                text-brand-body leading-tight
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-primary
                                bg-card
                                sm:text-sm
                                ${validationErrors.status ? 'border-red-500' : 'border-border'}
                                transition ease-in-out duration-150
                            `}
                        >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive/Cancelled</option>
                        </select>

                    </div>
                    {validationErrors.status && <p className="mt-1 text-xs text-red-600">{validationErrors.status}</p>}
                </div>
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
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-lg
                               hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                               transition duration-150 ease-in-out disabled:opacity-50 text-sm font-medium shadow-md"
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default MeetingForm;