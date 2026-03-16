'use client';

import { useState } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Ошибка при загрузке изображения');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>}
      
      <div className="flex items-center gap-4">
        {/* Preview Area */}
        <div className="relative w-40 h-24 rounded-xl bg-gray-950 border border-gray-800 overflow-hidden flex items-center justify-center group">
          {value ? (
            <>
              <Image 
                src={value} 
                alt="Upload preview" 
                fill 
                className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
              />
              <button
                onClick={() => onChange('')}
                className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-600">
              <ImageIcon size={24} />
              <span className="text-[10px] uppercase font-bold tracking-tighter">Нет фото</span>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 size={20} className="text-accent animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-grow">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors border border-gray-700">
            <Upload size={14} />
            {value ? 'Заменить фото' : 'Выбрать файл'}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
          <div className="mt-3 space-y-1">
            <p className="text-[10px] text-accent uppercase font-black tracking-widest flex items-center gap-1.5">
              <span className="w-1 h-1 bg-accent rounded-full"></span>
              Рекомендуемое разрешение: 1920 × 1080 px
            </p>
            <p className="text-[9px] text-gray-500 uppercase tracking-tighter leading-tight">
              Форматы: JPG, PNG, WEBP. Макс. вес: 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
