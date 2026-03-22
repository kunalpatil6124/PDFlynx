"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/layout/ToolLayout';
import Uploader from '@/components/ui/Uploader';
import { PDFDocument, degrees } from 'pdf-lib';
import { Download, Loader2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RotatePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pagesStr, setPagesStr] = useState("");

  const parseRanges = (str: string, maxPages: number): number[] => {
    if (!str.trim()) {
      return Array.from({ length: maxPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>();
    const parts = str.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (start && end && start <= end) {
          for (let i = start; i <= end; i++) {
             if (i >= 1 && i <= maxPages) pages.add(i);
          }
        }
      } else {
        const num = Number(part);
        if (num && num >= 1 && num <= maxPages) pages.add(num);
      }
    }
    return Array.from(pages);
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      const pagesToRotate = parseRanges(pagesStr, totalPages);
      
      const pdfPages = pdf.getPages();
      pagesToRotate.forEach(pageNum => {
         const pageIdx = pageNum - 1;
         if (pageIdx >= 0 && pageIdx < pdfPages.length) {
            const page = pdfPages[pageIdx];
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + rotation));
         }
      });

      const mergedPdfBytes = await pdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pdf_tools_rotated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error rotating PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const uploader = (
    <Uploader
      files={files}
      onFilesChange={(newFiles) => {
         setFiles(newFiles.length > 0 ? [newFiles[newFiles.length - 1]] : []);
      }}
      accept={{ 'application/pdf': ['.pdf'] }}
      maxFiles={1}
    />
  );

  const controls = (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Direction</label>
        <div className="flex space-x-2">
           <button
             onClick={() => setRotation(90)}
             className={cn("flex flex-col items-center justify-center flex-1 py-3 rounded-lg border", rotation === 90 ? "border-primary bg-primary/5 text-primary font-medium" : "border-slate-300 text-slate-600 hover:bg-slate-50")}
           >
             <RotateCw className="w-5 h-5 mb-1" />
             <span>Right (90°)</span>
           </button>
           <button
             onClick={() => setRotation(180)}
             className={cn("flex flex-col items-center justify-center flex-1 py-3 rounded-lg border", rotation === 180 ? "border-primary bg-primary/5 text-primary font-medium" : "border-slate-300 text-slate-600 hover:bg-slate-50")}
           >
             <RotateCw className="w-5 h-5 mb-1" style={{ transform: 'rotate(90deg)' }} />
             <span>Upside Down</span>
           </button>
           <button
             onClick={() => setRotation(270)}
             className={cn("flex flex-col items-center justify-center flex-1 py-3 rounded-lg border", rotation === 270 ? "border-primary bg-primary/5 text-primary font-medium" : "border-slate-300 text-slate-600 hover:bg-slate-50")}
           >
             <RotateCw className="w-5 h-5 mb-1" style={{ transform: 'scaleX(-1)' }} />
             <span>Left (270°)</span>
           </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pages to rotate (Optional)</label>
        <input 
          type="text" 
          value={pagesStr}
          onChange={(e) => setPagesStr(e.target.value)}
          placeholder="e.g. 1-3, 5 (Leave empty for all)"
          className="w-full border border-slate-300 rounded-lg p-2 bg-white text-sm"
        />
      </div>
    </div>
  );

  const actionButton = (
    <button
      onClick={handleGenerate}
      disabled={isProcessing || files.length === 0}
      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <><Loader2 className="w-6 h-6 animate-spin" /><span>Rotating PDF...</span></>
      ) : (
        <><Download className="w-6 h-6" /><span>Rotate PDF</span></>
      )}
    </button>
  );

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate your PDFs the way you need them. Apply rotation to all pages or selected pages."
      files={files}
      uploader={uploader}
      controls={controls}
      actionButton={actionButton}
    />
  );
}
