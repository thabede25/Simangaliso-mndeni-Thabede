import { X, Disc3 } from 'lucide-react';
import { VinylTrack } from '../../data/portfolioData';
import { AddVinylTrackInput, DeskPlayerView } from './DeskPlayerView';

interface VinylPlayerModalProps {
  tracks: VinylTrack[];
  loadingTracks?: boolean;
  currentTrackId: string;
  isPlaying: boolean;
  onSelectTrack: (trackId: string) => void;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onAddTrack: (payload: AddVinylTrackInput) => Promise<void> | void;
  onClose: () => void;
}

export function VinylPlayerModal({
  tracks,
  loadingTracks = false,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onAddTrack,
  onClose,
}: VinylPlayerModalProps) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center pt-16 pb-20 px-3 sm:px-6 bg-zinc-950/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vinyl-player-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Realistic Walnut & Brushed-Aluminum Turntable Player Housing */}
      <div className="w-full max-w-[840px] h-[min(540px,80vh)] flex flex-col rounded-[24px] border-[8px] border-[#5c3c24] ring-2 ring-zinc-400/65 bg-white shadow-[0_32px_90px_rgba(0,0,0,0.58)] overflow-hidden">
        {/* Brushed Aluminum Top Deck Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-[#f1efe9] px-4 py-2.5 text-zinc-900">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isPlaying ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.65)]' : 'bg-stone-400'
              }`}
              aria-hidden="true"
            />
            <Disc3
              className={`h-4 w-4 text-zinc-700 ${isPlaying ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span
              id="vinyl-player-modal-title"
              className="text-xs font-semibold tracking-tight text-zinc-800"
            >
              Desk Vinyl Player · Walnut Turntable
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-[family-name:var(--font-mono)] text-[11px] text-stone-500">
              {isPlaying ? '33⅓ RPM · SPINNING' : '33⅓ RPM · STANDBY'}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close vinyl player"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-stone-300 bg-white text-zinc-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <DeskPlayerView
          tracks={tracks}
          loadingTracks={loadingTracks}
          currentTrackId={currentTrackId}
          isPlaying={isPlaying}
          onSelectTrack={onSelectTrack}
          onTogglePlay={onTogglePlay}
          onPrevTrack={onPrevTrack}
          onNextTrack={onNextTrack}
          onAddTrack={onAddTrack}
        />
      </div>
    </div>
  );
}
