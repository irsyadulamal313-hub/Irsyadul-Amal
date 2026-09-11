import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  FileText,
  Calendar,
  Eye,
  X,
  Upload,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { OfficialReportItem } from '../../types';

export const AdminReportsSection: React.FC = () => {
  const { reports, addReport, updateReport, deleteReport } = useCMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<OfficialReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('Januari - Maret 2026');
  const [category, setCategory] = useState<string>('Laporan Donasi');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState('1.8 MB');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [published, setPublished] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAdd = () => {
    setEditingReport(null);
    setTitle('');
    setPeriod('Triwulan I 2026');
    setCategory('Laporan Donasi');
    setDescription('');
    setDownloadUrl('');
    setPublished(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEdit = (rep: OfficialReportItem) => {
    setEditingReport(rep);
    setTitle(rep.title);
    setPeriod(rep.period);
    setCategory(rep.category);
    setDescription(rep.description);
    setFileType(rep.fileType || 'PDF');
    setFileSize(rep.fileSize || '1.8 MB');
    setDownloadUrl(rep.downloadUrl || '');
    setPublished(rep.published);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: OfficialReportItem = {
      id: editingReport ? editingReport.id : `rep-${Date.now()}`,
      title: title.trim(),
      period: period.trim(),
      category,
      description: description.trim() || 'Laporan pertanggungjawaban resmi lembaga.',
      fileType,
      fileSize,
      downloadUrl: downloadUrl.trim() || undefined,
      published,
      publishDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };

    setIsSaving(true);
    setModalError(null);

    try {
      if (editingReport) {
        const res = await updateReport(payload);
        if (res.success) {
          showToast('Laporan berhasil diperbarui di database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal memperbarui laporan: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      } else {
        const res = await addReport(payload);
        if (res.success) {
          showToast('Laporan baru berhasil ditambahkan ke database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal menambahkan laporan: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      }
    } catch (err: any) {
      setModalError(`Terjadi kesalahan sistem: ${err?.message || 'Gagal menyimpan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, repTitle: string) => {
    if (confirm(`Hapus dokumen laporan "${repTitle}"?`)) {
      const res = await deleteReport(id);
      if (res.success) {
        showToast('Laporan berhasil dihapus dari database.');
      } else {
        alert(`Gagal menghapus laporan: ${res.error?.message || 'Terjadi kesalahan'}`);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <FileSpreadsheet className="w-4 h-4" />
            <span>AKUNTABILITAS & LAPORAN</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Kelola Laporan Pertanggungjawaban Resmi
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Dokumen audit donasi, realisasi program, dan laporan keuangan berkala untuk donatur.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload Laporan Baru
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-[#E6F4F4] text-[#008284] shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#008284] text-white">
                    {rep.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      rep.published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {rep.published ? 'Dipublikasikan' : 'Draft'}
                  </span>
                  <span className="text-xs text-gray-400">• {rep.period}</span>
                </div>
                <h3 className="font-extrabold text-sm text-[#071F20]">{rep.title}</h3>
                <p className="text-xs text-[#647B7C] max-w-xl line-clamp-2">{rep.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
              <button
                type="button"
                onClick={() => openEdit(rep)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-[#008284] text-xs font-bold text-[#008284] flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(rep.id, rep.title)}
                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 space-y-2">
            <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-sm text-gray-700">Belum ada laporan yang dipublikasikan.</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Sistem tidak menampilkan data rekaan. Dokumen laporan pertanggungjawaban akan tampil begitu diunggah oleh admin.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={openAdd}
                className="px-4 py-2 bg-[#008284] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Upload Dokumen Pertama
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Report */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-4 bg-[#F0FAFA] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20]">
                    {editingReport ? 'Edit Laporan' : 'Tambah Laporan Resmi'}
                  </h3>
                  <p className="text-[10px] text-[#647B7C]">Publikasi dokumen transparansi lembaga</p>
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
                <label className="font-bold text-[#071F20] block">Judul Laporan *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Laporan Penyaluran Donasi Triwulan I 2026"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Periode</label>
                  <input
                    type="text"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="Contoh: Triwulan I 2026"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-medium"
                  >
                    <option value="Laporan Donasi">Laporan Donasi</option>
                    <option value="Laporan Penggunaan Dana">Laporan Penggunaan Dana</option>
                    <option value="Laporan Program">Laporan Program</option>
                    <option value="Dokumentasi Kegiatan">Dokumentasi Kegiatan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rincian penyaluran bantuan, penerima manfaat, dan ringkasan..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Format Dokumen</label>
                  <input
                    type="text"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    placeholder="PDF / XLS"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Ukuran File</label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="Contoh: 1.8 MB"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Link Download File (URL)</label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-[#008284] focus:ring-[#008284]"
                />
                <label htmlFor="pub-check" className="font-bold text-[#071F20]">
                  Langsung Publikasikan ke Website Publik
                </label>
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
                  {isSaving ? 'Menyimpan ke Supabase...' : editingReport ? 'Perbarui Laporan' : 'Simpan Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
