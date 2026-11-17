import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Briefcase,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { DeskFocusId, SIMANGALISO_PROFILE } from '../../data/portfolioData';
import { LIGHTING_PRESETS, LightingMode } from '../../types/scene';

interface DeskHudProps {
  activeFocus: DeskFocusId;
  onSelectFocus: (focus: DeskFocusId) => void;
  onOpenDrawer: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  lightingMode: LightingMode;
  onCycleLighting: () => void;
}

const FOCUS_PILLS: { id: DeskFocusId; label: string; shortcut: string }[] = [
  { id: 'laptop', label: 'Laptop — My projects', shortcut: '1' },
  { id: 'tablet', label: 'Tablet — Hardware & sensors', shortcut: '2' },
  { id: 'phone', label: 'Phone — AI chat', shortcut: '3' },
  { id: 'truck', label: 'Haul Truck — Pit calc', shortcut: '4' },
  { id: 'diary', label: 'Write in my diary', shortcut: '5' },
  { id: 'vinyl', label: 'Vinyl Player — Desk music', shortcut: '6' },
  { id: 'blueprint', label: "See how it's made", shortcut: '7' },
];

export function DeskHud({
  activeFocus,
  onSelectFocus,
  onOpenDrawer,
  soundEnabled,
  onToggleSound,
  lightingMode,
  onCycleLighting,
}: DeskHudProps) {
  const [bioExpanded, setBioExpanded] = useState(true);

  const isOverview = activeFocus === 'overview';
  const lightingPreset = LIGHTING_PRESETS[lightingMode];
  const LightingIcon =
    lightingMode === 'day' ? Sun : lightingMode === 'golden-hour' ? Sunset : Moon;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-5">
      {/* Top Row: Left Intro Card + Right Action Controls */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-start justify-between gap-2.5 sm:gap-4">
        {/* Top-Left Intro Card (compacts cleanly when zoomed into an object so overlays never collide) */}
        <section
          aria-label="Introduction"
          className={`pointer-events-auto rounded-2xl border border-stone-300 bg-[#FAF8F4] shadow-sm ${
            isOverview ? 'w-full sm:max-w-[308px] px-3.5 py-2.5 sm:py-3' : 'self-start px-4 py-2.5'
          }`}
        >
          <h1
            className={`font-[family-name:var(--font-display)] font-bold tracking-tight text-zinc-900 leading-tight ${
              isOverview ? 'text-lg sm:text-[21px]' : 'text-base sm:text-lg'
            }`}
          >
            {SIMANGALISO_PROFILE.headline}
          </h1>

          {isOverview && (
            <>
              <p className="mt-1 text-xs sm:text-[12.5px] font-medium leading-snug text-zinc-800">
                {SIMANGALISO_PROFILE.subhead}
              </p>

              {bioExpanded && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-stone-600 hidden sm:block">
                  {SIMANGALISO_PROFILE.bio}
                </p>
              )}

              <div className="mt-1.5 flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setBioExpanded((prev) => !prev)}
                  aria-expanded={bioExpanded}
                  className="hidden sm:inline-flex items-center gap-1 text-[11.5px] font-medium text-amber-800 hover:text-amber-950 whitespace-nowrap cursor-pointer"
                >
                  <span>{bioExpanded ? 'Hide bio' : 'Read full bio'}</span>
                  {bioExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  className="text-[11.5px] font-medium text-stone-700 hover:text-zinc-950 underline underline-offset-2 whitespace-nowrap cursor-pointer"
                >
                  View all work & contact
                </button>
              </div>
            </>
          )}
        </section>

        {/* Top-Right Controls */}
        <div className="pointer-events-auto flex items-center justify-end gap-2 shrink-0 flex-wrap">
          {activeFocus !== 'overview' && (
            <button
              type="button"
              onClick={() => onSelectFocus('overview')}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-[#FAF8F4] px-3.5 py-2 text-xs font-semibold text-zinc-900 shadow-xs hover:bg-white cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to the desk</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCycleLighting}
            aria-label={`Studio lighting: ${lightingPreset.label}. Click or press L to switch`}
            title={`Lighting: ${lightingPreset.label} (L)`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-[#FAF8F4] px-3 py-2 text-xs font-semibold text-zinc-900 shadow-xs hover:bg-white cursor-pointer whitespace-nowrap"
          >
            <LightingIcon className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
            <span>{lightingPreset.shortLabel}</span>
          </button>

          <button
            type="button"
            onClick={onOpenDrawer}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-[#FAF8F4] px-3.5 py-2 text-xs font-semibold text-zinc-900 shadow-xs hover:bg-white cursor-pointer whitespace-nowrap"
          >
            <Briefcase className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
            <span>My Work & Contact</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Mute desk sound effects' : 'Enable desk sound effects'}
            title="Toggle desk sound (M)"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 bg-[#FAF8F4] text-zinc-800 shadow-xs hover:bg-white cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-amber-700" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 text-stone-500" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Quick-Focus Pill Bar */}
      <nav
        aria-label="Open a desk object"
        className="pointer-events-auto mx-auto max-w-full rounded-2xl border border-stone-300 bg-[#FAF8F4] p-1.5 shadow-lg overflow-x-auto"
      >
        <div className="flex items-center gap-1">
          {FOCUS_PILLS.map((pill) => {
            const active = activeFocus === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onSelectFocus(pill.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-stone-700 hover:bg-stone-200/70 hover:text-zinc-950'
                }`}
              >
                <kbd
                  className={`hidden lg:inline-block rounded px-1 py-0.5 font-[family-name:var(--font-mono)] text-[10px] leading-none ${
                    active ? 'bg-zinc-700 text-stone-200' : 'bg-stone-200/80 text-stone-600'
                  }`}
                >
                  {pill.shortcut}
                </kbd>
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
