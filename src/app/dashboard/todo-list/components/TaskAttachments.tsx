// TaskAttachments.tsx
import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AttachmentIcon } from "@hugeicons/core-free-icons";

export interface TaskAttachment {
    id: number;
    fileName: string;
    filePath: string;
}

export default function TaskAttachments({
    attachments,
    backendUrl
}: {
    attachments: TaskAttachment[];
    backendUrl: string;
}) {
    if (!attachments.length) return null;
    return (
        <div className="mt-4 mb-5 space-y-2">
            <h3 className="text-sm font-normal text-black">Attachments:</h3>
            {attachments.map(att => (
                <div key={att.id}
                    className="flex items-center justify-between bg-gradient-to-r
                    from-blue-100/50  to-blue-100/50 backdrop-blur[10px] border border-blue-200/50 rounded-lg py-3 px-4 space-x-2">
                    <HugeiconsIcon icon={AttachmentIcon} size={20} className="text-sky-800" />
                    <a
                        href={`${backendUrl.replace(/\/$/, "")}/${att.filePath.replace(/^\//, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 break-all text-xs text-gray-800 font-medium truncate  hover:underline"
                    >
                        {att.fileName}
                    </a>
                </div>
            ))}
        </div>
    );
}
