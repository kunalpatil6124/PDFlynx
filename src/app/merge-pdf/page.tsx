"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/layout/ToolLayout';
import Uploader from '@/components/ui/Uploader';
import { PDFDocument } from 'pdf-lib';
import { Download, Loader2, Info } from 'lucide-react';

export default function MergePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (files.length < 2) {
       alert("Please upload at least 2 PDFs to merge.");
       return;
    }
    
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pdf_tools_merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Error merging PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const uploader = (
    <Uploader
      files={files}
      onFilesChange={setFiles}
      accept={{ 'application/pdf': ['.pdf'] }}
      allowReorder={true}
    />
  );

  const controls = (
    <div className="space-y-4 text-sm text-slate-600">
      <div className="flex bg-blue-50 text-blue-800 p-4 rounded-xl items-start space-x-3">
         <Info className="w-5 h-5 shrink-0 mt-0.5" />
         <p>Drag and drop or use the arrows to reorder the files. The files will be merged in the exact order they appear in the list.</p>
      </div>
    </div>
  );

  const actionButton = (
    <button
      onClick={handleGenerate}
      disabled={isProcessing || files.length < 2}
      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <><Loader2 className="w-6 h-6 animate-spin" /><span>Merging PDFs...</span></>
      ) : (
        <><Download className="w-6 h-6" /><span>Merge PDF</span></>
      )}
    </button>
  );

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine PDFs in the order you want with the easiest PDF merger available."
      files={files}
      uploader={uploader}
      controls={controls}
      actionButton={actionButton}
    />
  );
}
