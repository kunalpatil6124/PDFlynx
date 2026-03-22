"use client";

import React, { useState } from 'react';
import ToolLayout from '@/components/layout/ToolLayout';
import Uploader from '@/components/ui/Uploader';
import { jsPDF } from 'jspdf';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [margin, setMargin] = useState<number>(0);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const doc = new jsPDF({
        orientation: pageSize === 'fit' ? undefined : orientation,
        unit: 'mm',
        format: pageSize === 'fit' ? 'a4' : pageSize,
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const imgData = await getBase64(file);
        const imgProps = await getImageProperties(imgData);
        
        let pageW = doc.internal.pageSize.getWidth();
        let pageH = doc.internal.pageSize.getHeight();
        
        if (pageSize === 'fit') {
          const pxToMm = 0.264583;
          const imgWMm = imgProps.width * pxToMm;
          const imgHMm = imgProps.height * pxToMm;
          const imgOri = imgWMm > imgHMm ? 'l' : 'p';
          
          if (i === 0) {
            doc.deletePage(1);
            doc.addPage([imgWMm, imgHMm], imgOri);
          } else {
            doc.addPage([imgWMm, imgHMm], imgOri);
          }
          pageW = imgWMm;
          pageH = imgHMm;
        } else {
          if (i > 0) doc.addPage();
        }

        const actualW = pageW - margin * 2;
        const actualH = pageH - margin * 2;

        const ratio = Math.min(actualW / imgProps.width, actualH / imgProps.height);
        const drawW = imgProps.width * ratio;
        const drawH = imgProps.height * ratio;
        const startX = margin + (actualW - drawW) / 2;
        const startY = margin + (actualH - drawH) / 2;

        // Determine format based on file type
        const format = file.type === 'image/png' ? 'PNG' : 'JPEG';
        doc.addImage(imgData, format, startX, startY, drawW, drawH);
      }

      doc.save('pdf_tools_converted.pdf');
    } catch (error) {
      console.error(error);
      alert('Error generating PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const getImageProperties = (src: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = src;
    });
  };

  const uploader = (
    <Uploader
      files={files}
      onFilesChange={setFiles}
      accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
      allowReorder={true}
    />
  );

  const controls = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Page Size</label>
        <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="w-full border border-slate-300 rounded-lg p-2 bg-white">
          <option value="a4">A4</option>
          <option value="letter">Letter</option>
          <option value="fit">Fit (Same as image)</option>
        </select>
      </div>

      {pageSize !== 'fit' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Orientation</label>
          <div className="flex space-x-2">
             <button
               onClick={() => setOrientation('p')}
               className={cn("flex-1 py-2 rounded-lg border", orientation === 'p' ? "border-primary bg-primary/5 text-primary font-medium" : "border-slate-300 text-slate-600 hover:bg-slate-50")}
             >
               Portrait
             </button>
             <button
               onClick={() => setOrientation('l')}
               className={cn("flex-1 py-2 rounded-lg border", orientation === 'l' ? "border-primary bg-primary/5 text-primary font-medium" : "border-slate-300 text-slate-600 hover:bg-slate-50")}
             >
               Landscape
             </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Margin</label>
        <select value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full border border-slate-300 rounded-lg p-2 bg-white">
          <option value={0}>No margin (0mm)</option>
          <option value={5}>Small (5mm)</option>
          <option value={15}>Big (15mm)</option>
        </select>
      </div>
    </div>
  );

  const actionButton = (
    <button
      onClick={handleGenerate}
      disabled={isProcessing}
      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <><Loader2 className="w-6 h-6 animate-spin" /><span>Generating PDF...</span></>
      ) : (
        <><Download className="w-6 h-6" /><span>Convert to PDF</span></>
      )}
    </button>
  );

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert JPG or PNG images to PDF. Adjust orientation and margins."
      files={files}
      uploader={uploader}
      controls={controls}
      actionButton={actionButton}
    />
  );
}
