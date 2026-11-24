'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Profile } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  FileText,
  Edit3,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  Save,
  X,
  Loader2,
  Cloud,
} from 'lucide-react';

export default function ProfilePage() {
  const { isOwner, isVisitor, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data);
      setEditFormData(data);
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'บันทึกข้อมูลล้มเหลว');
      }

      setProfile(data.profile);
      setSaveSuccessMsg('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccessMsg(null);
      }, 1200);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">ไม่พบข้อมูลโปรไฟล์</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Welcome banner for visitor or owner */}
      {isVisitor && session && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              👋
            </div>
            <div>
              <p className="text-xs text-blue-800 font-bold">
                ยินดีต้อนรับ คุณ{session.visitorName} จาก {session.companyName}
              </p>
              <p className="text-xs text-slate-600">
                คุณเข้าสู่ระบบในโหมดผู้เยี่ยมชม (อ่านอย่างเดียว) ขอขอบคุณที่ให้ความสนใจประวัติของคุณฮอลล์ครับ
              </p>
            </div>
          </div>
          <Link
            href="/experience"
            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shrink-0 transition-colors"
          >
            ดูผลงาน & ประสบการณ์
          </Link>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50">
        {/* Banner Background */}
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Owner Quick Edit Action */}
          {isOwner && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-xl shadow-md backdrop-blur-md transition-all hover:scale-105"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>แก้ไขข้อมูลโปรไฟล์ (เจ้าของ)</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-10 pb-8 sm:pb-10 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-20 sm:-mt-24 mb-6">
            {/* Avatar & Main Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'}
                    alt={profile.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {isOwner && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    title="เปลี่ยนรูปโปรไฟล์"
                    className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1 sm:mb-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {profile.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {profile.nickName}
                  </span>
                </div>
                <p className="text-base sm:text-lg font-medium text-blue-700">
                  {profile.title}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Resume, Social) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
                  title="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-blue-700 hover:text-blue-800 transition-colors shadow-2xs"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sky-700 hover:text-sky-800 transition-colors shadow-2xs"
                  title="Website"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {profile.resumePdfUrl ? (
                <a
                  href={profile.resumePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>ดาวน์โหลด Resume (PDF)</span>
                </a>
              ) : (
                <Link
                  href="/experience"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>ดูผลงานการทำงาน</span>
                </Link>
              )}
            </div>
          </div>

          {/* Bio text */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              เกี่ยวกับตัวผม (About Me)
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {profile.bio}
            </p>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT STATS */}
      {profile.highlightStats && profile.highlightStats.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profile.highlightStats.map((stat, idx) => (
            <div
              key={idx}
              className="glass-card p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all group"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-slate-800 mt-1">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-xs text-slate-400 mt-0.5">
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* QUICK SECTION GATEWAY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/education"
          className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>ประวัติการศึกษา</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            วุฒิการศึกษา ปริญญาตรี วิศวกรรมคอมพิวเตอร์ เกียรตินิยม และรางวัลวิชาการ
          </p>
        </Link>

        <Link
          href="/experience"
          className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>ประวัติการทำงาน</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            ตำแหน่งงาน ความรับผิดชอบ และผลงานความสำเร็จในองค์กรเทคโนโลยีชั้นนำ
          </p>
        </Link>

        <Link
          href="/training"
          className="glass-card p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>การฝึกอบรม & ใบรับรอง</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            ใบรับรอง Microsoft Certified Azure Solutions Architect, Developer และหลักสูตรวิชาชีพ
          </p>
        </Link>
      </section>

      {/* SKILLS MATRIX */}
      <section className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Competencies & Stack</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              ทักษะและความเชี่ยวชาญ (Skills Matrix)
            </h2>
          </div>
          {isOwner && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไขทักษะ</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.skills?.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span>{cat.category}</span>
              </h3>

              <div className="space-y-3">
                {cat.items.map((skill, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{skill.name}</span>
                      <span className="text-slate-400 font-mono">{skill.level || 85}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${skill.badgeColor || 'bg-blue-600'} transition-all duration-500`}
                        style={{ width: `${skill.level || 85}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OWNER EDIT PROFILE MODAL */}
      {isEditModalOpen && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  แก้ไขข้อมูลโปรไฟล์หลัก (คุณฮอลล์)
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Avatar Upload via Azure Blob Storage */}
              <ImageUploader
                currentUrl={editFormData.avatarUrl}
                label="รูปโปรไฟล์ (อัปโหลดเข้า Azure Blob Storage)"
                onUploadSuccess={(url) => setEditFormData({ ...editFormData, avatarUrl: url })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อเล่น / ฉายา
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.nickName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nickName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ตำแหน่ง / สายอาชีพ (Professional Headline)
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประวัติโดยย่อ (Bio & Summary)
                </label>
                <textarea
                  rows={4}
                  required
                  value={editFormData.bio || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมล (Email)
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ที่อยู่ / ที่พักอาศัย
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.githubUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.linkedinUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จำนวนปีประสบการณ์
                  </label>
                  <input
                    type="number"
                    value={editFormData.yearsOfExperience || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>บันทึกการเปลี่ยนแปลง</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
