import test from 'node:test';
import assert from 'node:assert/strict';
import {
  simulateCoolingRig,
  calculateHaulageAndCutoff,
  validateNotebookSubmission,
  validateVinylTrackSubmission,
  formatTrackDuration,
} from './engineeringMath';

test('simulateCoolingRig computes nominal 25C thermistor resistance and keeps relay off', () => {
  const reading = simulateCoolingRig(25, 30);
  assert.equal(reading.resistanceKOhm, 10);
  assert.equal(reading.adcVoltage, 2.5);
  assert.equal(reading.relayActive, false);
  assert.equal(reading.fanRpm, 0);
});

test('simulateCoolingRig trips relay and spins fan above threshold', () => {
  const reading = simulateCoolingRig(38, 30);
  assert.equal(reading.relayActive, true);
  assert.ok(reading.resistanceKOhm < 10);
  assert.ok(reading.adcVoltage > 2.5);
  assert.ok(reading.fanRpm > 1200);
});

test('calculateHaulageAndCutoff computes cycle time, truck count, and cut-off grade', () => {
  const out = calculateHaulageAndCutoff({
    oneWayDistanceKm: 2.4,
    loadedSpeedKmH: 24,
    emptySpeedKmH: 36,
    loadTimeMin: 3,
    spotDumpTimeMin: 1.5,
    truckPayloadTonnes: 100,
    excavatorTargetTph: 1200,
    miningCostPerTonne: 18,
    processingCostPerTonne: 32,
    metalPricePerGram: 65,
    recoveryPct: 90,
  });

  // loadedHaulMin = (2.4/24)*60 = 6.0, emptyReturnMin = (2.4/36)*60 = 4.0
  // totalCycleMin = 3 + 6 + 1.5 + 4 = 14.5
  assert.equal(out.loadedHaulMin, 6);
  assert.equal(out.emptyReturnMin, 4);
  assert.equal(out.totalCycleMin, 14.5);
  assert.ok(out.trucksRequired >= 3);
  // cutoff = 50 / (65 * 0.9) = 0.8547 -> 0.85
  assert.equal(out.breakevenCutoffGpt, 0.85);
});

test('validateNotebookSubmission enforces required fields, length bounds, and spam rules', () => {
  const emptyName = validateNotebookSubmission('   ', '', 'Great portfolio!');
  assert.equal(emptyName.valid, false);

  const tooLong = validateNotebookSubmission('Alex', 'Eng', 'a'.repeat(301));
  assert.equal(tooLong.valid, false);

  const spam = validateNotebookSubmission('Bot', '', 'hello aaaaaaaaaaaa');
  assert.equal(spam.valid, false);

  const valid = validateNotebookSubmission('  Thabo Molefe  ', '  Mining Engineer  ', '  Solid Surpac workflow! ');
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized.name, 'Thabo Molefe');
  assert.equal(valid.sanitized.role, 'Mining Engineer');
  assert.equal(valid.sanitized.message, 'Solid Surpac workflow!');
});

test('validateVinylTrackSubmission enforces HTTPS stream URLs and required metadata', () => {
  const httpRejected = validateVinylTrackSubmission(
    'Water',
    'Tyla',
    'Simangaliso',
    'http://insecure.example.com/song.mp3'
  );
  assert.equal(httpRejected.valid, false);

  const valid = validateVinylTrackSubmission(
    '  Highveld Groove  ',
    '  Black Coffee  ',
    '',
    'https://api.audius.co/v1/tracks/abc/stream?app_name=simangaliso-desk',
    'https://creatornode.audius.co/content/xyz/480x480.jpg',
    'audius'
  );
  assert.equal(valid.valid, true);
  assert.equal(valid.sanitized.title, 'Highveld Groove');
  assert.equal(valid.sanitized.pickedBy, "Visitor's pick");
  assert.equal(valid.sanitized.source, 'audius');
});

test('formatTrackDuration formats full-song durations cleanly', () => {
  assert.equal(formatTrackDuration(undefined), '0:00');
  assert.equal(formatTrackDuration(0), '0:00');
  assert.equal(formatTrackDuration(186), '3:06');
  assert.equal(formatTrackDuration(332.9), '5:32');
});
