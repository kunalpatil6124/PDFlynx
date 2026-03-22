"use client";

import React, { ReactNode } from 'react';

interface ToolLayoutProps {
  title: string;
  description: string;
  files: File[];
  uploader: ReactNode;
  controls?: ReactNode;
  actionButton?: ReactNode;
}

export default function ToolLayout({
  title,
  description,
  files,
  uploader,
  controls,
  actionButton
}: ToolLayoutProps) {
  const hasFiles = files.length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-6xl mx-auto py-10">
      {!hasFiles && (
        <div className="text-center mb-10 space-y-4 fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{description}</p>
        </div>
      )}

      {hasFiles ? (
         <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start fade-in">
           <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
              </div>
              {uploader}
           </div>
           
           <div className="lg:col-span-1 space-y-6">
              {controls && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 border-b border-slate-100 pb-2">Options</h3>
                  {controls}
                </div>
              )}
              {actionButton}
           </div>
         </div>
      ) : (
         <div className="w-full max-w-3xl fade-in">
           {uploader}
         </div>
      )}
    </div>
  );
}
