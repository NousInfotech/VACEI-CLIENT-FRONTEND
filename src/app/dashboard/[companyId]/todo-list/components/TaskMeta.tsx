// TaskMeta.tsx
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/Dropdown";
import React from "react";
import { ChevronDown } from "lucide-react";

interface Status { id: number; name: string; }

// Adjusted User interface to match what formatTask returns for assignedAccountants
interface AssignedAccountant {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string; // The combined name
}

interface Task {
    status: string;
    statusId: number;
    priority: string;
    dueDate: string;
    category: string;
    createdById: number;
    // otherUser: AssignedAccountant; // 'otherUser' is for a single contextual user, not for listing all.
    assignedAccountants: AssignedAccountant[]; // Add this
    isCreator: boolean; // Add this if you use it for display logic
    isAssigned: boolean; // Add this if you use it for display logic
}

export default function TaskMeta({
    task, statuses, selectedStatusId, setSelectedStatusId,
    handleStatusUpdate, currentUserId
}: {
    task: Task;
    statuses: Status[];
    selectedStatusId: number | null;
    setSelectedStatusId: (id: number) => void;
    handleStatusUpdate: () => void;
    currentUserId: number | null;
}) {
    const isResolved = task.status === "Resolved";

    // Determine if the current user is either the creator or one of the assigned
    const canUpdateStatus = currentUserId === task.createdById || task.isAssigned; // Using isAssigned from formatted task

    return (
        <div className="my-3 flex flex-wrap items-end justify-between text-sm">
            <div className="flex flex-wrap items-center gap-4">
                <p>Status: <span className="text-brand-body font-medium">{task.status}</span></p>
                <p>Category: <span className="text-brand-body font-medium">{task.category}</span></p>

                {/* Display multiple assigned accountants */}
                {task.assignedAccountants && task.assignedAccountants.length > 0 && (
                    <span>
                        Assigned To:{" "}
                        <span className="text-brand-body font-medium">
                            {task.assignedAccountants.map((accountant, index) => (
                                <React.Fragment key={accountant.id}>
                                    {accountant.name} ({accountant.email})
                                    {index < task.assignedAccountants.length - 1 && ", "}
                                </React.Fragment>
                            ))}
                        </span>
                    </span>
                )}

                {/* You can still display 'otherUser' if it serves a specific contextual purpose,
            but it might be redundant if 'Assigned To' covers everyone relevant.
            If otherUser is meant to be the creator for assignees, you'd need to
            ensure that `formatTask` populates it correctly based on `currentUserId`.
            For now, I'll comment it out to avoid confusion if `assignedAccountants` is the primary list.
        */}
                {/*
        {task.otherUser && (
          <span>User: <b>{task.otherUser.username} ({task.otherUser.email})</b></span>
        )}
        */}
            </div>

            {/* Logic for showing status update dropdown:
          - If current user is the creator OR (current user is assigned AND task is not resolved)
          - OR, simpler: if `canUpdateStatus` is true, and the task is not resolved OR the current user is the creator
      */}
            {(canUpdateStatus && (!isResolved || currentUserId === task.createdById)) && (
                <div className="mt-3 flex items-center gap-2 sm:mt-0">
                    <Dropdown
                        className="min-w-[140px]"
                        trigger={
                            <Button 
                                variant="outline" 
                                className="min-w-[140px] h-[36px] justify-between"
                                disabled={isResolved && currentUserId !== task.createdById}
                            >
                                {statuses.find(s => s.id === selectedStatusId)?.name || "Select status"}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        }
                        items={statuses
                            // Only allow "Resolved" status to be selected by the creator if the task is already resolved
                            // Or, if not resolved, allow all statuses.
                            .filter(s => s.name !== "Resolved" || currentUserId === task.createdById || !isResolved)
                            .map(s => ({
                                id: s.id,
                                label: s.name,
                                onClick: () => setSelectedStatusId(s.id)
                            }))}
                    />
                    <Button
                        variant={"outline"}
                        className="cursor-pointer text-card-foreground py-3 ps-3 pe-4 bg-sidebar-background hover:bg-card hover:text-brand-body border-sky-800"
                        onClick={handleStatusUpdate}
                        // Disable if resolved and not creator
                        disabled={isResolved && currentUserId !== task.createdById}
                    >Update</Button>
                </div>
            )}
        </div>
    );
}