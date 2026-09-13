import React, { useState, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Eye,
  RotateCcw,
  Sparkles,
  Upload,
  Layers,
  Heart,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Info,
  Link,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { HomepageContent, SectionVisibility } from '../../types';
import { MediaPickerModal } from './MediaPickerModal';
import { uploadMediaFile } from '../../lib/supabase';

interface AdminContentSectionProps {
  initialTab?: 'beranda' | 'tentang' | 'banner' | 'cta' | 'footer' | 'sections';
}

export const AdminContentSection: React.FC<AdminContentSectionProps> = ({
  initialTab = 'beranda',
}) => {
  const {
    homepageContent,
    siteSettings,
    updateSiteSettings,
    updateHomepageContent,
    saveHomepageDraft,
    publishHomepageDraft,
    discardHomepageDraft,
    isDraftModeActive,
  } = useCMS();

  const [formData, setFormData] = useState<HomepageContent>({
    ...homepageContent,
    sectionsVisibility: {
      hero: true,
      stats: true,
      about: true,
      featuredPrograms: true,
      videos: true,
      documentations: true,
      bankAccounts: true,
      cta: true,
      testimonials: false,
      banner: true,
      gallery: true,
      footer: true,
      ...(homepageContent.sectionsVisibility || {}),
    },
    sectionsOrder: homepageContent.sectionsOrder || [
      'hero',
      'stats',
      'featuredPrograms',
      'videos',
      'documentations',
      'bankAccounts',
      'about',
      'banner',
      'cta',
      'testimonials',
    ],
  });

  const [footerData, setFooterData] = useState({
    footerCopyright: siteSettings.footerCopyright || '© 2026 Lembaga Kesejahteraan Sosial Irsyadul Amal Garut. Seluruh Hak Cipta Dilindungi.',
    address: siteSettings.address,
    whatsapp: siteSettings.whatsapp,
    email: siteSettings.email,
    operatingHours: siteSettings.operatingHours,
    instagram: siteSettings.instagram || '',
    facebook: siteSettings.facebook || '',
    youtube: siteSettings.youtube || '',
  });

  const [activeTab, setActiveTab] = useState<'beranda' | 'tentang' | 'banner' | 'cta' | 'footer' | 'sections'>(
    initialTab
  );
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<'heroImageUrl' | 'bannerImageUrl'>('heroImageUrl');

  const handleDirectImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'heroImageUrl' | 'bannerImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setSaveError(null);
    try {
      const folder = field === 'heroImageUrl' ? 'hero' : 'banner';
      const res = await uploadMediaFile(file, 'media', folder);
      if (res.url) {
        handleFieldChange(field, res.url);
        setSaveNotification(`Gambar ${field === 'heroImageUrl' ? 'Hero' : 'Banner'} berhasil diunggah ke Storage!`);
        setTimeout(() => setSaveNotification(null), 3000);
      } else {
        setSaveError(res.error || 'Gagal mengunggah gambar ke Storage.');
      }
    } catch (err: any) {
      setSaveError(`Gagal upload gambar: ${err?.message || 'Terjadi kesalahan sistem'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Sync state from Supabase when external updates arrive
  useEffect(() => {
    if (!isDraftModeActive) {
      setFormData((prev) => ({
        ...homepageContent,
        sectionsVisibility: {
          hero: true,
          stats: true,
          about: true,
          featuredPrograms: true,
          videos: true,
          documentations: true,
          bankAccounts: true,
          cta: true,
          testimonials: false,
          banner: true,
          gallery: true,
          footer: true,
          ...(homepageContent.sectionsVisibility || {}),
        },
        sectionsOrder: homepageContent.sectionsOrder || prev.sectionsOrder || [
          'hero',
          'stats',
          'featuredPrograms',
          'videos',
          'documentations',
          'bankAccounts',
          'about',
          'banner',
          'cta',
          'testimonials',
        ],
      }));
    }
  }, [homepageContent, isDraftModeActive]);

  useEffect(() => {
    setFooterData({
      footerCopyright: siteSettings.footerCopyright || '© 2026 Lembaga Kesejahteraan Sosial Irsyadul Amal Garut. Seluruh Hak Cipta Dilindungi.',
      address: siteSettings.address,
      whatsapp: siteSettings.whatsapp,
      email: siteSettings.email,
      operatingHours: siteSettings.operatingHours,
      instagram: siteSettings.instagram || '',
      facebook: siteSettings.facebook || '',
      youtube: siteSettings.youtube || '',
    });
  }, [siteSettings]);

  const handleFieldChange = (field: keyof HomepageContent, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFooterChange = (field: string, value: string) => {
    setFooterData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePublishDirectly = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveNotification(null);
    try {
      const [resContent, resSettings] = await Promise.all([
        updateHomepageContent(formData, true),
        updateSiteSettings(footerData),
      ]);
      if (!resContent.success || !resSettings.success) {
        const errMsg = resContent.error?.message || resSettings.error?.message || 'Gagal menyimpan ke database Supabase.';
        setSaveError(`Gagal mempublikasikan konten: ${errMsg}`);
      } else {
        setSaveNotification('Konten berhasil disimpan ke Supabase dan langsung tampil di Website Publik!');
        setTimeout(() => setSaveNotification(null), 4000);
      }
    } catch (err: any) {
      setSaveError(`Terjadi kesalahan sistem: ${err?.message || 'Gagal menyimpan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveNotification(null);
    try {
      saveHomepageDraft(formData);
      const resSettings = await updateSiteSettings(footerData);
      if (!resSettings.success) {
        setSaveError(`Gagal menyimpan pengaturan: ${resSettings.error?.message || 'Terjadi kesalahan'}`);
      } else {
        setSaveNotification('Draft berhasil disimpan! Anda dapat menguji pratinjau sebelum mempublikasikannya.');
        setTimeout(() => setSaveNotification(null), 3500);
      }
    } catch (err: any) {
      setSaveError(`Terjadi kesalahan sistem: ${err?.message || 'Gagal menyimpan'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardDraft = () => {
    discardHomepageDraft();
    setFormData({ ...homepageContent });
    setSaveError(null);
    setSaveNotification('Perubahan draft dibatalkan.');
    setTimeout(() => setSaveNotification(null), 2500);
  };

  // Section visibility toggle
  const toggleSection = (sectionKey: keyof SectionVisibility) => {
    const current = formData.sectionsVisibility?.[sectionKey] !== false;
    const updated = {
      ...(formData.sectionsVisibility || {}),
      [sectionKey]: !current,
    };
    handleFieldChange('sectionsVisibility', updated);
  };

  // Move section order up/down
  const moveSectionOrder = (index: number, direction: 'up' | 'down') => {
    const order = [...(formData.sectionsOrder || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    const temp = order[index];
    order[index] = order[targetIndex];
    order[targetIndex] = temp;
    handleFieldChange('sectionsOrder', order);
  };

  const sectionLabels: Record<string, { label: string; desc: string }> = {
    hero: { label: 'Hero Banner Utama', desc: 'Banner pembuka di bagian paling atas dengan tombol aksi' },
    stats: { label: 'Statistik & Jejak Kebaikan', desc: 'Transparansi metrik donasi dan penerima manfaat' },
    featuredPrograms: { label: 'Program Kebaikan Pilihan', desc: '3 program unggulan paling mendesak' },
    videos: { label: 'Video Profil & Program', desc: 'Section video YouTube profil lembaga & program kemanusiaan' },
    documentations: { label: 'Dokumentasi Foto Carousel', desc: 'Carousel foto kegiatan & penyaluran amanah donatur' },
    bankAccounts: { label: 'Rekening Resmi Donasi', desc: 'Daftar nomor rekening bank BSI, BRI, Mandiri' },
    about: { label: 'Tentang Irsyadul Amal', desc: 'Visi, misi, dan kisah kiprah lembaga' },
    banner: { label: 'Banner Promo / Layanan Jemput', desc: 'Spanduk khusus layanan jemput zakat atau infaq' },
    cta: { label: 'Call To Action Donasi', desc: 'Kotak ajakan berbuat kebaikan di akhir halaman' },
    testimonials: { label: 'Testimonial & Kata Mereka', desc: 'Kesan para donatur dan penerima manfaat' },
    gallery: { label: 'Dokumentasi Lapangan', desc: 'Foto dokumentasi kegiatan nyata' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={(url) => {
          handleFieldChange(mediaTargetField, url);
        }}
        title={mediaTargetField === 'heroImageUrl' ? 'Pilih Foto Hero Banner' : 'Pilih Foto Banner Layanan'}
        categoryFilter={mediaTargetField === 'heroImageUrl' ? 'Hero' : 'Banner'}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
            <FileText className="w-4 h-4" />
            <span>PENGELOLA KONTEN WEBSITE</span>
          </div>
          <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
            Edit Teks, Banner, CTA & Footer
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Semua teks beranda, susunan section, dan identitas dapat disesuaikan tanpa menyentuh kode.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isDraftModeActive && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleDiscardDraft}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Batal Draft
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAsDraft}
            className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#008284] text-xs font-extrabold flex items-center gap-1.5 transition-colors border border-[#BDE3E3] disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Simpan Draft
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handlePublishDirectly}
            className="px-5 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isSaving ? 'Menyimpan ke Supabase...' : 'Publikasikan ke Website'}
          </button>
        </div>
      </div>

      {/* Error Notification */}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Toast Notification */}
      {saveNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-[#E0EAEA] shadow-2xs flex flex-wrap gap-1.5 text-xs font-bold">
        {[
          { id: 'beranda', label: '1. Beranda (Hero & Teks)' },
          { id: 'sections', label: '2. Susunan & Aktifkan Section' },
          { id: 'tentang', label: '3. Tentang Lembaga' },
          { id: 'banner', label: '4. Banner Layanan' },
          { id: 'cta', label: '5. Call To Action (CTA)' },
          { id: 'footer', label: '6. Footer & Hak Cipta' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-[#008284] text-white shadow-2xs font-extrabold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BERANDA (HERO BANNER) */}
      {activeTab === 'beranda' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-base text-[#071F20]">Pengaturan Hero Banner Utama</h3>
            <p className="text-xs text-[#647B7C]">
              Sesuaikan judul, badge, foto, dan tulisan tombol yang tampil di beranda bagian atas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hero Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">
                Badge / Label Atas Hero
              </label>
              <input
                type="text"
                value={formData.heroBadge}
                onChange={(e) => handleFieldChange('heroBadge', e.target.value)}
                placeholder="Contoh: Lembaga Sosial & Kemanusiaan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
              <p className="text-[11px] text-gray-400">Tampil di atas judul utama beranda.</p>
            </div>

            {/* Hero Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">
                Judul Utama Hero
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => handleFieldChange('heroTitle', e.target.value)}
                placeholder="Contoh: Berbagi Kebaikan, Menebar Manfaat"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-bold text-gray-800"
              />
              <p className="text-[11px] text-gray-400">Judul besar pertama yang dilihat pengunjung.</p>
            </div>

            {/* Hero Subtitle */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">
                Deskripsi / Subjudul Hero
              </label>
              <textarea
                rows={3}
                value={formData.heroSubtitle}
                onChange={(e) => handleFieldChange('heroSubtitle', e.target.value)}
                placeholder="Melalui Irsyadul Amal, mari bersama menghadirkan manfaat nyata bagi mereka yang membutuhkan."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none leading-relaxed"
              />
            </div>

            {/* Buttons Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">
                Teks Tombol Donasi (Utama)
              </label>
              <input
                type="text"
                value={formData.primaryButtonText}
                onChange={(e) => handleFieldChange('primaryButtonText', e.target.value)}
                placeholder="DONASI SEKARANG"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">
                Teks Tombol Program (Sekunder)
              </label>
              <input
                type="text"
                value={formData.secondaryButtonText}
                onChange={(e) => handleFieldChange('secondaryButtonText', e.target.value)}
                placeholder="LIHAT PROGRAM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-bold"
              />
            </div>

            {/* Hero Image Section */}
            <div className="md:col-span-2 space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-[#071F20] block">
                Foto Hero Beranda
              </label>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-48 h-32 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                  <img
                    src={formData.heroImageUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="text"
                    value={formData.heroImageUrl}
                    onChange={(e) => handleFieldChange('heroImageUrl', e.target.value)}
                    placeholder="URL gambar hero (https://...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-mono"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008284]" /> : <Upload className="w-3.5 h-3.5 text-[#008284]" />}
                      <span>{isUploadingImage ? 'Mengunggah...' : 'Upload dari Perangkat'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={(e) => handleDirectImageUpload(e, 'heroImageUrl')}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaTargetField('heroImageUrl');
                        setIsMediaPickerOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Pilih dari Media Library
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Rekomendasi rasio 16:9 atau 4:3, resolusi minimal 800x600 px.
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image Caption */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">
                Caption / Keterangan Foto Hero
              </label>
              <input
                type="text"
                value={formData.heroImageCaption || ''}
                onChange={(e) => handleFieldChange('heroImageCaption', e.target.value)}
                placeholder="Contoh: Penyaluran santunan dan pembinaan yatim dhuafa Garut"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
              <p className="text-[11px] text-gray-400">Tampil sebagai teks keterangan di bawah foto hero beranda.</p>
            </div>

            {/* Homepage Statistics Section */}
            <div className="md:col-span-2 pt-4 border-t border-gray-100 space-y-3">
              <div>
                <h4 className="font-extrabold text-sm text-[#071F20]">4 Kartu Statistik Beranda</h4>
                <p className="text-[11px] text-gray-500">
                  Teks statistik publik. Jika dikosongkan, sistem akan otomatis menampilkan status &quot;Data akan diperbarui&quot; atau menghitung dari data rill tanpa angka palsu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <label className="text-[11px] font-bold text-gray-700 block">Total Donasi</label>
                  <input
                    type="text"
                    value={formData.statsTotalDonations || ''}
                    onChange={(e) => handleFieldChange('statsTotalDonations', e.target.value)}
                    placeholder="Data akan diperbarui"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:border-[#008284] outline-none"
                  />
                </div>

                <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <label className="text-[11px] font-bold text-gray-700 block">Program Berjalan</label>
                  <input
                    type="text"
                    value={formData.statsActivePrograms || ''}
                    onChange={(e) => handleFieldChange('statsActivePrograms', e.target.value)}
                    placeholder="Otomatis dihitung / custom"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:border-[#008284] outline-none"
                  />
                </div>

                <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <label className="text-[11px] font-bold text-gray-700 block">Penerima Manfaat</label>
                  <input
                    type="text"
                    value={formData.statsBeneficiaries || ''}
                    onChange={(e) => handleFieldChange('statsBeneficiaries', e.target.value)}
                    placeholder="Data akan diperbarui"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:border-[#008284] outline-none"
                  />
                </div>

                <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <label className="text-[11px] font-bold text-gray-700 block">Donatur</label>
                  <input
                    type="text"
                    value={formData.statsDonors || ''}
                    onChange={(e) => handleFieldChange('statsDonors', e.target.value)}
                    placeholder="Data akan diperbarui"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold focus:border-[#008284] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUSUNAN & AKTIFKAN SECTION */}
      {activeTab === 'sections' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-base text-[#071F20]">
              Pengaturan Urutan & Visibilitas Section Beranda
            </h3>
            <p className="text-xs text-[#647B7C]">
              Aktifkan atau nonaktifkan section sesuai kebutuhan. Section yang dinonaktifkan tidak akan muncul di website publik. Anda juga dapat mengubah posisi urutannya.
            </p>
          </div>

          <div className="space-y-3">
            {(formData.sectionsOrder || [
              'hero',
              'stats',
              'featuredPrograms',
              'bankAccounts',
              'about',
              'banner',
              'cta',
              'testimonials',
            ]).map((secKey, idx) => {
              const info = sectionLabels[secKey] || { label: secKey, desc: '' };
              const isEnabled = formData.sectionsVisibility?.[secKey as keyof SectionVisibility] !== false;

              return (
                <div
                  key={secKey}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isEnabled
                      ? 'bg-white border-[#D8E6E6] shadow-2xs'
                      : 'bg-gray-50/70 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[#071F20]">{info.label}</h4>
                        {isEnabled ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Aktif di Website
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                            Dinonaktifkan
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{info.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Order Controls */}
                    <div className="flex items-center gap-1 mr-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSectionOrder(idx, 'up')}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                        title="Geser ke Atas"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === (formData.sectionsOrder?.length || 0) - 1}
                        onClick={() => moveSectionOrder(idx, 'down')}
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                        title="Geser ke Bawah"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleSection(secKey as keyof SectionVisibility)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        isEnabled
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-rose-600" />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-emerald-600" />
                          Aktifkan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TENTANG LEMBAGA */}
      {activeTab === 'tentang' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-base text-[#071F20]">Pengaturan Bagian Tentang</h3>
            <p className="text-xs text-[#647B7C]">
              Tuliskan profil lembaga, sejarah singkat, dan nilai-nilai luhur Irsyadul Amal.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Judul Bagian Tentang</label>
              <input
                type="text"
                value={formData.aboutTitle}
                onChange={(e) => handleFieldChange('aboutTitle', e.target.value)}
                placeholder="Tentang Irsyadul Amal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Subjudul Tentang</label>
              <input
                type="text"
                value={formData.aboutSubtitle}
                onChange={(e) => handleFieldChange('aboutSubtitle', e.target.value)}
                placeholder="Amanah, Transparan, dan Profesional Sejak Awal Berdiri"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Kisah & Profil Lengkap</label>
              <textarea
                rows={5}
                value={formData.aboutStory}
                onChange={(e) => handleFieldChange('aboutStory', e.target.value)}
                placeholder="Ceritakan latar belakang lembaga..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Judul Nilai Utama</label>
              <input
                type="text"
                value={formData.valuesTitle}
                onChange={(e) => handleFieldChange('valuesTitle', e.target.value)}
                placeholder="Nilai Utama Kami"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BANNER PROMO & LAYANAN */}
      {activeTab === 'banner' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#071F20]">Banner Layanan / Promo</h3>
              <p className="text-xs text-[#647B7C]">
                Spanduk khusus yang tampil di tengah halaman untuk layanan jemput donasi atau info darurat.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleFieldChange('bannerEnabled', !formData.bannerEnabled)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                formData.bannerEnabled !== false
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {formData.bannerEnabled !== false ? 'Banner Aktif' : 'Banner Dinonaktifkan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Judul Banner</label>
              <input
                type="text"
                value={formData.bannerTitle || ''}
                onChange={(e) => handleFieldChange('bannerTitle', e.target.value)}
                placeholder="Contoh: Layanan Jemput Zakat & Donasi Garut"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Teks Tombol Banner</label>
              <input
                type="text"
                value={formData.bannerButtonText || ''}
                onChange={(e) => handleFieldChange('bannerButtonText', e.target.value)}
                placeholder="Hubungi WhatsApp Layanan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-bold"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Subjudul / Deskripsi Banner</label>
              <textarea
                rows={2}
                value={formData.bannerSubtitle || ''}
                onChange={(e) => handleFieldChange('bannerSubtitle', e.target.value)}
                placeholder="Keterangan singkat..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Tautan Tombol Banner</label>
              <input
                type="text"
                value={formData.bannerButtonLink || ''}
                onChange={(e) => handleFieldChange('bannerButtonLink', e.target.value)}
                placeholder="https://wa.me/6287804034140"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-mono"
              />
            </div>

            {/* Banner Image */}
            <div className="md:col-span-2 space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-[#071F20] block">Foto Latar / Sampul Banner</label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-48 h-28 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                  <img
                    src={formData.bannerImageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80'}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="text"
                    value={formData.bannerImageUrl || ''}
                    onChange={(e) => handleFieldChange('bannerImageUrl', e.target.value)}
                    placeholder="URL gambar banner (https://...)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-mono"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <label className={`px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008284]" /> : <Upload className="w-3.5 h-3.5 text-[#008284]" />}
                      <span>{isUploadingImage ? 'Mengunggah...' : 'Upload dari Perangkat'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        onChange={(e) => handleDirectImageUpload(e, 'bannerImageUrl')}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaTargetField('bannerImageUrl');
                        setIsMediaPickerOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Pilih dari Media Library
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CALL TO ACTION (CTA) */}
      {activeTab === 'cta' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-base text-[#071F20]">Call To Action (Ajakan Donasi)</h3>
            <p className="text-xs text-[#647B7C]">
              Kotak ajakan berbuat kebaikan yang berada di dekat penutup halaman.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Judul Ajakan (CTA)</label>
              <input
                type="text"
                value={formData.ctaTitle}
                onChange={(e) => handleFieldChange('ctaTitle', e.target.value)}
                placeholder="Bersama Menghadirkan Senyum dan Harapan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Subjudul Ajakan</label>
              <textarea
                rows={2}
                value={formData.ctaSubtitle}
                onChange={(e) => handleFieldChange('ctaSubtitle', e.target.value)}
                placeholder="Mari ambil bagian dalam barisan kebaikan..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Teks Tombol CTA</label>
              <input
                type="text"
                value={formData.ctaButtonText}
                onChange={(e) => handleFieldChange('ctaButtonText', e.target.value)}
                placeholder="DONASI SEKARANG"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FOOTER & HAK CIPTA */}
      {activeTab === 'footer' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-base text-[#071F20]">Pengaturan Konten Footer</h3>
            <p className="text-xs text-[#647B7C]">
              Admin dapat mengedit seluruh footer website: alamat kantor, kontak, jam operasional, teks hak cipta, dan akun media sosial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">
                Teks Hak Cipta (Copyright)
              </label>
              <input
                type="text"
                value={footerData.footerCopyright}
                onChange={(e) => handleFooterChange('footerCopyright', e.target.value)}
                placeholder="© 2026 Lembaga Kesejahteraan Sosial Irsyadul Amal Garut..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Alamat Kantor Lengkap</label>
              <textarea
                rows={2}
                value={footerData.address}
                onChange={(e) => handleFooterChange('address', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Nomor WhatsApp Resmi</label>
              <input
                type="text"
                value={footerData.whatsapp}
                onChange={(e) => handleFooterChange('whatsapp', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Email Resmi</label>
              <input
                type="email"
                value={footerData.email}
                onChange={(e) => handleFooterChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Jam Operasional</label>
              <input
                type="text"
                value={footerData.operatingHours}
                onChange={(e) => handleFooterChange('operatingHours', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#071F20] block">Instagram URL</label>
              <input
                type="text"
                value={footerData.instagram}
                onChange={(e) => handleFooterChange('instagram', e.target.value)}
                placeholder="https://instagram.com/irsyadulamal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#008284] outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
