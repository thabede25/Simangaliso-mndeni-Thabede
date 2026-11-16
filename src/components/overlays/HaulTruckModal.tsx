import { useState } from 'react';
import { X, Truck, Gauge } from 'lucide-react';
import { calculateHaulageAndCutoff, HaulageInputs } from '../../utils/engineeringMath';

interface HaulTruckModalProps {
  onClose: () => void;
}

const DEFAULT_INPUTS: HaulageInputs = {
  oneWayDistanceKm: 2.4,
  loadedSpeedKmH: 22,
  emptySpeedKmH: 36,
  loadTimeMin: 3.0,
  spotDumpTimeMin: 1.5,
  truckPayloadTonnes: 100,
  excavatorTargetTph: 1200,
  miningCostPerTonne: 18,
  processingCostPerTonne: 32,
  metalPricePerGram: 65,
  recoveryPct: 90,
};

export function HaulTruckModal({ onClose }: HaulTruckModalProps) {
  const [inputs, setInputs] = useState<HaulageInputs>(DEFAULT_INPUTS);
  const out = calculateHaulageAndCutoff(inputs);

  const updateField = (key: keyof HaulageInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: Number.isFinite(value) ? value : prev[key],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center sm:justify-start p-4 sm:p-8 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pit-calc-title"
    >
      {/* Ruggedized Off-Highway Cab Operator Display Monitor */}
      <div className="pointer-events-auto w-full max-w-[450px] max-h-[88vh] flex flex-col rounded-2xl border-[7px] border-[#1f2024] ring-2 ring-amber-500/80 bg-[#141519] text-zinc-100 shadow-[0_26px_75px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Industrial Yellow Hazard Top Strip */}
        <div
          aria-hidden="true"
          className="h-1.5 w-full bg-[repeating-linear-gradient(135deg,#eab308_0_12px,#18181b_12px_24px)]"
        />

        {/* Cab Monitor Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-[#1c1d22] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-zinc-950">
              <Truck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="pit-calc-title"
                className="font-[family-name:var(--font-display)] text-base font-semibold text-white"
              >
                Open-Pit Haulage & Cut-Off Calc
              </h2>
              <p className="text-[11px] font-[family-name:var(--font-mono)] text-amber-400">
                CAB VIMS DISPATCH · BED HYDRAULICS ACTIVE
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close haulage calculator"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Calculated Operator Telemetry Gauges */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-zinc-800 bg-[#1c1e24] p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Gauge className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>Total Cycle Time</span>
              </div>
              <div className="mt-1 font-[family-name:var(--font-mono)] text-lg font-bold text-white tabular-nums">
                {out.totalCycleMin.toFixed(1)} min
              </div>
              <div className="font-[family-name:var(--font-mono)] text-[11px] text-zinc-400 tabular-nums">
                {out.tripsPerHourPerTruck.toFixed(2)} trips/hr
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#1c1e24] p-3">
              <div className="text-[11px] text-zinc-400">Trucks Required</div>
              <div className="mt-1 font-[family-name:var(--font-mono)] text-lg font-bold text-amber-400 tabular-nums">
                {out.trucksRequired} units
              </div>
              <div className="font-[family-name:var(--font-mono)] text-[11px] text-zinc-400 tabular-nums">
                {out.tonnesPerHourPerTruck} t/h each
              </div>
            </div>
            <div className="col-span-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-300">Breakeven Cut-Off Grade</div>
                <div className="text-[11px] font-[family-name:var(--font-mono)] text-amber-200/75">
                  (Mining + Processing) / (Price × Recovery)
                </div>
              </div>
              <div className="font-[family-name:var(--font-mono)] text-lg font-bold text-amber-300 tabular-nums">
                {out.breakevenCutoffGpt.toFixed(2)} g/t
              </div>
            </div>
          </div>

          {/* Haulage Parameters */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider font-[family-name:var(--font-mono)] text-zinc-400">
              Haulage Fleet Inputs
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="block text-zinc-400">One-way Haul (km)</span>
                <input
                  type="number"
                  step="0.2"
                  min="0.2"
                  max="20"
                  value={inputs.oneWayDistanceKm}
                  onChange={(e) => updateField('oneWayDistanceKm', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-zinc-400">Payload (tonnes)</span>
                <input
                  type="number"
                  step="10"
                  min="20"
                  max="400"
                  value={inputs.truckPayloadTonnes}
                  onChange={(e) => updateField('truckPayloadTonnes', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-zinc-400">Loaded Speed (km/h)</span>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="60"
                  value={inputs.loadedSpeedKmH}
                  onChange={(e) => updateField('loadedSpeedKmH', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-zinc-400">Target Shovel (t/h)</span>
                <input
                  type="number"
                  step="100"
                  min="200"
                  max="6000"
                  value={inputs.excavatorTargetTph}
                  onChange={(e) => updateField('excavatorTargetTph', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* Cut-Off Economics Parameters */}
          <div className="space-y-2.5 border-t border-zinc-800 pt-3.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider font-[family-name:var(--font-mono)] text-zinc-400">
              Cut-Off Economics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="block text-zinc-400">Mining Cost ($/t)</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={inputs.miningCostPerTonne}
                  onChange={(e) => updateField('miningCostPerTonne', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-zinc-400">Processing ($/t)</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={inputs.processingCostPerTonne}
                  onChange={(e) => updateField('processingCostPerTonne', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-zinc-400">Metal Price ($/g)</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={inputs.metalPricePerGram}
                  onChange={(e) => updateField('metalPricePerGram', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-zinc-400">Recovery (%)</span>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="100"
                  value={inputs.recoveryPct}
                  onChange={(e) => updateField('recoveryPct', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-[#0d0e11] px-2.5 py-1.5 text-white font-[family-name:var(--font-mono)] tabular-nums focus:border-amber-500 focus:outline-none"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
