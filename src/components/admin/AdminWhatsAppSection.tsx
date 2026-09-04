import React, { useState } from 'react';
import { MessageSquare, Save, CheckCircle2, Phone, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';
import { useCMS } from '../../data/cmsContext';

export const AdminWhatsAppSection: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useCMS();
  const [whatsappNumber, setWhatsappNumber] = useState(siteSettings.whatsapp);
  const [template, setTemplate] = useState(siteSettings.waConfirmationTemplate);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      whatsapp: whatsappNumber.trim(),
      waConfirmationTemplate: template,
    });
    setToastMessage('Pengaturan nomor dan pesan WhatsApp berhasil diperbarui!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const samplePreview = template
    .replace('[NAMA PROGRAM]', 'Wakaf Sumur Bor & Air Bersih')
    .replace('[NOMINAL]', '100.000')
    .replace('[NAMA BANK]', 'BSI')
    .replace('[NAMA REKENING]', 'LKS IRSYADUL AMAL');

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      <div className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#008284]">
          <MessageSquare className="w-4 h-4" />
          <span>LAYANAN WHATSAPP</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#071F20] mt-1">
          Pengaturan Konfirmasi Donasi via WhatsApp
        </h1>
        <p className="text-xs text-[#647B7C] mt-0.5">
          Kelola nomor resmi CS donasi dan format pesan yang otomatis terbuka saat donatur menekan tombol konfirmasi.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: 7 cols */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#071F20] block">
              Nomor WhatsApp Resmi Lembaga *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="087804034140"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#008284] text-xs sm:text-sm outline-none font-bold"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-[#647B7C]">
              Nomor resmi: 087804034140 (Garut). Format lokal maupun internasional 62 didukung otomatis.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#071F20]">
                Template Pesan Konfirmasi Donasi
              </label>
            </div>
            <textarea
              rows={9}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#008284] text-xs font-mono outline-none leading-relaxed"
            />
          </div>

          {/* Variables help */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-xs text-[#071F20]">
            <p className="font-extrabold text-[11px] text-[#008284] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Variabel Otomatis yang Didukung:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <span className="p-1 bg-white rounded border text-gray-700">[NAMA PROGRAM]</span>
              <span className="p-1 bg-white rounded border text-gray-700">[NOMINAL]</span>
              <span className="p-1 bg-white rounded border text-gray-700">[NAMA BANK]</span>
              <span className="p-1 bg-white rounded border text-gray-700">[NAMA REKENING]</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-extrabold shadow-xs flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan Pengaturan WhatsApp
            </button>
          </div>
        </form>

        {/* Live Preview: 5 cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#647B7C]">
            Pratinjau Chat WhatsApp
          </h3>

          <div className="p-4 bg-[#E5DDD5] rounded-2xl shadow-inner border border-gray-300 space-y-3">
            <div className="bg-[#DCF8C6] p-3 rounded-xl rounded-tr-none shadow-xs text-xs whitespace-pre-wrap font-sans text-gray-900 leading-relaxed border border-green-200">
              {samplePreview}
              <div className="text-right text-[10px] text-gray-500 mt-1">12:30 ✓✓</div>
            </div>
          </div>

          <p className="text-[11px] text-[#647B7C] italic">
            *Pratinjau ini menunjukkan bagaimana pesan otomatis terisi saat donatur mengonfirmasi transfer donasi dari halaman website publik.
          </p>
        </div>
      </div>
    </div>
  );
};
