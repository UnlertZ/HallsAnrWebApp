'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Users,
  LogOut,
  LogIn,
  Menu,
  X,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { session, isOwner, isVisitor, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'โปรไฟล์หลัก', icon: User },
    { href: '/education', label: 'ประวัติการศึกษา', icon: GraduationCap },
    { href: '/experience', label: 'ประวัติการทำงาน', icon: Briefcase },
    { href: '/training', label: 'การฝึกอบรม & ใบรับรอง', icon: Award },
    // Visitor logs is strictly shown ONLY to owner!
    ...(isOwner
      ? [
          {
            href: '/visitor-logs',
            label: 'บันทึกผู้เข้าชม',
            icon: Users,
            badge: 'เฉพาะเจ้าของ',
          },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg tracking-wider">H</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 bg-clip-text text-transparent">
                HallsAnr
              </span>
              <span className="block text-[11px] font-medium text-slate-500 -mt-1 tracking-wider uppercase">
                Resume & Portfolio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/60 font-semibold'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Session & Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : isOwner ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>👑 คุณฮอลล์ (เจ้าของ)</span>
                </div>
                <button
                  onClick={logout}
                  title="ออกจากระบบ"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออก</span>
                </button>
              </div>
            ) : isVisitor ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span className="max-w-[140px] truncate" title={session?.companyName}>
                    {session?.companyName}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="max-w-[100px] truncate text-slate-900 font-semibold">
                    {session?.visitorName}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="ออกจากระบบ / สลับบัญชี"
                  className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ / ลงทะเบียน</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-slate-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            {isOwner ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>สถานะ: คุณฮอลล์ (สิทธิ์แก้ไขได้สมบูรณ์)</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : isVisitor ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-600">
                  <div className="font-semibold text-slate-900">{session?.visitorName}</div>
                  <div>บริษัท: {session?.companyName}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ / ลงทะเบียนเข้าชม</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
