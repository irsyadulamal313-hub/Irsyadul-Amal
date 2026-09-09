import React, { useState } from 'react';
import { OfficialReportItem, DocumentationItem } from '../types';
import { useCMS } from '../data/cmsContext';
import { FileText, Download, ShieldCheck, Image, MapPin, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface ReportPageProps {
  onOpenPhotoLightbox: (photo: DocumentationItem) => void;
}

type ReportSubTab = 'donasi' | 'penggunaan_dana' | 'program' | 'dokumentasi';

export const ReportPage: React.FC<ReportPageProps> = ({ onOpenPhotoLightbox }) => {
  const { reports, documentations, siteSettings } = useCMS();
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>('donasi');
  const [selectedReportModal, setSelectedReportModal] = useState<OfficialReportItem | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const subTabs: { key: ReportSubTab; label: string; icon: React.ReactNode }[] = [
    { key: 'donasi', label: 'Laporan Donasi', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'penggunaan_dana', label: 'Laporan Penggunaan Dana', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'program', label: 'Laporan Program', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'dokumentasi', label: 'Dokumentasi Kegiatan', icon: <Image className="w-3.5 h-3.5" /> },
  ];

  // Filter reports by category
  const filteredReports = reports.filter((r) => {
    if (activeSubTab === 'donasi') return r.category === 'Donasi' || r.category === 'Keuangan';
    if (activeSubTab === 'penggunaan_dana') return r.category === 'Penggunaan Dana' || r.category === 'Audit';
    if (activeSubTab === 'program') return r.category === 'Program' || r.category === 'Lainnya';
    return true;
  });

  const handleDownload = (report: OfficialReportItem) => {
    if (report.fileUrl && report.fileUrl !== '#') {
      window.open(report.fileUrl, '_blank', 'noopener,noreferrer');
    }
    setDownloadSuccess(`Mengunduh dokumen: ${report.title}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans pb-10">
      {downloadSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#004D4F] text-white px-5 py-2.5 rounded-2xl shadow-xl border border-teal-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#008284] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Akuntabilitas & Keterbukaan
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#071F20] tracking-tight">
          Transparansi untuk Setiap Amanah
        </h1>
        <p className="text-xs sm:text-sm text-[#647B7C] leading-relaxed max-w-lg mx-auto font-normal">
          Kami berkomitmen menjaga keterbukaan setiap rupiah donasi dan wakaf yang dititipkan melalui pembukuan yang dapat dipertanggungjawabkan.
        </p>
      </section>

      {/* Sub navigation tabs */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar justify-start sm:justify-center">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSubTab(tab.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === tab.key
                ? 'bg-[#008284] text-white shadow-xs font-semibold'
                : 'bg-white hover:bg-teal-50 text-[#071F20] border border-[#E0EAEA]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </section>

      {/* 1. LAPORAN DONASI */}
      {activeSubTab === 'donasi' && (
        <section className="space-y-4">
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredReports.map((rep) => (
                <div key={rep.id} className="bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-[#E6F4F4] text-[#008284] rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-[#008284] bg-teal-50 px-2 py-0.5 rounded-full">
                          {rep.category}
                        </span>
                        <h3 className="font-semibold text-sm text-[#071F20] mt-1">{rep.title}</h3>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#647B7C] font-normal">Periode: {rep.period}</p>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-400 text-[11px] font-normal">{rep.fileSize}</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(rep)}
                      className="px-3 py-1.5 rounded-xl bg-[#008284] text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-[#006769] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh Dokumen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0EAEA] shadow-2xs space-y-4 text-center">
              <div className="max-w-md mx-auto space-y-2">
                <FileText className="w-10 h-10 text-[#008284] mx-auto opacity-70" />
                <h2 className="text-base sm:text-lg font-bold text-[#071F20]">
                  Laporan Donasi
                </h2>
                <p className="text-sm font-semibold text-gray-700">
                  Belum ada laporan yang dipublikasikan.
                </p>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  Rekapitulasi penerimaan donasi resmi sedang dalam proses pembukuan berkala dan akan diunggah secara terbuka melalui sistem administrasi kelembagaan.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Informasi & Konfirmasi via WhatsApp
                </a>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 2. LAPORAN PENGGUNAAN DANA */}
      {activeSubTab === 'penggunaan_dana' && (
        <section className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0EAEA] shadow-2xs space-y-4 text-center">
            <div className="max-w-md mx-auto space-y-2">
              <ShieldCheck className="w-10 h-10 text-[#008284] mx-auto opacity-70" />
              <h2 className="text-base sm:text-lg font-bold text-[#071F20]">
                Laporan Penggunaan Dana
              </h2>
              <p className="text-sm font-semibold text-gray-700">
                Belum ada laporan yang dipublikasikan.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Catatan realisasi penggunaan dana, bukti belanja, serta kuitansi operasional lapangan akan diunggah setelah penutupan periode akuntansi kelembagaan.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center">
              <a
                href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                Hubungi Call Center Lembaga
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 3. LAPORAN PROGRAM */}
      {activeSubTab === 'program' && (
        <section className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E0EAEA] shadow-2xs space-y-4 text-center">
            <div className="max-w-md mx-auto space-y-2">
              <FileText className="w-10 h-10 text-[#008284] mx-auto opacity-70" />
              <h2 className="text-base sm:text-lg font-bold text-[#071F20]">
                Laporan Program
              </h2>
              <p className="text-sm font-semibold text-gray-700">
                Belum ada laporan yang dipublikasikan.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Laporan narasi pelaksanaan program sosial, dakwah Al-Qur'an, dan wakaf air akan diperbarui oleh pengurus secara berkala.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center">
              <a
                href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                Informasi Program via WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 4. DOKUMENTASI KEGIATAN */}
      {activeSubTab === 'dokumentasi' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#071F20]">
                Dokumentasi Kegiatan
              </h2>
              <p className="text-xs text-[#647B7C] font-normal">
                Bukti visual ikhtiar penyaluran dan pendampingan warga di lapangan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documentations.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenPhotoLightbox(doc)}
                className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-2xs hover:shadow-sm cursor-pointer group transition-all"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {imgErrors[doc.id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center">
                      <ImageIcon className="w-8 h-8 mb-1 text-gray-300" />
                      <span className="text-[11px] font-medium">{doc.title}</span>
                    </div>
                  ) : (
                    <img
                      src={doc.imageUrl}
                      alt={doc.title}
                      onError={() => handleImageError(doc.id)}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  )}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                    {doc.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-[#071F20] group-hover:text-[#008284] transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-normal">
                    {doc.story}
                  </p>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1 font-normal">
                      <MapPin className="w-3 h-3 text-[#008284]" /> {doc.location}
                    </span>
                    <span className="text-[#008284] font-medium">Lihat Foto &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal Preview Report */}
      {selectedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-[#CCFBF1]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#008284] bg-teal-50 px-2.5 py-1 rounded-full">
                {selectedReportModal.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                className="text-gray-400 hover:text-gray-700 font-semibold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-semibold text-base text-[#071F20]">
                {selectedReportModal.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                {selectedReportModal.description}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100 font-normal">
              <p><strong>Periode:</strong> {selectedReportModal.period}</p>
              <p><strong>Penerbit:</strong> Lembaga Sosial & Kemanusiaan Irsyadul Amal</p>
              <p><strong>Status:</strong> Dokumen Resmi Terverifikasi</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleDownload(selectedReportModal);
                  setSelectedReportModal(null);
                }}
                className="flex-1 py-2.5 px-4 bg-[#008284] hover:bg-[#006769] text-white font-semibold text-xs rounded-xl text-center cursor-pointer"
              >
                Unduh Salinan Dokumen
              </button>
              <button
                type="button"
                onClick={() => setSelectedReportModal(null)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
