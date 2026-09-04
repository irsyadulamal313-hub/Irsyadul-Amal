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
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { DocumentationItem } from '../../types';

export const AdminDocumentationSection: React.FC = () => {
  const { documentations, addDocumentation, updateDocumentation, deleteDocumentation, programs } =
    useCMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setIsModalOpen(true);
  };

  const openEdit = (doc: DocumentationItem) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setProgramName(doc.programName);
    setCategory(doc.category);
    setDate(doc.date);
    setLocation(doc.location);
    setImageUrl(doc.imageUrl);
    setStory(doc.story);
    setTargetBeneficiary(doc.targetBeneficiary);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: DocumentationItem = {
      id: editingDoc ? editingDoc.id : `doc-${Date.now()}`,
      title: title.trim(),
      programName,
      category,
      date,
      location,
      imageUrl,
      story,
      targetBeneficiary,
    };

    if (editingDoc) {
      updateDocumentation(payload);
      showToast('Dokumentasi diperbarui!');
    } else {
      addDocumentation(payload);
      showToast('Dokumentasi baru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, docTitle: string) => {
    if (confirm(`Hapus dokumentasi "${docTitle}"?`)) {
      deleteDocumentation(id);
      showToast('Dokumentasi dihapus.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <CheckCircle2 className="w-4 h-4" />
            <span>DOKUMENTASI LAPANGAN</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Galeri & Bukti Kegiatan Penyaluran
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Dokumentasi nyata kegiatan para relawan dan penyaluran amanah donatur.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumentasi
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentations.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div className="relative h-44 bg-gray-100">
              <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover" />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#008284] text-white">
                {doc.category}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1">
              <h3 className="font-extrabold text-xs sm:text-sm text-[#071F20] line-clamp-2">
                {doc.title}
              </h3>
              <p className="text-[11px] text-[#647B7C] line-clamp-2">{doc.story}</p>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#647B7C]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#008284]" />
                  {doc.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {doc.date}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => openEdit(doc)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-[#008284] flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(doc.id, doc.title)}
                className="p-1 text-gray-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-4 bg-[#F0FAFA] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20]">
                    {editingDoc ? 'Edit Dokumentasi' : 'Tambah Dokumentasi'}
                  </h3>
                  <p className="text-[10px] text-[#647B7C]">Foto dan keterangan aktivitas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Judul Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Distribusi Sembako Lansia Dhuafa"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Program Terkait</label>
                <select
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-medium"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                  <option value="Kegiatan Sosial Terpadu">Kegiatan Sosial Terpadu</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">URL Foto / Upload</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs outline-none"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-bold text-gray-700 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Pilih File Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Tanggal / Periode</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Februari 2026"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kec. Tarogong Kaler"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Keterangan / Cerita Kegiatan</label>
                <textarea
                  rows={3}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Cerita singkat penyaluran bantuan..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs"
                >
                  Simpan Dokumentasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
