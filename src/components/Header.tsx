import React, { useState } from 'react';
import { Menu, X, Heart, ShieldCheck, PhoneCall, Home, Layers, FileText, Settings } from 'lucide-react';
import { IrsyadulAmalLogo } from './IrsyadulAmalLogo';
import { useCMS } from '../data/cmsContext';
import { NavPage } from '../types';

interface HeaderProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenAdmin,
}) => {
  const { siteSettings } = useCMS();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: { key: NavPage; label: string; icon: React.ReactNode }[] = [
    { key: 'beranda', label: 'Beranda', icon: <Home className="w-4 h-4" /> },
    { key: 'donasi', label: 'Donasi', icon: <Heart className="w-4 h-4" /> },
    { key: 'program', label: 'Program', icon: <Layers className="w-4 h-4" /> },
    { key: 'laporan', label: 'Laporan', icon: <FileText className="w-4 h-4" /> },
    { key: 'call_center', label: 'Call Center', icon: <PhoneCall className="w-4 h-4" /> },
  ];

  const handleLinkClick = (page: NavPage) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E0EAEA] shadow-2xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Brand logo & name */}
        <button
          type="button"
          onClick={() => handleLinkClick('beranda')}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <IrsyadulAmalLogo size={42} className="shadow-2xs rounded-full shrink-0 group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="font-extrabold text-[#008284] text-lg sm:text-xl tracking-tight leading-none group-hover:text-[#006769] transition-colors">
              {siteSettings.institutionName || 'IRSYADUL AMAL'}
            </span>
            <span className="text-xs text-[#647B7C] font-medium leading-tight mt-1">
              {siteSettings.tagline || 'Lembaga Sosial & Kemanusiaan'}
            </span>
          </div>
        </button>

        {/* Center/Right: Desktop Navigation (EXACT 5 MENUS) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = currentPage === link.key;
            return (
              <button
                key={link.key}
                type="button"
                onClick={() => handleLinkClick(link.key)}
                className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#008284] text-white shadow-xs'
                    : 'text-[#071F20] hover:text-[#008284] hover:bg-[#F0FAFA]'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          {/* Quick Donate Button on Desktop: EXACT "DONASI SEKARANG" */}
          <button
            type="button"
            onClick={() => handleLinkClick('donasi')}
            className="ml-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs lg:text-sm font-extrabold shadow-xs transition-all flex items-center gap-1.5 active:scale-95 tracking-wide"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            DONASI SEKARANG
          </button>

          {/* Admin Dashboard Access Icon (Khusus Pengelola Website) */}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              title="Dashboard Admin"
              className="ml-1 p-2 text-gray-400 hover:text-[#008284] hover:bg-[#F0FAFA] rounded-xl transition-all border border-transparent hover:border-[#CCFBF1]"
              aria-label="Dashboard Admin"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </nav>

        {/* Right on Mobile: Admin Icon & Hamburger Menu */}
        <div className="flex md:hidden items-center gap-1">
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              title="Dashboard Admin"
              className="p-2 text-gray-400 hover:text-[#008284] hover:bg-[#F0FAFA] rounded-xl transition-colors"
              aria-label="Dashboard Admin"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Buka Menu Navigasi"
            className="p-2 text-[#071F20] hover:text-[#008284] hover:bg-[#F0FAFA] rounded-xl transition-colors active:scale-95"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (EXACT 5 MENUS) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#071F20]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E0EAEA] flex items-center justify-between bg-[#F0FAFA]">
              <div className="flex items-center gap-2.5">
                <IrsyadulAmalLogo size={36} />
                <div>
                  <h2 className="font-extrabold text-sm text-[#008284]">IRSYADUL AMAL</h2>
                  <p className="text-[10px] text-[#647B7C]">Lembaga Sosial & Kemanusiaan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded-full hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">
                Navigasi Utama
              </p>

              {navLinks.map((link) => {
                const isActive = currentPage === link.key;
                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => handleLinkClick(link.key)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-[#008284] text-white'
                        : 'text-[#071F20] hover:bg-[#F0FAFA] hover:text-[#008284]'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-[#008284]'}>
                      {link.icon}
                    </span>
                    {link.label}
                  </button>
                );
              })}

              {/* Call to action card */}
              <div className="pt-4 border-t border-gray-100 mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleLinkClick('donasi')}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  Salurkan Donasi
                </button>

                <div className="bg-[#F0FAFA] rounded-xl p-3 text-[11px] text-[#647B7C] space-y-1 border border-[#CCFBF1]">
                  <p className="font-bold text-[#008284] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Sekretariat Resmi Garut
                  </p>
                  <p className="line-clamp-2">{siteSettings.address}</p>
                  <p className="pt-1 font-semibold text-[#071F20]">
                    WhatsApp: {siteSettings.whatsapp}
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>© 2026 Irsyadul Amal.</span>
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="text-[#008284] font-bold hover:underline flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Dashboard Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
