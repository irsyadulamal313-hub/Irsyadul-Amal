import React, { useState } from 'react';
import { X, Upload, Check, Image as ImageIcon, Search, Loader2, AlertCircle } from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { MediaItem } from '../../types';
import { uploadMediaFile } from '../../lib/supabase';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  title?: string;
  categoryFilter?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Pilih Foto dari Media Library',
  categoryFilter,
}) => {
  const { media, addMedia } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadMediaFile(file, 'media', 'library');
      if (res.url) {
        const newMedia: MediaItem = {
          id: `med-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: (categoryFilter as any) || 'Program',
          url: res.url,
          uploadedAt: new Date().toISOString().split('T')[0],
          caption: 'Foto diunggah ke Supabase Storage',
        };
        addMedia(newMedia);
        setSelectedUrl(res.url);
      } else {
        setUploadError(res.error || 'Gagal mengunggah foto ke Supabase Storage.');
      }
    } catch (err: any) {
      setUploadError(`Gagal upload: ${err?.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelectImage(selectedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E0EAEA]">
        {/* Header */}
        <div className="p-5 border-b border-[#E0EAEA] flex items-center justify-between bg-gradient-to-r from-[#F0FAFA] to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#008284]/10 text-[#008284] rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#071F20]">{title}</h3>
              <p className="text-xs text-[#647B7C]">
                Pilih foto yang sudah ada atau unggah foto baru dari perangkat Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#E0EAEA] bg-gray-50 flex flex-col gap-3">
          {uploadError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari foto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#008284] bg-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            <label className={`w-full sm:w-auto px-4 py-2 bg-[#008284] hover:bg-[#006E70] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Mengunggah ke Storage...' : 'Unggah Foto Baru'}
              <input type="file" accept="image/*" disabled={isUploading} onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredMedia.map((item) => {
            const isSelected = selectedUrl === item.url;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedUrl(item.url)}
                className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-4/3 bg-gray-100 ${
                  isSelected
                    ? 'border-[#008284] ring-2 ring-[#008284]/30 shadow-md'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                  <span className="text-[9px] text-gray-300">{item.category}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#008284] text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E0EAEA] bg-white flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {selectedUrl ? '1 foto dipilih' : 'Pilih salah satu foto'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-[#008284] hover:bg-[#006E70] text-white disabled:opacity-40 disabled:pointer-events-none shadow-xs transition-colors"
            >
              Gunakan Foto Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
