import { Platform } from "react-native";
import { TrackMetadata } from "@sony/types";

// High quality reliable audio streams for preview playback
export const FALLBACK_AUDIO_STREAMS = [
  "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
  "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
];

class WebAudioService {
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private onTimeUpdateCallback: ((timeMs: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  private init() {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
      this.audio.crossOrigin = "anonymous";

      this.audio.addEventListener("timeupdate", () => {
        if (this.audio && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(Math.floor(this.audio.currentTime * 1000));
        }
      });

      this.audio.addEventListener("ended", () => {
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });
    }
  }

  public subscribe(
    onTimeUpdate: (timeMs: number) => void,
    onEnded: () => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public playTrack(track: TrackMetadata, startMs: number = 0) {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    this.init();
    if (!this.audio) return;

    // Use track's streamUrl or a consistent fallback stream
    const targetUrl =
      track.streamUrl ||
      FALLBACK_AUDIO_STREAMS[Math.abs(hashCode(track.id)) % FALLBACK_AUDIO_STREAMS.length];

    if (this.currentUrl !== targetUrl) {
      this.currentUrl = targetUrl;
      this.audio.src = targetUrl;
      if (startMs > 0) {
        this.audio.currentTime = startMs / 1000;
      }
    }

    this.audio.play().catch((err) => {
      console.warn("WebAudioService: playback waiting for user interaction:", err);
    });
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public resume() {
    if (this.audio && this.currentUrl) {
      this.audio.play().catch(() => {});
    }
  }

  public seek(targetMs: number) {
    if (this.audio) {
      this.audio.currentTime = targetMs / 1000;
    }
  }

  public setVolume(vol: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }

  public getDurationMs(): number {
    return this.audio && !isNaN(this.audio.duration)
      ? Math.floor(this.audio.duration * 1000)
      : 0;
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const webAudioService = new WebAudioService();
