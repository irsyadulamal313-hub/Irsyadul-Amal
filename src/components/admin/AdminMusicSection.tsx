import React, { useState, useEffect } from 'react';
import {
  Music,
  CheckCircle2,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Check,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { extractYouTubeVideoId, getYouTubeThumbnail, isValidYouTubeUrl } from '../../lib/youtubeUtils';

export const AdminMusicSection: React.FC = () => {
  const { musicSettings, updateMusicSettings } = useCMS();

  const [isEnabled, setIsEnabled] = useState(musicSettings?.is_enabled ?? true);
  const [youtubeUrl, setYoutubeUrl] = useState(
    musicSettings?.youtube_url || 'https://www.youtube.com/watch?v=M5f9G6D99-A'
  );
  const [title, setTitle] = useState(
    musicSettings?.title || 'Instrumental Nasyid & Religi Penyejuk Hati'
  );
  const [volume, setVolume] = useState(musicSettings?.volume ?? 50);
  const [autoplay, setAutoplay] = useState(musicSettings?.autoplay ?? true);
  const [loop, setLoop] = useState(musicSettings?.loop ?? true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if musicSettings change externally
  useEffect(() => {
    if (musicSettings) {
      setIsEnabled(musicSettings.is_enabled ?? true);
      setYoutubeUrl(musicSettings.youtube_url || 'https://www.youtube.com/watch?v=M5f9G6D99-A');
      setTitle(musicSettings.title || 'Instrumental Nasyid & Religi Penyejuk Hati');
      setVolume(musicSettings.volume ?? 50);
      setAutoplay(musicSettings.autoplay ?? true);
      setLoop(musicSettings.loop ?? true);
    }
  }, [musicSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      alert('URL YouTube wajib diisi.');
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      alert('Format URL YouTube tidak valid.');
      return;
    }

    setIsSaving(true);
    try {
      updateMusicSettings({
        is_enabled: isEnabled,
        youtube_url: youtubeUrl.trim(),
        title: title.trim() || 'Musik Latar Belakang',
        volume: Number(volume),
        autoplay,
        loop,
      });

      setToastMessage('Pengaturan background music berhasil disimpan dan disinkronkan!');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan pengaturan audio musik ke bawaan resmi Irsyadul Amal?')) {
      setIsEnabled(true);
      setYoutubeUrl('https://www.youtube.com/watch?v=M5f9G6D99-A');
      setTitle('Instrumental Nasyid & Religi Penyejuk Hati');
      setVolume(50);
      setAutoplay(true);
      setLoop(true);
    }
  };

  const videoId = extractYouTubeVideoId(youtubeUrl);
  const isUrlValid = isValidYouTubeUrl(youtubeUrl);
  const thumbnail = videoId ? getYouTubeThumbnail(videoId, 'hq') : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#008284]">
            <Music className="w-4 h-4" />
            <span>PENGATURAN AUDIO</span>
          </div>
          <h1 className="text-xl font-bold text-[#071F20] mt-1">
            Background Music Website
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Atur musik latar belakang bernuansa islami/religi yang diputar otomatis untuk pengunjung website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Default
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Form Settings */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Enable / Disable Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <span>Aktifkan Background Music</span>
                {isEnabled && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    AKTIF
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500">
                Tampilkan tombol floating music player di pojok kanan bawah dan putar musik latar.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008284]" />
            </label>
          </div>
        </div>

        {/* Audio Source Configuration */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            Sumber & Identitas Audio (YouTube)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              {/* Judul Musik */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-gray-700 block">
                  Judul Musik Latar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Instrumental Nasyid & Religi Penyejuk Hati"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs font-medium"
                />
                <p className="text-[11px] text-gray-400">
                  Judul ini akan ditampilkan di tooltip dan panel pemutar musik.
                </p>
              </div>

              {/* URL YouTube */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-gray-700 block">
                  URL Video YouTube <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs font-mono"
                />
                <p className="text-[11px] text-gray-400">
                  Audio diekstrak secara otomatis dari streaming resmi YouTube Player API.
                </p>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col justify-between space-y-3">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#008284]" />
                Pratinjau Sumber Audio
              </span>

              {isUrlValid && videoId && thumbnail ? (
                <div className="space-y-2.5">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-300">
                    <img
                      src={thumbnail}
                      alt="Thumbnail Musik"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                        <Music className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Video Terverifikasi
                    </span>
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#008284] hover:underline flex items-center gap-0.5"
                    >
                      Buka YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center space-y-1">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <p>Masukkan URL YouTube yang valid untuk melihat pratinjau.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls & Volume */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E0EAEA] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">
            Perilaku & Volume Pemutaran
          </h3>

          <div className="space-y-4">
            {/* Volume Slider */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#008284]" />
                  <span>Default Volume ({volume}%)</span>
                </label>
                <span className="font-mono text-gray-500 text-xs">{volume} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#008284]"
              />
              <p className="text-[11px] text-gray-400">
                Tingkat kekerasan suara bawaan saat pengunjung pertama kali membuka website (rekomendasi: 30-50%).
              </p>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#008284] rounded-sm focus:ring-[#008284]"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-800 block">Autoplay Otomatis</span>
                  <span className="text-[11px] text-gray-500">
                    Mulai putar secara otomatis saat halaman pertama kali dibuka (mematuhi gesture policy browser).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#008284] rounded-sm focus:ring-[#008284]"
                />
                <div className="text-xs">
                  <span className="font-bold text-gray-800 block">Ulangi Terus (Loop)</span>
                  <span className="text-[11px] text-gray-500">
                    Ulangi pemutaran musik dari awal secara berkesinambungan saat durasi video berakhir.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving || !isUrlValid}
            className="px-6 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Musik'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
