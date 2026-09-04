import React, { useState } from 'react';
import { Users, Search, Download, Plus, Trash2, CheckCircle2, Phone, X } from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { DonorProfile } from '../../types';

export const AdminDonorsSection: React.FC = () => {
  const { donors, addDonor, deleteDonor, programs } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [program, setProgram] = useState(programs[0]?.title || 'Sedekah Umum');
  const [totalDonation, setTotalDonation] = useState('250000');
  const [status, setStatus] = useState<'Aktif' | 'Baru' | 'Donatur Tetap'>('Aktif');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newDonor: DonorProfile = {
      id: `donor-${Date.now()}`,
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      program,
      totalDonation: parseInt(totalDonation.replace(/\D/g, ''), 10) || 0,
      lastDonationDate: new Date().toISOString().split('T')[0],
      status,
    };

    addDonor(newDonor);
    showToast('Data donatur berhasil ditambahkan!');
    setIsAddOpen(false);
    setName('');
    setWhatsapp('');
  };

  const exportToCSV = () => {
    if (donors.length === 0) {
      alert('Tidak ada data donatur untuk di-export.');
      return;
    }

    const headers = ['ID', 'Nama Donatur', 'Nomor WhatsApp', 'Program', 'Total Donasi', 'Tanggal Terakhir', 'Status'];
    const rows = donors.map((d) => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.whatsapp}"`,
      `"${d.program.replace(/"/g, '""')}"`,
      d.totalDonation,
      d.lastDonationDate,
      d.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_donatur_irsyadul_amal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV donatur berhasil didownload!');
  };

  const filtered = donors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.whatsapp.includes(searchTerm) ||
      d.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <Users className="w-4 h-4" />
            <span>DATABASE DONATUR</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Data Donatur & Sahabat Kebaikan
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Kelola profil donatur, riwayat keterlibatan, dan ekspor data ke format CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Donatur
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau no. WhatsApp donatur..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#008284]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E0EAEA] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold text-[#647B7C] uppercase tracking-wider">
                <th className="py-3 px-4">Nama Donatur</th>
                <th className="py-3 px-4">WhatsApp</th>
                <th className="py-3 px-4">Program Utama</th>
                <th className="py-3 px-4">Total Donasi</th>
                <th className="py-3 px-4">Donasi Terakhir</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((donor) => (
                <tr key={donor.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#071F20]">{donor.name}</td>
                  <td className="py-3 px-4 text-[#647B7C] font-mono">{donor.whatsapp || '-'}</td>
                  <td className="py-3 px-4 font-medium text-[#071F20]">{donor.program}</td>
                  <td className="py-3 px-4 font-black text-[#008284]">
                    Rp{donor.totalDonation.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-[#647B7C]">{donor.lastDonationDate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-[#008284] border border-[#CCFBF1]">
                      {donor.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus donatur ${donor.name}?`)) {
                          deleteDonor(donor.id);
                          showToast('Data donatur dihapus.');
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
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
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-sm text-gray-700">Belum ada donatur terdaftar</p>
            <p className="text-xs text-gray-400">
              Data donatur akan tercatat seiring konfirmasi donasi dari donatur.
            </p>
          </div>
        )}
      </div>

      {/* Modal Add */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#CCFBF1]">
            <div className="p-4 bg-[#F0FAFA] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#008284] text-white rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#071F20]">Tambah Profil Donatur</h3>
                  <p className="text-[10px] text-[#647B7C]">Data donatur tetap & mitra donasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Nama Lengkap Donatur *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Hj. Siti Maryam"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Nomor WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#071F20] block">Program yang Didukung</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
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
                  <label className="font-bold text-[#071F20] block">Total Donasi (Rp)</label>
                  <input
                    type="number"
                    value={totalDonation}
                    onChange={(e) => setTotalDonation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none font-bold text-[#008284]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#071F20] block">Status Donatur</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white font-medium"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Baru">Baru</option>
                    <option value="Donatur Tetap">Donatur Tetap</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs"
                >
                  Simpan Donatur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
