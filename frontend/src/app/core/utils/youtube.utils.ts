export function extraerIdYoutube(url: string): string {
  if (!url) return '';

  const normalize = (value: string) => {
    const cleaned = (value || '').trim().replace(/^\/+|\/+$/g, '');
    return /^[a-zA-Z0-9_-]{11}$/.test(cleaned) ? cleaned : '';
  };

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || '';

    if (parsed.hostname.includes('youtu.be')) {
      return normalize(pathname);
    }

    const vParam = parsed.searchParams.get('v');
    const normalizedParam = normalize(vParam || '');
    if (normalizedParam) return normalizedParam;

    const embedMatch = pathname.match(/\/embed\/([^/?]+)/);
    const normalizedEmbed = normalize(embedMatch?.[1] || '');
    if (normalizedEmbed) return normalizedEmbed;

    const shortsMatch = pathname.match(/\/shorts\/([^/?]+)/);
    const normalizedShorts = normalize(shortsMatch?.[1] || '');
    if (normalizedShorts) return normalizedShorts;
  } catch {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const fallback = normalize(match?.[2] || '');
    if (fallback) return fallback;
  }

  return '';
}
