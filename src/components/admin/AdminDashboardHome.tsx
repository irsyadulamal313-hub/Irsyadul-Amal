import React from 'react';
import {
  Layers,
  HeartHandshake,
  Users,
  FileSpreadsheet,
  ArrowRight,
  Plus,
  Edit3,
  CreditCard,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { AdminMenuKey } from './AdminLayout';

interface AdminDashboardHomeProps {
  onNavigateMenu: (menu: AdminMenuKey) => void;
  onReturnToPublic: () => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  onNavigateMenu,
  onReturnToPublic,
}) => {
  const { programs, donations, donors, reports, siteSettings, homepageContent } = useCMS();

  // Calculate verified donation total without faking
  const verifiedDonations = donations.filter((d) => d.status === 'Terverifikasi');
  const totalVerifiedNominal = verifiedDonations.reduce((sum, d) => sum + d.nominal, 0);

  const totalDonationDisplay =
    verifiedDonations.length > 0
      ? `Rp${totalVerifiedNominal.toLocaleString('id-ID')}`
      : 'Belum tersedia';

  const totalDonorsDisplay = donors.length > 0 ? `${donors.length} Donatur` : 'Belum tersedia';
  const totalReportsDisplay = reports.length > 0 ? `${reports.length} Laporan` : 'Belum tersedia';

  // Program status count
  const runningCount = programs.filter((p) => p.status === 'BERJALAN').length;
  const draftCount = programs.filter((p) => p.status === 'DRAFT' || p.isDraft).length;
  const upcomingCount = programs.filter((p) => p.status === 'SEGERA DIMULAI').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#008284] to-[#006769] text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Panel Administrasi Terpusat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Irsyadul Amal
          </h1>
          <p className="text-xs sm:text-sm text-teal-50 leading-relaxed">
            Kelola seluruh konten, program sosial, data donasi, laporan pertanggungjawaban, dan informasi resmi website tanpa menyentuh kode.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateMenu('content')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Konten Beranda
            </button>
            <button
              type="button"
              onClick={onReturnToPublic}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-xs transition-colors"
            >
              Lihat Website Publik
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Summary Stat Cards (STRICTLY NO FAKE DATA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Program */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#647B7C] uppercase tracking-wider">
              Total Program
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-[#008284]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#071F20]">{programs.length}</p>
          <div className="mt-2 text-[11px] text-[#647B7C] flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">{runningCount} Berjalan</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{upcomingCount} Segera</span>
            {draftCount > 0 && (
              <>
                <span>•</span>
                <span className="text-gray-500 font-bold">{draftCount} Draft</span>
              </>
            )}
          </div>
        </div>

        {/* Total Donasi */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#647B7C] uppercase tracking-wider">
              Total Donasi Masuk
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#071F20]">
            {totalDonationDisplay}
          </p>
          <p className="mt-2 text-[11px] text-[#647B7C]">
            {verifiedDonations.length > 0
              ? `${verifiedDonations.length} donasi terverifikasi`
              : 'Belum ada data resmi donasi'}
          </p>
        </div>

        {/* Total Donatur */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#647B7C] uppercase tracking-wider">
              Total Donatur
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#071F20]">{totalDonorsDisplay}</p>
          <p className="mt-2 text-[11px] text-[#647B7C]">
            {donors.length > 0 ? 'Data donatur tercatat' : 'Belum tersedia di database'}
          </p>
        </div>

        {/* Total Laporan */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#647B7C] uppercase tracking-wider">
              Laporan Publik
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#071F20]">{totalReportsDisplay}</p>
          <p className="mt-2 text-[11px] text-[#647B7C]">
            {reports.length > 0 ? 'Dokumen laporan resmi' : 'Belum diunggah oleh admin'}
          </p>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-[#071F20]">Menu Aksi Cepat Pengelola</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => onNavigateMenu('programs')}
            className="p-4 bg-white rounded-2xl border border-[#E0EAEA] hover:border-[#008284] text-left transition-all group flex items-start justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-[#008284] group-hover:bg-[#008284] group-hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-[#071F20]">Tambah / Edit Program</span>
              </div>
              <p className="text-xs text-[#647B7C] pl-9">
                Kelola foto, target, lokasi, deskripsi, dan status program donasi.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#008284] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateMenu('content')}
            className="p-4 bg-white rounded-2xl border border-[#E0EAEA] hover:border-[#008284] text-left transition-all group flex items-start justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-[#071F20]">Edit Teks & Hero Beranda</span>
              </div>
              <p className="text-xs text-[#647B7C] pl-9">
                Ganti judul banner, subjudul, foto hero, dan tombol donasi.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#008284] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateMenu('bank_accounts')}
            className="p-4 bg-white rounded-2xl border border-[#E0EAEA] hover:border-[#008284] text-left transition-all group flex items-start justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-[#071F20]">Kelola Rekening Resmi</span>
              </div>
              <p className="text-xs text-[#647B7C] pl-9">
                BSI, BRI, Mandiri & status aktifasi rekening transfer.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#008284] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateMenu('whatsapp')}
            className="p-4 bg-white rounded-2xl border border-[#E0EAEA] hover:border-[#008284] text-left transition-all group flex items-start justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-[#071F20]">Konfirmasi WhatsApp</span>
              </div>
              <p className="text-xs text-[#647B7C] pl-9">
                Nomor WhatsApp resmi ({siteSettings.whatsapp}) dan template pesan.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#008284] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateMenu('reports')}
            className="p-4 bg-white rounded-2xl border border-[#E0EAEA] hover:border-[#008284] text-left transition-all group flex items-start justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-[#071F20]">Upload Laporan Donasi</span>
              </div>
              <p className="text-xs text-[#647B7C] pl-9">
                Pertanggungjawaban berkala untuk transparansi donatur.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#008284] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>

          <button
            type="button"
            onClick={() => onNavigateMenu('supabase_schema')}
            className="p-4 bg-white rounded-2xl border border-[#E0EAEA] hover:border-[#008284] text-left transition-all group flex items-start justify-between shadow-2xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-[#071F20]">Skema Supabase SQL</span>
              </div>
              <p className="text-xs text-[#647B7C] pl-9">
                Arsitektur tabel PostgreSQL siap integrasi database Supabase.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#008284] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
          </button>
        </div>
      </div>

      {/* Official Foundation Integrity Notice */}
      <div className="bg-[#F0FAFA] border border-[#CCFBF1] rounded-2xl p-5 flex items-start gap-3 text-xs text-[#071F20]">
        <AlertCircle className="w-5 h-5 text-[#008284] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-[#008284]">
            Prinsip Transparansi & Data Resmi Irsyadul Amal
          </p>
          <p className="text-[#647B7C] leading-relaxed">
            Seluruh data yang ditampilkan di website publik wajib berbasis kenyataan lapangan. Jika donasi, laporan, atau donatur belum tersedia, sistem akan menampilkan status transparan tanpa menghasilkan data rekaan demi menjaga kepercayaan umat.
          </p>
        </div>
      </div>
    </div>
  );
};
