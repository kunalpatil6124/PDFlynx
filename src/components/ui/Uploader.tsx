"use client";

import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, File, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploaderProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  maxFiles?: number;
  accept?: DropzoneOptions['accept'];
  className?: string;
  allowReorder?: boolean;
}

export default function Uploader({
  onFilesChange,
  files,
  maxFiles = 0,
  accept,
  className,
  allowReorder = false
}: UploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    let newFiles = [...files, ...acceptedFiles];
    if (maxFiles > 0 && newFiles.length > maxFiles) {
      newFiles = newFiles.slice(0, maxFiles);
    }
    onFilesChange(newFiles);
  }, [files, maxFiles, onFilesChange]);

  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles > 0 ? maxFiles : undefined,
  });

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center min-h-[250px]",
          isDragActive ? "border-primary bg-primary/5 border-primary" : "border-slate-300 hover:border-primary hover:bg-slate-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {isDragActive ? "Drop files here..." : "Choose or drag files here"}
        </h3>
        <p className="text-slate-500 text-sm">
          {maxFiles === 1 ? "Select 1 file max." : "You can drop multiple files here."}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {allowReorder && (
                  <div className="flex flex-col -space-y-1">
                    <button type="button" onClick={() => moveFile(idx, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-primary disabled:opacity-30 p-1">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveFile(idx, 'down')} disabled={idx === files.length - 1} className="text-slate-400 hover:text-primary disabled:opacity-30 p-1">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {file.type.startsWith('image/') ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded shrink-0 bg-slate-100"
                   />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => removeFile(e, idx)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
