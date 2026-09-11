import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Calendar,
  X,
  Upload,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { NewsArticle } from '../../types';

export const AdminNewsSection: React.FC = () => {
  const { news, addNews, updateNews, deleteNews } = useCMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kabar Lembaga');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
  );
  const [status, setStatus] = useState<'Publish' | 'Draft'>('Publish');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAdd = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('Kabar Lembaga');
    setContent('');
    setImageUrl('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80');
    setStatus('Publish');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEdit = (art: NewsArticle) => {
    setEditingArticle(art);
    setTitle(art.title);
    setCategory(art.category);
    setContent(art.content);
    setImageUrl(art.imageUrl);
    setStatus(art.status);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: NewsArticle = {
      id: editingArticle ? editingArticle.id : `news-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      content: content.trim(),
      imageUrl,
      publishedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status,
    };

    setIsSaving(true);
    setModalError(null);

    try {
      if (editingArticle) {
        const res = await updateNews(payload);
        if (res.success) {
          showToast('Artikel berhasil diperbarui di database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal memperbarui artikel: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      } else {
        const res = await addNews(payload);
        if (res.success) {
          showToast('Artikel berhasil ditambahkan ke database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal menambahkan artikel: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      }
    } catch (err: any) {
      setModalError(`Terjadi kesalahan sistem: ${err?.message || 'Gagal menyimpan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, artTitle: string) => {
    if (confirm(`Hapus artikel "${artTitle}"?`)) {
      const res = await deleteNews(id);
      if (res.success) {
        showToast('Artikel berhasil dihapus dari database.');
      } else {
        alert(`Gagal menghapus artikel: ${res.error?.message || 'Terjadi kesalahan'}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <Newspaper className="w-4 h-4" />
            <span>KABAR & INFORMASI</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Kelola Berita & Artikel Lembaga
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Publikasikan kabar terbaru, siaran pers, dan literasi dakwah sosial.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tulis Artikel Baru
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div className="relative h-44 bg-gray-100">
              <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover" />
              <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#008284] text-white">
                  {art.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    art.status === 'Publish' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-white'
                  }`}
                >
                  {art.status}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1">
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {art.publishedAt}
              </span>
              <h3 className="font-extrabold text-sm text-[#071F20] line-clamp-2">{art.title}</h3>
              <p className="text-xs text-[#647B7C] line-clamp-2">{art.content}</p>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => openEdit(art)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-bold text-[#008284] flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(art.id, art.title)}
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
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-4 bg-[#F0FAFA] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20]">
                    {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                  </h3>
                  <p className="text-[10px] text-[#647B7C]">Publikasi artikel dan kabar terkini</p>
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

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul artikel..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-medium"
                  >
                    <option value="Kabar Lembaga">Kabar Lembaga</option>
                    <option value="Penyaluran Donasi">Penyaluran Donasi</option>
                    <option value="Edukasi & Literasi">Edukasi & Literasi</option>
                    <option value="Siaran Pers">Siaran Pers</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-semibold"
                  >
                    <option value="Publish">Publish</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">URL Foto Utama</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Isi Konten Artikel</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi artikel..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSaving ? 'Menyimpan ke Supabase...' : editingArticle ? 'Perbarui Artikel' : 'Simpan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
