'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TrainingCertification } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Loader2,
  FileCheck,
  Building,
} from 'lucide-react';

export default function TrainingPage() {
  const { isOwner } = useAuth();
  const [trainingList, setTrainingList] = useState<TrainingCertification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingCertification | null>(null);
  const [formData, setFormData] = useState<Partial<TrainingCertification>>({
    title: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    imageUrl: '',
    description: '',
    orderIndex: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Enlarge preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchTrainings = async () => {
    try {
      const res = await fetch('/api/trainings');
      const data = await res.json();
      setTrainingList(data);
    } catch (e) {
      console.error('Failed to fetch trainings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      issuer: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
      imageUrl: '',
      description: '',
      orderIndex: trainingList.length + 1,
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TrainingCertification) => {
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
      const url = editingItem ? `/api/trainings/${editingItem.id}` : '/api/trainings';
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

      await fetchTrainings();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบข้อมูลการฝึกอบรมนี้ใช่หรือไม่?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/trainings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ลบข้อมูลไม่สำเร็จ');
      }
      setTrainingList((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Certifications & Specialized Training</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            การฝึกอบรม & ใบรับรองคุณวุฒิ (Certifications)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            หลักสูตรวิชาชีพ ใบประกาศนียบัตรระดับสากล และการอบรมยกระดับทักษะของคุณฮอลล์
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มการฝึกอบรม / ใบรับรอง</span>
          </button>
        )}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400">กำลังโหลดข้อมูลการฝึกอบรม...</p>
        </div>
      ) : trainingList.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-200 p-8">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">ยังไม่มีข้อมูลการฝึกอบรม</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainingList.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header row: badge image + actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Certificate Thumbnail */}
                    <div
                      onClick={() => item.imageUrl && setPreviewImage(item.imageUrl)}
                      className={`w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs ${
                        item.imageUrl ? 'cursor-pointer hover:opacity-90' : ''
                      }`}
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Award className="w-7 h-7 text-blue-600" />
                      )}
                    </div>

                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                        <Building className="w-3 h-3 text-blue-600" />
                        <span>{item.issuer}</span>
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  {/* Owner CRUD Buttons */}
                  {isOwner && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(item)}
                        title="แก้ไขข้อมูลนี้"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        title="ลบข้อมูลนี้"
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
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
                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Meta information & Verification link */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>ได้รับ: {item.issueDate}</span>
                  </span>
                  {item.credentialId && (
                    <span className="font-mono text-slate-400 text-[11px]">
                      ID: {item.credentialId}
                    </span>
                  )}
                </div>

                {item.credentialUrl && (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>ตรวจสอบใบรับรอง</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT TRAINING */}
      {isModalOpen && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem ? 'แก้ไขข้อมูลการฝึกอบรม' : 'เพิ่มการฝึกอบรม / ใบรับรองใหม่'}
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
              {/* Image Uploader for Certificate (Azure Blob) */}
              <ImageUploader
                currentUrl={formData.imageUrl}
                label="รูปภาพประกาศนียบัตร / ตราสัญลักษณ์ (Azure Blob Storage)"
                onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อหลักสูตร หรือ ชื่อใบรับรอง *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Microsoft Certified: Azure Solutions Architect Expert"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถาบันหรือองค์กรผู้ออกใบรับรอง *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Microsoft, Google Cloud, AWS, หรือ มหาวิทยาลัย"
                  value={formData.issuer || ''}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่หรือปีที่ได้รับ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 2023 หรือ มกราคม 2023"
                    value={formData.issueDate || ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันหมดอายุ (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 2025 หรือ ไม่ระบุ"
                    value={formData.expirationDate || ''}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credential ID / รหัสใบรับรอง
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น MS-AZ305-998124"
                    value={formData.credentialId || ''}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL สำหรับตรวจสอบใบรับรอง
                  </label>
                  <input
                    type="url"
                    placeholder="https://learn.microsoft.com/..."
                    value={formData.credentialUrl || ''}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดและเนื้อหาสำคัญที่ผ่านการอบรม
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุทักษะที่ได้รับ และหัวข้อหลักของการฝึกอบรม"
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
                      <span>{editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW ENLARGED IMAGE MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Certificate Preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
