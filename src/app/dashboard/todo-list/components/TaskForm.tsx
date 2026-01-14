// components/tasks/TaskForm.tsx
import React, { FormEvent, ChangeEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AttachmentIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Spinner from "@/components/Spinner";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import { ChevronDown } from "lucide-react";
interface Accountant {
    accountant: { id: number; first_name: string; last_name: string; email: string; name: string };
}
interface Status {
    id: number;
    name: string;
}
interface TaskAttachment {
    id: number;
    fileName: string;
    filePath: string;
}
interface AttachedFile {
    file: File;
    id: string;
}

type Priority = "LOW" | "MEDIUM" | "HIGH";

interface TaskFormProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
    assignedToIds: number[];
    setAssignedToIds: (ids: number[]) => void;
    statusId: number | null;
    setStatusId: (id: number | null) => void;
    dueDate: string | null; // YYYY-MM-DD format for date input
    setDueDate: (date: string | null) => void;
    priority: Priority | null;
    setPriority: (priority: Priority | null) => void;
    accountants: Accountant[];
    statuses: Status[];
    attachmentFiles: AttachedFile[];
    existingAttachments: TaskAttachment[];
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachment: (id: string) => void;
    removeExistingAttachment: (id: number) => void;
    handleSubmit: (e: FormEvent) => void;
    resetForm: () => void;
    isSubmitting: boolean;
    editTaskId: number | null;
    errors: string[];
    backendUrl: string;
}

export default function TaskForm({
    title,
    setTitle,
    description,
    setDescription,
    assignedToIds,
    setAssignedToIds,
    statusId,
    setStatusId,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    accountants,
    statuses,
    attachmentFiles,
    existingAttachments,
    handleFileChange,
    removeAttachment,
    removeExistingAttachment,
    handleSubmit,
    resetForm,
    isSubmitting,
    editTaskId,
    errors,
    backendUrl,
}: TaskFormProps) {
    const handleAssignedToChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions);
        const selectedIds = selectedOptions.map((option) => Number(option.value));
        setAssignedToIds(selectedIds);
    };

    function formatDateForInput(date: Date | string | null): string {
        if (!date) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        // Format date as YYYY-MM-DD
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    return (
        <div className="p-5">
            {errors.length > 0 && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <ul className="list-disc pl-5">
                        {errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="relative">
                {isSubmitting && (
                    <div className="absolute inset-0 bg-card bg-opacity-60 z-10 flex items-center justify-center">
                        <Spinner />
                    </div>
                )}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input
                        type="text"
                        className="w-full mb-3 text-sm text-brand-body border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-card mb-3 focus:outline-none"
                        rows={3}
                        placeholder="Task Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {/* Due Date and Priority */}
                    <div className="flex flex-wrap gap-4 mb-3">
                        {/* Due Date */}
                        <div className="flex-1 min-w-[200px] sm:min-w-[250px]">
                            <label htmlFor="dueDate" className="sr-only">
                                Due Date
                            </label>
                            <DatePicker
                                selected={dueDate ? new Date(dueDate) : null}
                                onChange={(date) => {
                                    setDueDate(date ? date.toISOString().split('T')[0] : null);
                                }}
                                id="dueDate"
                                popperPlacement="bottom-start"
                                dateFormat="yyyy-MM-dd"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                isClearable
                                withPortal // 🔹 This makes it open in a popup/portal
                                minDate={new Date()}
                                placeholderText="Due date"
                                onKeyDown={(e) => e.preventDefault()}
                                className=" block w-full border border-border rounded-lg px-3 py-2 bg-card text-sm text-brand-body focus:outline-none focus:ring-0 h-[42px]"
                            />
                        </div>

                        {/* Priority */}
                        <div className="flex-1 min-w-[150px] sm:min-w-[200px] md:min-w-[250px]">
                            <label htmlFor="priority" className="sr-only">
                                Priority
                            </label>
                            <Dropdown
                                className="w-full"
                                trigger={
                                    <Button variant="outline" className="w-full h-[42px] justify-between">
                                        {priority ? priority.charAt(0) + priority.slice(1).toLowerCase() : "Select Priority"}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                }
                                items={[
                                    { id: "LOW", label: "Low", onClick: () => setPriority("LOW") },
                                    { id: "MEDIUM", label: "Medium", onClick: () => setPriority("MEDIUM") },
                                    { id: "HIGH", label: "High", onClick: () => setPriority("HIGH") }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-3">
                        {/* Accountant Selection - Multi-select */}
                        {/* Note: Using native <select multiple> because Dropdown component doesn't support multi-select functionality */}
                        <div className="flex-1 min-w-[200px] sm:min-w-[250px] md:min-w-[300px]">
                            <label htmlFor="assignedToAccountants" className="sr-only">
                                Choose Accountant(s)
                            </label>
                            <select
                                id="assignedToAccountants"
                                multiple
                                value={assignedToIds.map(String)}
                                onChange={handleAssignedToChange}
                                className="
                  block min-w-[510px] border border-border rounded-lg px-3 py-2 bg-card text-sm text-brand-body
                  focus:outline-none focus:ring-0
                  h-40 overflow-y-auto resize-y
                "
                            >
                                <option value="" disabled>
                                    Assign Accountant(s)
                                </option>
                                {accountants.map((acc) => (
                                    <option key={acc.accountant.id} value={acc.accountant.id}>
                                        {acc.accountant.name} ({acc.accountant.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Selection - Single select */}
                        <div className="flex-1 min-w-[150px] sm:min-w-[200px] md:min-w-[250px]">
                            <label htmlFor="statusSelect" className="sr-only">
                                Select Status
                            </label>
                            <Dropdown
                                className="w-full"
                                trigger={
                                    <Button variant="outline" className="w-full h-[42px] justify-between">
                                        {statusId ? statuses.find(s => s.id === statusId)?.name || "Select Status" : "Select Status"}
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                }
                                items={statuses.map((status) => ({
                                    id: status.id,
                                    label: status.name,
                                    onClick: () => setStatusId(status.id)
                                }))}
                            />
                        </div>
                    </div>

                    {/* Existing Attachments */}
                    {existingAttachments.length > 0 && (
                        <div className="mt-2 mb-4 space-y-2">
                            <h3 className="text-sm font-medium text-brand-body">
                                Existing Attachments:
                            </h3>
                            {existingAttachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center border border-border bg-brand-body rounded-lg p-3 space-x-3"
                                >
                                    <HugeiconsIcon icon={AttachmentIcon} size={20} className="text-primary" />
                                    <div className="flex-1">
                                        <a
                                            href={`${attachment.filePath.replace(/^\//, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-brand-primary hover:underline break-all"
                                        >
                                            {attachment.fileName}
                                        </a>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingAttachment(attachment.id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            aria-label={`Remove ${attachment.fileName}`}
                                        >
                                            <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 w-full mb-4">
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer p-2.5 border rounded-lg flex items-center justify-center bg-brand-muted hover:bg-gray-200 transition"
                        >
                            <HugeiconsIcon icon={AttachmentIcon} size={20} className="mr-2" />
                            <span>Attach File(s)</span>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileChange}
                                multiple
                                accept=".pdf,image/jpeg,image/png,.xlsx,.xls"
                            />
                        </label>

                        {attachmentFiles.length > 0 && (
                            <div className="flex flex-col space-y-2 mt-2 bg-card border border-border rounded-[16px] shadow-md p-3">
                                <h3 className="text-sm font-medium text-brand-body">
                                    Selected New Attachments:
                                </h3>
                                {attachmentFiles.map((attachedFile) => (
                                    <div
                                        key={attachedFile.id}
                                        className="flex items-center justify-between bg-gradient-to-r from-blue-100/50  to-blue-100/50 backdrop-blur[10px] border border-border rounded-lg py-2 px-4"
                                    >
                                        <span className="text-xs text-gray-800 font-medium truncate flex-1 pr-2">
                                            {attachedFile.file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(attachedFile.id)}
                                            className="text-rose-700 hover:text-red-500 p-1 rounded-full transition-colors cursor-pointer"
                                            aria-label={`Remove ${attachedFile.file.name}`}
                                        >
                                            <HugeiconsIcon icon={Cancel01Icon} size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <Button
                            variant="default"
                            type="submit"
                         disabled={isSubmitting}
                        >
                            {editTaskId
                                ? isSubmitting
                                    ? "Updating..."
                                    : "Update"
                                : isSubmitting
                                    ? "Submitting..."
                                    : "Submit"}
                        </Button>
                        {editTaskId && (
                            <Button
                                type="button"
                                onClick={resetForm}
                                className={`cursor-pointer text-card-foreground py-3 ps-3 pe-4 ${isSubmitting ? "bg-gray-400" : "bg-rose-700 hover:bg-rose-800"}`}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
