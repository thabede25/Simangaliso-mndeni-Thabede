/**
 * Ad-Free Full-Song Online Audio Engine for Simangaliso's 3D Vinyl Record Player.
 * Streams real full-length online audio (Audius MP3 streams or direct HTTPS audio links)
 * cleanly via HTMLAudioElement with live progress, seeking, and auto-advance.
 */

export interface VinylStreamConfig {
  streamUrl: string;
  onEnded?: () => void;
}

export interface AudioPlaybackProgress {
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  isStream: boolean;
  error: string | null;
}

type ProgressListener = (progress: AudioPlaybackProgress) => void;

class VinylAudioEngine {
  private audioEl: HTMLAudioElement | null = null;
  private onEndedCallback: (() => void) | null = null;
  private progressListeners = new Set<ProgressListener>();
  private state: AudioPlaybackProgress = {
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    isStream: true,
    error: null,
  };

  private emitProgress(patch: Partial<AudioPlaybackProgress>) {
    this.state = { ...this.state, ...patch };
    this.progressListeners.forEach((cb) => cb(this.state));
  }

  public subscribeProgress(cb: ProgressListener): () => void {
    this.progressListeners.add(cb);
    cb(this.state);
    return () => {
      this.progressListeners.delete(cb);
    };
  }

  public seek(seconds: number) {
    if (!this.audioEl) return;
    const maxDur = Number.isFinite(this.audioEl.duration) ? this.audioEl.duration : seconds;
    const clamped = Math.max(0, Math.min(maxDur, seconds));
    this.audioEl.currentTime = clamped;
    this.emitProgress({ currentTime: clamped });
  }

  private ensureAudioElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioEl) {
      const el = new Audio();
      el.preload = 'auto';
      el.volume = 0.78;

      el.addEventListener('loadstart', () => {
        this.emitProgress({ isBuffering: true, error: null });
      });
      el.addEventListener('canplay', () => {
        this.emitProgress({
          isBuffering: false,
          duration: Number.isFinite(el.duration) ? el.duration : 0,
        });
      });
      el.addEventListener('playing', () => {
        this.emitProgress({ isBuffering: false, error: null });
      });
      el.addEventListener('timeupdate', () => {
        this.emitProgress({
          currentTime: el.currentTime || 0,
          duration: Number.isFinite(el.duration) ? el.duration : 0,
          isBuffering: false,
          error: null,
        });
      });
      el.addEventListener('ended', () => {
        this.emitProgress({ currentTime: 0, isBuffering: false });
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      });
      el.addEventListener('error', () => {
        this.emitProgress({
          isBuffering: false,
          error: 'Stream unavailable right now — try another track.',
        });
      });

      this.audioEl = el;
    }
    return this.audioEl;
  }

  public start(config: VinylStreamConfig) {
    this.stop();
    this.onEndedCallback = config.onEnded ?? null;

    if (!config.streamUrl) {
      this.emitProgress({
        currentTime: 0,
        duration: 0,
        isBuffering: false,
        isStream: false,
        error: null,
      });
      return;
    }

    const el = this.ensureAudioElement();
    if (!el) return;

    this.emitProgress({
      currentTime: 0,
      duration: 0,
      isBuffering: true,
      isStream: true,
      error: null,
    });

    if (el.src !== config.streamUrl) {
      el.src = config.streamUrl;
    }
    el.currentTime = 0;

    void el.play().catch((err: unknown) => {
      const errName =
        typeof err === 'object' && err !== null && 'name' in err
          ? String((err as { name?: unknown }).name)
          : '';
      const isHarmless = errName === 'NotAllowedError' || errName === 'AbortError';
      this.emitProgress({
        isBuffering: false,
        error: isHarmless ? null : 'Stream unavailable right now — try another track.',
      });
    });
  }

  public stop() {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.emitProgress({ isBuffering: false });
  }
}

export const vinylAudioEngine = new VinylAudioEngine();
