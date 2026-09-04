import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { MediaItem } from '../../types';

interface AdminMediaSectionProps {
  categoryFilter?: string;
}

export const AdminMediaSection: React.FC<AdminMediaSectionProps> = ({ categoryFilter }) => {
  const { media, addMedia, updateMedia, deleteMedia } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MediaItem['category']>('Program');
  const [newCaption, setNewCaption] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Replace photo modal state
  const [replacingItem, setReplacingItem] = useState<MediaItem | null>(null);

  // Lightbox preview state
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewImageUrl(reader.result);
          if (!newTitle) {
            setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replacingItem) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateMedia({
            ...replacingItem,
            url: reader.result,
            isPlaceholder: false,
            uploadedAt: new Date().toISOString().split('T')[0],
          });
          setReplacingItem(null);
          showToast(`Foto "${replacingItem.title}" berhasil diganti!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) {
      alert('Pilih foto terlebih dahulu.');
      return;
    }

    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      title: newTitle.trim() || 'Foto Kegiatan',
      category: newCategory,
      url: newImageUrl,
      caption: newCaption.trim() || undefined,
      uploadedAt: new Date().toISOString().split('T')[0],
      isPlaceholder: false,
    };

    addMedia(newItem);
    showToast('Foto baru berhasil diunggah ke Pustaka Media!');
    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewImageUrl('');
    setNewCaption('');
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('URL foto berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['Semua', 'Hero', 'Program', 'Dokumentasi', 'Banner', 'Galeri', 'Lainnya'];

  const filtered = media.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.caption && m.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === 'Semua' || m.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <ImageIcon className="w-4 h-4" />
            <span>PUSTAKA MEDIA & FOTO</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Media Manager Irsyadul Amal
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Unggah, ganti, preview, dan kelola semua foto kegiatan, banner hero, dan program lembaga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNewTitle('');
              setNewImageUrl('');
              setNewCaption('');
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <Upload className="w-4 h-4" />
            + Upload Foto Baru
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E0EAEA] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#008284] text-white shadow-2xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau keterangan foto..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#008284]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Image Preview Thumbnail */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Badge (Placeholder vs Resmi) */}
                <div className="absolute top-2 left-2">
                  {item.isPlaceholder ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black shadow-xs tracking-wider uppercase">
                      Placeholder
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black shadow-xs tracking-wider uppercase">
                      Resmi
                    </span>
                  )}
                </div>

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-[#071F20] text-xs font-bold flex items-center gap-1 shadow-md transition-transform hover:scale-105"
                    title="Preview Foto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setReplacingItem(item)}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-transform hover:scale-105"
                    title="Ganti Foto Ini"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus foto "${item.title}" dari pustaka media?`)) {
                        deleteMedia(item.id);
                        showToast('Foto berhasil dihapus.');
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-transform hover:scale-105"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-3 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-[#008284] uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <p className="text-xs font-bold text-[#071F20] truncate" title={item.title}>
                    {item.title}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#647B7C] pt-1 border-t border-gray-100">
                  <span>{item.uploadedAt}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="text-[#008284] hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Salin URL
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setReplacingItem(item)}
                    className="w-full py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Ganti
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="w-full py-1.5 px-2 rounded-lg bg-teal-50 hover:bg-[#E6F4F4] text-[#008284] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 space-y-3">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">Tidak ada foto dalam kategori ini</p>
          <p className="text-xs text-gray-500">
            Klik tombol "Upload Foto Baru" untuk menambahkan gambar ke website.
          </p>
        </div>
      )}

      {/* MODAL 1: UPLOAD FOTO BARU */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#E0EAEA]">
            <div className="p-5 border-b border-[#E0EAEA] flex items-center justify-between bg-gradient-to-r from-[#F0FAFA] to-white">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#008284]" />
                <h3 className="font-extrabold text-base text-[#071F20]">Upload Foto Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPhoto} className="p-6 space-y-4">
              {/* Image Preview & Upload Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">Pilih File Foto</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#008284] rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-gray-50">
                  {newImageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={newImageUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-contain shadow-xs"
                      />
                      <p className="text-[11px] text-[#008284] font-bold">Klik untuk mengganti file</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-xs font-bold text-gray-700">
                        Klik untuk memilih foto dari perangkat Anda
                      </p>
                      <p className="text-[10px] text-gray-400">Mendukung format JPG, PNG, WebP</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">Nama / Judul Foto</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Pembagian Sembako Garut"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#008284] outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">Kategori Foto</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#008284] outline-none"
                >
                  <option value="Program">Program</option>
                  <option value="Hero">Hero Banner</option>
                  <option value="Dokumentasi">Dokumentasi</option>
                  <option value="Banner">Banner Promo</option>
                  <option value="Galeri">Galeri</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">Keterangan / Caption</label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Keterangan singkat kegiatan..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:border-[#008284] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs transition-colors"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GANTI FOTO */}
      {replacingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-[#E0EAEA]">
            <div className="p-5 border-b border-[#E0EAEA] flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-extrabold text-base text-[#071F20]">Ganti Foto</h3>
                  <p className="text-[11px] text-[#647B7C]">Mengganti "{replacingItem.title}"</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplacingItem(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-600">Foto saat ini:</p>
                <img
                  src={replacingItem.url}
                  alt={replacingItem.title}
                  className="max-h-40 mx-auto rounded-xl object-contain border border-gray-200"
                />
              </div>

              <div className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-4 text-center cursor-pointer transition-colors relative bg-amber-50/50">
                <Upload className="w-7 h-7 text-amber-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-gray-800">
                  Pilih file foto baru pengganti
                </p>
                <p className="text-[10px] text-gray-500">Foto akan langsung diperbarui di website</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReplaceUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setReplacingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LIGHTBOX PREVIEW */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#071F20]">{previewItem.title}</h3>
                <span className="text-[11px] text-[#008284] font-bold">{previewItem.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-950 flex items-center justify-center flex-1 overflow-hidden">
              <img
                src={previewItem.url}
                alt={previewItem.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-4 bg-gray-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status:</span>
                {previewItem.isPlaceholder ? (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Placeholder (Contoh)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Resmi (Tervalidasi)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleCopyUrl(previewItem.url, previewItem.id)}
                className="px-3.5 py-1.5 rounded-xl bg-[#008284] text-white font-bold flex items-center gap-1.5 hover:bg-[#006769]"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin URL Gambar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
