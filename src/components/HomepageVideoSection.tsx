import React from 'react';
import { Play, Film, ExternalLink } from 'lucide-react';
import { VideoItem } from '../types';
import { getYouTubeThumbnail } from '../lib/youtubeUtils';

interface HomepageVideoSectionProps {
  videos: VideoItem[];
  title?: string;
  subtitle?: string;
  onSelectVideo: (video: VideoItem) => void;
}

export const HomepageVideoSection: React.FC<HomepageVideoSectionProps> = ({
  videos,
  title = 'Kenali Lebih Dekat IRSYADUL AMAL',
  subtitle = 'Profil lembaga dan dokumentasi program dalam bentuk video.',
  onSelectVideo,
}) => {
  const activeVideos = videos
    .filter((v) => v.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <section key="videos-section" className="space-y-6 sm:space-y-8" aria-label="Section Video">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider">
          <Film className="w-3.5 h-3.5 text-[#008284]" />
          <span>Video Kegiatan & Profil</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
          {subtitle}
        </p>
      </div>

      {/* Videos Grid */}
      {activeVideos.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-500 text-xs sm:text-sm">
          Belum ada video yang dipublikasikan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {activeVideos.map((video) => {
            const thumbnail =
              video.thumbnail_url ||
              getYouTubeThumbnail(video.youtube_url, 'hq') ||
              'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={video.id}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                onClick={() => onSelectVideo(video)}
              >
                {/* 16:9 Thumbnail Container */}
                <div className="relative aspect-video w-full bg-gray-900 overflow-hidden shrink-0">
                  <img
                    src={thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                      // Fallback to high quality or placeholder
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm text-white font-medium text-[10px] tracking-wide uppercase">
                      YouTube
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-[#008284] transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-normal">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-[#008284] group-hover:text-[#006769]">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Tonton Video
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#008284] transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
