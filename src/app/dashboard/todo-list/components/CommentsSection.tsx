// CommentsSection.tsx
import React from "react";
import { Comment } from "./commentUtils"; // Assuming Comment type includes attachments array

// --- Define your backend URL here or import it from a config ---
const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_PATH || "";

// Helper function to get initials from first and last name
const getInitials = (firstName?: string, lastName?: string): string => {
    if (!firstName && !lastName) return '??'; // Fallback if no names
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
};

export default function CommentsSection({
    messages, loadOlderMessages, loadingOlder, onScroll
}: {
    messages: Comment[];
    loadOlderMessages: () => void;
    loadingOlder: boolean;
    onScroll: React.UIEventHandler<HTMLDivElement>;
}) {
    return (
        <div className="mb-4 max-h-[400px] overflow-y-auto border border-blue-200/50 rounded-lg bg-gray-1 p-4" onScroll={onScroll}>
            {loadingOlder &&
                <div className="text-center text-sm text-gray-400">Loading older messages...</div>
            }
            {messages.length === 0 ? (
                <div className="py-10 text-center text-gray-400">No comments found</div>
            ) : (messages.map(msg => (
                <div key={msg.id} className={`mb-3 flex ${msg.sender === "self" ? "justify-end" : "justify-start"}`}>
                    <div className={` max-w-[80%] relative border border-blue-200/50 rounded-[16px] py-2 px-3 ${msg.sender === "self" ? "bg-gradient-to-r from-white/80 to-blue-100/50 backdrop-blur[10px] text-black" : "border bg-white"} `}>
                        {/* Display Commenter's Initials */}
                        {msg.commentedBy && (
                            <div className={` absolute -top-2 ${msg.sender === "self" ? "-right-2 bg-sky-700 text-white" : "-left-2 bg-gray-200 text-gray-800"} w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ${msg.sender === "self" ? "ring-0" : "ring-gray-300"} `} title={`${msg.commentedBy.name || msg.commentedBy.username || msg.commentedBy.email}`}>
                                {getInitials(msg.commentedBy.first_name, msg.commentedBy.last_name)}
                            </div>
                        )}
                        {/* Display Comment Text */}
                        {msg.comment && <div className="mt-4">{msg.comment}</div>}
                        {/* Display Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 text-sm mb-2">
                                {msg.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-2 mb-1 text-black">
                                        {/* You can add an icon based on mimetype here */}
                                        {attachment.mimetype.startsWith('image/') && attachment.filepath ? (
                                            <img src={`${backendUrl.replace(/\/$/, '')}/${attachment.filepath.replace(/^\//, '')}`} className="w-10 h-10 object-cover border border-sky-600 rounded-full" alt={attachment.filename || "Attachment image"} />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                        )}
                                        {attachment.filepath && (
                                            <a href={`${backendUrl.replace(/\/$/, '')}/${attachment.filepath.replace(/^\//, '')}`} target="_blank" rel="noopener noreferrer" className={`underline ${msg.sender === "self" ? "text-black" : "text-sky-700"}`}>
                                                {attachment.filename}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Display Commenter's Full Name / Username / Email and Timestamp */}
                        <div className="mt-1 text-right text-xs text-green-700 font-medium">
                            <span>
                                {/* Prioritize 'name' (first + last), then username, then email */}
                                {msg.commentedBy?.username} ({msg.commentedBy?.email})
                            </span>
                            {" - "}
                            {new Date(msg.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            ))
            )}
        </div>
    );
}