import React from 'react';
import { Check, CheckCheck, FileText } from 'lucide-react';
import type { Message, User } from '../types';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isMe: boolean;
  sender?: User;
  showSenderName?: boolean;
  onMediaClick?: (message: Message) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isMe,
  sender,
  showSenderName,
  onMediaClick,
}) => {
  return (
    <div className={cn("flex flex-col mb-4", isMe ? "items-end" : "items-start")}>
      {!isMe && showSenderName && sender && (
        <span className="text-[10px] font-semibold text-primary mb-1 ml-2">
          {sender.name}
        </span>
      )}
      
      <div
        className={cn(
          "max-w-[85%] relative shadow-sm px-2.5 py-1.5 min-w-[60px]",
          isMe 
            ? "bg-primary text-white rounded-lg rounded-tr-none" 
            : "bg-white text-gray-800 rounded-lg rounded-tl-none border border-[#e2e8f0]/30",
          message.type === 'gif' ? "p-1" : ""
        )}
      >
        {message.type === 'image' ? (
          <div 
            className="overflow-hidden rounded-xl mb-1 cursor-pointer hover:opacity-95 transition-opacity bg-black/5"
            onClick={() => onMediaClick?.(message)}
          >
            <img 
              src={message.fileUrl} 
              alt={message.fileName} 
              className="w-[300px] h-full object-cover" 
            />
          </div>
        ) : message.type === 'document' ? (
          <div 
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg mb-1 border group cursor-pointer transition-colors",
              isMe 
                ? "bg-white/10 border-white/10 hover:bg-white/20" 
                : "bg-black/5 border-black/5 hover:bg-black/10"
            )}
            onClick={() => {
              if (message.fileUrl) {
                window.open(message.fileUrl, '_blank');
              }
            }}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-[14px] font-medium truncate",
                isMe ? "text-white" : "text-gray-900"
              )}>
                {message.fileName}
              </p>
              <p className={cn(
                "text-[12px] uppercase",
                isMe ? "text-white/60" : "text-gray-500"
              )}>
                {message.fileSize}
              </p>
            </div>
          </div>
        ) : message.type === 'gif' ? (
          <div className="overflow-hidden rounded-lg">
            <img src={message.gifUrl} alt="GIF" className="max-w-full h-auto min-w-[200px]" />
          </div>
        ) : (
          <p className="text-[14.5px] pr-[70px] pb-1 leading-normal break-word whitespace-pre-wrap">{message.text}</p>
        )}
        
        <div className={cn(
          "absolute bottom-1 right-2 flex items-center gap-1",
          isMe ? "text-white/70" : "text-gray-400",
          message.type === 'gif' && "bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-white/90"
        )}>
          <span className="text-[10px] uppercase">{message.timestamp}</span>
          {isMe && (
            <span>
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-white" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
