import React, { useState } from 'react';
import {
  Film,
  Plus,
  Edit3,
  Trash2,
  Play,
  CheckCircle2,
  ExternalLink,
  Eye,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { useCMS } from '../../data/cmsContext';
import { VideoItem } from '../../types';
import { extractYouTubeVideoId, getYouTubeThumbnail, isValidYouTubeUrl } from '../../lib/youtubeUtils';
import { VideoPlayerModal } from '../VideoPlayerModal';

export const AdminVideosSection: React.FC = () => {
  const { videos, addVideo, updateVideo, deleteVideo, toggleVideoActive } = useCMS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAdd = () => {
    setEditingVideo(null);
    setTitle('');
    setYoutubeUrl('');
    setDescription('');
    setSortOrder((videos.length || 0) + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setTitle(video.title);
    setYoutubeUrl(video.youtube_url);
    setDescription(video.description || '');
    setSortOrder(video.sort_order ?? 1);
    setIsActive(video.is_active !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) {
      alert('Judul dan URL YouTube wajib diisi.');
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      alert('Format URL YouTube tidak valid. Harap masukkan URL video YouTube yang benar.');
      return;
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    const thumbnail = videoId ? getYouTubeThumbnail(videoId, 'hq') : undefined;

    const payload: VideoItem = {
      id: editingVideo ? editingVideo.id : `vid-${Date.now()}`,
      title: title.trim(),
      youtube_url: youtubeUrl.trim(),
      description: description.trim(),
      thumbnail_url: thumbnail,
      sort_order: Number(sortOrder) || 1,
      is_active: isActive,
    };

    if (editingVideo) {
      updateVideo(payload);
      showToast('Video berhasil diperbarui!');
    } else {
      addVideo(payload);
      showToast('Video baru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, videoTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus video "${videoTitle}"?`)) {
      deleteVideo(id);
      showToast('Video berhasil dihapus.');
    }
  };

  // Preview helper in form
  const inputVideoId = extractYouTubeVideoId(youtubeUrl);
  const isInputValid = isValidYouTubeUrl(youtubeUrl);

  const sortedVideos = [...videos].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0EAEA] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#008284]">
            <Film className="w-4 h-4" />
            <span>KONTEN VIDEO</span>
          </div>
          <h1 className="text-xl font-bold text-[#071F20] mt-1">
            Kelola Video Kegiatan & Profil
          </h1>
          <p className="text-xs text-[#647B7C] mt-0.5">
            Kelola video YouTube yang ditampilkan pada halaman Beranda website Irsyadul Amal.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Video
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Videos List */}
      {sortedVideos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0EAEA] p-10 text-center space-y-3">
          <Film className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">Belum Ada Video</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Tambahkan video YouTube profil atau program kemanusiaan untuk ditampilkan di halaman depan.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-[#008284] text-white text-xs font-bold hover:bg-[#006769] cursor-pointer"
          >
            Tambah Video Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedVideos.map((video) => {
            const vidId = extractYouTubeVideoId(video.youtube_url);
            const thumb = video.thumbnail_url || (vidId ? getYouTubeThumbnail(vidId, 'hq') : '');

            return (
              <div
                key={video.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  video.is_active !== false ? 'border-[#E0EAEA] shadow-2xs' : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden group">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Film className="w-8 h-8" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(video)}
                    className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Putar video"
                  >
                    <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current translate-x-0.5" />
                    </div>
                  </button>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        video.is_active !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {video.is_active !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white">
                      Urutan: {video.sort_order ?? 1}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-2 flex-1">
                  <h3 className="font-bold text-sm text-[#071F20] line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-[#647B7C] line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 font-mono truncate">
                    {video.youtube_url}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleVideoActive(video.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      video.is_active !== false
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {video.is_active !== false ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(video)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-[#008284] hover:bg-white transition-colors cursor-pointer"
                      title="Pratinjau Video"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(video)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-[#008284] hover:bg-white transition-colors cursor-pointer"
                      title="Edit Video"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(video.id, video.title)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                      title="Hapus Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-[#008284] flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-gray-900">
                  {editingVideo ? 'Edit Video' : 'Tambah Video Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Judul Video */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">
                  Judul Video <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Profil Yayasan IRSYADUL AMAL"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs"
                />
              </div>

              {/* YouTube URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">
                  URL Video YouTube <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs font-mono"
                />
                <p className="text-[11px] text-gray-400">
                  Mendukung format https://www.youtube.com/watch?v=... atau https://youtu.be/...
                </p>

                {/* Real-time preview */}
                {youtubeUrl && (
                  <div className="pt-2">
                    {isInputValid && inputVideoId ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <img
                          src={getYouTubeThumbnail(inputVideoId, 'default')}
                          alt="Thumbnail Preview"
                          className="w-16 h-12 object-cover rounded-lg shrink-0 border border-emerald-300"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>URL YouTube Valid</span>
                          </div>
                          <p className="text-[11px] text-emerald-700 font-mono truncate">
                            Video ID: {inputVideoId}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Format URL belum terdeteksi sebagai tautan YouTube yang valid.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat mengenai program atau konten video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#008284]/20 focus:border-[#008284] text-xs"
                />
              </div>

              {/* Urutan & Status */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Urutan Tampilan</label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block">Status Publikasi</label>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#008284] rounded-sm focus:ring-[#008284]"
                    />
                    <span className="text-xs font-semibold text-gray-700">Tampilkan di Beranda</span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isInputValid}
                  className="px-5 py-2 rounded-xl bg-[#008284] hover:bg-[#006769] text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {editingVideo ? 'Simpan Perubahan' : 'Tambahkan Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal Preview */}
      <VideoPlayerModal
        video={previewVideo}
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
    </div>
  );
};
