import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

import { AttachmentMenu } from './AttachmentMenu';
import { EmojiPicker } from './EmojiPicker';
import { GifPicker } from './GifPicker'

interface MessageInputProps {
  onSendMessage: (content: { 
    text?: string; 
    gifUrl?: string; 
    fileUrl?: string; 
    fileName?: string; 
    fileSize?: string;
    type: 'text' | 'gif' | 'image' | 'document' 
  }) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  const onSelectEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const onSelectGif = (gifUrl: string) => {
    onSendMessage({ gifUrl, type: 'gif' });
    setShowGifPicker(false);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ text: message, type: 'text' });
      setMessage('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;
    const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';

    onSendMessage({
      type,
      fileUrl,
      fileName,
      fileSize,
    });

    e.target.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 bg-[#f0f2f5] flex items-center gap-2 shrink-0 relative">
      <div className="flex items-center gap-1">
        <input 
          type="file" 
          ref={imageInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <input 
          type="file" 
          ref={docInputRef} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileSelect(e, 'document')}
        />

        <button 
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowGifPicker(false);
            setShowAttachmentMenu(false);
          }}
          className={cn(
            "p-2 hover:bg-gray-200 rounded-full transition-colors",
            showEmojiPicker ? "text-primary bg-gray-200" : "text-gray-500"
          )}
        >
          <Smile className="w-6 h-6" />
        </button>

        <button 
          onClick={() => {
            setShowGifPicker(!showGifPicker);
            setShowEmojiPicker(false);
            setShowAttachmentMenu(false);
          }}
          className={cn(
            "p-1.5 px-2 hover:bg-gray-200 rounded-lg transition-colors text-[10px] font-bold border border-current",
            showGifPicker ? "text-primary bg-gray-200" : "text-gray-500"
          )}
        >
          GIF
        </button>

        <button 
          onClick={() => {
            setShowAttachmentMenu(!showAttachmentMenu);
            setShowEmojiPicker(false);
            setShowGifPicker(false);
          }}
          className={cn(
            "p-2 hover:bg-gray-200 rounded-full transition-colors",
            showAttachmentMenu ? "text-primary bg-gray-200" : "text-gray-500"
          )}
        >
          <Paperclip className="w-6 h-6" />
        </button>

        {showAttachmentMenu && (
          <AttachmentMenu 
            onSelect={(type: 'image' | 'document') => {
              if (type === 'image') imageInputRef.current?.click();
              else if (type === 'document') docInputRef.current?.click();
            }}
            onClose={() => setShowAttachmentMenu(false)}
          />
        )}
      </div>

      {showEmojiPicker && (
        <EmojiPicker 
          onSelect={onSelectEmoji} 
          onClose={() => setShowEmojiPicker(false)} 
        />
      )}

      {showGifPicker && (
        <GifPicker 
          onSelect={onSelectGif} 
          onClose={() => setShowGifPicker(false)} 
        />
      )}
      
      <div className="flex-1 relative group/input">
        <textarea
          rows={1}
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full bg-white border border-transparent rounded-lg px-3 py-2 text-[15px] outline-none h-10 resize-none flex items-center shadow-sm placeholder:text-gray-400 transition-all focus:border-primary/20"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className={cn(
          "p-2.5 rounded-full transition-all flex items-center justify-center",
          message.trim() 
            ? "bg-primary text-white shadow-sm hover:opacity-90 active:scale-95" 
            : "text-gray-400 cursor-not-allowed"
        )}
      >
        <Send className="w-5 h-5 fill-current" />
      </button>
    </div>
  );
};
