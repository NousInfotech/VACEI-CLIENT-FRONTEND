"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, ImageIcon, Eye, Download } from "lucide-react";
import { toast } from "sonner";

interface ExistingFile {
  id: string;
  file_name: string;
  url: string;
}

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  existingFiles?: ExistingFile[];
  onRemoveExisting?: (fileId: string) => void;
  maxFiles?: number;
}

export function FileUploader({ 
  files, 
  onFilesChange, 
  existingFiles = [], 
  onRemoveExisting,
  maxFiles = 10 
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    
    const incomingFiles = Array.from(newFiles);
    const totalFiles = files.length + existingFiles.length + incomingFiles.length;

    if (totalFiles > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    // Check file size (e.g., 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    const validFiles = incomingFiles.filter(file => {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} is too large. Max size is 25MB.`);
        return false;
      }
      return true;
    });

    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return <ImageIcon className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Support for PDF, Images, Spreadsheets (Max 25MB)
          </p>
        </div>
      </div>

      {(files.length > 0 || existingFiles.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Existing Files */}
          {existingFiles.map((file) => (
            <div 
              key={file.id}
              className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  {getFileIcon(file.file_name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.file_name}
                  </p>
                  <p className="text-[11px] text-green-500 font-medium">
                    Uploaded
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleView(file.url); }}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemoveExisting(file.id); }}
                    className="p-1.5 text-gray-400 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* New Files */}
          {files.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  {getFileIcon(file.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1.5 text-gray-400 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
