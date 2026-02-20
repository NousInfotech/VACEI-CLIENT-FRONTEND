import { X, Search } from 'lucide-react';
import type { Message, User } from '../types';
import { useState } from 'react';

interface MessageSearchPaneProps {
  messages: Message[];
  participants: User[];
  chatName?: string;
  onClose: () => void;
  onMessageClick: (messageId: string) => void;
}

export const MessageSearchPane: React.FC<MessageSearchPaneProps> = ({
  messages,
  participants,
  chatName,
  onClose,
  onMessageClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const trimmed = searchQuery.trim().toLowerCase();

  const filteredMessages = trimmed
    ? messages.filter(msg =>
      !msg.isDeleted && (
        msg.text?.toLowerCase().includes(trimmed) ||
        msg.fileName?.toLowerCase().includes(trimmed)
      )
    )
    : [];

  /** Wrap matched text in a highlight span */
  const highlight = (text: string): React.ReactNode => {
    if (!trimmed) return text;
    const idx = text.toLowerCase().indexOf(trimmed);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {text.slice(idx, idx + trimmed.length)}
        </mark>
        {text.slice(idx + trimmed.length)}
      </>
    );
  };

  return (
    <div className="w-full bg-white h-full flex flex-col animate-in fade-in duration-500 shadow-xl z-20">
      {/* Header */}
      <div className="h-16 flex items-center px-4 bg-[#f0f2f5] shrink-0 gap-6">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="font-medium text-gray-900">Search Messages</span>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative group/search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/search:text-primary transition-colors" />
          <input
            autoFocus
            type="text"
            placeholder="Search in this chat…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-[#f0f2f5] border border-transparent rounded-lg text-sm outline-none transition-all focus:bg-white focus:border-primary/20 placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!trimmed ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <Search className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">
              {chatName ? `Search messages in "${chatName}"` : 'Type to search messages'}
            </p>
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="py-2">
            <p className="px-5 py-2 text-[13px] text-primary font-medium">
              {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
            </p>
            {filteredMessages.map((msg) => {
              const sender = participants.find(p => p.id === msg.senderId);
              const senderName = msg.senderId === 'me' ? 'You' : (sender?.name || 'Unknown');

              return (
                <button
                  key={msg.id}
                  onClick={() => onMessageClick(msg.id)}
                  className="w-full px-5 py-3 hover:bg-[#f5f6f6] transition-colors text-left border-b border-gray-50/50"
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-semibold text-primary">{senderName}</span>
                    <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-[14px] text-gray-700 leading-normal line-clamp-2">
                    {msg.text
                      ? highlight(msg.text)
                      : (msg.type === 'image' || msg.type === 'document')
                        ? `📎 ${msg.fileName}`
                        : ''}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <p className="text-sm">
              No messages found for &ldquo;<strong className="text-gray-600">{searchQuery}</strong>&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
