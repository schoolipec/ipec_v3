export interface LiveVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

// Consulta YouTube Data API v3 para detectar si hay transmisión en vivo activa.
// Resultado cacheado 2 minutos para no agotar la cuota gratuita (10k unidades/día).
export async function getLiveVideo(): Promise<LiveVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    const videoId: string = item.id.videoId;
    const s = item.snippet;
    const thumbnail: string =
      s.thumbnails?.maxres?.url ??
      s.thumbnails?.high?.url ??
      s.thumbnails?.medium?.url ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    return { videoId, title: s.title as string, thumbnail };
  } catch {
    return null;
  }
}
