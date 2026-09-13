import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Calendar,
  X,
  Upload,
  Image as ImageIcon,
  Eye,
  Camera,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { DocumentationItem } from '../../types';
import { PhotoLightboxModal } from '../PhotoLightboxModal';
import { uploadMediaFile } from '../../lib/supabase';
import { MediaPickerModal } from './MediaPickerModal';

export const AdminDocumentationSection: React.FC = () => {
  const { documentations, addDocumentation, updateDocumentation, deleteDocumentation, toggleDocumentationActive, programs } =
    useCMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Lightbox preview state
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [programName, setProgramName] = useState(programs[0]?.title || '');
  const [category, setCategory] = useState('Sosial');
  const [date, setDate] = useState('Februari 2026');
  const [location, setLocation] = useState('Kabupaten Garut');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
  );
  const [story, setStory] = useState('');
  const [targetBeneficiary, setTargetBeneficiary] = useState('Masyarakat Dhuafa');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAdd = () => {
    setEditingDoc(null);
    setTitle('');
    setProgramName(programs[0]?.title || 'Bantuan Kemanusiaan');
    setCategory('Sosial');
    setDate('Februari 2026');
    setLocation('Garut');
    setImageUrl('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80');
    setStory('');
    setTargetBeneficiary('Warga Prasejahtera');
    setSortOrder((documentations.length || 0) + 1);
    setIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEdit = (doc: DocumentationItem) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setProgramName(doc.programName || 'Bantuan Kemanusiaan');
    setCategory(doc.category || 'Sosial');
    setDate(doc.date || '');
    setLocation(doc.location || '');
    setImageUrl(doc.imageUrl || '');
    setStory(doc.story || '');
    setTargetBeneficiary(doc.targetBeneficiary || '');
    setSortOrder(doc.sort_order ?? 1);
    setIsActive(doc.is_active !== false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setModalError(null);
    try {
      const res = await uploadMediaFile(file, 'media', 'documentation');
      if (res.url) {
        setImageUrl(res.url);
        showToast('Foto dokumentasi berhasil diunggah ke Storage!');
      } else {
        setModalError(res.error || 'Gagal mengunggah foto ke Supabase Storage.');
      }
    } catch (err: any) {
      setModalError(`Gagal upload: ${err?.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      alert('Judul dan URL Foto wajib diisi.');
      return;
    }

    const payload: DocumentationItem = {
      id: editingDoc ? editingDoc.id : `doc-${Date.now()}`,
      title: title.trim(),
      programName,
      category,
      date,
      location,
      imageUrl,
      story: story.trim(),
      targetBeneficiary,
      sort_order: Number(sortOrder) || 1,
      is_active: isActive,
    };

    setIsSaving(true);
    setModalError(null);

    try {
      if (editingDoc) {
        const res = await updateDocumentation(payload);
        if (res.success) {
          showToast('Dokumentasi berhasil diperbarui di database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal memperbarui dokumentasi: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      } else {
        const res = await addDocumentation(payload);
        if (res.success) {
          showToast('Dokumentasi baru berhasil ditambahkan ke database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal menambahkan dokumentasi: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      }
    } catch (err: any) {
      setModalError(`Terjadi kesalahan sistem: ${err?.message || 'Gagal menyimpan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, docTitle: string) => {
    if (confirm(`Hapus dokumentasi "${docTitle}"?`)) {
      const res = await deleteDocumentation(id);
      if (res.success) {
        showToast('Dokumentasi berhasil dihapus dari database.');
      } else {
        alert(`Gagal menghapus dokumentasi: ${res.error?.message || 'Terjadi kesalahan'}`);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const res = await toggleDocumentationActive(id);
    if (res.success) {
      showToast('Status aktif dokumentasi berhasil diubah.');
    } else {
      alert(`Gagal mengubah status dokumentasi: ${res.error?.message || 'Terjadi kesalahan'}`);
    }
  };

  const sortedDocs = [...documentations].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#008284]">
            <Camera className="w-4 h-4" />
            <span>DOKUMENTASI KEGIATAN</span>
          </div>
          <h1 className="text-xl font-bold text-[#071F20] mt-1">
            Galeri & Foto Carousel Beranda
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Dokumentasi foto penyaluran program yang ditampilkan pada carousel halaman Beranda dan Laporan.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumentasi
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid */}
      {sortedDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0EAEA] p-10 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">Belum Ada Dokumentasi</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Tambahkan foto dokumentasi kegiatan penyaluran untuk ditampilkan pada carousel halaman utama.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-[#008284] text-white text-xs font-bold hover:bg-[#006769] cursor-pointer"
          >
            Tambah Foto Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedDocs.map((doc, idx) => (
            <div
              key={doc.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-2xs flex flex-col justify-between ${
                doc.is_active !== false ? 'border-[#E0EAEA]' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="relative h-48 bg-gray-900 group">
                <img
                  src={doc.imageUrl || doc.image_url}
                  alt={doc.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setIsLightboxOpen(true);
                  }}
                  className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <div className="p-2 rounded-full bg-white/90 text-gray-900 shadow-md">
                    <Eye className="w-4 h-4" />
                  </div>
                </button>

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#008284] text-white">
                    {doc.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white">
                    #{doc.sort_order ?? idx + 1}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 flex-1">
                <h3 className="font-bold text-xs sm:text-sm text-[#071F20] line-clamp-2 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs text-[#647B7C] line-clamp-2 leading-relaxed">
                  {doc.story}
                </p>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#647B7C]">
                  <span className="flex items-center gap-1 truncate max-w-[55%]">
                    <MapPin className="w-3 h-3 text-[#008284] shrink-0" />
                    <span className="truncate">{doc.location}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3 text-[#008284]" />
                    <span>{doc.date}</span>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(doc.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    doc.is_active !== false
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {doc.is_active !== false ? 'Aktif' : 'Nonaktif'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxIndex(idx);
                      setIsLightboxOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-[#008284] hover:bg-white transition-colors cursor-pointer"
                    title="Pratinjau Foto"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(doc)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-[#008284] hover:bg-white transition-colors cursor-pointer"
                    title="Edit Dokumentasi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                    title="Hapus Dokumentasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#008284] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-gray-900">
                  {editingDoc ? 'Edit Dokumentasi Kegiatan' : 'Tambah Dokumentasi Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">
                  Judul Dokumentasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Distribusi Sembako & Makanan Bergizi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs font-medium bg-white"
                  >
                    <option value="Sosial">Sosial</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Wakaf">Wakaf</option>
                    <option value="Bencana">Tanggap Bencana</option>
                    <option value="Pangan">Ketahanan Pangan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Terkait Program</label>
                  <select
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs font-medium bg-white truncate"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                    <option value="Kegiatan Terpadu">Kegiatan Terpadu</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">
                  URL Foto / Gambar <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs font-mono"
                    />
                    <label className={`px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008284]" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{isUploadingImage ? 'Mengunggah...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3 py-2 bg-[#008284]/10 hover:bg-[#008284]/20 text-[#008284] rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Media Library</span>
                    </button>
                  </div>
                </div>
                {imageUrl && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={imageUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Waktu / Periode</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Februari 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Lokasi Pelaksanaan</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kec. Tarogong, Garut"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">Keterangan / Cerita Penyaluran</label>
                <textarea
                  rows={3}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Deskripsi singkat penyaluran bantuan dan dampak bagi penerima manfaat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Urutan Carousel</label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Status Publikasi</label>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#008284] rounded-sm focus:ring-[#008284]"
                    />
                    <span className="text-xs font-semibold text-gray-700">Tampilkan di Carousel</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSaving ? 'Menyimpan ke Supabase...' : editingDoc ? 'Simpan Perubahan' : 'Tambahkan Dokumentasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <PhotoLightboxModal
        items={sortedDocs}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        categoryFilter="Dokumentasi"
        title="Pilih Foto Dokumentasi dari Media Library"
        onSelectImage={(url) => {
          setImageUrl(url);
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
};
