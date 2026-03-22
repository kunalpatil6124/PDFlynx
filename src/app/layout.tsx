import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PDF Tools Web App",
  description: "A comprehensive PDF tools web application to merge, split, compress, and edit PDFs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="footer py-6 text-center text-sm text-slate-500 border-t border-slate-200 mt-auto">
          <p>&copy; {new Date().getFullYear()} PDF Tools App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
