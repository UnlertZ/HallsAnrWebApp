'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export default function OwnerLoginPage() {
  const router = useRouter();
  const { refreshSession, session, isOwner } = useAuth();

  const [username, setUsername] = useState('hall');
  const [password, setPassword] = useState('hall1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      await refreshSession();
      router.push('/');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Owner Portal • แผงควบคุมเจ้าของเว็บไซต์</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            เข้าสู่ระบบสำหรับ <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">คุณฮอลล์</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ระบบจัดการเนื้อหา เพิ่ม/ลบ/แก้ไขข้อมูลประวัติ และเข้าดูบันทึกผู้เยี่ยมชมเว็บไซต์ (Visitor Logs)
          </p>
        </div>

        {/* Existing Session Alert */}
        {session && isOwner && (
          <div className="p-4 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                คุณเข้าสู่ระบบในฐานะ:{' '}
                <strong className="text-amber-200">👑 คุณฮอลล์ (เจ้าของ)</strong>
              </span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
            >
              ไปยังหน้าหลัก
            </button>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white/95 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 backdrop-blur-xl">
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">ข้อมูลสำหรับทดสอบ (Demo Account):</span>
              <p className="mt-0.5 font-mono text-[11px] text-amber-800">
                Username: <strong>hall</strong> / Password: <strong>hall1234</strong>
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleOwnerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้ (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="hall"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังตรวจสอบข้อมูล...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>เข้าสู่ระบบจัดการเว็บไซต์</span>
                </>
              )}
            </button>
          </form>

          {/* Return to Visitor Entrance */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">ท่านเป็นผู้มาเยี่ยมชมเว็บไซต์?</span>
            <Link
              href="/welcome"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold transition-colors"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>ไปที่หน้าลงทะเบียนผู้เข้าชม &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500">
          <p>
            เข้าสู่ระบบเฉพาะสำหรับคุณฮอลล์ (สิทธิ์ผู้ดูแลระบบระดับสูงสุด)
          </p>
        </div>
      </div>
    </div>
  );
}
