import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeskFocusId, VinylTrack } from './data/portfolioData';
import {
  createVinylTrack,
  incrementVinylTrackPlays,
  NotebookEntry,
  PersistedVinylTrack,
  subscribeToNotebookEntries,
  subscribeToVinylTracks,
} from './lib/firebase';
import { simulateCoolingRig } from './utils/engineeringMath';
import { vinylAudioEngine } from './utils/musicEngine';
import { playDeskClick, playRelaySwitch } from './utils/soundEffects';
import { DeskScene } from './components/desk/DeskScene';
import { DeskHud } from './components/hud/DeskHud';
import { ProjectsModal } from './components/overlays/ProjectsModal';
import { CoolingLabModal } from './components/overlays/CoolingLabModal';
import { PhoneChatModal } from './components/overlays/PhoneChatModal';
import { HaulTruckModal } from './components/overlays/HaulTruckModal';
import { DiaryModal } from './components/overlays/DiaryModal';
import { VinylPlayerModal } from './components/overlays/VinylPlayerModal';
import { AddVinylTrackInput } from './components/overlays/DeskPlayerView';
import { ArchitectureModal } from './components/overlays/ArchitectureModal';
import { WorkContactDrawer } from './components/overlays/WorkContactDrawer';

const TRACK_PALETTES: [string, string][] = [
  ['#1e293b', '#0284c7'],
  ['#312e81', '#6366f1'],
  ['#064e3b', '#10b981'],
  ['#451a03', '#d97706'],
  ['#3f1d2b', '#e11d48'],
];

interface TrendingApiTrack {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  streamUrl: string;
  durationSec: number;
  source: 'audius';
}

function mapFirestoreTrack(doc: PersistedVinylTrack, index: number): VinylTrack {
  const palette = TRACK_PALETTES[index % TRACK_PALETTES.length];
  const dateLabel = doc.createdAt
    ? doc.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : 'Just now';

  return {
    id: doc.id,
    title: doc.title,
    artist: doc.artist,
    pickedBy: doc.pickedBy,
    dateLabel,
    plays: doc.plays,
    accentFrom: palette[0],
    accentTo: palette[1],
    streamUrl: doc.streamUrl,
    artworkUrl: doc.artworkUrl || undefined,
    source: doc.source,
    isPersisted: true,
  };
}

function mapTrendingTrack(item: TrendingApiTrack, index: number): VinylTrack {
  const palette = TRACK_PALETTES[(index + 2) % TRACK_PALETTES.length];
  return {
    id: item.id,
    title: item.title,
    artist: item.artist,
    pickedBy: 'Online Trending',
    dateLabel: 'Live',
    plays: Math.max(1, 12 - index),
    accentFrom: palette[0],
    accentTo: palette[1],
    streamUrl: item.streamUrl,
    artworkUrl: item.artworkUrl || undefined,
    durationSec: item.durationSec,
    source: 'audius',
    isPersisted: false,
  };
}

export default function App() {
  const [activeFocus, setActiveFocus] = useState<DeskFocusId>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Firestore Notebook State (shared between Diary & Tablet summary card)
  const [diaryEntries, setDiaryEntries] = useState<NotebookEntry[]>([]);
  const [diaryLoading, setDiaryLoading] = useState(true);
  const [diaryError, setDiaryError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToNotebookEntries(
      (items) => {
        setDiaryEntries(items);
        setDiaryLoading(false);
        setDiaryError(null);
      },
      (err) => {
        setDiaryError(err.message || 'Unable to load diary entries.');
        setDiaryLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Linked 3D Hardware Cooling Rig State
  const [temperatureC, setTemperatureC] = useState(26);
  const [thresholdC, setThresholdC] = useState(30);
  const coolingState = useMemo(
    () => simulateCoolingRig(temperatureC, thresholdC),
    [temperatureC, thresholdC]
  );
  const prevRelayRef = useRef(coolingState.relayActive);

  useEffect(() => {
    if (prevRelayRef.current !== coolingState.relayActive) {
      prevRelayRef.current = coolingState.relayActive;
      playRelaySwitch(soundEnabled, coolingState.relayActive);
    }
  }, [coolingState.relayActive, soundEnabled]);

  // Linked 3D Vinyl Record Player Playlist (Firestore community songs + live online trending full songs)
  const [firestoreTracks, setFirestoreTracks] = useState<VinylTrack[]>([]);
  const [onlineCatalogTracks, setOnlineCatalogTracks] = useState<VinylTrack[]>([]);
  const [loadingOnlineTracks, setLoadingOnlineTracks] = useState(true);
  const [currentTrackId, setCurrentTrackId] = useState<string>('');
  const [vinylPlaying, setVinylPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToVinylTracks(
      (docs) => {
        setFirestoreTracks(docs.map((doc, idx) => mapFirestoreTrack(doc, idx)));
      },
      (err) => {
        console.error('Failed to subscribe to vinyl tracks:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/music/trending')
      .then((res) => (res.ok ? res.json() : { tracks: [] }))
      .then((data: { tracks?: TrendingApiTrack[] }) => {
        if (!active) return;
        const list = Array.isArray(data.tracks) ? data.tracks : [];
        setOnlineCatalogTracks(list.map((item, idx) => mapTrendingTrack(item, idx)));
      })
      .catch(() => {
        // Leave catalog empty if offline; visitor-saved Firestore tracks or search still work
      })
      .finally(() => {
        if (active) setLoadingOnlineTracks(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const tracks = useMemo(() => {
    const seenUrls = new Set(firestoreTracks.map((t) => t.streamUrl));
    const uniqueTrending = onlineCatalogTracks.filter((t) => !seenUrls.has(t.streamUrl));
    return [...firestoreTracks, ...uniqueTrending];
  }, [firestoreTracks, onlineCatalogTracks]);

  useEffect(() => {
    if (tracks.length > 0 && !tracks.some((t) => t.id === currentTrackId)) {
      setCurrentTrackId(tracks[0].id);
    }
  }, [tracks, currentTrackId]);

  const currentTrack = useMemo(
    () => tracks.find((t) => t.id === currentTrackId) ?? tracks[0],
    [tracks, currentTrackId]
  );

  const handleNextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    const nextIdx = idx < 0 || idx >= tracks.length - 1 ? 0 : idx + 1;
    const nextTrack = tracks[nextIdx];
    if (nextTrack) {
      if (nextTrack.isPersisted) {
        void incrementVinylTrackPlays(nextTrack.id).catch(() => {});
      } else {
        setOnlineCatalogTracks((prev) =>
          prev.map((t) => (t.id === nextTrack.id ? { ...t, plays: t.plays + 1 } : t))
        );
      }
      setCurrentTrackId(nextTrack.id);
      setVinylPlaying(true);
    }
  }, [tracks, currentTrackId]);

  const handleNextTrackRef = useRef(handleNextTrack);
  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  useEffect(() => {
    if (vinylPlaying && soundEnabled && currentTrack?.streamUrl) {
      vinylAudioEngine.start({
        streamUrl: currentTrack.streamUrl,
        onEnded: () => handleNextTrackRef.current(),
      });
    } else {
      vinylAudioEngine.stop();
    }
  }, [vinylPlaying, currentTrack, soundEnabled]);

  useEffect(() => {
    return () => {
      vinylAudioEngine.stop();
    };
  }, []);

  const handleSelectTrack = useCallback(
    (trackId: string) => {
      const target = tracks.find((t) => t.id === trackId);
      if (target?.isPersisted) {
        void incrementVinylTrackPlays(trackId).catch(() => {});
      } else {
        setOnlineCatalogTracks((prev) =>
          prev.map((t) => (t.id === trackId ? { ...t, plays: t.plays + 1 } : t))
        );
      }
      setCurrentTrackId(trackId);
      setVinylPlaying(true);
    },
    [tracks]
  );

  const handleToggleVinylPlay = useCallback(() => {
    if (!currentTrack) return;
    setVinylPlaying((prev) => !prev);
  }, [currentTrack]);

  const handlePrevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    const prevIdx = idx <= 0 ? tracks.length - 1 : idx - 1;
    const prevTrack = tracks[prevIdx];
    if (prevTrack) {
      handleSelectTrack(prevTrack.id);
    }
  }, [tracks, currentTrackId, handleSelectTrack]);

  const handleAddTrack = useCallback(async (payload: AddVinylTrackInput) => {
    const newId = await createVinylTrack(payload);
    setCurrentTrackId(newId);
    setVinylPlaying(true);
  }, []);

  const handleSelectFocus = useCallback(
    (next: DeskFocusId) => {
      playDeskClick(soundEnabled, next === 'overview' ? 420 : 580);
      setActiveFocus(next);
    },
    [soundEnabled]
  );

  const handleCloseOverlay = useCallback(() => {
    playDeskClick(soundEnabled, 380);
    setActiveFocus('overview');
  }, [soundEnabled]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (drawerOpen) {
          setDrawerOpen(false);
        } else if (activeFocus !== 'overview') {
          setActiveFocus('overview');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeFocus, drawerOpen]);

  return (
    <main
      className="relative w-full h-full overflow-hidden bg-[#EFECE6]"
      aria-label="Simangaliso Thabede 3D Virtual Engineering Desk"
      data-state={activeFocus}
    >
      {/* Full-Viewport 3D Desk Scene */}
      <DeskScene
        activeFocus={activeFocus}
        onSelectObject={handleSelectFocus}
        onOpenWorkDrawer={() => {
          playDeskClick(soundEnabled, 500);
          setDrawerOpen(true);
        }}
        fanActive={coolingState.relayActive}
        fanRpm={coolingState.fanRpm}
        truckBedTipped={activeFocus === 'truck'}
        vinylPlaying={vinylPlaying}
      />

      {/* Floating HUD */}
      <DeskHud
        activeFocus={activeFocus}
        onSelectFocus={handleSelectFocus}
        onOpenDrawer={() => {
          playDeskClick(soundEnabled, 500);
          setDrawerOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Focused Object Overlays */}
      {activeFocus === 'laptop' && (
        <ProjectsModal
          onClose={handleCloseOverlay}
          onOpenCad={() => handleSelectFocus('blueprint')}
        />
      )}

      {activeFocus === 'tablet' && (
        <CoolingLabModal
          temperatureC={temperatureC}
          thresholdC={thresholdC}
          onChangeTemperature={setTemperatureC}
          onChangeThreshold={setThresholdC}
          diaryCount={diaryEntries.length}
          tracks={tracks}
          loadingTracks={loadingOnlineTracks && tracks.length === 0}
          currentTrackId={currentTrackId}
          vinylPlaying={vinylPlaying}
          onSelectTrack={handleSelectTrack}
          onToggleVinylPlay={handleToggleVinylPlay}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onAddTrack={handleAddTrack}
          onOpenDiary={() => handleSelectFocus('diary')}
          onOpenCad={() => handleSelectFocus('blueprint')}
          onClose={handleCloseOverlay}
        />
      )}

      {activeFocus === 'phone' && <PhoneChatModal onClose={handleCloseOverlay} />}

      {activeFocus === 'truck' && <HaulTruckModal onClose={handleCloseOverlay} />}

      {activeFocus === 'diary' && (
        <DiaryModal
          entries={diaryEntries}
          loading={diaryLoading}
          loadError={diaryError}
          onClose={handleCloseOverlay}
        />
      )}

      {activeFocus === 'vinyl' && (
        <VinylPlayerModal
          tracks={tracks}
          loadingTracks={loadingOnlineTracks && tracks.length === 0}
          currentTrackId={currentTrackId}
          isPlaying={vinylPlaying}
          onSelectTrack={handleSelectTrack}
          onTogglePlay={handleToggleVinylPlay}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onAddTrack={handleAddTrack}
          onClose={handleCloseOverlay}
        />
      )}

      {activeFocus === 'blueprint' && <ArchitectureModal onClose={handleCloseOverlay} />}

      {/* Accessible Slide-Over Work & Contact Drawer */}
      <WorkContactDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onFocusObject={handleSelectFocus}
      />
    </main>
  );
}
