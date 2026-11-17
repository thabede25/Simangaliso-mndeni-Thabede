import type { DeskFocusId } from '../data/portfolioData';

export type LightingMode = 'day' | 'golden-hour' | 'night';

export interface LightingPreset {
  id: LightingMode;
  label: string;
  shortLabel: string;
  backgroundHex: string;
  fogHex: string;
  fogNear: number;
  fogFar: number;
  environmentIntensity: number;
  toneMappingExposure: number;
  hemiSkyHex: string;
  hemiGroundHex: string;
  hemiIntensity: number;
  keyPos: [number, number, number];
  keyColorHex: string;
  keyIntensity: number;
  fillPos: [number, number, number];
  fillColorHex: string;
  fillIntensity: number;
  lampDefaultOn: boolean;
  lampLightIntensity: number;
  lampLightColorHex: string;
  wallColorHex: string;
  floorColorHex: string;
}

export const LIGHTING_MODES: readonly LightingMode[] = ['day', 'golden-hour', 'night'];

export const LIGHTING_PRESETS: Record<LightingMode, LightingPreset> = {
  day: {
    id: 'day',
    label: 'Daylight Studio',
    shortLabel: 'Day',
    backgroundHex: '#EFECE6',
    fogHex: '#EFECE6',
    fogNear: 10,
    fogFar: 24,
    environmentIntensity: 0.72,
    toneMappingExposure: 1.02,
    hemiSkyHex: '#eef4fc',
    hemiGroundHex: '#b49576',
    hemiIntensity: 0.7,
    keyPos: [3.8, 6.5, 4.6],
    keyColorHex: '#fff4e2',
    keyIntensity: 1.48,
    fillPos: [-4.4, 3.4, -3.2],
    fillColorHex: '#dbeafe',
    fillIntensity: 0.56,
    lampDefaultOn: true,
    lampLightIntensity: 1.15,
    lampLightColorHex: '#fde68a',
    wallColorHex: '#efece6',
    floorColorHex: '#e6e1d7',
  },
  'golden-hour': {
    id: 'golden-hour',
    label: 'Golden Hour',
    shortLabel: 'Golden',
    backgroundHex: '#E9DDD0',
    fogHex: '#E9DDD0',
    fogNear: 9,
    fogFar: 22,
    environmentIntensity: 0.56,
    toneMappingExposure: 1.06,
    hemiSkyHex: '#fde4c8',
    hemiGroundHex: '#7c5338',
    hemiIntensity: 0.52,
    keyPos: [5.4, 2.85, 3.8],
    keyColorHex: '#ffbe7b',
    keyIntensity: 1.82,
    fillPos: [-4.2, 3.6, -2.8],
    fillColorHex: '#93c5fd',
    fillIntensity: 0.48,
    lampDefaultOn: true,
    lampLightIntensity: 2.35,
    lampLightColorHex: '#fbbf24',
    wallColorHex: '#eadfd2',
    floorColorHex: '#dcd0c1',
  },
  night: {
    id: 'night',
    label: 'Night Workshop',
    shortLabel: 'Night',
    backgroundHex: '#151923',
    fogHex: '#151923',
    fogNear: 8.5,
    fogFar: 20,
    environmentIntensity: 0.28,
    toneMappingExposure: 1.0,
    hemiSkyHex: '#3b4e73',
    hemiGroundHex: '#1f1914',
    hemiIntensity: 0.32,
    keyPos: [3.6, 5.8, 4.2],
    keyColorHex: '#8ab4f8',
    keyIntensity: 0.45,
    fillPos: [-4.4, 3.4, -3.2],
    fillColorHex: '#475569',
    fillIntensity: 0.28,
    lampDefaultOn: true,
    lampLightIntensity: 3.4,
    lampLightColorHex: '#fcd34d',
    wallColorHex: '#1c2230',
    floorColorHex: '#121620',
  },
};

export function isLightingMode(value: unknown): value is LightingMode {
  return value === 'day' || value === 'golden-hour' || value === 'night';
}

export function cycleLightingMode(current: LightingMode): LightingMode {
  const idx = LIGHTING_MODES.indexOf(current);
  return LIGHTING_MODES[(idx + 1) % LIGHTING_MODES.length];
}

export const DESK_SHORTCUT_MAP: Record<string, DeskFocusId> = {
  '0': 'overview',
  '1': 'laptop',
  '2': 'tablet',
  '3': 'phone',
  '4': 'truck',
  '5': 'diary',
  '6': 'vinyl',
  '7': 'blueprint',
};
