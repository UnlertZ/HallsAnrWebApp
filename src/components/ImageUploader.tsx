'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export default function ImageUploader({
  currentUrl,
  onUploadSuccess,
  label = 'อัปโหลดรูปภาพ (Azure Blob Storage)',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [storageType, setStorageType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'การอัปโหลดล้มเหลว');
      }

      setPreviewUrl(data.url);
      setStorageType(data.storageType);
      onUploadSuccess(data.url);
    } catch (err: unknown) {
      const error = err as Error;
      setUploadError(error.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label}
      </label>

      <div className="flex items-center gap-4">
        {/* Preview thumbnail */}
        <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload controls */}
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ภาพ'}</span>
            </button>

            {previewUrl && (
              <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>อัปโหลดแล้ว {storageType === 'azure' ? '(Azure Blob)' : '(Local)'}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            รองรับ JPG, PNG, WebP หรือ PDF ขนาดไม่เกิน 10MB
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
