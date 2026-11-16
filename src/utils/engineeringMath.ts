export interface ThermistorReading {
  temperatureC: number;
  resistanceKOhm: number;
  adcVoltage: number;
  adcRaw: number;
  relayActive: boolean;
  fanDutyPct: number;
  fanRpm: number;
}

/**
 * Simulates a 10k NTC thermistor (Beta = 3950K) in a 5V voltage divider
 * feeding an Arduino Uno 10-bit ADC, controlling a 5V relay and cooling fan.
 */
export function simulateCoolingRig(
  temperatureC: number,
  thresholdC: number = 30
): ThermistorReading {
  const clampedTemp = Math.max(-10, Math.min(80, temperatureC));
  const r0 = 10000; // 10k Ohm at 25C
  const t0K = 25 + 273.15;
  const beta = 3950;
  const tempK = clampedTemp + 273.15;

  const resistanceOhm = r0 * Math.exp(beta * (1 / tempK - 1 / t0K));
  const resistanceKOhm = Number((resistanceOhm / 1000).toFixed(2));

  // Voltage divider with 10k fixed pull-down resistor at 5.0V
  const vcc = 5.0;
  const rFixed = 10000;
  const adcVoltage = Number(((vcc * rFixed) / (resistanceOhm + rFixed)).toFixed(3));
  const adcRaw = Math.round((adcVoltage / vcc) * 1023);

  const relayActive = clampedTemp >= thresholdC;
  let fanDutyPct = 0;
  if (relayActive) {
    const excess = clampedTemp - thresholdC;
    fanDutyPct = Math.min(100, Math.round(45 + excess * 3.5));
  }
  const fanRpm = relayActive ? Math.round((fanDutyPct / 100) * 2800) : 0;

  return {
    temperatureC: Number(clampedTemp.toFixed(1)),
    resistanceKOhm,
    adcVoltage,
    adcRaw,
    relayActive,
    fanDutyPct,
    fanRpm,
  };
}

export interface HaulageInputs {
  oneWayDistanceKm: number;
  loadedSpeedKmH: number;
  emptySpeedKmH: number;
  loadTimeMin: number;
  spotDumpTimeMin: number;
  truckPayloadTonnes: number;
  excavatorTargetTph: number;
  miningCostPerTonne: number;
  processingCostPerTonne: number;
  metalPricePerGram: number;
  recoveryPct: number;
}

export interface HaulageOutputs {
  loadedHaulMin: number;
  emptyReturnMin: number;
  totalCycleMin: number;
  tripsPerHourPerTruck: number;
  tonnesPerHourPerTruck: number;
  trucksRequired: number;
  breakevenCutoffGpt: number;
}

export function calculateHaulageAndCutoff(inputs: HaulageInputs): HaulageOutputs {
  const dist = Math.max(0.1, inputs.oneWayDistanceKm);
  const loadedSpeed = Math.max(5, inputs.loadedSpeedKmH);
  const emptySpeed = Math.max(5, inputs.emptySpeedKmH);
  const loadTime = Math.max(0.5, inputs.loadTimeMin);
  const dumpTime = Math.max(0.2, inputs.spotDumpTimeMin);
  const payload = Math.max(10, inputs.truckPayloadTonnes);
  const targetTph = Math.max(50, inputs.excavatorTargetTph);

  const loadedHaulMin = (dist / loadedSpeed) * 60;
  const emptyReturnMin = (dist / emptySpeed) * 60;
  const totalCycleMin = loadTime + loadedHaulMin + dumpTime + emptyReturnMin;
  const tripsPerHourPerTruck = 60 / totalCycleMin;
  const tonnesPerHourPerTruck = tripsPerHourPerTruck * payload;
  const trucksRequired = Math.max(1, Math.ceil(targetTph / tonnesPerHourPerTruck));

  const totalOpCost = Math.max(0, inputs.miningCostPerTonne) + Math.max(0, inputs.processingCostPerTonne);
  const recovery = Math.max(0.05, Math.min(1, inputs.recoveryPct / 100));
  const pricePerGram = Math.max(0.1, inputs.metalPricePerGram);
  const breakevenCutoffGpt = totalOpCost / (pricePerGram * recovery);

  return {
    loadedHaulMin: Number(loadedHaulMin.toFixed(2)),
    emptyReturnMin: Number(emptyReturnMin.toFixed(2)),
    totalCycleMin: Number(totalCycleMin.toFixed(2)),
    tripsPerHourPerTruck: Number(tripsPerHourPerTruck.toFixed(2)),
    tonnesPerHourPerTruck: Number(tonnesPerHourPerTruck.toFixed(1)),
    trucksRequired,
    breakevenCutoffGpt: Number(breakevenCutoffGpt.toFixed(2)),
  };
}

export interface NotebookValidationResult {
  valid: boolean;
  error?: string;
  sanitized: {
    name: string;
    role: string;
    message: string;
  };
}

export function validateNotebookSubmission(
  name: string,
  role: string,
  message: string
): NotebookValidationResult {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const cleanRole = role.trim().replace(/\s+/g, ' ');
  const cleanMessage = message.trim();

  if (cleanName.length < 1) {
    return {
      valid: false,
      error: 'Please enter your name before signing the diary.',
      sanitized: { name: cleanName, role: cleanRole, message: cleanMessage },
    };
  }
  if (cleanName.length > 60) {
    return {
      valid: false,
      error: 'Name must be 60 characters or fewer.',
      sanitized: { name: cleanName, role: cleanRole, message: cleanMessage },
    };
  }
  if (cleanRole.length > 80) {
    return {
      valid: false,
      error: 'Role or company must be 80 characters or fewer.',
      sanitized: { name: cleanName, role: cleanRole, message: cleanMessage },
    };
  }
  if (cleanMessage.length < 2) {
    return {
      valid: false,
      error: 'Please write a short note (at least 2 characters).',
      sanitized: { name: cleanName, role: cleanRole, message: cleanMessage },
    };
  }
  if (cleanMessage.length > 300) {
    return {
      valid: false,
      error: 'Message cannot exceed 300 characters.',
      sanitized: { name: cleanName, role: cleanRole, message: cleanMessage },
    };
  }

  // Basic spam guard: repeated identical character runs >= 12 or multiple URLs
  if (/(.)\1{11,}/.test(cleanMessage)) {
    return {
      valid: false,
      error: 'Message looks like repeated-character spam. Please write a real note.',
      sanitized: { name: cleanName, role: cleanRole, message: cleanMessage },
    };
  }
  const urlMatches = cleanMessage.match(/https?:\/\//gi);
  if (urlMatches && urlMatches.length > 1) {
    return {
      valid: false,
      error: 'Multiple external links are not allowed in diary entries.',
      sanitized: { name: cleanName, role: cleanRole, message: cleanMessage },
    };
  }

  return {
    valid: true,
    sanitized: {
      name: cleanName,
      role: cleanRole,
      message: cleanMessage,
    },
  };
}

export type VinylTrackSource = 'audius' | 'direct';

export function formatTrackDuration(seconds: number | undefined): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export interface VinylTrackValidationResult {
  valid: boolean;
  error?: string;
  sanitized: {
    title: string;
    artist: string;
    pickedBy: string;
    streamUrl: string;
    artworkUrl: string;
    source: VinylTrackSource;
  };
}

export function validateVinylTrackSubmission(
  title: string,
  artist: string,
  pickedBy: string,
  streamUrl: string,
  artworkUrl: string = '',
  source: VinylTrackSource = 'direct'
): VinylTrackValidationResult {
  const cleanTitle = title.trim().replace(/\s+/g, ' ').slice(0, 100);
  const cleanArtist = artist.trim().replace(/\s+/g, ' ').slice(0, 80);
  const rawPicker = pickedBy.trim().replace(/\s+/g, ' ');
  const cleanPickedBy = (rawPicker || "Visitor's pick").slice(0, 50);
  const cleanStreamUrl = streamUrl.trim();
  const cleanArtworkUrl = artworkUrl.trim();

  if (cleanTitle.length < 1) {
    return {
      valid: false,
      error: 'Please enter a song title.',
      sanitized: {
        title: cleanTitle,
        artist: cleanArtist,
        pickedBy: cleanPickedBy,
        streamUrl: cleanStreamUrl,
        artworkUrl: cleanArtworkUrl,
        source,
      },
    };
  }
  if (cleanArtist.length < 1) {
    return {
      valid: false,
      error: 'Please enter an artist name.',
      sanitized: {
        title: cleanTitle,
        artist: cleanArtist,
        pickedBy: cleanPickedBy,
        streamUrl: cleanStreamUrl,
        artworkUrl: cleanArtworkUrl,
        source,
      },
    };
  }
  if (
    cleanStreamUrl.length < 8 ||
    cleanStreamUrl.length > 500 ||
    !/^https:\/\/.+/.test(cleanStreamUrl)
  ) {
    return {
      valid: false,
      error: 'Please provide a valid HTTPS audio stream URL (<= 500 characters).',
      sanitized: {
        title: cleanTitle,
        artist: cleanArtist,
        pickedBy: cleanPickedBy,
        streamUrl: cleanStreamUrl,
        artworkUrl: cleanArtworkUrl,
        source,
      },
    };
  }
  if (
    cleanArtworkUrl !== '' &&
    (cleanArtworkUrl.length > 500 || !/^https:\/\/.+/.test(cleanArtworkUrl))
  ) {
    return {
      valid: false,
      error: 'Artwork URL must start with https:// and be 500 characters or fewer.',
      sanitized: {
        title: cleanTitle,
        artist: cleanArtist,
        pickedBy: cleanPickedBy,
        streamUrl: cleanStreamUrl,
        artworkUrl: cleanArtworkUrl,
        source,
      },
    };
  }

  return {
    valid: true,
    sanitized: {
      title: cleanTitle,
      artist: cleanArtist,
      pickedBy: cleanPickedBy,
      streamUrl: cleanStreamUrl,
      artworkUrl: cleanArtworkUrl,
      source,
    },
  };
}

