import { useEffect, useState } from 'react';
import {
  X,
  Thermometer,
  Fan,
  Zap,
  Usb,
  Wifi,
  BatteryCharging,
  BookOpen,
  Layers,
  Disc3,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import { simulateCoolingRig } from '../../utils/engineeringMath';
import { PROJECTS, VinylTrack } from '../../data/portfolioData';
import { AddVinylTrackInput, DeskPlayerView } from './DeskPlayerView';

interface CoolingLabModalProps {
  temperatureC: number;
  thresholdC: number;
  onChangeTemperature: (temp: number) => void;
  onChangeThreshold: (threshold: number) => void;
  diaryCount: number;
  tracks: VinylTrack[];
  loadingTracks?: boolean;
  currentTrackId: string;
  vinylPlaying: boolean;
  onSelectTrack: (trackId: string) => void;
  onToggleVinylPlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onAddTrack: (payload: AddVinylTrackInput) => Promise<void> | void;
  onOpenDiary: () => void;
  onOpenCad: () => void;
  onClose: () => void;
}

type TabletScreenMode = 'home' | 'cooling' | 'player';

export function CoolingLabModal({
  temperatureC,
  thresholdC,
  onChangeTemperature,
  onChangeThreshold,
  diaryCount,
  tracks,
  loadingTracks = false,
  currentTrackId,
  vinylPlaying,
  onSelectTrack,
  onToggleVinylPlay,
  onPrevTrack,
  onNextTrack,
  onAddTrack,
  onOpenDiary,
  onOpenCad,
  onClose,
}: CoolingLabModalProps) {
  const [screenMode, setScreenMode] = useState<TabletScreenMode>('home');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const reading = simulateCoolingRig(temperatureC, thresholdC);

  const timeString = now.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const shortDateString = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const fullDateString = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Build SVG NTC Beta curve points from 15C to 55C
  const curvePoints = Array.from({ length: 21 }, (_, idx) => {
    const t = 15 + idx * 2;
    const sim = simulateCoolingRig(t, thresholdC);
    const x = ((t - 15) / 40) * 260 + 10;
    const y = 90 - Math.min(80, (sim.resistanceKOhm / 16) * 76);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const markerX = ((Math.min(55, Math.max(15, temperatureC)) - 15) / 40) * 260 + 10;
  const markerY = 90 - Math.min(80, (reading.resistanceKOhm / 16) * 76);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center pt-16 pb-20 px-3 sm:px-6 bg-zinc-950/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tablet-os-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Realistic Matte-Black Landscape iPad Hardware Chassis */}
      <div className="relative w-full max-w-[820px] h-[min(510px,78vh)] flex flex-col rounded-[30px] border-[11px] border-[#0c0d10] ring-1 ring-white/15 bg-[#0c0d10] shadow-[0_32px_90px_rgba(0,0,0,0.58)] overflow-hidden">
        {/* Camera Dot inside Top Bezel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[8px] z-30 h-1.5 w-1.5 rounded-full bg-slate-700 ring-1 ring-slate-600"
        />

        {/* HOME WALLPAPER MODE (Matching Tablet Reference) */}
        {screenMode === 'home' && (
          <div className="relative flex-1 flex flex-col justify-between rounded-[19px] overflow-hidden select-none">
            {/* Illustrated Highveld Landscape Wallpaper SVG */}
            <svg
              viewBox="0 0 960 600"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full pointer-events-none"
            >
              <defs>
                <linearGradient id="highveld-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e6de8" />
                  <stop offset="55%" stopColor="#70a8f5" />
                  <stop offset="100%" stopColor="#b8d9fc" />
                </linearGradient>
                <linearGradient id="veldt-grass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#77bd2a" />
                  <stop offset="100%" stopColor="#a4d633" />
                </linearGradient>
              </defs>

              <rect width="960" height="600" fill="url(#highveld-sky)" />

              {/* Bright Cumulus Clouds */}
              <g fill="#f7fbff" opacity="0.94">
                <ellipse cx="180" cy="210" rx="115" ry="62" />
                <ellipse cx="265" cy="185" rx="95" ry="70" />
                <ellipse cx="470" cy="235" rx="135" ry="78" />
                <ellipse cx="560" cy="175" rx="110" ry="88" />
                <ellipse cx="670" cy="240" rx="95" ry="65" />
                <ellipse cx="835" cy="210" rx="105" ry="58" />
              </g>
              <g fill="#cfe2fb" opacity="0.72">
                <ellipse cx="320" cy="255" rx="95" ry="44" />
                <ellipse cx="620" cy="265" rx="125" ry="48" />
              </g>

              {/* Distant Blue Mountain Ridge */}
              <path
                d="M0 320 L140 278 L280 302 L440 236 L580 284 L745 258 L960 305 L960 390 L0 390 Z"
                fill="#4e79c7"
                opacity="0.45"
              />

              {/* Midground Koppie & Green Slopes */}
              <path
                d="M0 355 Q160 315 295 338 L440 236 Q525 278 655 322 Q810 308 960 342 L960 410 L0 410 Z"
                fill="#27791b"
              />
              <path
                d="M0 365 Q230 336 420 260 Q515 295 690 340 Q830 326 960 356 L960 420 L0 420 Z"
                fill="#419622"
              />

              {/* Highveld Meadow Foreground */}
              <path d="M0 375 Q480 356 960 378 L960 600 L0 600 Z" fill="url(#veldt-grass)" />

              {/* Winding Ochre Dirt Trail */}
              <path
                d="M448 372 Q425 425 462 478 Q490 525 445 600 L565 600 Q552 528 518 475 Q482 422 468 372 Z"
                fill="#e2bc63"
              />
              <path
                d="M454 373 Q436 425 472 478 Q502 525 465 600 L535 600 Q522 528 492 475 Q466 422 462 373 Z"
                fill="#efd180"
                opacity="0.72"
              />
            </svg>

            {/* Top iPad Status Bar */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-2.5 text-[11px] font-medium text-white drop-shadow-xs">
              <div className="flex items-center gap-2 font-[family-name:var(--font-mono)]">
                <span>{timeString}</span>
                <span className="opacity-85">{shortDateString}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-[family-name:var(--font-mono)]">100%</span>
                <BatteryCharging className="h-4 w-4" aria-hidden="true" />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close tablet"
                  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900/45 text-white hover:bg-zinc-900/70 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Split Layout: Left Lock Clock + Right "On my desk" Telemetry Card */}
            <div className="relative z-10 flex-1 flex flex-col sm:flex-row items-start justify-between gap-4 px-6 sm:px-9 pt-4 sm:pt-5">
              {/* Left Clock */}
              <div className="text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.28)]">
                <div className="text-xs sm:text-sm font-medium tracking-wide opacity-95">
                  {fullDateString}
                </div>
                <h2
                  id="tablet-os-title"
                  className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl font-bold tracking-tight leading-none mt-1 tabular-nums"
                >
                  {timeString}
                </h2>
              </div>

              {/* Right "On my desk" Live Summary Card */}
              <div className="w-full sm:w-[244px] rounded-2xl bg-white/90 border border-white/80 p-3.5 text-zinc-900 shadow-[0_12px_32px_rgba(15,23,42,0.18)] space-y-2.5">
                <div className="text-[11px] font-semibold text-stone-500">On my desk</div>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <Thermometer className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="leading-tight min-w-0">
                    <div className="text-sm font-bold tabular-nums">
                      {reading.temperatureC.toFixed(1)} °C
                    </div>
                    <div className="text-[10px] text-stone-500 truncate">
                      cooling rig · {reading.relayActive ? 'fan spinning' : 'relay standby'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-bold tabular-nums">{diaryCount}</div>
                    <div className="text-[10px] text-stone-500">pages in my diary</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-bold tabular-nums">{PROJECTS.length}</div>
                    <div className="text-[10px] text-stone-500">engineering projects built</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <Disc3 className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-bold tabular-nums">{tracks.length}</div>
                    <div className="text-[10px] text-stone-500">songs on the vinyl player</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Centered iPad Dock + Bottom-Right Diary CTA Card */}
            <div className="relative z-10 px-4 sm:px-6 pb-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
              {/* Left Spacer on Desktop to Keep Dock Centered */}
              <div className="hidden lg:block w-[210px]" aria-hidden="true" />

              {/* Frosted iPad Dock */}
              <nav
                aria-label="Tablet apps"
                className="flex items-center gap-4 rounded-[22px] bg-white/88 border border-white/80 px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.2)]"
              >
                <button
                  type="button"
                  onClick={() => setScreenMode('cooling')}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm group-hover:-translate-y-0.5 transition-transform">
                    <Thermometer className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-medium text-zinc-800">Cooling Lab</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScreenMode('player')}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-sm group-hover:-translate-y-0.5 transition-transform">
                    <Disc3
                      className={`h-5 w-5 text-sky-400 ${vinylPlaying ? 'animate-spin' : ''}`}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-[10px] font-medium text-zinc-800">Desk Player</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCad}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-sm group-hover:-translate-y-0.5 transition-transform">
                    <Compass className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-medium text-zinc-800">CAD Viewer</span>
                </button>
              </nav>

              {/* Bottom-Right Diary Shortcut Card */}
              <div className="w-full sm:w-[215px] rounded-2xl bg-white/90 border border-white/80 p-3 text-zinc-900 shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
                <div className="text-[11px] font-semibold text-zinc-800">Highveld Field Notes</div>
                <p className="mt-0.5 text-[10px] leading-snug text-stone-600">
                  Leave a note in my desk notebook or launch an app from the dock.
                </p>
                <button
                  type="button"
                  onClick={onOpenDiary}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-3.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Open my diary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COOLING LAB APP INSIDE IPAD */}
        {screenMode === 'cooling' && (
          <div className="flex-1 flex flex-col min-h-0 rounded-[19px] bg-[#0f172a] text-slate-100 overflow-hidden">
            {/* Tablet App Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-[#0b101d] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScreenMode('home')}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Tablet Home</span>
                </button>
                <div>
                  <h2
                    id="tablet-os-title"
                    className="font-[family-name:var(--font-display)] text-sm sm:text-base font-semibold text-white"
                  >
                    Lab Cooling &amp; Sensor Telemetry
                  </h2>
                  <p className="text-[10px] font-[family-name:var(--font-mono)] text-slate-400">
                    Arduino Uno · 10 kΩ NTC Thermistor · 5V Relay &amp; 3D Fan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-[family-name:var(--font-mono)] text-emerald-400">
                  <Usb className="h-3 w-3" aria-hidden="true" />
                  UNO_COM3
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close tablet"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Interactive Controls + Characteristic Curve */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-800 bg-[#162033]/80 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="ambient-temp-slider" className="font-semibold text-slate-200">
                      Simulated Mine Duct Temperature
                    </label>
                    <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-amber-400 tabular-nums">
                      {reading.temperatureC.toFixed(1)} °C
                    </span>
                  </div>
                  <input
                    id="ambient-temp-slider"
                    type="range"
                    min={15}
                    max={55}
                    step={0.5}
                    value={temperatureC}
                    onChange={(e) => onChangeTemperature(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-[family-name:var(--font-mono)]">
                    <span>15 °C</span>
                    <span>Setpoint: {thresholdC} °C</span>
                    <span>55 °C</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#162033]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="relay-threshold-slider" className="font-medium text-slate-300">
                      Relay Trip Threshold
                    </label>
                    <span className="font-[family-name:var(--font-mono)] text-xs font-semibold text-sky-300 tabular-nums">
                      {thresholdC} °C
                    </span>
                  </div>
                  <input
                    id="relay-threshold-slider"
                    type="range"
                    min={24}
                    max={42}
                    step={1}
                    value={thresholdC}
                    onChange={(e) => onChangeThreshold(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-800 bg-[#182236] p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Thermometer className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                      <span>NTC Resistance</span>
                    </div>
                    <div className="mt-1 font-[family-name:var(--font-mono)] text-base font-semibold text-white tabular-nums">
                      {reading.resistanceKOhm.toFixed(2)} kΩ
                    </div>
                    <div className="font-[family-name:var(--font-mono)] text-[11px] text-slate-400 tabular-nums">
                      ADC: {reading.adcVoltage.toFixed(2)} V ({reading.adcRaw})
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#182236] p-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Zap className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                      <span>5V Relay &amp; Fan</span>
                    </div>
                    <div
                      className={`mt-1 font-[family-name:var(--font-mono)] text-base font-semibold tabular-nums ${
                        reading.relayActive ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {reading.relayActive ? 'TRIPPED · ON' : 'IDLE · OFF'}
                    </div>
                    <div className="flex items-center gap-1 font-[family-name:var(--font-mono)] text-[11px] text-slate-400 tabular-nums">
                      <Fan className="h-3 w-3" aria-hidden="true" />
                      <span>
                        {reading.fanRpm} RPM ({reading.fanDutyPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#090d16] p-3.5 text-slate-200">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] text-slate-400">
                    <span>NTC R(T) Response Curve (β=3950 K)</span>
                    <span className="text-sky-400">3D Fan Linked</span>
                  </div>
                  <svg
                    viewBox="0 0 280 96"
                    className="w-full h-28 overflow-visible"
                    aria-label="Thermistor resistance versus temperature curve"
                  >
                    <line x1="10" y1="88" x2="270" y2="88" stroke="#334155" strokeWidth="1" />
                    <polyline fill="none" stroke="#f59e0b" strokeWidth="2.4" points={curvePoints} />
                    <circle
                      cx={markerX}
                      cy={markerY}
                      r="4.5"
                      fill={reading.relayActive ? '#ef4444' : '#10b981'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESK VINYL PLAYER APP INSIDE IPAD */}
        {screenMode === 'player' && (
          <div className="flex-1 flex flex-col min-h-0 rounded-[19px] bg-white text-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-[#FAF9F6] px-4 py-2">
              <button
                type="button"
                onClick={() => setScreenMode('home')}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-stone-100 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tablet Home</span>
              </button>
              <span
                id="tablet-os-title"
                className="text-xs font-semibold text-stone-600"
              >
                Desk Player · Linked to 3D Turntable
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close tablet"
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-zinc-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DeskPlayerView
              tracks={tracks}
              loadingTracks={loadingTracks}
              currentTrackId={currentTrackId}
              isPlaying={vinylPlaying}
              onSelectTrack={onSelectTrack}
              onTogglePlay={onToggleVinylPlay}
              onPrevTrack={onPrevTrack}
              onNextTrack={onNextTrack}
              onAddTrack={onAddTrack}
            />
          </div>
        )}

        {/* Bottom Home Indicator Bar inside Bezel */}
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30">
          <div className="h-1 w-28 rounded-full bg-white/45" />
        </div>
      </div>
    </div>
  );
}
