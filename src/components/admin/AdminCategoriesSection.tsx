import React, { useState } from 'react';
import { FolderOpen, Plus, Trash2, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { useCMS } from '../../data/cmsContext';

export const AdminCategoriesSection: React.FC = () => {
  const { categories, addCategory, deleteCategory, programs } = useCMS();
  const [newCat, setNewCat] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    if (categories.includes(newCat.trim())) {
      alert('Kategori tersebut sudah ada.');
      return;
    }
    addCategory(newCat.trim());
    setNewCat('');
    setToastMessage('Kategori baru berhasil ditambahkan!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDelete = (cat: string) => {
    const usedCount = programs.filter((p) => p.category === cat).length;
    if (usedCount > 0) {
      if (!confirm(`Kategori "${cat}" sedang digunakan oleh ${usedCount} program. Tetap hapus?`)) {
        return;
      }
    }
    deleteCategory(cat);
    setToastMessage(`Kategori "${cat}" berhasil dihapus.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      <div className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
          <FolderOpen className="w-4 h-4" />
          <span>KATEGORI PROGRAM</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
          Kelola Kategori Program Donasi
        </h1>
        <p className="text-xs text-[#647B7C] mt-0.5">
          Kategori digunakan untuk mengelompokkan program di halaman Donasi dan Program publik.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs flex gap-3">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Nama kategori baru (contoh: Kesehatan, Ramadhan, dll)"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] text-xs sm:text-sm outline-none font-semibold"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </form>

      {/* Categories Grid */}
      <div className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-3">
        <h2 className="text-sm font-extrabold text-[#071F20]">Daftar Kategori Aktif</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const count = programs.filter((p) => p.category === cat).length;
            return (
              <div
                key={cat}
                className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white border border-gray-200 text-[#008284]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-[#071F20]">{cat}</p>
                    <p className="text-[10px] text-[#647B7C]">{count} Program</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  title="Hapus Kategori"
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
