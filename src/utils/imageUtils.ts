import React from 'react';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';

export function formatImageUrl(url?: string | null, fallback?: string): string {
  const fallbackUrl = fallback || DEFAULT_PRODUCT_IMAGE;
  if (!url || typeof url !== 'string') {
    return fallbackUrl;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallbackUrl;
  }

  // Google Drive & Docs URL transformation
  if (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com')
  ) {
    let fileId = '';

    // Match /file/d/{FILE_ID} or /d/{FILE_ID}
    const matchD = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
    // Match ?id={FILE_ID} or &id={FILE_ID}
    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (matchD && matchD[1]) {
      fileId = matchD[1];
    } else if (matchId && matchId[1]) {
      fileId = matchId[1];
    }

    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // If a raw Google Drive file ID was pasted (alphanumerics with - and _, typically 28-60 chars)
  if (/^[a-zA-Z0-9_-]{28,60}$/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${trimmed}`;
  }

  // Dropbox links
  if (trimmed.includes('dropbox.com')) {
    return trimmed
      .replace('dl=0', 'raw=1')
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  }

  return trimmed;
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_PRODUCT_IMAGE
) {
  const target = e.currentTarget;
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
