import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCMS } from '../data/cmsContext';

export const FloatingWhatsApp: React.FC = () => {
  const { siteSettings } = useCMS();
  const cleanPhone = (siteSettings?.whatsapp || '087804034140').replace(/\D/g, '').replace(/^0/, '62');
  const defaultMessage =
    siteSettings?.whatsappDefaultMessage ||
    "Assalamu'alaikum Irsyadul Amal, saya ingin mendapatkan informasi mengenai program dan donasi.";

  const whatsappUrl = `https://wa.me/${cleanPhone || '6287804034140'}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside
      aria-label="Kontak Cepat WhatsApp"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center group"
    >
      {/* Tooltip on hover on desktop */}
      <span className="hidden sm:inline-block mr-2 px-3 py-1.5 bg-gray-900/90 text-white text-xs font-semibold rounded-xl shadow-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Tanya Call Center Irsyadul Amal
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat WhatsApp Resmi Irsyadul Amal (${siteSettings?.whatsapp || '087804034140'})`}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-[#25D366]" />
      </a>
    </aside>
  );
};

