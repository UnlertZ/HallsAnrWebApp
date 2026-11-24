'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { VisitorLog } from '@/types';
import {
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  Search,
  Download,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Eye,
  X,
  Loader2,
  Globe,
  MessageSquare,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function VisitorLogsPage() {
  const router = useRouter();
  const { isOwner, isLoading: authLoading } = useAuth();

  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/visitors');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch visitor logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isOwner) {
      fetchLogs();
    } else if (!authLoading && !isOwner) {
      setIsLoading(false);
    }
  }, [authLoading, isOwner]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบบันทึกผู้เข้าชมรายนี้ใช่หรือไม่?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/visitors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ลบล้มเหลว');
      }
      setLogs((prev) => prev.filter((item) => item.id !== id));
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeletingId(null);
    }
  };

  // Export to CSV with UTF-8 BOM for Thai Excel compatibility
  const exportToCSV = () => {
    if (logs.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = ['วันที่เข้าชม', 'ชื่อผู้เข้าชม', 'บริษัท/หน่วยงาน', 'อีเมล', 'เบอร์โทรศัพท์', 'วัตถุประสงค์', 'IP Address'];
    const rows = filteredLogs.map((log) => [
      `"${new Date(log.visitedAt).toLocaleString('th-TH')}"`,
      `"${(log.visitorName || '').replace(/"/g, '""')}"`,
      `"${(log.companyName || '').replace(/"/g, '""')}"`,
      `"${(log.email || '').replace(/"/g, '""')}"`,
      `"${(log.phone || '').replace(/"/g, '""')}"`,
      `"${(log.purpose || '').replace(/"/g, '""')}"`,
      `"${(log.ipAddress || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hallsanr-visitor-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      log.visitorName.toLowerCase().includes(q) ||
      log.companyName.toLowerCase().includes(q) ||
      (log.email && log.email.toLowerCase().includes(q)) ||
      (log.purpose && log.purpose.toLowerCase().includes(q))
    );
  });

  // Calculate KPIs
  const totalVisits = logs.length;
  const uniqueCompanies = new Set(logs.map((l) => l.companyName.toLowerCase().trim())).size;
  const todayDateStr = new Date().toDateString();
  const visitsToday = logs.filter((l) => new Date(l.visitedAt).toDateString() === todayDateStr).length;

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // RESTRICTED ACCESS: Non-owner screen
  if (!isOwner) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              สงวนสิทธิ์เฉพาะเจ้าของเว็บไซต์ (ฮอลล์)
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              หน้านี้เป็นระบบบันทึกประวัติผู้เยี่ยมชมเว็บไซต์ (Visitor Logs) จัดเก็บข้อมูลเฉพาะสำหรับคุณฮอลล์เพื่อติดตามว่ามีบริษัทหรือผู้ใดเข้ามาเยี่ยมชมบ้าง ผู้เยี่ยมชมทั่วไปไม่สามารถเข้าถึงข้อมูลส่วนนี้ได้
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              กลับสู่หน้าหลัก
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              เข้าสู่ระบบในฐานะเจ้าของ (ฮอลล์)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Owner Dashboard (เฉพาะคุณฮอลล์)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            บันทึกประวัติผู้เข้าชมเว็บไซต์ (Visitor Logs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            บันทึกชื่อ บริษัท วัตถุประสงค์ และวันเวลาที่ผู้เข้าชมลงทะเบียนเข้าดูเรซูเม่ของคุณฮอลล์ใน Azure SQL
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={logs.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>ส่งออกเป็น CSV (Excel)</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalVisits}</div>
            <div className="text-xs font-medium text-slate-500">จำนวนการเข้าชมทั้งหมด</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{uniqueCompanies}</div>
            <div className="text-xs font-medium text-slate-500">บริษัท / องค์กรที่เยี่ยมชม</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{visitsToday}</div>
            <div className="text-xs font-medium text-slate-500">ผู้เยี่ยมชมในวันนี้</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้เยี่ยมชม บริษัท หรือข้อความ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400">กำลังโหลดบันทึกการเข้าชม...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">ไม่พบข้อมูลบันทึกผู้เข้าชม</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">วันและเวลาที่เข้าชม</th>
                  <th className="py-3 px-4">ชื่อผู้เยี่ยมชม</th>
                  <th className="py-3 px-4">บริษัท / องค์กร</th>
                  <th className="py-3 px-4">ช่องทางติดต่อ</th>
                  <th className="py-3 px-4">วัตถุประสงค์ / ข้อความ</th>
                  <th className="py-3 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {new Date(log.visitedAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.visitedAt).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} น.
                      </div>
                    </td>

                    {/* Visitor Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.visitorName}
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <Building2 className="w-3 h-3 text-blue-600" />
                        <span>{log.companyName}</span>
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      {log.email ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{log.email}</span>
                        </div>
                      ) : null}
                      {log.phone ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{log.phone}</span>
                        </div>
                      ) : null}
                      {!log.email && !log.phone && (
                        <span className="text-slate-400 italic text-[11px]">ไม่ระบุ</span>
                      )}
                    </td>

                    {/* Purpose */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {log.purpose ? (
                        <p
                          className="truncate cursor-pointer hover:text-blue-600"
                          onClick={() => setSelectedLog(log)}
                          title="คลิกเพื่ออ่านข้อความเต็ม"
                        >
                          {log.purpose}
                        </p>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">เข้าชมทั่วไป</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedLog(log)}
                          title="ดูรายละเอียด"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          title="ลบบันทึก"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === log.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  รายละเอียดผู้เข้าชมเว็บไซต์
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200/80">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">ชื่อผู้เข้าชม:</span>
                  <span className="font-bold text-slate-900">{selectedLog.visitorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">บริษัท / องค์กร:</span>
                  <span className="font-bold text-blue-700">{selectedLog.companyName}</span>
                </div>
                {selectedLog.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">อีเมล:</span>
                    <a
                      href={`mailto:${selectedLog.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedLog.email}
                    </a>
                  </div>
                )}
                {selectedLog.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">เบอร์โทรศัพท์:</span>
                    <a href={`tel:${selectedLog.phone}`} className="text-blue-600 hover:underline">
                      {selectedLog.phone}
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">เวลาที่เข้าชม:</span>
                  <span className="text-slate-700">
                    {new Date(selectedLog.visitedAt).toLocaleString('th-TH')}
                  </span>
                </div>
                {selectedLog.ipAddress && (
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>IP Address:</span>
                    <span>{selectedLog.ipAddress}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ข้อความ / วัตถุประสงค์ในการเข้าชม:
                </label>
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedLog.purpose || 'ไม่มีข้อความเพิ่มเติม (เข้าชมโปรไฟล์ทั่วไป)'}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedLog.id)}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  ลบบันทึกนี้
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
