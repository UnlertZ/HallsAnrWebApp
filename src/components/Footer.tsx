import React from 'react';
import Link from 'next/link';
import { Cloud, Database, HardDrive, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand info */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                H
              </div>
              <span className="font-bold text-slate-800 text-lg">HallsAnr</span>
            </div>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-sm">
              เว็บแอปพลิเคชันเรซูเม่ออนไลน์และพอร์ตโฟลิโอส่วนตัวของคุณฮอลล์ ออกแบบพร้อมรองรับการ Deploy บน Microsoft Azure Portal
            </p>
          </div>

          {/* Cloud stack tech badges */}
          <div className="flex flex-wrap items-center justify-start md:justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Azure App Service</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span>Azure SQL Database</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
              <span>Azure Blob Storage</span>
            </span>
          </div>

          {/* Copyright & Quick Links */}
          <div className="text-left md:text-right text-xs text-slate-500 space-y-1">
            <div className="flex items-center md:justify-end gap-3 font-medium">
              <Link href="/" className="hover:text-blue-600 transition-colors">โปรไฟล์</Link>
              <span>•</span>
              <Link href="/education" className="hover:text-blue-600 transition-colors">การศึกษา</Link>
              <span>•</span>
              <Link href="/experience" className="hover:text-blue-600 transition-colors">การทำงาน</Link>
              <span>•</span>
              <Link href="/training" className="hover:text-blue-600 transition-colors">การฝึกอบรม</Link>
            </div>
            <p className="text-slate-400">
              © {new Date().getFullYear()} HallsAnr. Powered by Next.js & Microsoft Azure.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
