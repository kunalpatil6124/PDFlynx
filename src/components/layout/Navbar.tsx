import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:opacity-90 transition-opacity">
            <Layers className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">PDF Tools</span>
          </Link>
          <div className="hidden sm:flex space-x-6">
            <Link href="/merge-pdf" className="text-slate-600 hover:text-primary font-medium text-sm transition-colors">Merge PDF</Link>
            <Link href="/split-pdf" className="text-slate-600 hover:text-primary font-medium text-sm transition-colors">Split PDF</Link>
            <Link href="/compress-pdf" className="text-slate-600 hover:text-primary font-medium text-sm transition-colors">Compress PDF</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
