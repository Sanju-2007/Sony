import { Platform } from "react-native";
import { TrackMetadata } from "@sony/types";

// High quality reliable audio streams for preview/fallback playback
export const FALLBACK_AUDIO_STREAMS = [
  "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
  "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

class WebAudioService {
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private currentVolume: number = 1.0;
  private onTimeUpdateCallback: ((timeMs: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  // YouTube IFrame Player integration
  private isYouTubeActive: boolean = false;
  private ytPlayer: any = null;
  private isYtReady: boolean = false;
  private ytPendingVideoId: string | null = null;
  private ytPendingStartSec: number = 0;
  private ytTimePollTimer: any = null;
  private audioPollTimer: any = null;

  private initAudio() {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
      this.audio.crossOrigin = "anonymous";

      this.audio.addEventListener("timeupdate", () => {
        if (!this.isYouTubeActive && this.audio && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(Math.floor(this.audio.currentTime * 1000));
        }
      });

      this.audio.addEventListener("playing", () => {
        this.startAudioTicker();
      });

      this.audio.addEventListener("pause", () => {
        this.stopAudioTicker();
      });

      this.audio.addEventListener("ended", () => {
        this.stopAudioTicker();
        if (!this.isYouTubeActive && this.onEndedCallback) {
          this.onEndedCallback();
        }
      });
    }
  }

  private initYouTubePlayer() {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (this.ytPlayer || this.isYtReady) return;

    // Create a container for the audio-only YouTube player (zero video frames visible)
    let container = document.getElementById("sony-youtube-player-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "sony-youtube-player-container";
      container.style.position = "fixed";
      container.style.bottom = "0px";
      container.style.right = "0px";
      container.style.width = "1px";
      container.style.height = "1px";
      container.style.overflow = "hidden";
      container.style.opacity = "0.001";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-9999";

      const playerDiv = document.createElement("div");
      playerDiv.id = "sony-yt-player-target";
      container.appendChild(playerDiv);
      document.body.appendChild(container);
    }

    const onYTReady = () => {
      try {
        this.ytPlayer = new window.YT.Player("sony-yt-player-target", {
          height: "200",
          width: "200",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              this.isYtReady = true;
              if (this.ytPendingVideoId) {
                this.loadAndPlayYouTube(this.ytPendingVideoId, this.ytPendingStartSec);
                this.ytPendingVideoId = null;
              }
            },
            onStateChange: (event: any) => {
              // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering)
              if (event.data === 1) {
                // Playing
                this.startYtTicker();
              } else if (event.data === 0) {
                // Ended -> Advance track in room/queue
                this.stopYtTicker();
                if (this.isYouTubeActive && this.onEndedCallback) {
                  this.onEndedCallback();
                }
              } else if (event.data === 2) {
                // Paused
                this.stopYtTicker();
              }
            },
          },
        });
      } catch (err) {
        console.warn("Error initializing YouTube Player:", err);
      }
    };

    if (window.YT && window.YT.Player) {
      onYTReady();
    } else {
      // Load YouTube IFrame API script
      const existingScript = document.getElementById("sony-yt-api-script");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "sony-yt-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = onYTReady;
    }
  }

  private startYtTicker() {
    this.stopYtTicker();
    this.ytTimePollTimer = setInterval(() => {
      if (this.isYouTubeActive && this.ytPlayer && typeof this.ytPlayer.getCurrentTime === "function") {
        try {
          const sec = this.ytPlayer.getCurrentTime();
          if (this.onTimeUpdateCallback && typeof sec === "number") {
            this.onTimeUpdateCallback(Math.floor(sec * 1000));
          }
        } catch {}
      }
    }, 100);
  }

  private stopYtTicker() {
    if (this.ytTimePollTimer) {
      clearInterval(this.ytTimePollTimer);
      this.ytTimePollTimer = null;
    }
  }

  private startAudioTicker() {
    this.stopAudioTicker();
    this.audioPollTimer = setInterval(() => {
      if (!this.isYouTubeActive && this.audio && !this.audio.paused && this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(Math.floor(this.audio.currentTime * 1000));
      }
    }, 100);
  }

  private stopAudioTicker() {
    if (this.audioPollTimer) {
      clearInterval(this.audioPollTimer);
      this.audioPollTimer = null;
    }
  }

  private loadAndPlayYouTube(videoId: string, startSec: number = 0) {
    if (!this.ytPlayer || !this.isYtReady) return;
    try {
      this.ytPlayer.loadVideoById({
        videoId,
        startSeconds: startSec,
      });
      this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
    } catch (err) {
      console.warn("Failed to load YouTube video in player:", err);
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

    const isYT =
      track.provider === "YOUTUBE" ||
      track.id.startsWith("yt-") ||
      (track.streamUrl &&
        (track.streamUrl.includes("youtube.com") || track.streamUrl.includes("youtu.be"))) ||
      (track.providerTrackId && /^[a-zA-Z0-9_-]{11}$/.test(track.providerTrackId));

    if (isYT) {
      // 1. YouTube Audio-Only Engine
      this.isYouTubeActive = true;
      if (this.audio) {
        this.audio.pause();
      }

      let videoId = "";
      if (track.providerTrackId && /^[a-zA-Z0-9_-]{11}$/.test(track.providerTrackId)) {
        videoId = track.providerTrackId;
      } else if (track.id.startsWith("yt-")) {
        videoId = track.id.replace(/^yt-/, "");
      } else if (track.streamUrl && track.streamUrl.includes("v=")) {
        const match = track.streamUrl.match(/v=([a-zA-Z0-9_-]{11})/);
        videoId = match ? match[1] : "";
      }

      const startSec = startMs > 0 ? startMs / 1000 : 0;

      if (!this.isYtReady) {
        this.ytPendingVideoId = videoId;
        this.ytPendingStartSec = startSec;
        this.initYouTubePlayer();
      } else {
        this.loadAndPlayYouTube(videoId, startSec);
      }
    } else {
      // 2. Standard Audio Stream (HTML5 Audio)
      this.isYouTubeActive = false;
      this.stopYtTicker();
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
        try {
          this.ytPlayer.pauseVideo();
        } catch {}
      }

      this.initAudio();
      if (!this.audio) return;

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

      this.audio.volume = this.currentVolume;
      this.audio.play().then(() => {
        this.startAudioTicker();
      }).catch((err) => {
        console.warn("WebAudioService: playback waiting for user interaction:", err);
      });
    }
  }

  public pause() {
    if (this.isYouTubeActive && this.ytPlayer && typeof this.ytPlayer.pauseVideo === "function") {
      try {
        this.ytPlayer.pauseVideo();
      } catch {}
    } else if (this.audio) {
      this.audio.pause();
    }
    this.stopYtTicker();
    this.stopAudioTicker();
  }

  public resume() {
    if (this.isYouTubeActive && this.ytPlayer && typeof this.ytPlayer.playVideo === "function") {
      try {
        this.ytPlayer.playVideo();
        this.startYtTicker();
      } catch {}
    } else if (this.audio && this.currentUrl) {
      this.audio.play().then(() => {
        this.startAudioTicker();
      }).catch(() => {});
    }
  }

  public isActuallyPlaying(): boolean {
    if (this.isYouTubeActive && this.ytPlayer && typeof this.ytPlayer.getPlayerState === "function") {
      try {
        return this.ytPlayer.getPlayerState() === 1; // 1 = YT.PlayerState.PLAYING
      } catch {
        return false;
      }
    }
    return !!(this.audio && !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0);
  }

  public seek(targetMs: number) {
    const sec = targetMs / 1000;
    if (this.isYouTubeActive && this.ytPlayer && typeof this.ytPlayer.seekTo === "function") {
      try {
        this.ytPlayer.seekTo(sec, true);
      } catch {}
    } else if (this.audio) {
      this.audio.currentTime = sec;
    }
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.currentVolume;
    }
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === "function") {
      try {
        this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
      } catch {}
    }
  }

  public getDurationMs(): number {
    if (this.isYouTubeActive && this.ytPlayer && typeof this.ytPlayer.getDuration === "function") {
      try {
        const sec = this.ytPlayer.getDuration();
        return sec && !isNaN(sec) ? Math.floor(sec * 1000) : 0;
      } catch {
        return 0;
      }
    }
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
