'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Experience } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Loader2,
  Cpu,
  Trophy,
} from 'lucide-react';

export default function ExperiencePage() {
  const { isOwner } = useAuth();
  const [experienceList, setExperienceList] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<Partial<Experience>>({
    jobTitle: '',
    companyName: '',
    companyLogoUrl: '',
    employmentType: 'Full-time',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    responsibilities: [],
    achievements: [],
    technologies: [],
    orderIndex: 0,
  });

  // String helpers for textarea inputs
  const [respText, setRespText] = useState('');
  const [achieveText, setAchieveText] = useState('');
  const [techText, setTechText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExperience = async () => {
    try {
      const res = await fetch('/api/experience');
      const data = await res.json();
      setExperienceList(data);
    } catch (e) {
      console.error('Failed to fetch experience:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      jobTitle: '',
      companyName: '',
      companyLogoUrl: '',
      employmentType: 'Full-time',
      location: 'กรุงเทพมหานคร',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      responsibilities: [],
      achievements: [],
      technologies: [],
      orderIndex: experienceList.length + 1,
    });
    setRespText('');
    setAchieveText('');
    setTechText('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Experience) => {
    setEditingItem(item);
    setFormData(item);
    setRespText((item.responsibilities || []).join('\n'));
    setAchieveText((item.achievements || []).join('\n'));
    setTechText((item.technologies || []).join(', '));
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const responsibilities = respText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const achievements = achieveText
      .split('\n')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const technologies = techText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      ...formData,
      responsibilities,
      achievements,
      technologies,
    };

    try {
      const url = editingItem ? `/api/experience/${editingItem.id}` : '/api/experience';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      await fetchExperience();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบข้อมูลประวัติการทำงานนี้ใช่หรือไม่?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/experience/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ลบข้อมูลไม่สำเร็จ');
      }
      setExperienceList((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Professional Career</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            ประวัติการทำงาน (Work Experience)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ประสบการณ์การทำงานในองค์กรชั้นนำ โครงการที่รับผิดชอบ และผลลัพธ์ที่สร้างขึ้น
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มประวัติการทำงาน</span>
          </button>
        )}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400">กำลังโหลดประวัติการทำงาน...</p>
        </div>
      ) : experienceList.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-200 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">ยังไม่มีข้อมูลการทำงาน</p>
          {isOwner && (
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 text-xs bg-blue-600 text-white rounded-lg font-semibold"
            >
              คลิกเพื่อเพิ่มรายการแรก
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {experienceList.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Company Logo / Avatar */}
                  <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {item.companyLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.companyLogoUrl}
                        alt={item.companyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-blue-600" />
                    )}
                  </div>

                  {/* Title & Organization */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {item.jobTitle}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.employmentType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {item.companyName}
                      </span>
                      {item.location && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.location}
                          </span>
                        </>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 text-blue-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {item.startDate} - {item.isCurrent ? 'ปัจจุบัน' : item.endDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner CRUD Buttons */}
                {isOwner && (
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => openEditModal(item)}
                      title="แก้ไขข้อมูลนี้"
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      title="ลบข้อมูลนี้"
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 mt-4 leading-relaxed">
                {item.description}
              </p>

              {/* Responsibilities list */}
              {item.responsibilities && item.responsibilities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    หน้าที่และความรับผิดชอบหลัก:
                  </h3>
                  <ul className="space-y-1.5">
                    {item.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Achievements */}
              {item.achievements && item.achievements.length > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    <span>ผลงานและความสำเร็จสำคัญ:</span>
                  </div>
                  <ul className="space-y-1">
                    {item.achievements.map((ach, aIdx) => (
                      <li key={aIdx} className="text-xs text-amber-800 leading-relaxed">
                        • {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack Pills */}
              {item.technologies && item.technologies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {item.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPERIENCE */}
      {isModalOpen && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem ? 'แก้ไขประวัติการทำงาน' : 'เพิ่มประวัติการทำงานใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Upload Company Logo */}
              <ImageUploader
                currentUrl={formData.companyLogoUrl}
                label="โลโก้บริษัท (อัปโหลดเข้า Azure Blob Storage)"
                onUploadSuccess={(url) => setFormData({ ...formData, companyLogoUrl: url })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่งงาน (Job Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Senior Cloud & Software Engineer"
                    value={formData.jobTitle || ''}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อบริษัท / องค์กร *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Microsoft, PTT Digital, SCB"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ประเภทการจ้างงาน
                  </label>
                  <select
                    value={formData.employmentType || 'Full-time'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentType: e.target.value as Experience['employmentType'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                  >
                    <option value="Full-time">งานประจำ (Full-time)</option>
                    <option value="Contract">สัญญาจ้าง (Contract)</option>
                    <option value="Freelance">ฟรีแลนซ์ (Freelance)</option>
                    <option value="Part-time">พาร์ทไทม์ (Part-time)</option>
                    <option value="Internship">ฝึกงาน (Internship)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่ทำงาน / รูปแบบ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น กรุงเทพมหานคร (Hybrid)"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่/เดือนที่เริ่มงาน *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น มกราคม 2022"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่สิ้นสุด (เว้นว่างหรือพิมพ์ ปัจจุบัน ได้)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ปัจจุบัน หรือ ธันวาคม 2023"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำอธิบายภาพรวมงาน (Summary Description) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="สรุปบทบาทและหน้าที่โดยรวมในตำแหน่งนี้"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หน้าที่และความรับผิดชอบ (พิมพ์ 1 ข้อ ต่อ 1 บรรทัด)
                </label>
                <textarea
                  rows={4}
                  placeholder={`ออกแบบ Architecture บน Microsoft Azure\nพัฒนา Web Application ด้วย Next.js และ TypeScript\nดูแลระบบ CI/CD Pipeline`}
                  value={respText}
                  onChange={(e) => setRespText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ผลงานและความสำเร็จสำคัญ (พิมพ์ 1 ข้อ ต่อ 1 บรรทัด)
                </label>
                <textarea
                  rows={3}
                  placeholder={`ลด latency ของระบบลง 40%\nเพิ่ม uptime ระบบเป็น 99.95%`}
                  value={achieveText}
                  onChange={(e) => setAchieveText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เทคโนโลยีและเครื่องมือที่ใช้ (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  placeholder="เช่น Microsoft Azure, Azure SQL, Next.js, Node.js, Docker, TypeScript"
                  value={techText}
                  onChange={(e) => setTechText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มประวัติการทำงาน'}</span>
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
