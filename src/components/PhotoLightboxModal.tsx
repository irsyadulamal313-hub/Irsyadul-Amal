import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Calendar, Tag, MapPin } from 'lucide-react';
import { DocumentationItem } from '../types';

interface PhotoLightboxModalProps {
  items: DocumentationItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const modalContent = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Container */}
      <div
        className="relative z-10 w-full max-w-5xl max-h-[95vh] flex flex-col bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-gray-800/80 bg-gray-950/80">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-semibold text-white">
              {currentIndex + 1} / {items.length}
            </span>
            <span>•</span>
            <span className="truncate max-w-[200px] sm:max-w-md text-gray-300">
              {currentItem.title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Tutup preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Image Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[440px] max-h-[60vh] sm:max-h-[68vh] bg-black flex items-center justify-center overflow-hidden select-none">
          <img
            src={currentItem.image_url}
            alt={currentItem.title}
            className="max-h-full max-w-full object-contain mx-auto"
            loading="eager"
          />

          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : items.length - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/10 backdrop-blur-sm shadow-md transition-all hover:scale-105 cursor-pointer"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate(currentIndex < items.length - 1 ? currentIndex + 1 : 0)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/10 backdrop-blur-sm shadow-md transition-all hover:scale-105 cursor-pointer"
                aria-label="Foto selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Details */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 bg-gray-950 border-t border-gray-800/80 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {currentItem.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                {currentItem.date}
              </span>
            )}
            {currentItem.category && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-900/40 border border-teal-700/40 text-teal-300 font-medium text-[11px]">
                <Tag className="w-3 h-3" />
                {currentItem.category}
              </span>
            )}
            {currentItem.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {currentItem.location}
              </span>
            )}
          </div>

          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {currentItem.title}
          </h4>

          {currentItem.description && (
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
              {currentItem.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
