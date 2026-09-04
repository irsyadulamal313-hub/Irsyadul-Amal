import React, { useState } from 'react';
import { useCMS } from '../data/cmsContext';
import { Phone, MapPin, MessageSquare, Clock, Send, ShieldCheck, Mail } from 'lucide-react';
import { IrsyadulAmalLogo } from '../components/IrsyadulAmalLogo';

export const CallCenterPage: React.FC = () => {
  const { siteSettings } = useCMS();
  const [customMessage, setCustomMessage] = useState('');
  const [senderName, setSenderName] = useState('');

  const defaultWhatsappMessage =
    siteSettings.whatsappDefaultMessage ||
    "Assalamu'alaikum Irsyadul Amal, saya ingin mendapatkan informasi mengenai program dan donasi.";

  const cleanPhone = siteSettings.whatsapp.replace(/\D/g, '').replace(/^0/, '62');

  const handleChatWhatsapp = () => {
    let textToSend = defaultWhatsappMessage;
    if (customMessage.trim()) {
      textToSend = `Assalamu'alaikum Irsyadul Amal, perkenalkan saya ${
        senderName.trim() || 'Hamba Allah'
      }. ${customMessage.trim()}`;
    }

    const url = `https://wa.me/${cleanPhone || '6287804034140'}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008284] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Layanan Sahabat Donatur
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071F20] tracking-tight">
          Hubungi Irsyadul Amal
        </h1>
        <p className="text-xs sm:text-sm text-[#647B7C] leading-relaxed max-w-lg mx-auto">
          Memiliki pertanyaan mengenai donasi atau program kami? Kami siap membantu.
        </p>
      </section>

      {/* Main Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E0EAEA] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <IrsyadulAmalLogo size={46} />
            <div>
              <h2 className="font-extrabold text-base text-[#071F20]">
                {siteSettings.institutionName || 'IRSYADUL AMAL'}
              </h2>
              <p className="text-xs text-[#008284] font-semibold">
                {siteSettings.tagline || 'Lembaga Sosial & Kemanusiaan'}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-gray-700">
            {/* WhatsApp Resmi */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E6F7F7] border border-[#CCFBF1]">
              <div className="w-10 h-10 rounded-full bg-[#008284] text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#006769]">
                  WhatsApp Resmi Call Center
                </span>
                <p className="text-base sm:text-lg font-mono font-black text-[#004D4F]">
                  {siteSettings.whatsapp}
                </p>
                <p className="text-[11px] text-gray-600">
                  Layanan respon cepat konfirmasi donasi, jemput infaq, dan informasi program.
                </p>
              </div>
            </div>

            {/* Alamat Resmi */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#008284]" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Alamat Resmi
                </span>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-relaxed">
                  {siteSettings.address}
                </p>
              </div>
            </div>

            {/* Jam Operasional */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#008284]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Jam Layanan Informasi
                </span>
                <p className="text-xs sm:text-sm font-semibold text-gray-900">
                  {siteSettings.operationalHours || 'Senin - Ahad: 08.00 - 21.00 WIB'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Pesan di luar jam kerja akan dibalas pada kesempatan pertama.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Button: Exact Required Button */}
          <div className="pt-2">
            <a
              href={`https://wa.me/${cleanPhone || '6287804034140'}?text=${encodeURIComponent(defaultWhatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#008284] hover:bg-[#006769] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              CHAT VIA WHATSAPP ({siteSettings.whatsapp})
            </a>
          </div>
        </div>

        {/* Interactive Direct Inquiry Box */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E0EAEA] shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-[#071F20]">
              Kirim Pesan Langsung
            </h3>
            <p className="text-xs text-gray-500">
              Tulis pertanyaan Anda di sini, sistem kami akan langsung menyambungkannya ke WhatsApp Call Center resmi.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Nama Lengkap / Panggilan
              </label>
              <input
                type="text"
                placeholder="Contoh: Fajar / Hamba Allah"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-[#008284] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Pesan / Pertanyaan Anda
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan hal yang ingin Anda tanyakan mengenai program, konsultasi zakat, atau konfirmasi donasi..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-[#008284] focus:bg-white resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleChatWhatsapp}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim ke WhatsApp {siteSettings.whatsapp}
            </button>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-4 h-4 text-[#008284] shrink-0" />
            <span>Kerahasiaan data dan pesan Anda dijamin aman.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
