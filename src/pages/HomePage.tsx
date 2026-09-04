import React, { useState } from 'react';
import { NavPage, ProgramItem } from '../types';
import {
  Heart,
  ArrowRight,
  Layers,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  PhoneCall,
  MessageSquare,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { useCMS } from '../data/cmsContext';

interface HomePageProps {
  programs: ProgramItem[];
  onNavigate: (page: NavPage) => void;
  onSelectProgramDetail: (program: ProgramItem) => void;
  onOpenQuickDonation: (program?: ProgramItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  programs,
  onNavigate,
  onSelectProgramDetail,
  onOpenQuickDonation,
}) => {
  const { homepageContent, bankGroups } = useCMS();
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (accNumber: string) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedAccount(accNumber);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const sectionsVisibility = homepageContent.sectionsVisibility || {
    hero: true,
    stats: true,
    featuredPrograms: true,
    bankAccounts: true,
    about: true,
    banner: true,
    cta: true,
    testimonials: false,
    gallery: true,
    footer: true,
  };

  const sectionsOrder = homepageContent.sectionsOrder || [
    'hero',
    'stats',
    'featuredPrograms',
    'bankAccounts',
    'about',
    'banner',
    'cta',
    'testimonials',
  ];

  // Render individual sections
  const renderHero = () => (
    <section
      key="hero"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#006769] via-[#008284] to-[#004D4F] text-white shadow-xl"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-grid)" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          {homepageContent.heroBadge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-emerald-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{homepageContent.heroBadge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {homepageContent.heroTitle}{' '}
            {homepageContent.heroTitleHighlight && (
              <span className="text-[#A5F3FC]">{homepageContent.heroTitleHighlight}</span>
            )}
          </h1>

          <p className="text-sm sm:text-base text-teal-50 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {homepageContent.heroSubtitle}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              type="button"
              onClick={() => onNavigate('donasi')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 uppercase cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" />
              {homepageContent.primaryButtonText || 'DONASI SEKARANG'}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('program')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/30 backdrop-blur-xs transition-all flex items-center justify-center gap-2 active:scale-95 uppercase cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              {homepageContent.secondaryButtonText || 'LIHAT PROGRAM'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white/10 group">
            <img
              src={homepageContent.heroImageUrl}
              alt="Aktivitas Irsyadul Amal"
              className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {homepageContent.heroImageCaption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                  Amanah Donatur
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {homepageContent.heroImageCaption}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const renderStats = () => (
    <section key="stats" className="space-y-4">
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <h2 className="text-2xl font-extrabold text-[#071F20] tracking-tight">
          Jejak Kebaikan Irsyadul Amal
        </h2>
        <p className="text-xs sm:text-sm text-[#647B7C]">
          Prinsip keterbukaan dan integritas untuk setiap titipan sedekah, infaq, dan wakaf.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#647B7C]">
            Total Donasi
          </span>
          <p className="text-sm sm:text-base font-bold text-[#008284]">
            Data akan diperbarui
          </p>
          <p className="text-[10px] text-gray-400">Sinkronisasi pembukuan resmi</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#647B7C]">
            Program Berjalan
          </span>
          <p className="text-sm sm:text-base font-bold text-[#008284]">
            Data akan diperbarui
          </p>
          <p className="text-[10px] text-gray-400">Pendidikan, Wakaf & Sosial</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#647B7C]">
            Penerima Manfaat
          </span>
          <p className="text-sm sm:text-base font-bold text-[#008284]">
            Data akan diperbarui
          </p>
          <p className="text-[10px] text-gray-400">Garut dan sekitarnya</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#647B7C]">
            Donatur
          </span>
          <p className="text-sm sm:text-base font-bold text-[#008284]">
            Data akan diperbarui
          </p>
          <p className="text-[10px] text-gray-400">Muhsinin & Sahabat Kebaikan</p>
        </div>
      </div>

      <div className="bg-[#F0FAFA] border border-[#CCFBF1] rounded-2xl p-3.5 flex items-center justify-between text-xs text-[#006769]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#008284] shrink-0" />
          <span>Angka statistik resmi diperbarui berkala sesuai laporan rekapitulasi kelembagaan.</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('laporan')}
          className="font-bold underline hover:text-[#004D4F] shrink-0 ml-2 cursor-pointer"
        >
          Lihat Laporan &rarr;
        </button>
      </div>
    </section>
  );

  const renderFeaturedPrograms = () => (
    <section key="featuredPrograms" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#071F20] tracking-tight">
            Program Kebaikan Pilihan
          </h2>
          <p className="text-xs text-[#647B7C]">
            Ambil bagian dalam aksi nyata kemanusiaan dan dakwah sosial
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('program')}
          className="text-xs sm:text-sm font-bold text-[#008284] hover:underline flex items-center gap-1 cursor-pointer"
        >
          Semua Program <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs.slice(0, 3).map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#008284]/40 transition-all flex flex-col"
            >
              <div className="relative h-44 overflow-hidden bg-gray-100">
                <img
                  src={prog.imageUrl}
                  alt={prog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#008284] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {prog.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-[#071F20] line-clamp-2 leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>Target Dana</span>
                    <span className="font-semibold text-gray-700">{prog.targetAmountText || 'Data akan diperbarui'}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectProgramDetail(prog)}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQuickDonation(prog)}
                      className="flex-1 py-2 px-3 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      Donasi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2">
          <p className="text-sm font-bold text-gray-600">Belum ada program yang dipublikasikan.</p>
          <p className="text-xs text-gray-400">Silakan kembali lagi nanti untuk melihat program terbaru.</p>
        </div>
      )}
    </section>
  );

  const renderBankAccounts = () => (
    <section key="bankAccounts" className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E0EAEA] shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-[#008284] uppercase tracking-wider">
            Rekening Resmi Lembaga
          </span>
          <h2 className="text-xl font-extrabold text-[#071F20] tracking-tight">
            Transfer Kebaikan dengan Mudah
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('donasi')}
          className="text-xs font-bold text-[#008284] hover:underline flex items-center gap-1 cursor-pointer"
        >
          Lihat Semua Rekening Lengkap <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {bankGroups.map((group) => {
          const firstAcc = group.accounts[0];
          if (!firstAcc) return null;
          const isCopied = copiedAccount === firstAcc.accountNumber;
          return (
            <div
              key={group.category}
              className="bg-[#F0FAFA] border border-[#CCFBF1] rounded-2xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-extrabold text-[#006769] uppercase tracking-wider">
                  {group.category}
                </span>
                <h4 className="font-extrabold text-sm text-[#071F20] mt-0.5">
                  {firstAcc.bankName}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  a.n. {firstAcc.accountHolder}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-teal-100">
                <span className="font-mono font-extrabold text-sm text-[#008284] tracking-wider">
                  {firstAcc.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(firstAcc.accountNumber)}
                  className="p-1.5 rounded-lg bg-white border border-teal-200 text-teal-800 hover:bg-teal-50 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Salin nomor rekening"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  const renderAbout = () => (
    <section key="about" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0EAEA] shadow-2xs space-y-4">
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-[#008284] uppercase tracking-wider">
          Tentang Kami
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#071F20] tracking-tight">
          {homepageContent.aboutTitle || 'Tentang Irsyadul Amal'}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-[#008284]">
          {homepageContent.aboutSubtitle}
        </p>
      </div>

      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-4xl">
        {homepageContent.aboutStory}
      </p>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-600">{homepageContent.valuesTitle || 'Nilai Utama Kami'}</span>
        <button
          type="button"
          onClick={() => onNavigate('call_center')}
          className="text-xs font-bold text-[#008284] hover:underline flex items-center gap-1 cursor-pointer"
        >
          Hubungi Sekretariat <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );

  const renderBanner = () => {
    if (homepageContent.bannerEnabled === false) return null;
    return (
      <section
        key="banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071F20] to-[#004D4F] text-white shadow-md p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 z-10 max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Layanan Jemput Donasi</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">
            {homepageContent.bannerTitle || 'Layanan Jemput Zakat & Donasi Garut'}
          </h3>
          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            {homepageContent.bannerSubtitle || 'Tim relawan resmi Irsyadul Amal siap melayani jemput zakat, infaq, dan sedekah ke lokasi Anda.'}
          </p>
        </div>

        <div className="z-10 shrink-0">
          <a
            href={homepageContent.bannerButtonLink || 'https://wa.me/6287804034140'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 uppercase tracking-wider"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            {homepageContent.bannerButtonText || 'Hubungi WhatsApp'}
          </a>
        </div>
      </section>
    );
  };

  const renderCTA = () => (
    <section
      key="cta"
      className="bg-gradient-to-br from-[#008284] to-[#006769] text-white rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-4"
    >
      <div className="max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          {homepageContent.ctaTitle || 'Bersama Menghadirkan Senyum dan Harapan'}
        </h2>
        <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
          {homepageContent.ctaSubtitle || 'Mari ambil bagian dalam barisan kebaikan untuk memajukan saudara-saudara kita di pelosok Garut.'}
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => onNavigate('donasi')}
          className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-black text-sm shadow-xl hover:shadow-2xl transition-all uppercase tracking-wider cursor-pointer"
        >
          {homepageContent.ctaButtonText || 'DONASI SEKARANG'}
        </button>
      </div>
    </section>
  );

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: renderHero,
    stats: renderStats,
    featuredPrograms: renderFeaturedPrograms,
    bankAccounts: renderBankAccounts,
    about: renderAbout,
    banner: renderBanner,
    cta: renderCTA,
  };

  return (
    <div className="space-y-10 sm:space-y-14 animate-in fade-in duration-200">
      {sectionsOrder.map((secKey) => {
        const isVisible = sectionsVisibility[secKey as keyof typeof sectionsVisibility] !== false;
        if (!isVisible) return null;
        const renderer = sectionRenderers[secKey];
        return renderer ? renderer() : null;
      })}
    </div>
  );
};
