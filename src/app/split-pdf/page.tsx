"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/layout/ToolLayout';
import Uploader from '@/components/ui/Uploader';
import { PDFDocument } from 'pdf-lib';
import { Download, Loader2 } from 'lucide-react';

export default function SplitPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rangeStr, setRangeStr] = useState("1"); // e.g. "1, 3-5"

  const parseRanges = (str: string, maxPages: number): number[] => {
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
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      const pagesToExtract = parseRanges(rangeStr, totalPages);
      if (pagesToExtract.length === 0) {
        alert(`Invalid range. The document has ${totalPages} pages.`);
        setIsProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      // pdf-lib page indices are 0-based
      const indices = pagesToExtract.map(p => p - 1);
      const copiedPages = await newPdf.copyPages(pdf, indices);
      copiedPages.forEach(p => newPdf.addPage(p));

      const mergedPdfBytes = await newPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pdf_tools_split_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error splitting PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const uploader = (
    <Uploader
      files={files}
      onFilesChange={(newFiles) => {
         // Keep only the latest file for splitting
         setFiles(newFiles.length > 0 ? [newFiles[newFiles.length - 1]] : []);
      }}
      accept={{ 'application/pdf': ['.pdf'] }}
      maxFiles={1}
    />
  );

  const controls = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pages to extract</label>
        <input 
          type="text" 
          value={rangeStr}
          onChange={(e) => setRangeStr(e.target.value)}
          placeholder="e.g. 1, 3-5, 8"
          className="w-full border border-slate-300 rounded-lg p-2 bg-white"
        />
        <p className="text-xs text-slate-500 mt-2">
          Enter page numbers and/or page ranges separated by commas.
        </p>
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
        <><Loader2 className="w-6 h-6 animate-spin" /><span>Splitting PDF...</span></>
      ) : (
        <><Download className="w-6 h-6" /><span>Split PDF</span></>
      )}
    </button>
  );

  return (
    <ToolLayout
      title="Split PDF"
      description="Separate one page or a whole set for easy conversion into independent PDF files."
      files={files}
      uploader={uploader}
      controls={controls}
      actionButton={actionButton}
    />
  );
}
