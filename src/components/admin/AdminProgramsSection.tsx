import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Upload,
  Calendar,
  MapPin,
  Heart,
  Users,
  Target,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { ProgramItem, ProgramStatus } from '../../types';
import { uploadMediaFile } from '../../lib/supabase';
import { MediaPickerModal } from './MediaPickerModal';

export const AdminProgramsSection: React.FC = () => {
  const { programs, categories, addProgram, updateProgram, deleteProgram, duplicateProgram } =
    useCMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const initialForm: Partial<ProgramItem> = {
    title: '',
    slug: '',
    category: categories[0] || 'Sosial',
    status: 'BERJALAN',
    imageUrl:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
    description: '',
    fullStory: '',
    background: '',
    objective: '',
    location: 'Kabupaten Garut',
    targetAmountText: 'Target akan diperbarui',
    collectedAmountText: 'Data donasi akan diperbarui',
    donorsCountText: 'Data akan diperbarui',
    targetRecipients: 'Penerima manfaat wilayah Garut',
    deadline: 'Program Berkelanjutan',
    latestUpdateText: 'Program resmi binaan Irsyadul Amal.',
    gallery: [],
    documentations: [],
  };

  const [formData, setFormData] = useState<Partial<ProgramItem>>(initialForm);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingProgram(null);
    setFormData(initialForm);
    setModalError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (prog: ProgramItem) => {
    setEditingProgram(prog);
    setFormData({ ...prog });
    setModalError(null);
    setIsFormOpen(true);
  };

  const handleSlugGen = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setModalError(null);
    try {
      const res = await uploadMediaFile(file, 'media', 'programs');
      if (res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        setToastMessage('Foto berhasil diunggah ke Supabase Storage!');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        setModalError(res.error || 'Gagal mengunggah foto ke Supabase Storage.');
      }
    } catch (err: any) {
      setModalError(`Gagal upload: ${err?.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!formData.title?.trim()) {
      alert('Nama program wajib diisi');
      return;
    }

    const payload: ProgramItem = {
      id: editingProgram ? editingProgram.id : `prog-${Date.now()}`,
      title: formData.title || '',
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      category: formData.category || 'Sosial',
      status: isDraft ? 'DRAFT' : (formData.status as ProgramStatus) || 'BERJALAN',
      imageUrl:
        formData.imageUrl ||
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
      description: formData.description || 'Deskripsi program sosial dan kemanusiaan Irsyadul Amal.',
      fullStory: formData.fullStory || formData.description,
      background: formData.background || 'Kondisi kebutuhan masyarakat prasejahtera di Garut.',
      objective: formData.objective || 'Menyediakan bantuan nyata berkelanjutan.',
      location: formData.location || 'Kabupaten Garut',
      targetAmountText: formData.targetAmountText || 'Target akan diperbarui',
      collectedAmountText: formData.collectedAmountText || 'Data donasi akan diperbarui',
      donorsCountText: formData.donorsCountText || 'Data akan diperbarui',
      targetRecipients: formData.targetRecipients || 'Data akan diperbarui',
      deadline: formData.deadline || 'Program Berkelanjutan',
      latestUpdateText: formData.latestUpdateText || 'Akan diperbarui oleh admin.',
      gallery: formData.gallery || [],
      documentations: formData.documentations || [],
      isDraft,
      order: editingProgram ? editingProgram.order : programs.length + 1,
    };

    setIsSaving(true);
    setModalError(null);

    try {
      if (editingProgram) {
        const res = await updateProgram(payload);
        if (res.success) {
          showToast('Program berhasil diperbarui dan tersimpan di database!');
          setIsFormOpen(false);
        } else {
          setModalError(`Gagal memperbarui program di database: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      } else {
        const res = await addProgram(payload);
        if (res.success) {
          showToast(isDraft ? 'Program disimpan sebagai draft di database!' : 'Program baru berhasil dipublikasikan ke database!');
          setIsFormOpen(false);
        } else {
          setModalError(`Gagal menambahkan program ke database: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      }
    } catch (err: any) {
      setModalError(`Terjadi kesalahan sistem: ${err?.message || 'Gagal menyimpan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus program: "${title}"?`)) {
      const res = await deleteProgram(id);
      if (res.success) {
        showToast('Program berhasil dihapus dari database.');
        if (editingProgram?.id === id) {
          setIsFormOpen(false);
        }
      } else {
        alert(`Gagal menghapus program: ${res.error?.message || 'Terjadi kesalahan'}`);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateProgram(id);
    if (res.success) {
      showToast('Program berhasil diduplikasi ke database.');
    } else {
      alert(`Gagal menduplikasi program: ${res.error?.message || 'Terjadi kesalahan'}`);
    }
  };

  // Filter programs
  const filteredPrograms = programs.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchStatus =
      selectedStatus === 'Semua' ||
      (selectedStatus === 'DRAFT' && (p.status === 'DRAFT' || p.isDraft)) ||
      p.status === selectedStatus;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <Layers className="w-4 h-4" />
            <span>MANAJEMEN PROGRAM DONASI</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Kelola Program Sosial & Kemanusiaan
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Total {programs.length} program terdaftar dalam sistem website Irsyadul Amal.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Program Baru
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E0EAEA] shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama program atau kata kunci..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#008284]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071F20] outline-none bg-white"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071F20] outline-none bg-white"
          >
            <option value="Semua">Semua Status</option>
            <option value="BERJALAN">Berjalan</option>
            <option value="SEGERA DIMULAI">Segera Dimulai</option>
            <option value="SELESAI">Selesai</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Program Cards / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((prog) => {
          const isDraft = prog.status === 'DRAFT' || prog.isDraft;
          return (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              {/* Image & Badges */}
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img
                  src={prog.imageUrl}
                  alt={prog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#008284] text-white">
                    {prog.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isDraft
                        ? 'bg-gray-800 text-white'
                        : prog.status === 'BERJALAN'
                        ? 'bg-emerald-500 text-white'
                        : prog.status === 'SEGERA DIMULAI'
                        ? 'bg-amber-400 text-gray-900'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isDraft ? 'DRAFT' : prog.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20] line-clamp-2 leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-[#647B7C] line-clamp-2 mt-1 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 text-[11px] text-[#647B7C] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#008284]" />
                      {prog.location || 'Garut'}
                    </span>
                    <span className="font-bold text-[#008284]">
                      {prog.targetAmountText || 'Target akan diperbarui'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => openEditModal(prog)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-[#008284] text-[#008284] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(prog.id)}
                    title="Duplikasi Program"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(prog.id, prog.title)}
                    title="Hapus Program"
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 space-y-3">
          <Layers className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="font-bold text-sm text-gray-700">Tidak ada program yang sesuai filter</p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#008284] text-white rounded-xl text-xs font-bold"
          >
            Tambah Program Baru
          </button>
        </div>
      )}

      {/* FULL PROGRAM FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-[#CCFBF1] flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F0FAFA]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#071F20]">
                    {editingProgram ? 'Edit Data Program' : 'Tambah Program Baru'}
                  </h3>
                  <p className="text-[11px] text-[#647B7C]">
                    Lengkapi informasi program resmi Irsyadul Amal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Row 1: Title & Slug */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#071F20] block">Nama Program *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleSlugGen(e.target.value)}
                  placeholder="Contoh: Wakaf Sumur Bor & Sarana Air Bersih"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] text-xs sm:text-sm outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Slug URL</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="wakaf-sumur-bor"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Kategori</label>
                  <select
                    value={formData.category || 'Sosial'}
                    onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Status Program</label>
                  <select
                    value={formData.status || 'BERJALAN'}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value as ProgramStatus }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-semibold"
                  >
                    <option value="BERJALAN">BERJALAN</option>
                    <option value="SEGERA DIMULAI">SEGERA DIMULAI</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              {/* Image upload / URL */}
              <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="font-bold text-[#071F20] block">Foto Utama Program</label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-24 h-20 rounded-xl object-cover border bg-gray-200 shrink-0"
                  />
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="Masukkan URL foto atau unggah langsung..."
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-[11px] font-bold text-gray-700 cursor-pointer ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008284]" /> : <Upload className="w-3.5 h-3.5 text-[#008284]" />}
                        {isUploadingImage ? 'Mengunggah ke Storage...' : 'Unggah File (Supabase Storage)'}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#008284]/10 hover:bg-[#008284]/20 text-[#008284] text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Pilih dari Media Library
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#071F20] block">Deskripsi Singkat (Card)</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Ringkasan 1-2 kalimat untuk tampilan kartu..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#071F20] block">
                  Cerita Lengkap Program (Detail Modal)
                </label>
                <textarea
                  rows={4}
                  value={formData.fullStory || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, fullStory: e.target.value }))}
                  placeholder="Latar belakang, urgensi, dan narasi lengkap program..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none leading-relaxed"
                />
              </div>

              {/* Target and Metrics (Default with safe labels) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Target Dana (Teks)</label>
                  <input
                    type="text"
                    value={formData.targetAmountText || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, targetAmountText: e.target.value }))
                    }
                    placeholder="Contoh: Target akan diperbarui"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Dana Terkumpul (Teks)</label>
                  <input
                    type="text"
                    value={formData.collectedAmountText || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, collectedAmountText: e.target.value }))
                    }
                    placeholder="Contoh: Data donasi akan diperbarui"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Jumlah Donatur (Teks)</label>
                  <input
                    type="text"
                    value={formData.donorsCountText || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, donorsCountText: e.target.value }))
                    }
                    placeholder="Contoh: Data akan diperbarui"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Lokasi Program</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Kabupaten Garut"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Target Penerima Manfaat</label>
                  <input
                    type="text"
                    value={formData.targetRecipients || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, targetRecipients: e.target.value }))
                    }
                    placeholder="Warga desa & santri pelosok"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Batas Waktu / Deadline</label>
                  <input
                    type="text"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
                    placeholder="Program Berkelanjutan"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Kabar / Update Terbaru</label>
                <input
                  type="text"
                  value={formData.latestUpdateText || ''}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, latestUpdateText: e.target.value }))
                  }
                  placeholder="Contoh: Survei titik lokasi dan koordinasi perangkat desa..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              {editingProgram && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleDelete(editingProgram.id, editingProgram.title)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  Hapus Program
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSubmit(true)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  Simpan Draft
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSubmit(false)}
                  className="px-5 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSaving ? 'Menyimpan ke Supabase...' : editingProgram ? 'Perbarui Program' : 'Publikasikan Program'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        categoryFilter="Program"
        title="Pilih Foto Program dari Media Library"
        onSelectImage={(url) => {
          setFormData((p) => ({ ...p, imageUrl: url }));
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
};
