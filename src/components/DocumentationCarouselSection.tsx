import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Camera, Calendar, Tag, Eye } from 'lucide-react';
import { DocumentationItem } from '../types';

interface DocumentationCarouselSectionProps {
  items: DocumentationItem[];
  title?: string;
  subtitle?: string;
  onSelectPhoto: (index: number) => void;
  autoPlayInterval?: number; // ms, default 5000
}

export const DocumentationCarouselSection: React.FC<DocumentationCarouselSectionProps> = ({
  items,
  title = 'Dokumentasi Kegiatan & Penyaluran',
  subtitle = 'Bukti nyata amanah para donatur yang telah terdistribusi langsung kepada para penerima manfaat.',
  onSelectPhoto,
  autoPlayInterval = 5000,
}) => {
  const activeItems = items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive itemsPerPage calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(1);
      } else if (width < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, activeItems.length - itemsPerPage);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    if (isHovered || maxIndex <= 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isHovered, maxIndex, autoPlayInterval, handleNext]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (activeItems.length === 0) {
    return (
      <section className="space-y-6" aria-label="Section Dokumentasi">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-500 text-xs sm:text-sm">
          Belum ada dokumentasi foto yang dipublikasikan.
        </div>
      </section>
    );
  }

  return (
    <section
      key="documentation-carousel-section"
      className="space-y-6 sm:space-y-8"
      aria-label="Section Dokumentasi Kegiatan"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-[#008284]" />
            <span>Dokumentasi Program</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeItems.length <= itemsPerPage}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Dokumentasi sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={activeItems.length <= itemsPerPage}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Dokumentasi selanjutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel Track Container */}
      <div
        className="overflow-hidden relative rounded-3xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsPerPage}%)`,
          }}
        >
          {activeItems.map((item, index) => (
            <div
              key={item.id || index}
              className="px-2.5 shrink-0"
              style={{ width: `${100 / itemsPerPage}%` }}
            >
              <div
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                onClick={() => onSelectPhoto(index)}
              >
                {/* Photo container */}
                <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/90 text-gray-900 font-semibold text-xs flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5 text-[#008284]" />
                      Lihat Foto
                    </span>
                  </div>

                  {/* Category Tag */}
                  {item.category && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-teal-900/80 backdrop-blur-xs text-white font-medium text-[10px] tracking-wide uppercase flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    {item.date && (
                      <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#008284]" />
                        {item.date}
                      </p>
                    )}
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-[#008284] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators / Dots */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setCurrentIndex(dotIdx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === dotIdx ? 'w-6 bg-[#008284]' : 'w-2 bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`Ke slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
