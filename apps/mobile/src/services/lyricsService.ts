import { LyricLine, TrackMetadata } from "@sony/types";

/**
 * Built-in curated synchronized lyrics database for instant offline/zero-latency playback
 */
export const CURATED_SYNCED_LYRICS: Record<string, LyricLine[]> = {
  default: [
    { timeMs: 0, text: "♪ [Ambient Synthesizer Soundscape] ♪" },
    { timeMs: 12000, text: "Night falls over the city skyline" },
    { timeMs: 24000, text: "Listening together across the wire" },
    { timeMs: 38000, text: "Every frequency in perfect harmony" },
    { timeMs: 52000, text: "Voices blending softly with the beat" },
    { timeMs: 70000, text: "No distance can keep us apart tonight" },
    { timeMs: 90000, text: "♪ [Deep Resonance & Bass Wave] ♪" },
    { timeMs: 110000, text: "Stay right here in the music" },
    { timeMs: 130000, text: "Echoes drifting into the horizon" },
    { timeMs: 160000, text: "♪ [Gentle Fade Out] ♪" },
  ],
  "track-ambient-01": [
    { timeMs: 0, text: "♪ [Deep Ambient Synth Waves] ♪" },
    { timeMs: 16000, text: "Drifting through midnight electric blue" },
    { timeMs: 32000, text: "Sound floating freely through the room" },
    { timeMs: 48000, text: "Feel the calm in every resonance" },
    { timeMs: 68000, text: "♪ [Melodic Chime & Pulse] ♪" },
    { timeMs: 88000, text: "Lost in the rhythm of the night" },
    { timeMs: 112000, text: "Connected in the soundscape together" },
    { timeMs: 140000, text: "♪ [Harmonic Resonance Outro] ♪" },
  ],
  "track-lofi-02": [
    { timeMs: 0, text: "♪ [Tokyo Rain & Vinyl Crackle Intro] ♪" },
    { timeMs: 14000, text: "Walking Shibuya under neon signs" },
    { timeMs: 28000, text: "Rain drops falling softly in line" },
    { timeMs: 45000, text: "Coffee in hand, watch the city glow" },
    { timeMs: 62000, text: "Warm tape warmth moving steady and slow" },
    { timeMs: 82000, text: "♪ [Lo-Fi Electric Piano Solo] ♪" },
    { timeMs: 104000, text: "Tomorrow can wait a little while" },
    { timeMs: 126000, text: "Lost in the quiet Tokyo style" },
    { timeMs: 155000, text: "♪ [Gentle Rain & Fade] ♪" },
  ],
  "blinding-lights": [
    { timeMs: 0, text: "♪ [80s Synth Intro & Driving Arpeggio] ♪" },
    { timeMs: 13130, text: "Yeah" },
    { timeMs: 16560, text: "♪ [Driving Bass Synth] ♪" },
    { timeMs: 27160, text: "I've been tryna call" },
    { timeMs: 29960, text: "I've been on my own for long enough" },
    { timeMs: 32710, text: "Maybe you can show me how to love, maybe" },
    { timeMs: 38290, text: "I'm goin' through withdrawals" },
    { timeMs: 41230, text: "You don't even have to do too much" },
    { timeMs: 44120, text: "You can turn me on with just a touch, baby" },
    { timeMs: 49570, text: "I look around and" },
    { timeMs: 50620, text: "Sin City's cold and empty (oh)" },
    { timeMs: 53530, text: "No one's around to judge me (oh)" },
    { timeMs: 56240, text: "I can't see clearly when you're gone" },
    { timeMs: 60730, text: "I said, ooh, I'm blinded by the lights", isChorus: true },
    { timeMs: 66690, text: "No, I can't sleep until I feel your touch", isChorus: true },
    { timeMs: 71790, text: "I said, ooh, I'm drowning in the night", isChorus: true },
    { timeMs: 77890, text: "Oh, when I'm like this, you're the one I trust", isChorus: true },
    { timeMs: 82160, text: "♪ [Euphoric Synth Hook] ♪" },
    { timeMs: 94360, text: "I'm running out of time" },
    { timeMs: 97030, text: "'Cause I can see the sun light up the sky" },
    { timeMs: 100040, text: "So I hit the road in overdrive, baby, oh" },
    { timeMs: 106640, text: "The city's cold and empty (oh)" },
    { timeMs: 109520, text: "No one's around to judge me (oh)" },
    { timeMs: 112470, text: "I can't see clearly when you're gone" },
    { timeMs: 116980, text: "I said, ooh, I'm blinded by the lights", isChorus: true },
    { timeMs: 122700, text: "No, I can't sleep until I feel your touch", isChorus: true },
    { timeMs: 127940, text: "I said, ooh, I'm drowning in the night", isChorus: true },
    { timeMs: 134000, text: "Oh, when I'm like this, you're the one I trust", isChorus: true },
    { timeMs: 139170, text: "I'm just walking by to let you know" },
    { timeMs: 142160, text: "I could never say it on the phone" },
    { timeMs: 145370, text: "Will never let you go this time" },
    { timeMs: 150270, text: "I said, ooh, I'm blinded by the lights", isChorus: true },
    { timeMs: 156330, text: "No, I can't sleep until I feel your touch", isChorus: true },
    { timeMs: 160500, text: "♪ [Synth Breakdown] ♪" },
    { timeMs: 183900, text: "I said, ooh, I'm blinded by the lights", isChorus: true },
    { timeMs: 190120, text: "No, I can't sleep until I feel your touch", isChorus: true },
  ],
  "shape-of-you": [
    { timeMs: 0, text: "♪ [Marimba & Acoustic Rhythm Intro] ♪" },
    { timeMs: 9550, text: "The club isn't the best place to find a lover" },
    { timeMs: 11880, text: "So the bar is where I go" },
    { timeMs: 14240, text: "Me and my friends at the table doing shots" },
    { timeMs: 16670, text: "Drinking fast, and then we talk slow" },
    { timeMs: 19130, text: "Come over and start up a conversation with just me" },
    { timeMs: 22000, text: "And trust me, I'll give it a chance now" },
    { timeMs: 24150, text: "Take my hand, stop, put Van the Man on the jukebox" },
    { timeMs: 26860, text: "And then we start to dance, and now I'm singing like" },
    { timeMs: 29500, text: "Girl, you know I want your love", isChorus: true },
    { timeMs: 31650, text: "Your love was handmade for somebody like me", isChorus: true },
    { timeMs: 34800, text: "Come on now, follow my lead", isChorus: true },
    { timeMs: 36700, text: "I may be crazy, don't mind me", isChorus: true },
    { timeMs: 38900, text: "Say, boy, let's not talk too much", isChorus: true },
    { timeMs: 41600, text: "Grab on my waist and put that body on me", isChorus: true },
    { timeMs: 44600, text: "Come on now, follow my lead", isChorus: true },
    { timeMs: 49460, text: "I'm in love with the shape of you", isChorus: true },
    { timeMs: 52020, text: "We push and pull like a magnet do", isChorus: true },
    { timeMs: 54680, text: "Although my heart is falling too", isChorus: true },
    { timeMs: 57120, text: "I'm in love with your body", isChorus: true },
    { timeMs: 59600, text: "Last night you were in my room" },
    { timeMs: 62140, text: "And now my bed sheets smell like you" },
    { timeMs: 64500, text: "Every day discovering something brand new" },
    { timeMs: 67360, text: "I'm in love with your body", isChorus: true },
  ],
  levitating: [
    { timeMs: 0, text: "♪ [Cosmic Disco Groove Intro] ♪" },
    { timeMs: 10400, text: "If you wanna run away with me, I know a galaxy" },
    { timeMs: 14500, text: "And I can take you for a ride" },
    { timeMs: 18200, text: "I had a premonition that we fell into a rhythm" },
    { timeMs: 22600, text: "Where the music don't stop for life" },
    { timeMs: 26300, text: "Glitter in the sky, glitter in my eyes" },
    { timeMs: 30200, text: "Shining just the way I like" },
    { timeMs: 34400, text: "If you're feeling like you need a little bit of company" },
    { timeMs: 38500, text: "You met me at the perfect time" },
    { timeMs: 42100, text: "You want me, I want you, baby", isChorus: true },
    { timeMs: 46200, text: "My sugarboo, I'm levitating", isChorus: true },
    { timeMs: 50400, text: "The Milky Way, we're renegading", isChorus: true },
    { timeMs: 54200, text: "Yeah, yeah, yeah, yeah, yeah", isChorus: true },
    { timeMs: 58500, text: "I got you, moonlight, you're my starlight", isChorus: true },
    { timeMs: 63100, text: "I need you all night, come on, dance with me", isChorus: true },
    { timeMs: 68400, text: "I'm levitating", isChorus: true },
  ],
};

// In-memory cache for fast lookup across room navigation
const lyricsCache = new Map<string, LyricLine[]>();

/**
 * Strips YouTube and audio metadata artifacts from titles
 */
export function cleanTrackTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?Video|Official\s*Audio|Lyric\s*Video|Full\s*Audio|Audio|HD|4K|Remastered|Visualizer|Lyrics|HQ|Explicit)[\)\]]/gi, "")
    .replace(/\s*[\(\[]\s*feat\.?.*[\)\]]/gi, "")
    .replace(/\s*[\(\[]\s*ft\.?.*[\)\]]/gi, "")
    .replace(/\s*-\s*Official.*$/gi, "")
    .trim();
}

/**
 * Parses standard LRC format strings ([mm:ss.xx] or [mm:ss.xxx]) into LyricLine[]
 */
export function parseLrcString(lrcContent: string): LyricLine[] {
  if (!lrcContent) return [];
  const lines: LyricLine[] = [];
  const lrcRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)/;

  const rawLines = lrcContent.split("\n");
  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const match = trimmed.match(lrcRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let ms = 0;
      if (match[3]) {
        if (match[3].length === 1) ms = parseInt(match[3], 10) * 100;
        else if (match[3].length === 2) ms = parseInt(match[3], 10) * 10;
        else ms = parseInt(match[3], 10);
      }
      const timeMs = minutes * 60000 + seconds * 1000 + ms;
      const text = match[4].trim();

      if (text && text !== "♪") {
        const isChorus = /chorus|refrain|hook/i.test(text);
        lines.push({
          timeMs,
          text: text.replace(/^"|"$/g, ""),
          isChorus,
        });
      } else if (text === "♪") {
        lines.push({ timeMs, text: "♪ [Instrumental Beat] ♪" });
      }
    }
  }

  return lines.sort((a, b) => a.timeMs - b.timeMs);
}

/**
 * Distributes plain lyrics evenly across song duration if only plain text is available
 */
export function distributePlainLyrics(plainLyrics: string, durationMs: number = 200000): LyricLine[] {
  const rawLines = plainLyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) return [];

  // Start after intro (usually 8-12 seconds) and finish before final outro
  const introMs = Math.min(10000, durationMs * 0.06);
  const vocalDuration = Math.max(20000, durationMs - introMs - 15000);
  const intervalMs = vocalDuration / Math.max(1, rawLines.length);

  const lines: LyricLine[] = [
    { timeMs: 0, text: "♪ [Intro] ♪" }
  ];

  rawLines.forEach((text, index) => {
    lines.push({
      timeMs: Math.round(introMs + index * intervalMs),
      text,
    });
  });

  return lines;
}

/**
 * Main service to fetch and synchronize lyrics for any track
 */
export async function getSynchronizedLyrics(track: Partial<TrackMetadata> | null): Promise<LyricLine[]> {
  if (!track || (!track.title && !track.id)) {
    return CURATED_SYNCED_LYRICS.default;
  }

  const cleanTitle = cleanTrackTitle(track.title || "");
  const cleanArtist = (track.artist || "").replace(/feat\.?.*$/i, "").trim();
  const cacheKey = `${cleanArtist.toLowerCase()}---${cleanTitle.toLowerCase()}`;

  // 1. Check in-memory session cache
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  // 2. Check built-in curated collection for instant match
  const normalizedTitle = cleanTitle.toLowerCase();
  if (normalizedTitle.includes("blinding lights")) {
    lyricsCache.set(cacheKey, CURATED_SYNCED_LYRICS["blinding-lights"]);
    return CURATED_SYNCED_LYRICS["blinding-lights"];
  }
  if (normalizedTitle.includes("shape of you")) {
    lyricsCache.set(cacheKey, CURATED_SYNCED_LYRICS["shape-of-you"]);
    return CURATED_SYNCED_LYRICS["shape-of-you"];
  }
  if (normalizedTitle.includes("levitating")) {
    lyricsCache.set(cacheKey, CURATED_SYNCED_LYRICS["levitating"]);
    return CURATED_SYNCED_LYRICS["levitating"];
  }
  if (track.id && CURATED_SYNCED_LYRICS[track.id]) {
    lyricsCache.set(cacheKey, CURATED_SYNCED_LYRICS[track.id]);
    return CURATED_SYNCED_LYRICS[track.id];
  }

  // 3. Fetch from LRCLIB (open-source synced lyrics API)
  if (cleanTitle) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const params = new URLSearchParams();
      if (cleanArtist) params.append("artist_name", cleanArtist);
      params.append("track_name", cleanTitle);
      if (track.durationMs && track.durationMs > 0) {
        params.append("duration", Math.round(track.durationMs / 1000).toString());
      }

      // Try exact get first
      const getRes = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
        signal: controller.signal,
        headers: { "User-Agent": "Sony-Music-Platform/1.0" },
      });

      clearTimeout(timeoutId);

      if (getRes.ok) {
        const data = await getRes.json();
        if (data && data.syncedLyrics) {
          const parsed = parseLrcString(data.syncedLyrics);
          if (parsed.length > 0) {
            lyricsCache.set(cacheKey, parsed);
            return parsed;
          }
        }
        if (data && data.plainLyrics) {
          const distributed = distributePlainLyrics(data.plainLyrics, track.durationMs || 200000);
          if (distributed.length > 0) {
            lyricsCache.set(cacheKey, distributed);
            return distributed;
          }
        }
      }

      // Fallback to search if exact get had no match
      const searchRes = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanArtist} ${cleanTitle}`.trim())}`,
        { headers: { "User-Agent": "Sony-Music-Platform/1.0" } }
      );

      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          const matched = results.find((r: any) => r.syncedLyrics) || results[0];
          if (matched && matched.syncedLyrics) {
            const parsed = parseLrcString(matched.syncedLyrics);
            if (parsed.length > 0) {
              lyricsCache.set(cacheKey, parsed);
              return parsed;
            }
          }
        }
      }
    } catch (err) {
      console.log("LyricsService: live fetch skipped, using fallback:", err);
    }
  }

  // 4. Fallback to default harmonious lyrics if nothing was matched
  const fallback = CURATED_SYNCED_LYRICS[track.id || ""] || CURATED_SYNCED_LYRICS.default;
  lyricsCache.set(cacheKey, fallback);
  return fallback;
}
