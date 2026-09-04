import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  X,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { DonationTransaction } from '../../types';

export const AdminDonationsSection: React.FC = () => {
  const { donations, addDonation, updateDonationStatus, deleteDonation, programs, bankAccounts } =
    useCMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewProof, setPreviewProof] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New donation form
  const [donorName, setDonorName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [programTitle, setProgramTitle] = useState(programs[0]?.title || '');
  const [nominal, setNominal] = useState('100000');
  const [bankDestination, setBankDestination] = useState('BSI 7208684657');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak'>(
    'Terverifikasi'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) return;

    const newDonation: DonationTransaction = {
      id: `don-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      donorName: donorName.trim(),
      whatsapp: whatsapp.trim() || undefined,
      program: programTitle,
      nominal: parseInt(nominal.replace(/\D/g, ''), 10) || 0,
      bank: bankDestination,
      status,
      notes: notes.trim() || undefined,
    };

    addDonation(newDonation);
    showToast('Data donasi berhasil ditambahkan!');
    setIsAddModalOpen(false);
    setDonorName('');
    setWhatsapp('');
    setNotes('');
  };

  const filtered = donations.filter((d) => {
    const matchSearch =
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <HeartHandshake className="w-4 h-4" />
            <span>TRANSAKSI DONASI</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Data Transaksi Donasi Masuk
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Verifikasi transfer, catat donasi manual, dan pantau penyaluran donatur.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Catat Donasi Manual
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E0EAEA] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari donatur atau program..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#008284]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#071F20] outline-none bg-white"
        >
          <option value="Semua">Semua Status</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          <option value="Terverifikasi">Terverifikasi</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-2xl border border-[#E0EAEA] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-[#647B7C] uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Donatur</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Bank Tujuan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-4 text-[#647B7C] font-medium whitespace-nowrap">
                    {d.date}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#071F20]">{d.donorName}</p>
                    {d.whatsapp && (
                      <p className="text-[10px] text-[#647B7C]">{d.whatsapp}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs font-medium text-[#071F20] truncate">
                    {d.program}
                  </td>
                  <td className="py-3 px-4 font-black text-[#008284] whitespace-nowrap">
                    Rp{d.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-[#647B7C] whitespace-nowrap">{d.bank}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={d.status}
                      onChange={(e) =>
                        updateDonationStatus(
                          d.id,
                          e.target.value as 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak'
                        )
                      }
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border outline-none ${
                        d.status === 'Terverifikasi'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : d.status === 'Menunggu Verifikasi'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Terverifikasi">Terverifikasi</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus catatan donasi dari ${d.donorName}?`)) {
                          deleteDonation(d.id);
                          showToast('Data donasi dihapus.');
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <HeartHandshake className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-sm text-gray-700">Belum ada data donasi tercatat</p>
            <p className="text-xs text-gray-400">
              Catat transaksi donasi masuk dari transfer bank atau WhatsApp.
            </p>
          </div>
        )}
      </div>

      {/* Manual Add Donation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-4 bg-[#F0FAFA] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20]">Catat Donasi Baru</h3>
                  <p className="text-[10px] text-[#647B7C]">Input manual transaksi transfer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Nama Donatur *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Contoh: Hamba Allah / Ahmad Fauzi"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Program Donasi</label>
                <select
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-medium"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                  <option value="Sedekah / Infaq Umum">Sedekah / Infaq Umum</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none font-bold text-[#008284]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Rekening Tujuan</label>
                  <select
                    value={bankDestination}
                    onChange={(e) => setBankDestination(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={`${b.bankName} ${b.accountNumber}`}>
                        {b.bankName} - {b.accountNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Status Verifikasi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-semibold"
                >
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Catatan / Keterangan</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Keterangan transfer atau titipan doa..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs"
                >
                  Simpan Donasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
