'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ประตูทางเข้าเว็บไซต์ HallsAnr</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            กรุณาเลือกรูปแบบการเข้าใช้งาน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ระบบได้แยกหน้าสำหรับผู้มาเยี่ยมชม และหน้าสำหรับเจ้าของเว็บไซต์อย่างชัดเจน
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Visitor Gateway */}
          <Link
            href="/welcome"
            className="flex items-center justify-between p-5 rounded-2xl glass-card border border-blue-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  สำหรับผู้มาเยี่ยมชม (Visitor Check-in)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  กรอกชื่อและบริษัทเพื่อลงทะเบียนเข้าดูผลงานของคุณฮอลล์
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Owner Gateway */}
          <Link
            href="/owner-login"
            className="flex items-center justify-between p-5 rounded-2xl glass-card border border-amber-200/90 shadow-sm hover:border-amber-400 hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  สำหรับเจ้าของเว็บไซต์ (ฮอลล์)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เข้าสู่ระบบจัดการ เพิ่ม/แก้ไขข้อมูล และดูบันทึกผู้เข้าชม
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
