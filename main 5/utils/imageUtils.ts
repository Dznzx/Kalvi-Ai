
export const getOptimizedUrl = (url: string | undefined | null, width: number = 400, quality: number = 60): string => {
  if (!url) return '';

  // Handle Supabase Storage URLs
  // Pattern: url + '?width=400&resize=cover&quality=60'
  if (url.includes('supabase.co')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&resize=cover&quality=${quality}`;
  }

  // Handle Unsplash URLs (often used in About/Landing)
  if (url.includes('images.unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=${quality}&auto=format&fit=crop`;
  }

  // Return original for other sources (e.g. YouTube thumbnails or unknown CDNs)
  return url;
};
