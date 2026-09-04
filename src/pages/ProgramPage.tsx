import React, { useState, useMemo } from 'react';
import { ProgramItem, ProgramCategory, ProgramStatus } from '../types';
import { Heart, Search, Filter, Layers, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProgramPageProps {
  programs: ProgramItem[];
  onSelectProgramDetail: (program: ProgramItem) => void;
  onOpenQuickDonation: (program?: ProgramItem) => void;
}

export const ProgramPage: React.FC<ProgramPageProps> = ({
  programs,
  onSelectProgramDetail,
  onOpenQuickDonation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: ProgramCategory[] = [
    'Semua',
    'Pendidikan',
    'Sosial',
    'Wakaf',
    'Kemanusiaan',
    "Al-Qur'an",
  ];

  const filteredPrograms = useMemo(() => {
    return programs.filter((item) => {
      const matchCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      const matchStatus =
        selectedStatus === 'SEMUA' || item.status === selectedStatus;

      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchStatus && matchSearch;
    });
  }, [programs, selectedCategory, selectedStatus, searchQuery]);

  const getStatusBadge = (status: ProgramStatus) => {
    switch (status) {
      case 'BERJALAN':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            BERJALAN
          </span>
        );
      case 'SEGERA DIMULAI':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            <Clock className="w-2.5 h-2.5" />
            SEGERA DIMULAI
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" />
            SELESAI
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008284] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Ikhtiar Kebaikan
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#071F20] tracking-tight">
          Program Kebaikan Irsyadul Amal
        </h1>
        <p className="text-xs sm:text-sm text-[#647B7C] leading-relaxed max-w-lg mx-auto">
          Lihat berbagai program yang sedang kami jalankan dan ikut ambil bagian dalam menghadirkan manfaat.
        </p>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0EAEA] shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari program kebaikan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#008284] focus:bg-white transition-colors"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#008284] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs text-gray-500">
          <span className="font-semibold">Filter Status:</span>
          <div className="flex items-center gap-1">
            {['SEMUA', 'BERJALAN', 'SEGERA DIMULAI', 'SELESAI'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  selectedStatus === st
                    ? 'bg-[#006769] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Program Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Program yang tersedia akan ditampilkan di sini.</span>
          {selectedCategory !== 'Semua' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('Semua')}
              className="text-[#008284] font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        {filteredPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-xs hover:shadow-md hover:border-[#008284]/50 transition-all flex flex-col justify-between"
              >
                {/* Image with reliable fallback to prevent broken images */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        item.category === 'Wakaf'
                          ? 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=800&q=80'
                          : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-[#008284] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-[#071F20] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Target & Dana terkumpul */}
                  <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Target Dana</span>
                      <span className="font-semibold text-gray-700">
                        {item.targetAmountText || 'Target akan diperbarui'}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Dana Terkumpul</span>
                      <span className="font-semibold text-[#008284]">
                        {item.collectedAmountText || 'Data donasi akan diperbarui'}
                      </span>
                    </div>

                    {/* Progress Bar placeholder */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#008284] h-full w-2" />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectProgramDetail(item)}
                        className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold text-center transition-colors"
                      >
                        Detail Lengkap
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenQuickDonation(item)}
                        className="flex-1 py-2 px-3 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        Donasi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 space-y-2">
            <p className="text-sm font-bold text-gray-700">Tidak ada program yang sesuai</p>
            <p className="text-xs text-gray-500">Coba ubah filter kategori atau kata kunci pencarian.</p>
          </div>
        )}
      </section>
    </div>
  );
};
