'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { refreshSession, session, isOwner } = useAuth();

  const [visitorName, setVisitorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVisitorCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!visitorName.trim()) {
      setErrorMsg('กรุณาระบุชื่อ-นามสกุล ของท่าน');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('กรุณาระบุชื่อบริษัท หรือองค์กรของท่าน');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: visitorName.trim(),
          companyName: companyName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          purpose: purpose.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      }

      await refreshSession();
      router.push(redirectPath);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'ไม่สามารถลงทะเบียนได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background Glow & Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full mx-auto relative z-10 space-y-6">
        {/* Brand & Gate Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>ประตูเข้าสู่เว็บไซต์ • HallsAnr Cloud Portfolio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            ยินดีต้อนรับสู่ <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">HallsAnr</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            กรุณาระบุข้อมูลผู้เข้าชมเพื่อปลดล็อกและเข้าดูเรซูเม่ ประวัติการศึกษา ผลงาน และการฝึกอบรมของคุณฮอลล์
          </p>
        </div>

        {/* Existing Session Alert */}
        {session && (
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                คุณลงทะเบียนแล้ว:{' '}
                <strong className="text-sky-300">
                  {isOwner ? '👑 คุณฮอลล์ (เจ้าของ)' : `${session.companyName} (${session.visitorName})`}
                </strong>
              </span>
            </div>
            <button
              onClick={() => router.push(redirectPath)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            >
              เข้าสู่หน้าเว็บทันที
            </button>
          </div>
        )}

        {/* Visitor Registration Card */}
        <div className="bg-white/95 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ลงทะเบียนสำหรับผู้มาเยี่ยมชม (Visitor)
                </h2>
                <p className="text-[11px] text-slate-500">
                  ข้อมูลจะถูกบันทึกลง Azure SQL เพื่อแจ้งให้คุณฮอลล์ทราบ
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              สิทธิ์อ่านอย่างเดียว
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVisitorCheckIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ-นามสกุล ของท่าน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย ใจดี หรือ HR Manager"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อบริษัท / องค์กร / หน่วยงาน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น PTT, Agoda, SCG, Google หรือ บุคคลทั่วไป"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมลสำหรับติดต่อ (ไม่บังคับ)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="hr@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ (ไม่บังคับ)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="081-xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วัตถุประสงค์ในการเข้าชม / ข้อความถึงคุณฮอลล์ (ไม่บังคับ)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  placeholder="เช่น สนใจเสนองาน Cloud Engineer, ปรึกษาโปรเจกต์ หรือเยี่ยมชมผลงาน"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกและปลดล็อกเข้าสู่เว็บไซต์...</span>
                </>
              ) : (
                <>
                  <span>บันทึกข้อมูลและเข้าสู่เว็บไซต์</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Distinct Owner Link Separated Here */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">ท่านคือคุณฮอลล์ (เจ้าของเว็บไซต์)?</span>
            <Link
              href="/owner-login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>เข้าสู่ระบบสำหรับเจ้าของ (ฮอลล์) &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400">
          <p>
            HallsAnr Web Application • Deployable on Microsoft Azure Portal
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WelcomeGatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}
