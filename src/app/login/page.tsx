'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession, session, isOwner, isVisitor } = useAuth();

  const [activeTab, setActiveTab] = useState<'visitor' | 'owner'>('visitor');

  // Visitor Form State
  const [visitorName, setVisitorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isVisitorSubmitting, setIsVisitorSubmitting] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);

  // Owner Form State
  const [username, setUsername] = useState('hall');
  const [password, setPassword] = useState('hall1234');
  const [isOwnerSubmitting, setIsOwnerSubmitting] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  // Handle Visitor Check-in
  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitorError(null);

    if (!visitorName.trim()) {
      setVisitorError('กรุณาระบุชื่อผู้เข้าเยี่ยมชม');
      return;
    }
    if (!companyName.trim()) {
      setVisitorError('กรุณาระบุชื่อบริษัท หรือหน่วยงานของท่าน');
      return;
    }

    setIsVisitorSubmitting(true);
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
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการลงทะเบียนเข้าชม');
      }

      await refreshSession();
      router.push('/');
    } catch (err: unknown) {
      const error = err as Error;
      setVisitorError(error.message || 'ไม่สามารถลงทะเบียนได้');
    } finally {
      setIsVisitorSubmitting(false);
    }
  };

  // Handle Owner Login
  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerError(null);

    if (!username.trim() || !password) {
      setOwnerError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsOwnerSubmitting(true);
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
      setOwnerError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsOwnerSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>ระบบพอร์ตโฟลิโอและเรซูเม่ออนไลน์ HallsAnr</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            ยินดีต้อนรับสู่ <span className="text-blue-600">HallsAnr</span>
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            กรุณาเลือกรูปแบบการเข้าสู่ระบบ: ลงทะเบียนสำหรับผู้เยี่ยมชม หรือ เข้าสู่ระบบสำหรับเจ้าของเว็บไซต์ (ฮอลล์)
          </p>
        </div>

        {/* Current logged-in notice if any */}
        {session && (
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-900">
                  คุณกำลังเข้าสู่ระบบในฐานะ:{' '}
                </span>
                <span className="text-blue-700 font-bold">
                  {isOwner ? '👑 คุณฮอลล์ (เจ้าของ)' : `👤 ผู้เยี่ยมชม (${session.companyName} - ${session.visitorName})`}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-300 shadow-2xs"
            >
              ไปยังหน้าหลัก
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="glass-card rounded-2xl shadow-xl overflow-hidden border border-slate-200/80">
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('visitor')}
              className={`flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'visitor'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>ผู้มาเยี่ยมชม (Visitor)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('owner')}
              className={`flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'owner'
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>เจ้าของเว็บ (ฮอลล์)</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* TAB 1: VISITOR CHECK-IN */}
            {activeTab === 'visitor' && (
              <form onSubmit={handleVisitorSubmit} className="space-y-4">
                <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-900">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    ระบบจะบันทึกข้อมูลการเข้าชมของท่าน (ชื่อและบริษัท) เข้าสู่ฐานข้อมูล SQL Database เพื่อให้คุณฮอลล์รับทราบการเข้าชม และท่านจะสามารถเข้าดูประวัติและผลงานทั้งหมดได้อย่างสมบูรณ์
                  </p>
                </div>

                {visitorError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{visitorError}</span>
                  </div>
                )}

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
                      placeholder="เช่น สมชาย สุขุมวิท หรือ HR / Recruiter"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อบริษัท / องค์กร / สถาบัน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="เช่น Tech Solutions, PTT, Agoda, SCG หรือ บุคคลทั่วไป"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      อีเมล (ไม่บังคับ)
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
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
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
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
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
                      placeholder="เช่น สนใจเสนองาน Cloud Engineer, สอบถามข้อมูลเพิ่มเติม, หรือเยี่ยมชมผลงาน"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVisitorSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {isVisitorSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึกและเข้าสู่เว็บไซต์...</span>
                    </>
                  ) : (
                    <>
                      <span>บันทึกประวัติและเข้าชมพอร์ตโฟลิโอ</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: OWNER LOGIN */}
            {activeTab === 'owner' && (
              <form onSubmit={handleOwnerSubmit} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">เข้าสู่ระบบสำหรับ คุณฮอลล์ (เจ้าของเว็บไซต์):</span>
                    <p className="mt-0.5 leading-relaxed text-amber-800">
                      เมื่อเข้าสู่ระบบในฐานะเจ้าของ ท่านจะมีสิทธิ์ในการเพิ่ม ลบ และแก้ไขข้อมูลทุกส่วนในเว็บไซต์ รวมทั้งสามารถเข้าดูบันทึกผู้มาเยี่ยมชมได้
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-amber-700 bg-amber-100/70 px-2 py-1 rounded">
                      Demo Account: <strong>hall</strong> / รหัสผ่าน: <strong>hall1234</strong>
                    </p>
                  </div>
                </div>

                {ownerError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{ownerError}</span>
                  </div>
                )}

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
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
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
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isOwnerSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-amber-500/25 transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {isOwnerSubmitting ? (
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
            )}
          </div>
        </div>

        {/* Security & Azure Note */}
        <div className="text-center text-xs text-slate-400">
          <p>
            ฐานข้อมูลปลอดภัยบน Microsoft Azure SQL Database • ไฟล์จัดเก็บผ่าน Azure Blob Storage
          </p>
        </div>
      </div>
    </div>
  );
}
