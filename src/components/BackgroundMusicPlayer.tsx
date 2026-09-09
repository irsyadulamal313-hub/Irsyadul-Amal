import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import { useCMS } from '../data/cmsContext';
import { extractYouTubeVideoId } from '../lib/youtubeUtils';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const BackgroundMusicPlayer: React.FC = () => {
  const { musicSettings } = useCMS();

  // If disabled in settings, do not render
  const isEnabled = musicSettings?.is_enabled ?? true;
  const youtubeUrl = musicSettings?.youtube_url || 'https://www.youtube.com/watch?v=M5f9G6D99-A';
  const musicTitle = musicSettings?.title || 'Instrumental Nasyid & Religi Penyejuk Hati';
  const defaultVolume = musicSettings?.volume ?? 50;
  const shouldAutoplay = musicSettings?.autoplay ?? true;
  const shouldLoop = musicSettings?.loop ?? true;

  const videoId = extractYouTubeVideoId(youtubeUrl) || 'M5f9G6D99-A';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  const playerRef = useRef<any>(null);
  const containerId = useRef(`yt-audio-player-${Math.random().toString(36).substring(2, 9)}`);

  // Load YouTube Iframe API
  useEffect(() => {
    if (!isEnabled || !videoId) return;

    const loadYTAPI = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }

      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        initPlayer();
      };
    };

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(containerId.current, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: shouldAutoplay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            loop: shouldLoop ? 1 : 0,
            playlist: shouldLoop ? videoId : undefined,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              setIsPlayerReady(true);
              event.target.setVolume(defaultVolume);

              if (shouldAutoplay) {
                // Try autoplay
                const playPromise = event.target.playVideo();
                if (playPromise !== undefined) {
                  // In modern browsers, playVideo might be blocked
                  setTimeout(() => {
                    const state = event.target.getPlayerState();
                    if (state !== 1) {
                      // 1 = playing
                      setNeedsGesture(true);
                      setIsPlaying(false);
                    } else {
                      setIsPlaying(true);
                      setNeedsGesture(false);
                    }
                  }, 800);
                }
              }
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                // Playing
                setIsPlaying(true);
                setNeedsGesture(false);
              } else if (event.data === 2) {
                // Paused
                setIsPlaying(false);
              } else if (event.data === 0) {
                // Ended -> replay if loop is active
                if (shouldLoop) {
                  event.target.playVideo();
                } else {
                  setIsPlaying(false);
                }
              }
            },
            onError: () => {
              console.warn('[BackgroundMusic] Error playing YouTube audio.');
            },
          },
        });
      } catch (err) {
        console.warn('[BackgroundMusic] Failed to initialize YouTube player:', err);
      }
    };

    loadYTAPI();

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isEnabled, videoId, shouldAutoplay, shouldLoop, defaultVolume]);

  // First user interaction on page to kickstart autoplay if browser blocked it
  useEffect(() => {
    if (!needsGesture || !shouldAutoplay) return;

    const handleFirstUserInteraction = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
        setNeedsGesture(false);
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [needsGesture, shouldAutoplay]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      setNeedsGesture(false);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (playerRef.current) {
      playerRef.current.setVolume(newVol);
      if (newVol === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Hidden YouTube IFrame container */}
      <div className="fixed -top-96 -left-96 w-1 h-1 overflow-hidden pointer-events-none opacity-0" aria-hidden="true">
        <div id={containerId.current} />
      </div>

      {/* Floating Audio Controller */}
      <div className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-40 flex flex-col items-end">
        {/* Expanded Controller Panel */}
        {isExpanded && (
          <div className="mb-2 w-72 bg-gray-900/95 backdrop-blur-md border border-gray-800 text-white rounded-2xl p-3.5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-800 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <Music className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs font-semibold text-gray-200 truncate">
                  {musicTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Tutup panel musik"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Controls */}
            <div className="mt-3 flex items-center justify-between gap-3">
              {/* Play / Pause button */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#008284] hover:bg-[#006e70] text-white flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Volume Slider & Mute */}
              <div className="flex-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-gray-300 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                  aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-teal-400" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#008284]"
                  aria-label="Pengatur Volume"
                />
                <span className="text-[10px] text-gray-400 w-6 text-right font-mono">
                  {isMuted ? '0%' : `${volume}%`}
                </span>
              </div>
            </div>

            {/* Play prompt if blocked by browser policy */}
            {needsGesture && !isPlaying && (
              <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/50 border border-amber-800/60 rounded-lg px-2 py-1 text-center font-medium">
                Klik play untuk mendengarkan audio latar belakang.
              </div>
            )}
          </div>
        )}

        {/* Floating Trigger Button */}
        <div className="relative group">
          {/* Audio hint tooltip if not expanded */}
          {!isExpanded && (
            <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 bg-gray-900/90 text-white text-[11px] font-medium rounded-lg shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {isPlaying ? `Memutar: ${musicTitle}` : 'Musik Latar Belakang'}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {/* Main Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (!isExpanded) {
                  // If autoplay blocked, clicking also starts playback
                  if (!isPlaying && isPlayerReady) {
                    togglePlay();
                  }
                  setIsExpanded(true);
                } else {
                  togglePlay();
                }
              }}
              className={`h-11 px-3 sm:px-3.5 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300 cursor-pointer ${
                isPlaying
                  ? 'bg-gray-900 border border-teal-500/50 text-white hover:border-teal-400'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              aria-label="Kontrol musik latar belakang"
            >
              {/* Equalizer Wave / Icon */}
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-4 w-4">
                  <span className="w-1 bg-teal-400 rounded-full animate-pulse h-3" />
                  <span className="w-1 bg-teal-400 rounded-full animate-pulse delay-75 h-4" />
                  <span className="w-1 bg-teal-400 rounded-full animate-pulse delay-150 h-2" />
                </div>
              ) : (
                <Music className={`w-4 h-4 ${needsGesture ? 'text-amber-500 animate-bounce' : 'text-[#008284]'}`} />
              )}

              <span className="text-xs font-semibold tracking-tight hidden xs:inline">
                {isPlaying ? 'Musik Aktif' : 'Musik'}
              </span>

              {/* Arrow expand toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded((prev) => !prev);
                }}
                className="p-0.5 text-gray-400 hover:text-white rounded-md transition-colors"
                aria-label={isExpanded ? 'Sembunyikan' : 'Buka kontrol'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
