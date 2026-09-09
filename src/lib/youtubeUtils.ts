/**
 * YouTube Utility Helpers for IRSYADUL AMAL
 * Robust parsing for various YouTube URL patterns:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex covering standard watch, embed, shorts, and youtu.be shortlinks
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}

export function isValidYouTubeUrl(url: string | null | undefined): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function getYouTubeThumbnail(
  urlOrId: string | null | undefined,
  quality: 'maxres' | 'hq' | 'mq' | 'default' = 'hq'
): string {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) {
    return '';
  }
  const filename = quality === 'maxres' ? 'maxresdefault.jpg' : `${quality}default.jpg`;
  return `https://img.youtube.com/vi/${videoId}/${filename}`;
}

export function getYouTubeEmbedUrl(
  urlOrId: string | null | undefined,
  options: {
    autoplay?: boolean;
    loop?: boolean;
    mute?: boolean;
    controls?: boolean;
  } = {}
): string {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) return '';

  const params = new URLSearchParams();
  if (options.autoplay) params.set('autoplay', '1');
  if (options.loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  if (options.mute) params.set('mute', '1');
  if (options.controls === false) params.set('controls', '0');
  params.set('rel', '0');
  params.set('modestbranding', '1');
  params.set('playsinline', '1');

  const query = params.toString();
  return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ''}`;
}
