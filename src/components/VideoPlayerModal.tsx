import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Play } from 'lucide-react';
import { VideoItem } from '../types';
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from '../lib/youtubeUtils';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const videoId = extractYouTubeVideoId(video.youtube_url);
  const embedUrl = videoId ? getYouTubeEmbedUrl(videoId, { autoplay: true }) : '';

  const modalContent = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 flex items-center justify-between border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {video.title}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                IRSYADUL AMAL • Video Dokumentasi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Embed Frame */}
        <div className="relative w-full aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-2">
              <p className="text-sm">Tautan video tidak valid atau tidak dapat dimuat.</p>
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-400 hover:underline inline-flex items-center gap-1"
              >
                Buka di YouTube langsung <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer info & link */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-gray-950/80 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <p className="text-gray-300 leading-relaxed max-w-2xl text-xs sm:text-sm">
            {video.description || 'Dokumentasi program dan kiprah sosial kemanusiaan Irsyadul Amal.'}
          </p>
          <a
            href={video.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <span>Buka di YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
