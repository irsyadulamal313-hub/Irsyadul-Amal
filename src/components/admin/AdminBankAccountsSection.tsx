import React, { useState } from 'react';
import { CreditCard, Plus, Edit3, Trash2, CheckCircle2, ShieldCheck, Copy, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { BankAccountItem } from '../../types';

export const AdminBankAccountsSection: React.FC = () => {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, toggleBankAccountActive } =
    useCMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccountItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [bankName, setBankName] = useState('BSI');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('LKS IRSYADUL AMAL');
  const [category, setCategory] = useState<'DONASI UMUM' | 'DONASI YAYASAN' | 'WAKAF AIR BERSIH'>(
    'DONASI UMUM'
  );
  const [description, setDescription] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openAdd = () => {
    setEditingAccount(null);
    setBankName('BSI');
    setAccountNumber('');
    setAccountHolder('LKS IRSYADUL AMAL');
    setCategory('DONASI UMUM');
    setDescription('Penyaluran donasi dan sedekah.');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEdit = (acc: BankAccountItem) => {
    setEditingAccount(acc);
    setBankName(acc.bankName);
    setAccountNumber(acc.accountNumber);
    setAccountHolder(acc.accountHolder);
    setCategory(acc.category as any);
    setDescription(acc.description || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;

    const logoCode = bankName.toLowerCase().includes('mandiri')
      ? 'mandiri'
      : bankName.toLowerCase().includes('bri')
      ? 'bri'
      : 'bsi';

    const payload: BankAccountItem = {
      id: editingAccount ? editingAccount.id : `bank-${Date.now()}`,
      bankName: bankName.toUpperCase(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      category,
      description: description.trim(),
      logoCode,
      isActive: editingAccount ? editingAccount.isActive !== false : true,
    };

    setIsSaving(true);
    setModalError(null);

    try {
      if (editingAccount) {
        const res = await updateBankAccount(payload);
        if (res.success) {
          showToast('Rekening berhasil diperbarui di database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal memperbarui rekening: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      } else {
        const res = await addBankAccount(payload);
        if (res.success) {
          showToast('Rekening baru berhasil disimpan ke database!');
          setIsModalOpen(false);
        } else {
          setModalError(`Gagal menambahkan rekening: ${res.error?.message || 'Terjadi kesalahan'}`);
        }
      }
    } catch (err: any) {
      setModalError(`Terjadi kesalahan sistem: ${err?.message || 'Gagal menyimpan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string, num: string) => {
    if (confirm(`Hapus rekening ${name} ${num}? Rekening ini tidak akan tampil lagi di web publik.`)) {
      const res = await deleteBankAccount(id);
      if (res.success) {
        showToast('Rekening berhasil dihapus dari database.');
      } else {
        alert(`Gagal menghapus rekening: ${res.error?.message || 'Terjadi kesalahan'}`);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const res = await toggleBankAccountActive(id);
    if (res.success) {
      showToast('Status aktif rekening diperbarui.');
    } else {
      alert(`Gagal mengubah status rekening: ${res.error?.message || 'Terjadi kesalahan'}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <CreditCard className="w-4 h-4" />
            <span>REKENING RESMI LEMBAGA</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Kelola Rekening Bank Donasi & Wakaf
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Pastikan nomor rekening, nama bank, dan nama pemegang rekening selalu sesuai buku tabungan resmi.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Rekening Bank
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Group List */}
      {(['DONASI UMUM', 'DONASI YAYASAN', 'WAKAF AIR BERSIH'] as const).map((catKey) => {
        const accountsInCat = bankAccounts.filter((b) => b.category === catKey);
        return (
          <div key={catKey} className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-[#008284] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  KATEGORI REKENING: {catKey}
                </h2>
                <p className="text-xs text-[#647B7C] mt-0.5">
                  {catKey === 'DONASI UMUM' && 'Rekening operasional infaq, sedekah & tanggap kemanusiaan.'}
                  {catKey === 'DONASI YAYASAN' && 'Rekening amanah binaan dakwah & kelembagaan yayasan.'}
                  {catKey === 'WAKAF AIR BERSIH' && 'Rekening khusus program sumur bor dan fasilitas air bersih.'}
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {accountsInCat.length} Rekening
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accountsInCat.map((acc) => {
                const isActive = acc.isActive !== false;
                return (
                  <div
                    key={acc.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-[#F9FCFC] border-[#CCFBF1] shadow-2xs'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#008284] text-white font-black text-xs tracking-wider">
                          {acc.bankName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(acc)}
                          className="p-1.5 text-gray-500 hover:text-[#008284] hover:bg-white rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(acc.id, acc.bankName, acc.accountNumber)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-[#647B7C]">Nomor Rekening:</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono text-base font-black text-[#071F20] tracking-wide">
                          {acc.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(acc.accountNumber, acc.id)}
                          className="px-2 py-1 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-[#008284] hover:bg-teal-50 flex items-center gap-1"
                        >
                          {copiedId === acc.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedId === acc.id ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] text-[#647B7C]">Atas Nama:</p>
                        <p className="font-extrabold text-[#071F20]">{acc.accountHolder}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(acc.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                          isActive
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                            : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-4 bg-[#F0FAFA] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20]">
                    {editingAccount ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
                  </h3>
                  <p className="text-[10px] text-[#647B7C]">Informasi resmi donasi Irsyadul Amal</p>
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
                <label className="font-bold text-[#071F20] block">Kategori Donasi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-bold text-[#008284]"
                >
                  <option value="DONASI UMUM">DONASI UMUM</option>
                  <option value="DONASI YAYASAN">DONASI YAYASAN</option>
                  <option value="WAKAF AIR BERSIH">WAKAF AIR BERSIH</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Nama Bank *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="BSI / BRI / MANDIRI"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none uppercase font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Nomor Rekening *</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Contoh: 7208684657"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Atas Nama Rekening *</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Contoh: LKS IRSYADUL AMAL"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Keterangan Singkat</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Untuk keperluan program donasi..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
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
                  {isSaving ? 'Menyimpan ke Supabase...' : editingAccount ? 'Perbarui Rekening' : 'Simpan Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
