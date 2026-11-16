import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  Plus,
  Disc3,
  Globe,
  Link2,
  Loader2,
  Check,
} from 'lucide-react';
import { VinylTrack } from '../../data/portfolioData';
import { AudioPlaybackProgress, vinylAudioEngine } from '../../utils/musicEngine';
import {
  formatTrackDuration,
  validateVinylTrackSubmission,
  VinylTrackSource,
} from '../../utils/engineeringMath';

export interface AddVinylTrackInput {
  title: string;
  artist: string;
  pickedBy: string;
  streamUrl: string;
  artworkUrl: string;
  source: VinylTrackSource;
}

interface OnlineSearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  streamUrl: string;
  durationSec: number;
  source: 'audius';
}

interface DeskPlayerViewProps {
  tracks: VinylTrack[];
  loadingTracks?: boolean;
  currentTrackId: string;
  isPlaying: boolean;
  onSelectTrack: (trackId: string) => void;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onAddTrack: (payload: AddVinylTrackInput) => Promise<void> | void;
}

const QUICK_SEARCH_CHIPS = ['Black Coffee', 'Tyla', 'Daft Punk', 'Burna Boy', 'Lofi'];

export function DeskPlayerView({
  tracks,
  loadingTracks = false,
  currentTrackId,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onAddTrack,
}: DeskPlayerViewProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'most-played'>('newest');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addMode, setAddMode] = useState<'online' | 'direct'>('online');

  // Online Search State
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<OnlineSearchResult[]>([]);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [pickedByName, setPickedByName] = useState('');
  const [savingTrackId, setSavingTrackId] = useState<string | null>(null);

  // Direct URL Form State
  const [directTitle, setDirectTitle] = useState('');
  const [directArtist, setDirectArtist] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [directError, setDirectError] = useState<string | null>(null);

  // Live Playback Progress State
  const [progress, setProgress] = useState<AudioPlaybackProgress>({
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    isStream: false,
    error: null,
  });

  useEffect(() => {
    return vinylAudioEngine.subscribeProgress(setProgress);
  }, []);

  const currentTrack: VinylTrack | undefined = useMemo(
    () => tracks.find((t) => t.id === currentTrackId) ?? tracks[0],
    [tracks, currentTrackId]
  );

  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = tracks.filter(
      (t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.pickedBy.toLowerCase().includes(q)
    );
    if (sortBy === 'most-played') {
      return [...matched].sort((a, b) => b.plays - a.plays);
    }
    return matched;
  }, [tracks, search, sortBy]);

  const runOnlineSearch = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    setOnlineQuery(trimmed);
    setSearchingOnline(true);
    setOnlineError(null);

    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as { tracks?: OnlineSearchResult[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not search online music.');
      }
      const found = Array.isArray(data.tracks) ? data.tracks : [];
      setOnlineResults(found);
      if (found.length === 0) {
        setOnlineError('No ad-free streams matched that query. Try another song or artist.');
      }
    } catch (err) {
      setOnlineError(err instanceof Error ? err.message : 'Music search failed.');
    } finally {
      setSearchingOnline(false);
    }
  };

  const handleOnlineSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runOnlineSearch(onlineQuery);
  };

  const handleSelectOnlineResult = async (item: OnlineSearchResult) => {
    const picker = pickedByName.trim() ? `${pickedByName.trim()}'s pick` : "Visitor's pick";
    const validation = validateVinylTrackSubmission(
      item.title,
      item.artist,
      picker,
      item.streamUrl,
      item.artworkUrl,
      item.source
    );
    if (!validation.valid) {
      setOnlineError(validation.error || 'Track could not be added.');
      return;
    }

    setSavingTrackId(item.id);
    setOnlineError(null);
    try {
      await onAddTrack(validation.sanitized);
      setShowAddPanel(false);
    } catch (err) {
      setOnlineError(err instanceof Error ? err.message : 'Failed to save song to queue.');
    } finally {
      setSavingTrackId(null);
    }
  };

  const handleDirectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDirectError(null);
    const picker = pickedByName.trim() ? `${pickedByName.trim()}'s pick` : "Visitor's pick";
    const validation = validateVinylTrackSubmission(
      directTitle,
      directArtist,
      picker,
      directUrl,
      '',
      'direct'
    );
    if (!validation.valid) {
      setDirectError(validation.error || 'Please check the stream details.');
      return;
    }

    setSavingTrackId('direct');
    try {
      await onAddTrack(validation.sanitized);
      setDirectTitle('');
      setDirectArtist('');
      setDirectUrl('');
      setShowAddPanel(false);
    } catch (err) {
      setDirectError(err instanceof Error ? err.message : 'Could not save direct stream.');
    } finally {
      setSavingTrackId(null);
    }
  };

  const sourceBadge =
    currentTrack?.source === 'direct' ? 'Direct Stream · Ad-Free' : 'Full Song · Ad-Free';

  const effectiveDuration =
    progress.duration > 0 ? progress.duration : currentTrack?.durationSec ?? 0;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white text-zinc-900">
      {/* Left Column: Now Spinning Album Art, Live Scrubber & Transport Controls */}
      <div className="w-full md:w-[39%] shrink-0 border-b md:border-b-0 md:border-r border-stone-200 p-4 sm:p-5 flex flex-col justify-between bg-[#FAF9F6] overflow-y-auto">
        {currentTrack ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-stone-500">On the vinyl player</span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                {sourceBadge}
              </span>
            </div>

            {/* Square Album Artwork Card */}
            <div
              className="relative aspect-square w-full max-w-[186px] mx-auto rounded-2xl shadow-lg overflow-hidden flex flex-col justify-between p-3.5 text-white"
              style={{
                background: `linear-gradient(145deg, ${currentTrack.accentFrom}, ${currentTrack.accentTo})`,
              }}
            >
              {currentTrack.artworkUrl ? (
                <>
                  <img
                    src={currentTrack.artworkUrl}
                    alt={`${currentTrack.title} album cover`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35"
                  />
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-white/90">
                    <span>33⅓ RPM</span>
                    <span>FULL SONG</span>
                  </div>
                  <div className="relative z-10 flex items-end justify-between">
                    <span className="text-[11px] font-medium text-white/90 truncate pr-2">
                      {currentTrack.artist}
                    </span>
                    <div
                      className={`h-9 w-9 shrink-0 rounded-full bg-zinc-950/90 ring-2 ring-white/40 flex items-center justify-center ${
                        isPlaying ? 'animate-spin' : ''
                      }`}
                      style={{ animationDuration: '4s' }}
                    >
                      <Disc3 className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider text-white/75">
                    <span>33⅓ RPM</span>
                    <span>FULL SONG</span>
                  </div>
                  <div className="my-auto flex items-center justify-center">
                    <div
                      className={`h-22 w-22 rounded-full bg-zinc-950/85 ring-4 ring-white/15 flex items-center justify-center ${
                        isPlaying ? 'animate-spin' : ''
                      }`}
                      style={{ animationDuration: '5s' }}
                    >
                      <Disc3 className="h-11 w-11 text-amber-400" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-white/80 truncate">
                    {currentTrack.artist}
                  </div>
                </>
              )}
            </div>

            {/* Active Track Metadata */}
            <div className="space-y-0.5 text-left max-w-[230px] mx-auto">
              <h3 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold text-zinc-900 truncate">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-stone-600 truncate">{currentTrack.artist}</p>
              <p className="text-xs font-medium text-blue-600 truncate">{currentTrack.pickedBy}</p>
            </div>

            {/* Live Full-Song Stream Progress Scrubber */}
            <div className="max-w-[230px] mx-auto space-y-1">
              <input
                type="range"
                aria-label="Track playback position"
                min={0}
                max={effectiveDuration > 0 ? effectiveDuration : 180}
                step={0.5}
                value={progress.currentTime}
                onChange={(e) => vinylAudioEngine.seek(Number(e.target.value))}
                className="w-full h-1.5 accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] text-stone-500 tabular-nums">
                <span>
                  {progress.isBuffering ? 'Buffering...' : formatTrackDuration(progress.currentTime)}
                </span>
                <span>
                  {effectiveDuration > 0 ? formatTrackDuration(effectiveDuration) : 'Full Stream'}
                </span>
              </div>
              {progress.error && (
                <p className="text-[10px] text-rose-600 leading-tight">{progress.error}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="my-auto text-center space-y-2 py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-600">
              {loadingTracks ? (
                <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
              ) : (
                <Disc3 className="h-7 w-7" aria-hidden="true" />
              )}
            </div>
            <p className="text-xs font-medium text-stone-600">
              {loadingTracks
                ? 'Loading real online songs...'
                : 'Search & add any real online song to spin.'}
            </p>
          </div>
        )}

        {/* Transport Controls */}
        <div className="pt-3 flex items-center justify-center gap-5">
          <button
            type="button"
            disabled={!currentTrack}
            onClick={onPrevTrack}
            aria-label="Previous vinyl track"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-stone-200 disabled:opacity-40 cursor-pointer"
          >
            <SkipBack className="h-4 w-4 fill-current" />
          </button>
          <button
            type="button"
            disabled={!currentTrack}
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause vinyl player' : 'Play vinyl player'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 disabled:opacity-40 cursor-pointer transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>
          <button
            type="button"
            disabled={!currentTrack}
            onClick={onNextTrack}
            aria-label="Next vinyl track"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-stone-200 disabled:opacity-40 cursor-pointer"
          >
            <SkipForward className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Right Column: Ad-Free Online Song Search + Shared Firestore Playlist */}
      <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold text-zinc-900">
              Desk Vinyl Player
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              {tracks.length} real online {tracks.length === 1 ? 'song' : 'songs'} · Full-length
              streams, zero ads.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPanel((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{showAddPanel ? 'Close search' : 'Add song online'}</span>
          </button>
        </div>

        {/* Inline Online Search & Direct URL Adder */}
        {showAddPanel && (
          <div className="mt-3 rounded-xl border border-stone-200 bg-[#FAF9F6] p-3 space-y-2.5 max-h-[265px] flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-full bg-stone-200/75 p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setAddMode('online')}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 cursor-pointer ${
                    addMode === 'online' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  <span>Search Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('direct')}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 cursor-pointer ${
                    addMode === 'direct' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  <Link2 className="h-3 w-3" aria-hidden="true" />
                  <span>Direct HTTPS Audio</span>
                </button>
              </div>

              <input
                type="text"
                value={pickedByName}
                onChange={(e) => setPickedByName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={36}
                aria-label="Your name"
                className="w-40 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs text-zinc-900"
              />
            </div>

            {addMode === 'online' ? (
              <>
                <form onSubmit={handleOnlineSearchSubmit} className="flex gap-1.5">
                  <input
                    type="text"
                    value={onlineQuery}
                    onChange={(e) => setOnlineQuery(e.target.value)}
                    placeholder="Search any song or artist (e.g. Tyla, Black Coffee, Lofi)..."
                    aria-label="Search online songs"
                    className="flex-1 min-w-0 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={searchingOnline}
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {searchingOnline ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>Search</span>
                  </button>
                </form>

                {/* Quick Starter Search Pills */}
                {onlineResults.length === 0 && !searchingOnline && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-stone-500">Try:</span>
                    {QUICK_SEARCH_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => void runOnlineSearch(chip)}
                        className="rounded-full border border-stone-300 bg-white px-2.5 py-0.5 text-[10px] font-medium text-zinc-700 hover:border-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {onlineError && (
                  <p role="alert" className="text-[11px] text-rose-600">
                    {onlineError}
                  </p>
                )}

                {onlineResults.length > 0 && (
                  <ul className="flex-1 overflow-y-auto divide-y divide-stone-200/70 pr-1">
                    {onlineResults.map((item) => (
                      <li
                        key={item.id}
                        className="py-1.5 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.artworkUrl ? (
                            <img
                              src={item.artworkUrl}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              className="h-8 w-8 rounded-md object-cover shrink-0 bg-stone-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                              <Disc3 className="h-4 w-4" aria-hidden="true" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-zinc-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-stone-500 truncate">
                              {item.artist} · {formatTrackDuration(item.durationSec)} ·{' '}
                              <span className="text-emerald-700 font-medium">
                                Full Song · Ad-Free
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={savingTrackId === item.id}
                          onClick={() => void handleSelectOnlineResult(item)}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          {savingTrackId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                          ) : (
                            <Check className="h-3 w-3" aria-hidden="true" />
                          )}
                          <span>Add &amp; Spin</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <form onSubmit={handleDirectSubmit} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={directTitle}
                    onChange={(e) => setDirectTitle(e.target.value)}
                    placeholder="Song title *"
                    maxLength={100}
                    required
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900"
                  />
                  <input
                    type="text"
                    value={directArtist}
                    onChange={(e) => setDirectArtist(e.target.value)}
                    placeholder="Artist *"
                    maxLength={80}
                    required
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900"
                  />
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="https://... direct MP3/M4A/OGG stream URL *"
                    maxLength={500}
                    required
                    className="flex-1 min-w-0 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900"
                  />
                  <button
                    type="submit"
                    disabled={savingTrackId === 'direct'}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {savingTrackId === 'direct' ? 'Adding...' : 'Add & Spin'}
                  </button>
                </div>
                {directError && (
                  <p role="alert" className="text-[11px] text-rose-600">
                    {directError}
                  </p>
                )}
              </form>
            )}
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter queue by song, artist or visitor"
              className="w-full rounded-full border border-stone-200 bg-stone-100/80 pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-stone-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex items-center rounded-full border border-stone-200 bg-stone-100 p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`rounded-full px-2.5 py-1 cursor-pointer ${
                sortBy === 'newest' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortBy('most-played')}
              className={`rounded-full px-2.5 py-1 cursor-pointer ${
                sortBy === 'most-played' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              Most played
            </button>
          </div>
        </div>

        {/* Scrollable Track Queue */}
        <ul className="mt-3 flex-1 overflow-y-auto divide-y divide-stone-100 pr-1">
          {filteredTracks.map((track) => {
            const active = currentTrack?.id === track.id;
            return (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => onSelectTrack(track.id)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    active ? 'bg-stone-100' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {track.artworkUrl ? (
                      <div
                        className="relative h-9 w-9 shrink-0 rounded-lg overflow-hidden shadow-2xs"
                        style={{
                          background: `linear-gradient(135deg, ${track.accentFrom}, ${track.accentTo})`,
                        }}
                      >
                        <img
                          src={track.artworkUrl}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                          {active && isPlaying ? (
                            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Play className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                        style={{
                          background: `linear-gradient(135deg, ${track.accentFrom}, ${track.accentTo})`,
                        }}
                      >
                        {active && isPlaying ? (
                          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Play className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-semibold truncate ${
                          active ? 'text-blue-700' : 'text-zinc-900'
                        }`}
                      >
                        {track.title}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {track.artist}
                        {track.durationSec ? ` · ${formatTrackDuration(track.durationSec)}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[11px] text-stone-400">
                    <div>
                      {track.pickedBy} · {track.dateLabel}
                    </div>
                    <div className="font-[family-name:var(--font-mono)] text-[10px]">
                      {track.plays} {track.plays === 1 ? 'play' : 'plays'}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
