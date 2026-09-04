import React from 'react';
import { ProgramItem } from '../types';
import { X, Heart, Users, Target, Calendar, CheckCircle2, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface ProgramDetailModalProps {
  program: ProgramItem | null;
  onClose: () => void;
  onDonate: (program: ProgramItem) => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  onClose,
  onDonate,
}) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[#CCFBF1]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F0FAFA]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#008284] text-white text-[11px] font-extrabold rounded-full">
              {program.category}
            </span>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
              Status: {program.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-gray-700">
          {/* Main Photo with safe fallback */}
          <div className="relative rounded-2xl overflow-hidden h-60 sm:h-72 bg-gray-100">
            <img
              src={program.imageUrl}
              alt={program.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  program.category === 'Wakaf'
                    ? 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Program Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#647B7C] mb-1.5">
              {program.location && (
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-[#008284]" />
                  {program.location}
                </span>
              )}
              {program.deadline && (
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {program.deadline}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#071F20] tracking-tight">
              {program.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
              {program.description}
            </p>
          </div>

          {/* Metrics summary cards (Strictly using honest data) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#F0FAFA] rounded-2xl border border-[#CCFBF1]">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Target Dana</span>
              <p className="font-bold text-[#071F20] text-xs sm:text-sm mt-0.5">
                {program.targetAmountText || 'Target akan diperbarui'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Dana Terkumpul</span>
              <p className="font-bold text-[#008284] text-xs sm:text-sm mt-0.5">
                {program.collectedAmountText || 'Data donasi akan diperbarui'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Penerima Manfaat</span>
              <p className="font-bold text-[#071F20] text-xs sm:text-sm mt-0.5">
                {program.targetRecipients || 'Data akan diperbarui'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Jumlah Donatur</span>
              <p className="font-bold text-[#071F20] text-xs sm:text-sm mt-0.5">
                {program.donorsCountText || 'Data akan diperbarui'}
              </p>
            </div>
          </div>

          {/* Cerita Lengkap & Latar Belakang */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-[#071F20]">
              Cerita Lengkap & Latar Belakang Program
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {program.fullStory || program.description}
            </p>
            {program.background && (
              <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-[#008284] space-y-1">
                <span className="font-bold text-xs text-gray-900">Latar Belakang:</span>
                <p className="text-xs text-gray-600 leading-relaxed">{program.background}</p>
              </div>
            )}
            {program.objective && (
              <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-amber-400 space-y-1">
                <span className="font-bold text-xs text-gray-900">Tujuan Program:</span>
                <p className="text-xs text-gray-600 leading-relaxed">{program.objective}</p>
              </div>
            )}
          </div>

          {/* Update Terbaru */}
          <div className="bg-[#E6F7F7] border border-[#CCFBF1] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#006769]">
              <Clock className="w-3.5 h-3.5" />
              Update Terbaru Penyaluran / Pengerjaan
            </div>
            <p className="text-xs text-[#004D4F] leading-relaxed">
              {program.latestUpdateText || 'Akan diperbarui oleh admin secara berkala melalui dokumentasi lapangan.'}
            </p>
          </div>

          {/* Galeri Dokumentasi jika ada */}
          {program.gallery && program.gallery.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                Dokumentasi & Galeri Foto
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {program.gallery.map((img, idx) => (
                  <div key={idx} className="h-32 rounded-xl overflow-hidden bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onDonate(program);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs sm:text-sm font-extrabold shadow-sm flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-white" />
            DONASI SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
};
