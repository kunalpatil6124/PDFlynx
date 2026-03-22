"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/layout/ToolLayout';
import Uploader from '@/components/ui/Uploader';
import { jsPDF } from 'jspdf';
import { Download, Loader2 } from 'lucide-react';

export default function CompressPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    import('pdfjs-dist').then(pdfjsLib => {
      const version = pdfjsLib.version || '4.0.379';
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
    }).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfjsLib = await import('pdfjs-dist');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const doc = new jsPDF({ unit: 'mm' });
      doc.deletePage(1);

      let scale = 1.5;
      let quality = 0.6;
      if (level === 'low') { scale = 2.0; quality = 0.8; }
      else if (level === 'high') { scale = 1.0; quality = 0.4; }

      const numPages = pdf.numPages;
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not create canvas context");
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: ctx as any,
          viewport
        } as any).promise;
        
        const imgData = canvas.toDataURL('image/jpeg', quality);
        
        const pxToMm = 0.352778 / scale; 
        const pageW = viewport.width * pxToMm;
        const pageH = viewport.height * pxToMm;
        
        const orientation = pageW > pageH ? 'l' : 'p';
        doc.addPage([pageW, pageH], orientation);
        doc.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
      }

      doc.save(`pdf_tools_compressed_${file.name}`);
    } catch (error) {
      console.error(error);
      alert('Error compressing PDF. Please try a different file.');
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Compression Level</label>
        <div className="space-y-2">
          <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
             <input type="radio" name="compression" value="low" checked={level === 'low'} onChange={() => setLevel('low')} className="mt-1" />
             <div>
                <div className="font-semibold text-slate-800">Low Compression</div>
                <div className="text-xs text-slate-500">High image quality, less compression</div>
             </div>
          </label>
          <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
             <input type="radio" name="compression" value="medium" checked={level === 'medium'} onChange={() => setLevel('medium')} className="mt-1" />
             <div>
                <div className="font-semibold text-slate-800">Medium Compression</div>
                <div className="text-xs text-slate-500">Good image quality and good compression</div>
             </div>
          </label>
          <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
             <input type="radio" name="compression" value="high" checked={level === 'high'} onChange={() => setLevel('high')} className="mt-1" />
             <div>
                <div className="font-semibold text-slate-800">High Compression</div>
                <div className="text-xs text-slate-500">Lower image quality, high compression</div>
             </div>
          </label>
        </div>
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
        <><Loader2 className="w-6 h-6 animate-spin" /><span>Compressing PDF...</span></>
      ) : (
        <><Download className="w-6 h-6" /><span>Compress PDF</span></>
      )}
    </button>
  );

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce file size while optimizing for maximal PDF quality."
      files={files}
      uploader={uploader}
      controls={controls}
      actionButton={actionButton}
    />
  );
}
