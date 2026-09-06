import React, { useState, useMemo } from 'react';
import { ProgramItem, ProgramCategory, ProgramStatus } from '../types';
import { Heart, Search, Layers, Clock, CheckCircle2, Image as ImageIcon } from 'lucide-react';

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
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getStatusBadge = (status: ProgramStatus) => {
    switch (status) {
      case 'BERJALAN':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            BERJALAN
          </span>
        );
      case 'SEGERA DIMULAI':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Clock className="w-2.5 h-2.5" />
            SEGERA DIMULAI
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" />
            SELESAI
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans pb-10">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-2 pt-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#008284] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Ikhtiar Kebaikan
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#071F20] tracking-tight">
          Program Kebaikan Irsyadul Amal
        </h1>
        <p className="text-xs sm:text-sm text-[#647B7C] leading-relaxed max-w-lg mx-auto font-normal">
          Lihat berbagai ikhtiar dakwah sosial, pendidikan, dan wakaf yang sedang kami jalankan untuk menghadirkan manfaat nyata.
        </p>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E0EAEA] shadow-2xs space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama atau tujuan program kebaikan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#008284] focus:bg-white transition-colors font-normal"
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#008284] text-white shadow-xs font-semibold'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs text-gray-500">
          <span className="font-medium">Filter Status:</span>
          <div className="flex items-center gap-1">
            {['SEMUA', 'BERJALAN', 'SEGERA DIMULAI', 'SELESAI'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-[#006769] text-white font-semibold'
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
        <div className="flex items-center justify-between text-xs text-gray-500 font-normal">
          <span>Menampilkan {filteredPrograms.length} program kebaikan</span>
          {selectedCategory !== 'Semua' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('Semua')}
              className="text-[#008284] font-medium hover:underline cursor-pointer"
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
                className="bg-white rounded-2xl border border-[#E0EAEA] overflow-hidden shadow-2xs hover:shadow-sm hover:border-[#008284]/40 transition-all flex flex-col justify-between"
              >
                {/* Image with reliable fallback */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {imgErrors[item.id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center">
                      <ImageIcon className="w-8 h-8 mb-1 text-gray-300" />
                      <span className="text-[11px] font-medium">{item.title}</span>
                    </div>
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-[#008284] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-sm text-[#071F20] leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Target & Dana terkumpul */}
                  <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Target Dana</span>
                      <span className="font-medium text-gray-700">
                        {item.targetAmountText || 'Data akan diperbarui'}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Dana Terkumpul</span>
                      <span className="font-semibold text-[#008284]">
                        {item.collectedAmountText || 'Data akan diperbarui'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectProgramDetail(item)}
                        className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium text-center transition-colors cursor-pointer"
                      >
                        Detail Lengkap
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenQuickDonation(item)}
                        className="flex-1 py-2 px-3 bg-[#008284] hover:bg-[#006769] text-white rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 space-y-2">
            <Layers className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">
              {programs.length === 0
                ? 'Belum ada program yang dipublikasikan.'
                : 'Tidak ada program yang sesuai dengan filter.'}
            </p>
            <p className="text-xs text-gray-500 font-normal">
              {programs.length === 0
                ? 'Program resmi akan ditampilkan segera setelah dipublikasikan oleh pengelola.'
                : 'Coba ubah filter kategori atau kata kunci pencarian.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
