import React, { useState } from 'react';
import { ProgramItem, ProgramStatus, ProgramCategory } from '../types';
import { X, Plus, Trash2, Edit3, Database, Check, Phone, CreditCard, FileText, Image, Layers, UserCheck } from 'lucide-react';
import { FOUNDATION_INFO, OFFICIAL_BANK_GROUPS } from '../data/officialData';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: ProgramItem[];
  onAddProgram: (newProg: ProgramItem) => void;
  onUpdateProgram: (updated: ProgramItem) => void;
  onDeleteProgram: (id: string) => void;
}

type AdminTab = 'program' | 'donasi' | 'donatur' | 'laporan' | 'dokumentasi' | 'rekening' | 'kontak' | 'supabase_schema';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  programs,
  onAddProgram,
  onUpdateProgram,
  onDeleteProgram,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('program');

  // New Program form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProgramCategory>('Sosial');
  const [newStatus, setNewStatus] = useState<ProgramStatus>('BERJALAN');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetText, setNewTargetText] = useState('Target akan diperbarui');
  const [newCollectedText, setNewCollectedText] = useState('Data donasi akan diperbarui');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80');

  // Contact state
  const [whatsappNumber, setWhatsappNumber] = useState('087804034140');
  const [addressText, setAddressText] = useState(FOUNDATION_INFO.address);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProg: ProgramItem = {
      id: `prog-admin-${Date.now()}`,
      title: newTitle,
      category: newCategory === 'Semua' ? 'Sosial' : (newCategory as any),
      status: newStatus,
      description: newDescription || 'Deskripsi program sosial dan kemanusiaan Irsyadul Amal.',
      targetAmountText: newTargetText || 'Target akan diperbarui',
      collectedAmountText: newCollectedText || 'Data donasi akan diperbarui',
      targetRecipients: 'Penerima manfaat wilayah Garut',
      donorsCountText: 'Data akan diperbarui',
      latestUpdateText: 'Program baru ditambahkan oleh administrator.',
      imageUrl: newImageUrl,
    };

    onAddProgram(newProg);
    setNewTitle('');
    setNewDescription('');
    setSavedNotice('Program baru berhasil ditambahkan!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleStatusChange = (prog: ProgramItem, newSt: ProgramStatus) => {
    onUpdateProgram({
      ...prog,
      status: newSt,
    });
  };

  const handleSaveContact = () => {
    setSavedNotice('Pengaturan kontak & WhatsApp berhasil diperbarui!');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'program', label: 'PROGRAM', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'donasi', label: 'DONASI', icon: <Database className="w-3.5 h-3.5" /> },
    { key: 'donatur', label: 'DONATUR', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { key: 'laporan', label: 'LAPORAN', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'dokumentasi', label: 'DOKUMENTASI', icon: <Image className="w-3.5 h-3.5" /> },
    { key: 'rekening', label: 'REKENING', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { key: 'kontak', label: 'KONTAK', icon: <Phone className="w-3.5 h-3.5" /> },
    { key: 'supabase_schema', label: 'SKEMA SUPABASE (SQL)', icon: <Database className="w-3.5 h-3.5 text-emerald-600" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#CCFBF1]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F0FAFA]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#008284] text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-[#071F20]">
                Struktur Manajemen Data (Siap Supabase)
              </h2>
              <p className="text-[11px] text-[#647B7C]">
                Kelola Program, Donasi, Donatur, Laporan, Dokumentasi, Rekening & Kontak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto p-2 border-b border-gray-100 bg-gray-50 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-[#008284] text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-white hover:text-[#008284]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notice alert */}
        {savedNotice && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* TAB 1: PROGRAM */}
          {activeTab === 'program' && (
            <div className="space-y-6">
              {/* Form Tambah Program */}
              <div className="bg-[#F0FAFA] border border-[#CCFBF1] rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="font-extrabold text-sm text-[#006769] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Tambah Program Kebaikan Baru
                </h3>

                <form onSubmit={handleCreateProgram} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Nama Program *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bantuan Pangan Santri Garut"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#008284]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    >
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Sosial">Sosial</option>
                      <option value="Wakaf">Wakaf</option>
                      <option value="Kemanusiaan">Kemanusiaan</option>
                      <option value="Al-Qur'an">Al-Qur'an</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Status Program
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    >
                      <option value="BERJALAN">BERJALAN</option>
                      <option value="SEGERA DIMULAI">SEGERA DIMULAI</option>
                      <option value="SELESAI">SELESAI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Target Dana
                    </label>
                    <input
                      type="text"
                      value={newTargetText}
                      onChange={(e) => setNewTargetText(e.target.value)}
                      placeholder="Target akan diperbarui"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Dana Terkumpul
                    </label>
                    <input
                      type="text"
                      value={newCollectedText}
                      onChange={(e) => setNewCollectedText(e.target.value)}
                      placeholder="Data donasi akan diperbarui"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Deskripsi Ringkas
                    </label>
                    <input
                      type="text"
                      placeholder="Deskripsi singkat mengenai peruntukan program..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Simpan Program Baru
                    </button>
                  </div>
                </form>
              </div>

              {/* Daftar Program yang Ada */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                  Daftar Program Terdaftar ({programs.length})
                </h4>

                <div className="space-y-2">
                  {programs.map((prog) => (
                    <div
                      key={prog.id}
                      className="p-3.5 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#071F20] truncate">
                            {prog.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-teal-50 text-teal-700">
                            {prog.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1">
                          Target: {prog.targetAmountText} • Terkumpul: {prog.collectedAmountText}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={prog.status}
                          onChange={(e) =>
                            handleStatusChange(prog, e.target.value as ProgramStatus)
                          }
                          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold"
                        >
                          <option value="BERJALAN">BERJALAN</option>
                          <option value="SEGERA DIMULAI">SEGERA DIMULAI</option>
                          <option value="SELESAI">SELESAI</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => onDeleteProgram(prog.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Hapus Program"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DONASI */}
          {activeTab === 'donasi' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FAFA] rounded-2xl border border-[#CCFBF1]">
                <h4 className="font-bold text-xs text-[#006769]">Manajemen Aliran Donasi</h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Rekap transaksi donasi yang masuk melalui transfer rekening dan konfirmasi WhatsApp.
                </p>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-2xl text-center space-y-2">
                <Database className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="font-bold text-gray-700 text-xs">Pencatatan Donasi Realtime Siap Sinkronisasi Supabase</p>
                <p className="text-gray-500 text-[11px]">
                  Tabel <code>donations</code> siap menerima transaksi dari transfer donatur dan integrasi webhook perbankan.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DONATUR */}
          {activeTab === 'donatur' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FAFA] rounded-2xl border border-[#CCFBF1]">
                <h4 className="font-bold text-xs text-[#006769]">Database Sahabat Donatur & Muhsinin</h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Tabel <code>donors</code> menyimpan data donatur, kontak WhatsApp, dan riwayat infaq.
                </p>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-2xl text-center space-y-1 text-gray-500">
                <p className="font-bold text-gray-700">Data donatur akan dihubungkan ke tabel Supabase `donors`.</p>
                <p className="text-[11px]">Menjaga privasi data donatur sesuai amanah kelembagaan.</p>
              </div>
            </div>
          )}

          {/* TAB 4: LAPORAN */}
          {activeTab === 'laporan' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FAFA] rounded-2xl border border-[#CCFBF1]">
                <h4 className="font-bold text-xs text-[#006769]">Pengunggahan & Publikasi Laporan Resmi</h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Admin dapat mengunggah file PDF laporan donasi, penggunaan dana, dan pertanggungjawaban.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2">
                <FileText className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="font-bold text-gray-700">Penyimpanan Berkas Laporan (Supabase Storage Bucket: `reports`)</p>
                <p className="text-gray-500 text-[11px]">
                  Setiap file PDF yang diunggah akan otomatis memiliki link publik untuk donatur.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: DOKUMENTASI */}
          {activeTab === 'dokumentasi' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FAFA] rounded-2xl border border-[#CCFBF1]">
                <h4 className="font-bold text-xs text-[#006769]">Pengunggahan Foto Dokumentasi Lapangan</h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Koleksi visual serah terima bantuan, pengeboran air bersih, dan pembinaan santri.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2">
                <Image className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="font-bold text-gray-700">Storage Dokumentasi (Bucket: `documentation-photos`)</p>
                <p className="text-gray-500 text-[11px]">Foto serah terima langsung dari relawan lapangan di Garut.</p>
              </div>
            </div>
          )}

          {/* TAB 6: REKENING */}
          {activeTab === 'rekening' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FAFA] rounded-2xl border border-[#CCFBF1]">
                <h4 className="font-bold text-xs text-[#006769]">Kelola Rekening Resmi Kelembagaan</h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Rekening yang tampil di halaman Donasi publik.
                </p>
              </div>

              <div className="space-y-3">
                {OFFICIAL_BANK_GROUPS.map((grp) => (
                  <div key={grp.category} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                    <span className="font-bold text-xs text-teal-800 uppercase">{grp.category}</span>
                    <div className="space-y-1 text-[11px]">
                      {grp.accounts.map((acc) => (
                        <p key={acc.id} className="font-mono text-gray-700">
                          • {acc.bankName} - <strong>{acc.accountNumber}</strong> a.n. {acc.accountHolder}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: KONTAK */}
          {activeTab === 'kontak' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F0FAFA] rounded-2xl border border-[#CCFBF1]">
                <h4 className="font-bold text-xs text-[#006769]">Pengaturan Kontak & WhatsApp Call Center</h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Nomor resmi dan alamat yang digunakan di seluruh tautan chat website.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Nomor WhatsApp Resmi
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Alamat Resmi Sekretariat
                  </label>
                  <textarea
                    rows={3}
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs leading-relaxed resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="px-4 py-2 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-bold"
                >
                  Simpan Perubahan Kontak
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: SKEMA SUPABASE (SQL) */}
          {activeTab === 'supabase_schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-700" /> Skema Tabel Database Supabase (PostgreSQL DDL)
                </h4>
                <p className="text-emerald-800 text-[11px] mt-1">
                  Skema ini telah disesuaikan dengan seluruh struktur entitas Irsyadul Amal. Anda dapat langsung menjalankan SQL ini di SQL Editor dashboard Supabase Anda.
                </p>
              </div>

              <div className="relative bg-gray-900 text-gray-100 p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto">
                <pre>{`-- 1. TABEL PROGRAM
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Pendidikan', 'Sosial', 'Wakaf', 'Kemanusiaan', 'Al-Qur''an')),
    status TEXT NOT NULL DEFAULT 'BERJALAN' CHECK (status IN ('BERJALAN', 'SEGERA DIMULAI', 'SELESAI')),
    description TEXT NOT NULL,
    full_story TEXT,
    background TEXT,
    objective TEXT,
    target_recipients TEXT DEFAULT 'Data akan diperbarui',
    target_amount_text TEXT DEFAULT 'Target akan diperbarui',
    collected_amount_text TEXT DEFAULT 'Data donasi akan diperbarui',
    donors_count_text TEXT DEFAULT 'Data akan diperbarui',
    latest_update_text TEXT DEFAULT 'Akan diperbarui oleh admin',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL REKENING
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('DONASI UMUM', 'DONASI YAYASAN', 'WAKAF AIR BERSIH')),
    is_active BOOLEAN DEFAULT true
);

-- 3. TABEL DONASI & DONATUR
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name TEXT NOT NULL DEFAULT 'Hamba Allah',
    donor_phone TEXT,
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
    program_title TEXT NOT NULL,
    nominal NUMERIC(15,2),
    nominal_text TEXT,
    bank_destination TEXT,
    proof_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABEL LAPORAN (TRANSPARANSI)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Laporan Donasi', 'Laporan Penggunaan Dana', 'Laporan Program', 'Dokumentasi Kegiatan')),
    period TEXT NOT NULL,
    file_url TEXT,
    description TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABEL DOKUMENTASI KEGIATAN
CREATE TABLE IF NOT EXISTS public.documentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    program_name TEXT,
    location TEXT,
    image_url TEXT NOT NULL,
    story TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TABEL PENGATURAN KONTAK
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
