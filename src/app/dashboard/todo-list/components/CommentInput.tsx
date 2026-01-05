import React, { useState, RefObject } from "react"; // Import useState
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
export default function CommentInput({
  isResolved,
  messageError,
  setMessageError,
  handleSendMessage,
  messageInputRef,
}: {
  isResolved: boolean;
  messageError: string | null;
  setMessageError: (msg: string | null) => void;
  handleSendMessage: (attachments: File[]) => void; // Modified to accept attachments
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [attachments, setAttachments] = useState<File[]>([]); // State to store selected files
  const [fileInputKey, setFileInputKey] = useState(0); // State to force re-render of file input

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments((prevAttachments) => [
        ...prevAttachments,
        ...Array.from(files),
      ]);
      // The input's value is effectively reset by changing its 'key' prop,
      // so we don't need to manually clear e.target.value here.
    }
  };

  const handleRemoveAttachment = (fileToRemove: File) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((file) => file !== fileToRemove)
    );
    // Increment the key to force the file input to re-mount,
    // allowing the same file to be selected again.
    setFileInputKey((prevKey) => prevKey + 1);
  };

  const handleSendAndClear = () => {
    handleSendMessage(attachments); // Pass attachments to the parent handler
    setAttachments([]); // Clear attachments from state
    // Increment the key to reset the file input after sending,
    // ensuring it's ready for new selections.
    setFileInputKey((prevKey) => prevKey + 1);
  };

  if (isResolved) {
    return (
      <div className="rounded-lg border bg-red-50 p-3 text-center text-sm text-red-700">
        This task is resolved. You can no longer add comments to it.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300">
        {/* Attachment preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            {attachments.map((file, index) => (
              <span
                key={index}
                className="flex items-center justify-between bg-gradient-to-r from-blue-100/50  to-blue-100/50 backdrop-blur[10px] border border-border rounded-lg py-2 px-4 gap-3"
              >
                {file.name}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(file)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <textarea
            ref={messageInputRef}
            rows={2}
            className="flex-1 w-full mb-3 text-sm text-brand-body border border-border rounded-lg px-3 py-2 bg-card focus:outline-none"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (messageError) setMessageError(null);
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendAndClear(); // Call the new function to send and clear
              }
            }}
          />
          {/* File input button */}
          <label className="cursor-pointer rounded-lg bg-brand-body border border-border px-4 py-2 text-sm text-brand-body hover:bg-brand-muted">
            Attach Files
            <input
              key={fileInputKey} // Apply the key here to force re-render on reset
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              // ADDED: accept attribute for file type filtering
              accept=".pdf,image/jpeg,image/png,.xlsx,.xls"
            />
          </label>
          <Button
            variant={"outline"}
            className="cursor-pointer text-card-foreground py-3 ps-3 pe-4 bg-sidebar-background hover:bg-card hover:text-brand-body border-sky-800"
            onClick={handleSendAndClear} // Call the new function to send and clear
          >
            Send
          </Button>
        </div>
      </div>
      {messageError && <div className="text-sm text-red-500">{messageError}</div>}
    </>
  );
}
