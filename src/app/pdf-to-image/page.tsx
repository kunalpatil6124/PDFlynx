"use client";

import React, { useState, useEffect } from 'react';
import ToolLayout from '@/components/layout/ToolLayout';
import Uploader from '@/components/ui/Uploader';
import { Download, Loader2 } from 'lucide-react';

export default function PdfToImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');

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
      
      const numPages = pdf.numPages;
      const images: string[] = [];
      const scale = 2.0; // Higher scale for better quality

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
        
        const imgData = canvas.toDataURL(`image/${format}`, 1.0);
        images.push(imgData);
      }

      // Download images sequentially
      for (let i = 0; i < images.length; i++) {
        const a = document.createElement('a');
        a.href = images[i];
        a.download = `page_${i + 1}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        await new Promise(r => setTimeout(r, 250));
      }

    } catch (error) {
      console.error(error);
      alert('Error extracting images.');
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
        <label className="block text-sm font-medium text-slate-700 mb-2">Image Format</label>
        <div className="flex space-x-4">
           <label className="flex items-center space-x-2 cursor-pointer">
             <input type="radio" name="format" value="jpeg" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} />
             <span>JPG</span>
           </label>
           <label className="flex items-center space-x-2 cursor-pointer">
             <input type="radio" name="format" value="png" checked={format === 'png'} onChange={() => setFormat('png')} />
             <span>PNG</span>
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
        <><Loader2 className="w-6 h-6 animate-spin" /><span>Extracting Images...</span></>
      ) : (
        <><Download className="w-6 h-6" /><span>Convert to {format === 'jpeg' ? 'JPG' : 'PNG'}</span></>
      )}
    </button>
  );

  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert each PDF page into a JPG or PNG."
      files={files}
      uploader={uploader}
      controls={controls}
      actionButton={actionButton}
    />
  );
}
