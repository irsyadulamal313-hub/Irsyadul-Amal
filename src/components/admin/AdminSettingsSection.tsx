import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  Clock,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  ShieldCheck,
  RotateCcw,
  Search,
  Navigation,
  UserCheck,
  Key,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { SiteSettings } from '../../types';

interface AdminSettingsSectionProps {
  subTab?: 'identity' | 'nav' | 'seo' | 'admin';
}

export const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({
  subTab = 'identity',
}) => {
  const { siteSettings, updateSiteSettings } = useCMS();
  const [activeTab, setActiveTab] = useState<'identity' | 'nav' | 'seo' | 'admin'>(subTab);
  const [formData, setFormData] = useState<SiteSettings>({
    ...siteSettings,
    seoTitle: siteSettings.seoTitle || 'Irsyadul Amal - Lembaga Sosial & Kemanusiaan Garut',
    seoDescription:
      siteSettings.seoDescription ||
      'Lembaga sosial, kemanusiaan, wakaf air bersih dan pendidikan di Kabupaten Garut, Jawa Barat.',
    navLabels: siteSettings.navLabels || {
      beranda: 'Beranda',
      donasi: 'Donasi',
      program: 'Program',
      laporan: 'Laporan',
      call_center: 'Call Center',
    },
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNavLabelChange = (key: keyof NonNullable<SiteSettings['navLabels']>, value: string) => {
    setFormData((prev) => ({
      ...prev,
      navLabels: {
        ...(prev.navLabels || {
          beranda: 'Beranda',
          donasi: 'Donasi',
          program: 'Program',
          laporan: 'Laporan',
          call_center: 'Call Center',
        }),
        [key]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings(formData);
    setToastMessage('Pengaturan website berhasil disimpan dan diperbarui!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan ke identitas resmi default Irsyadul Amal?')) {
      const defaultData: SiteSettings = {
        name: 'IRSYADUL AMAL',
        tagline: 'Lembaga Sosial & Kemanusiaan',
        address: 'Kp. Malajati, RT.004/RW.013, Jati, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44150',
        whatsapp: '087804034140',
        email: 'info@irsyadulamal.org',
        operatingHours: 'Senin - Sabtu: 08.00 - 16.00 WIB',
        instagram: 'https://instagram.com/irsyadulamal',
        facebook: 'https://facebook.com/irsyadulamal',
        youtube: 'https://youtube.com/@irsyadulamal',
        waConfirmationTemplate: siteSettings.waConfirmationTemplate,
        seoTitle: 'Irsyadul Amal - Lembaga Sosial & Kemanusiaan Garut',
        seoDescription:
          'Lembaga sosial, kemanusiaan, wakaf air bersih dan pendidikan di Kabupaten Garut, Jawa Barat.',
        navLabels: {
          beranda: 'Beranda',
          donasi: 'Donasi',
          program: 'Program',
          laporan: 'Laporan',
          call_center: 'Call Center',
        },
      };
      setFormData(defaultData);
      updateSiteSettings(defaultData);
      setToastMessage('Data telah direset ke default resmi.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <Settings className="w-4 h-4" />
            <span>PENGATURAN WEBSITE & SISTEM</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Identitas Lembaga, Navigasi & SEO
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Kelola nama lembaga, alamat sekretariat resmi di Garut, urutan menu navigasi publik, dan optimasi SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-[#E0EAEA] shadow-2xs flex flex-wrap gap-1.5 text-xs font-bold">
        {[
          { id: 'identity', label: 'Identitas Lembaga' },
          { id: 'nav', label: 'Navigasi Publik' },
          { id: 'seo', label: 'Optimasi SEO' },
          { id: 'admin', label: 'Akun Pengelola' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-[#008284] text-white shadow-2xs font-extrabold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Forms based on activeTab */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: IDENTITAS LEMBAGA */}
        {activeTab === 'identity' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#071F20] border-b pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#008284]" />
              Identitas & Legalitas Lembaga
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#071F20] block">Nama Lembaga *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm outline-none font-extrabold text-[#008284]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#071F20] block">Tagline / Slogan *</label>
                <input
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-[#071F20] block">Alamat Sekretariat Resmi *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#071F20] block">Nomor WhatsApp Resmi *</label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#071F20] block">Email Resmi Lembaga *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#071F20] block">Jam Operasional Pelayanan</label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => handleChange('operatingHours', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#071F20] block">Instagram URL</label>
                <input
                  type="text"
                  value={formData.instagram || ''}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/irsyadulamal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NAVIGASI PUBLIK */}
        {activeTab === 'nav' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#071F20] border-b pb-2 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#008284]" />
              Menu Navigasi Publik Website
            </h2>
            <p className="text-xs text-[#647B7C]">
              Navigasi publik tetap: <strong>Beranda, Donasi, Program, Laporan, Call Center</strong> (tidak boleh ada tab "Kontak" atau menu admin pada navigasi publik).
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400">MENU 1</span>
                  <p className="text-xs font-bold text-gray-800">Beranda</p>
                </div>
                <input
                  type="text"
                  value={formData.navLabels?.beranda || 'Beranda'}
                  onChange={(e) => handleNavLabelChange('beranda', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs w-48 font-semibold text-right"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400">MENU 2</span>
                  <p className="text-xs font-bold text-gray-800">Donasi</p>
                </div>
                <input
                  type="text"
                  value={formData.navLabels?.donasi || 'Donasi'}
                  onChange={(e) => handleNavLabelChange('donasi', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs w-48 font-semibold text-right"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400">MENU 3</span>
                  <p className="text-xs font-bold text-gray-800">Program</p>
                </div>
                <input
                  type="text"
                  value={formData.navLabels?.program || 'Program'}
                  onChange={(e) => handleNavLabelChange('program', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs w-48 font-semibold text-right"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400">MENU 4</span>
                  <p className="text-xs font-bold text-gray-800">Laporan</p>
                </div>
                <input
                  type="text"
                  value={formData.navLabels?.laporan || 'Laporan'}
                  onChange={(e) => handleNavLabelChange('laporan', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs w-48 font-semibold text-right"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-400">MENU 5</span>
                  <p className="text-xs font-bold text-gray-800">Call Center</p>
                </div>
                <input
                  type="text"
                  value={formData.navLabels?.call_center || 'Call Center'}
                  onChange={(e) => handleNavLabelChange('call_center', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs w-48 font-semibold text-right"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEO */}
        {activeTab === 'seo' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#071F20] border-b pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#008284]" />
              Search Engine Optimization (SEO)
            </h2>
            <p className="text-xs text-[#647B7C]">
              Pengaturan judul dan deskripsi situs di mesin pencari Google dan kartu pratinjau sosial media.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">Judul Halaman (Meta Title)</label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={(e) => handleChange('seoTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#071F20] block">Deskripsi Meta (SEO Description)</label>
                <textarea
                  rows={3}
                  value={formData.seoDescription || ''}
                  onChange={(e) => handleChange('seoDescription', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AKUN PENGELOLA */}
        {activeTab === 'admin' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#071F20] border-b pb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#008284]" />
              Akun Pengelola Administrator
            </h2>
            <p className="text-xs text-[#647B7C]">
              Akses khusus pengelola Irsyadul Amal. Default akun: <strong>admin</strong> / <strong>admin123</strong>.
            </p>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#008284] text-white font-bold flex items-center justify-center">
                  A
                </div>
                <div>
                  <p className="text-xs font-bold text-[#071F20]">Administrator Utama</p>
                  <p className="text-[11px] text-gray-500 font-mono">admin@irsyadulamal.org / admin</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Super Admin Aktif
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
};
