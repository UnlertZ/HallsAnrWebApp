'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Education } from '@/types';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Loader2,
} from 'lucide-react';

export default function EducationPage() {
  const { isOwner } = useAuth();
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Education | null>(null);
  const [formData, setFormData] = useState<Partial<Education>>({
    degree: '',
    institution: '',
    faculty: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
    isCurrent: false,
    gpa: '',
    honors: '',
    description: '',
    orderIndex: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEducation = async () => {
    try {
      const res = await fetch('/api/education');
      const data = await res.json();
      setEducationList(data);
    } catch (e) {
      console.error('Failed to fetch education:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      degree: '',
      institution: '',
      faculty: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      isCurrent: false,
      gpa: '',
      honors: '',
      description: '',
      orderIndex: educationList.length + 1,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Education) => {
    setEditingItem(item);
    setFormData(item);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const url = editingItem ? `/api/education/${editingItem.id}` : '/api/education';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      await fetchEducation();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบข้อมูลประวัติการศึกษานี้ใช่หรือไม่?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/education/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ลบข้อมูลไม่สำเร็จ');
      }
      setEducationList((prev) => prev.filter((item) => item.id !== id));
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
            <GraduationCap className="w-4 h-4" />
            <span>Academic Background</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            ประวัติการศึกษา (Education)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            คุณวุฒิการศึกษา ปริญญาบัตร และผลงานทางวิชาการของคุณฮอลล์
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มประวัติการศึกษา</span>
          </button>
        )}
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400">กำลังโหลดข้อมูลประวัติการศึกษา...</p>
        </div>
      ) : educationList.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-200 p-8">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">ยังไม่มีข้อมูลการศึกษา</p>
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
        <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8">
          {educationList.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-md flex items-center justify-center text-white" />

              <div className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.startYear} - {item.isCurrent ? 'ปัจจุบัน' : item.endYear}</span>
                    </span>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 pt-1">
                      {item.degree}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-0.5">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        {item.institution}
                      </span>
                      {item.faculty && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{item.faculty}</span>
                        </>
                      )}
                      {item.fieldOfStudy && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-blue-700 font-medium">{item.fieldOfStudy}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Owner CRUD Buttons */}
                  {isOwner && (
                    <div className="flex items-center gap-1 shrink-0">
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

                {/* Badges for GPA & Honors */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                  {item.gpa && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>เกรดเฉลี่ย (GPA): {item.gpa}</span>
                    </span>
                  )}
                  {item.honors && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item.honors}</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT EDUCATION */}
      {isModalOpen && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem ? 'แก้ไขข้อมูลการศึกษา' : 'เพิ่มประวัติการศึกษาใหม่'}
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

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วุฒิการศึกษา / ระดับการศึกษา *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ปริญญาตรี วิศวกรรมศาสตรบัณฑิต"
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อสถาบันการศึกษา / มหาวิทยาลัย *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น มหาวิทยาลัยเกษตรศาสตร์, จุฬาลงกรณ์มหาวิทยาลัย"
                  value={formData.institution || ''}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คณะ (Faculty)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น คณะวิศวกรรมศาสตร์"
                    value={formData.faculty || ''}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สาขาวิชา (Field of Study) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                    value={formData.fieldOfStudy || ''}
                    onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ปีที่เริ่มศึกษา (พ.ศ. หรือ ค.ศ.) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 2016"
                    value={formData.startYear || ''}
                    onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ปีที่จบการศึกษา *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 2020"
                    value={formData.endYear || ''}
                    onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เกรดเฉลี่ย (GPA)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 3.75"
                    value={formData.gpa || ''}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เกียรตินิยม / รางวัลพิเศษ (Honors)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น เกียรตินิยมอันดับหนึ่ง"
                    value={formData.honors || ''}
                    onChange={(e) => setFormData({ ...formData, honors: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดเพิ่มเติม / โครงงานวิจัย
                </label>
                <textarea
                  rows={3}
                  placeholder="เช่น สรุปโครงงานจบการศึกษา, รายวิชาสำคัญ หรือกิจกรรมวิชาการ"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      <span>{editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มประวัติการศึกษา'}</span>
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
