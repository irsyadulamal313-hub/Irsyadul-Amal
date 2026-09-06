import React, { useState } from 'react';
import { useCMS } from '../data/cmsContext';
import { Phone, MapPin, MessageSquare, Clock, Send, ShieldCheck, ExternalLink } from 'lucide-react';
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

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    siteSettings.address || 'Kp. Malajati, RT.004/RW.013, Jati, Kec. Tarogong Kaler, Kabupaten Garut, Jawa Barat 44150'
  )}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans pb-10">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#008284] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Layanan Sahabat Donatur
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#071F20] tracking-tight">
          Hubungi Irsyadul Amal
        </h1>
        <p className="text-xs sm:text-sm text-[#647B7C] leading-relaxed max-w-lg mx-auto font-normal">
          Memiliki pertanyaan mengenai donasi, wakaf, atau program kemanusiaan kami? Tim Irsyadul Amal siap melayani dengan ramah dan amanah.
        </p>
      </section>

      {/* Main Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E0EAEA] shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <IrsyadulAmalLogo size={44} />
            <div>
              <h2 className="font-semibold text-base text-[#071F20]">
                {siteSettings.institutionName || 'IRSYADUL AMAL'}
              </h2>
              <p className="text-xs text-[#008284] font-medium">
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
              <div className="space-y-0.5 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#006769]">
                  WhatsApp Resmi Call Center
                </span>
                <p className="text-base sm:text-lg font-mono font-bold text-[#004D4F]">
                  {siteSettings.whatsapp}
                </p>
                <p className="text-[11px] text-gray-600 font-normal">
                  Layanan respon cepat konfirmasi donasi, jemput zakat/infaq, dan informasi program.
                </p>
              </div>
            </div>

            {/* Alamat Resmi */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#008284]" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Alamat Resmi
                  </span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-[#008284] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Buka Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 leading-relaxed">
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
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Jam Layanan Informasi
                </span>
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  {siteSettings.operationalHours || 'Senin - Ahad: 08.00 - 21.00 WIB'}
                </p>
                <p className="text-[11px] text-gray-500 font-normal">
                  Pesan di luar jam operasional akan dibalas pada kesempatan pertama saat jam kerja berikutnya.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <a
              href={`https://wa.me/${cleanPhone || '6287804034140'}?text=${encodeURIComponent(defaultWhatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-6 rounded-2xl bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 text-center cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              CHAT VIA WHATSAPP ({siteSettings.whatsapp})
            </a>
          </div>
        </div>

        {/* Interactive Direct Inquiry Box */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E0EAEA] shadow-2xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-[#071F20]">
              Kirim Pesan Langsung
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              Tulis pertanyaan Anda di sini, sistem kami akan langsung menyambungkannya ke WhatsApp Call Center resmi.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Nama Lengkap / Panggilan
              </label>
              <input
                type="text"
                placeholder="Contoh: Fajar / Hamba Allah"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-[#008284] focus:bg-white font-normal"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Pesan / Pertanyaan Anda
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan hal yang ingin Anda tanyakan mengenai program, konsultasi zakat, atau konfirmasi donasi..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-[#008284] focus:bg-white resize-none font-normal"
              />
            </div>

            <button
              type="button"
              onClick={handleChatWhatsapp}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim ke WhatsApp {siteSettings.whatsapp}
            </button>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500 font-normal">
            <ShieldCheck className="w-4 h-4 text-[#008284] shrink-0" />
            <span>Kerahasiaan komunikasi dan data Anda terjamin amanah.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
