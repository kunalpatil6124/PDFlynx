import Link from 'next/link';
import { 
  FileImage, Combine, Split, 
  Minimize, Image as ImageIcon, RotateCw 
} from 'lucide-react';

const tools = [
  {
    title: "Merge PDF",
    description: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: Combine,
    href: "/merge-pdf",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: Split,
    href: "/split-pdf",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: Minimize,
    href: "/compress-pdf",
    color: "text-green-500",
    bg: "bg-green-50"
  },
  {
    title: "PDF to Image",
    description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
    icon: FileImage,
    href: "/pdf-to-image",
    color: "text-yellow-500",
    bg: "bg-yellow-50"
  },
  {
    title: "Image to PDF",
    description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    icon: ImageIcon,
    href: "/image-to-pdf",
    color: "text-red-500",
    bg: "bg-red-50"
  },
  {
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    icon: RotateCw,
    href: "/rotate-pdf",
    color: "text-purple-500",
    bg: "bg-purple-50"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center py-12">
      <div className="text-center mb-16 space-y-4 fade-in">
        <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">Every tool you need to work with PDFs</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          100% free and easy to use! Merge, split, compress, convert, and manage your PDFs with just a few clicks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <Link 
              key={tool.href} 
              href={tool.href}
              className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`${tool.bg} ${tool.color} p-4 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
