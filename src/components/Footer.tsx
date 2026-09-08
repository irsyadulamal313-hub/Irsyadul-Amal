import React from 'react';
import { IrsyadulAmalLogo } from './IrsyadulAmalLogo';
import { useCMS } from '../data/cmsContext';
import { NavPage } from '../types';
import { MapPin, Phone, ShieldCheck, UserCog } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: NavPage) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const { siteSettings } = useCMS();
  const navItems: { key: NavPage; label: string }[] = [
    { key: 'beranda', label: siteSettings.navLabels?.beranda || 'Beranda' },
    { key: 'donasi', label: siteSettings.navLabels?.donasi || 'Donasi' },
    { key: 'program', label: siteSettings.navLabels?.program || 'Program' },
    { key: 'laporan', label: siteSettings.navLabels?.laporan || 'Laporan' },
    { key: 'call_center', label: siteSettings.navLabels?.call_center || 'Call Center' },
  ];

  const cleanPhone = siteSettings.whatsapp.replace(/\D/g, '').replace(/^0/, '62');

  return (
    <footer className="bg-[#051819] text-[#E0EAEA] pt-12 pb-24 md:pb-12 border-t border-[#004D4F] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#0A2F31]">
          {/* Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <IrsyadulAmalLogo size={46} className="bg-white/10 p-0.5 rounded-full" />
              <div>
                <h3 className="font-semibold text-lg text-white tracking-tight">
                  {siteSettings.name || 'IRSYADUL AMAL'}
                </h3>
                <p className="text-xs text-[#8CE8E8] font-normal">
                  {siteSettings.tagline || 'Lembaga Sosial & Kemanusiaan'}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#A0BABA] leading-relaxed max-w-sm font-normal">
              Berbagi kebaikan dan menebar manfaat nyata bagi saudara-saudara kita yang membutuhkan melalui program amanah, transparan, dan berkelanjutan.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#004D4F]/60 rounded-xl text-[11px] text-teal-200 border border-teal-700/40">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Amanah • Transparan • Profesional</span>
            </div>
          </div>

          {/* Navigasi Wajib (5 Menu) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Navigasi Utama
            </h4>
            <ul className="space-y-2 text-xs">
              {navItems.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.key);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[#A0BABA] hover:text-white hover:underline transition-colors cursor-pointer font-normal"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Alamat Resmi & WhatsApp */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Alamat Resmi
            </h4>

            <div className="flex items-start gap-2.5 text-[#A0BABA] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#009B9E] shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Sekretariat Irsyadul Amal</p>
                <p className="font-normal">{siteSettings.address}</p>
              </div>
            </div>

            <div className="pt-2">
              <h5 className="text-[11px] font-semibold text-white uppercase tracking-wider mb-1">
                WhatsApp Resmi
              </h5>
              <a
                href={`https://wa.me/${cleanPhone || '6287804034140'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#8CE8E8] font-semibold hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {siteSettings.whatsapp}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar with editable copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A9899]">
          <p className="font-normal">
            {siteSettings.footerCopyright || '© 2026 Lembaga Kesejahteraan Sosial Irsyadul Amal Garut. Seluruh Hak Cipta Dilindungi.'}
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Kabupaten Garut, Jawa Barat</span>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-[#A0BABA] hover:text-white underline flex items-center gap-1 cursor-pointer font-normal"
              >
                <UserCog className="w-3 h-3" />
                <span>Dashboard Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
