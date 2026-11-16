import { useState } from 'react';
import { X, Box, Cpu, Database, Sparkles, Compass, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

type ModalTab = 'cad' | 'architecture';
type CadDrawingId = 'pit-section' | 'dmc-cyclone' | 'cooling-schematic';

const STACK_LAYERS = [
  {
    icon: Box,
    title: '3D Spatial Scene — React Three Fiber & Three.js',
    details:
      'Built declaratively with @react-three/fiber and @react-three/drei. Desk hardware uses beveled ExtrudeGeometry slabs, LatheGeometry ceramics & shades, TubeGeometry jumper wires, an InstancedMesh MacBook keyboard, RoomEnvironment studio IBL, ACES Filmic tone mapping, and damped camera tweening.',
  },
  {
    icon: Sparkles,
    title: 'Conversational AI — Express + Gemini API',
    details:
      'The smartphone AI chat calls a server-side Express route (/api/chat) backed by the @google/genai SDK (gemini-4-hydrogen) grounded on Simangaliso’s Wits Mining Engineering projects, Python automation scripts, and underground vac experience.',
  },
  {
    icon: Database,
    title: 'Real-Time Persistence — Cloud Firestore',
    details:
      'The hardcover field diary streams live visitor signatures from the notebook_entries collection using onSnapshot ordered by serverTimestamp(), guarded by strict schema validation and Firestore security rules.',
  },
  {
    icon: Cpu,
    title: 'Live Engineering Simulators — Pure TypeScript Models',
    details:
      'The cooling lab implements the Steinhart-Hart / Beta-parameter 10k NTC thermistor equation driving the 3D fan rotor on the desk, while the haul truck computes open-pit fleet cycle times and breakeven cut-off grades in real time.',
  },
];

const CAD_SHEETS: {
  id: CadDrawingId;
  dwgNo: string;
  title: string;
  software: string;
  scale: string;
}[] = [
  {
    id: 'pit-section',
    dwgNo: 'DWG MNE-304-01',
    title: 'Open-Pit Bench & Li₂O Orebody Section A-A',
    software: 'GEOVIA Surpac / Whittle',
    scale: '1:250',
  },
  {
    id: 'dmc-cyclone',
    dwgNo: 'DWG MNE-304-02',
    title: 'Dense Medium Cyclone (DMC) Assembly',
    software: 'Siemens Solid Edge',
    scale: '1:20',
  },
  {
    id: 'cooling-schematic',
    dwgNo: 'DWG MNE-304-03',
    title: 'NTC Thermistor & 5V Relay Control Schematic',
    software: 'Embedded CAD / Arduino Uno',
    scale: 'NTS',
  },
];

function CadDrawingCanvas({ activeSheet }: { activeSheet: CadDrawingId }) {
  if (activeSheet === 'pit-section') {
    return (
      <svg
        viewBox="0 0 820 460"
        className="w-full h-auto rounded-lg border border-blue-900/30 bg-[#F8F6EF]"
        role="img"
        aria-label="Open-pit bench geometry and lithium pegmatite orebody CAD cross-section"
      >
        <defs>
          <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e40af" strokeOpacity="0.08" strokeWidth="0.7" />
          </pattern>
          <pattern id="oreHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#b45309" strokeOpacity="0.55" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="820" height="460" fill="url(#cadGrid)" />
        <rect x="14" y="14" width="792" height="432" fill="none" stroke="#1e3a8a" strokeWidth="2.2" />
        <rect x="20" y="20" width="780" height="420" fill="none" stroke="#1e3a8a" strokeWidth="0.8" />

        <text x="34" y="46" fill="#1e3a8a" fontSize="13" fontWeight="700" fontFamily="monospace">
          SECTION A-A: WHITTLE PIT SHELL #12 &amp; PEGMATITE OREBODY ENVELOPE
        </text>

        {/* Pit crest dimension line */}
        <line x1="120" y1="78" x2="620" y2="78" stroke="#1e3a8a" strokeWidth="1.2" />
        <line x1="120" y1="70" x2="120" y2="108" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="620" y1="70" x2="620" y2="108" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="3 3" />
        <text x="240" y="72" fill="#1e3a8a" fontSize="11" fontWeight="600" fontFamily="monospace">
          PIT CREST SPAN: 285.0 m | OVERALL SLOPE: 45.0°
        </text>

        {/* Stepped Open-Pit Benches */}
        <polyline
          points="55,108 120,108 148,156 202,156 230,204 284,204 312,252 428,252 456,204 510,204 538,156 592,156 620,108 730,108"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.4"
        />

        {/* 10% Haul Ramp Notch Callout */}
        <rect x="202" y="148" width="28" height="8" fill="#fef3c7" stroke="#b45309" strokeWidth="1.2" />
        <text x="58" y="142" fill="#0f172a" fontSize="10" fontFamily="monospace">
          BENCH H = 10.0m
        </text>
        <text x="58" y="156" fill="#1e3a8a" fontSize="10" fontFamily="monospace">
          BERM W = 6.5m
        </text>
        <text x="58" y="170" fill="#b45309" fontSize="10" fontFamily="monospace">
          HAUL RAMP 10%
        </text>

        {/* Orebody Solid Wireframe */}
        <polygon
          points="290,192 440,182 475,316 318,332"
          fill="url(#oreHatch)"
          stroke="#b45309"
          strokeWidth="2"
        />
        <text x="308" y="352" fill="#92400e" fontSize="11" fontWeight="700" fontFamily="monospace">
          Li2O ORE ZONE (1.34% AVG · KRIGED 10×10×5m)
        </text>

        {/* Diamond Drillholes */}
        <line x1="255" y1="108" x2="345" y2="338" stroke="#dc2626" strokeWidth="1.3" strokeDasharray="6 3" />
        <line x1="370" y1="68" x2="370" y2="335" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="10 3 2 3" />
        <line x1="500" y1="108" x2="415" y2="330" stroke="#dc2626" strokeWidth="1.3" strokeDasharray="6 3" />
        <text x="520" y="255" fill="#dc2626" fontSize="10" fontFamily="monospace">
          DDH-01 / 02 / 03 (2.0m COMP.)
        </text>

        {/* ISO Title Block */}
        <rect x="462" y="362" width="332" height="72" fill="#f1ede2" stroke="#1e3a8a" strokeWidth="1.6" />
        <line x1="462" y1="386" x2="794" y2="386" stroke="#1e3a8a" strokeWidth="1.2" />
        <line x1="650" y1="386" x2="650" y2="434" stroke="#1e3a8a" strokeWidth="1.2" />
        <text x="474" y="378" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="monospace">
          WITS MINING ENG · LITHIUM RESOURCE MODEL
        </text>
        <text x="474" y="404" fill="#1e3a8a" fontSize="10" fontFamily="monospace">
          ENG: S. M. THABEDE
        </text>
        <text x="474" y="422" fill="#1e3a8a" fontSize="10" fontFamily="monospace">
          SOFTWARE: SURPAC / WHITTLE
        </text>
        <text x="662" y="404" fill="#0f172a" fontSize="10" fontFamily="monospace">
          SCALE: 1:250
        </text>
        <text x="662" y="422" fill="#0f172a" fontSize="10" fontFamily="monospace">
          DWG: MNE-304-01
        </text>
      </svg>
    );
  }

  if (activeSheet === 'dmc-cyclone') {
    return (
      <svg
        viewBox="0 0 820 460"
        className="w-full h-auto rounded-lg border border-blue-900/30 bg-[#F8F6EF]"
        role="img"
        aria-label="Solid Edge orthographic CAD drawing of a Dense Medium Cyclone assembly"
      >
        <defs>
          <pattern id="cadGridDmc" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e40af" strokeOpacity="0.08" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="820" height="460" fill="url(#cadGridDmc)" />
        <rect x="14" y="14" width="792" height="432" fill="none" stroke="#1e3a8a" strokeWidth="2.2" />
        <rect x="20" y="20" width="780" height="420" fill="none" stroke="#1e3a8a" strokeWidth="0.8" />

        <text x="34" y="46" fill="#1e3a8a" fontSize="13" fontWeight="700" fontFamily="monospace">
          SASOLBURG COAL PREP PLANT: Ø650mm DENSE MEDIUM CYCLONE ASSEMBLY
        </text>

        {/* Cyclone Body */}
        <polygon
          points="260,115 390,115 390,198 342,356 308,356 260,198"
          fill="#e0f2fe"
          fillOpacity="0.35"
          stroke="#0f172a"
          strokeWidth="2.4"
        />
        {/* Vortex Finder & Overflow */}
        <rect x="305" y="72" width="40" height="84" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
        {/* Tangential Feed Inlet */}
        <rect x="176" y="128" width="84" height="34" fill="#fef3c7" stroke="#0f172a" strokeWidth="2" />
        {/* Apex / Underflow Spigot */}
        <rect x="308" y="356" width="34" height="26" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
        {/* Flange bolts */}
        <line x1="252" y1="198" x2="398" y2="198" stroke="#0f172a" strokeWidth="3" />
        {/* Center Axis */}
        <line x1="325" y1="58" x2="325" y2="404" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="10 3 2 3" />

        {/* Annotations */}
        <text x="54" y="142" fill="#1e3a8a" fontSize="11" fontWeight="600" fontFamily="monospace">
          ROM FEED (-50mm + 1mm)
        </text>
        <text x="54" y="158" fill="#b45309" fontSize="10" fontFamily="monospace">
          + MAGNETITE MED (RD 1.55)
        </text>
        <text x="364" y="88" fill="#059669" fontSize="11" fontWeight="600" fontFamily="monospace">
          OVERFLOW: CLEAN COAL (LOW ASH)
        </text>
        <text x="364" y="372" fill="#dc2626" fontSize="11" fontWeight="600" fontFamily="monospace">
          UNDERFLOW: HIGH-ASH DISCARD
        </text>

        {/* Mass Balance Box */}
        <rect x="462" y="150" width="318" height="145" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.4" />
        <text x="478" y="176" fill="#1e3a8a" fontSize="11.5" fontWeight="700" fontFamily="monospace">
          STREAM MASS BALANCE SPECIFICATION
        </text>
        <text x="478" y="204" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
          • Feed Top Size: 50 mm ROM
        </text>
        <text x="478" y="226" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
          • Cut Density (RD50): 1.55 g/cm³
        </text>
        <text x="478" y="248" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
          • Magnetite Loss: &lt; 0.50 kg/t
        </text>
        <text x="478" y="270" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
          • Fines Circuit: Spirals (-1 mm)
        </text>

        {/* ISO Title Block */}
        <rect x="462" y="362" width="332" height="72" fill="#f1ede2" stroke="#1e3a8a" strokeWidth="1.6" />
        <line x1="462" y1="386" x2="794" y2="386" stroke="#1e3a8a" strokeWidth="1.2" />
        <line x1="650" y1="386" x2="650" y2="434" stroke="#1e3a8a" strokeWidth="1.2" />
        <text x="474" y="378" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="monospace">
          COAL BENEFICIATION · DMC SECTION
        </text>
        <text x="474" y="404" fill="#1e3a8a" fontSize="10" fontFamily="monospace">
          ENG: S. M. THABEDE
        </text>
        <text x="474" y="422" fill="#1e3a8a" fontSize="10" fontFamily="monospace">
          SOFTWARE: SOLID EDGE CAD
        </text>
        <text x="662" y="404" fill="#0f172a" fontSize="10" fontFamily="monospace">
          SCALE: 1:20
        </text>
        <text x="662" y="422" fill="#0f172a" fontSize="10" fontFamily="monospace">
          DWG: MNE-304-02
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 820 460"
      className="w-full h-auto rounded-lg border border-blue-900/30 bg-[#F8F6EF]"
      role="img"
      aria-label="Arduino Uno NTC thermistor and 5V relay evaporative cooling schematic"
    >
      <defs>
        <pattern id="cadGridElec" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e40af" strokeOpacity="0.08" strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="820" height="460" fill="url(#cadGridElec)" />
      <rect x="14" y="14" width="792" height="432" fill="none" stroke="#1e3a8a" strokeWidth="2.2" />
      <rect x="20" y="20" width="780" height="420" fill="none" stroke="#1e3a8a" strokeWidth="0.8" />

      <text x="34" y="46" fill="#1e3a8a" fontSize="13" fontWeight="700" fontFamily="monospace">
        SCHEMATIC: ARDUINO UNO R3 EVAPORATIVE COOLING CONTROLLER
      </text>

      {/* Thermistor Divider Block */}
      <rect x="58" y="108" width="190" height="200" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
      <text x="74" y="132" fill="#1e3a8a" fontSize="11" fontWeight="700" fontFamily="monospace">
        NTC DIVIDER (10 kΩ)
      </text>
      <text x="82" y="164" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
        +5V ──[ R_REF 10k ]──┐
      </text>
      <text x="82" y="196" fill="#b45309" fontSize="10.5" fontFamily="monospace">
        PIN A0 ◀─────────────┤
      </text>
      <text x="82" y="228" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
        GND ──[ NTC β=3950 ]─┘
      </text>
      <text x="74" y="276" fill="#475569" fontSize="9.5" fontFamily="monospace">
        T = 1/(1/T0 + ln(R/R0)/β)
      </text>

      {/* Wiring to Arduino */}
      <line x1="248" y1="192" x2="322" y2="192" stroke="#d97706" strokeWidth="2.5" />
      <text x="262" y="184" fill="#b45309" fontSize="10" fontFamily="monospace">
        ADC A0
      </text>

      {/* Arduino Uno Block */}
      <rect x="322" y="108" width="196" height="200" fill="#cffafe" fillOpacity="0.45" stroke="#0e7490" strokeWidth="2.2" />
      <text x="352" y="136" fill="#0e7490" fontSize="12" fontWeight="700" fontFamily="monospace">
        ARDUINO UNO R3
      </text>
      <text x="342" y="172" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
        ATmega328P · 10-bit ADC
      </text>
      <text x="342" y="204" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
        Hysteresis: ±0.8 °C
      </text>
      <text x="342" y="236" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
        D7 OUTPUT ──▶ RELAY IN
      </text>

      {/* Wiring to Relay */}
      <line x1="518" y1="232" x2="588" y2="232" stroke="#16a34a" strokeWidth="2.5" />
      <text x="530" y="224" fill="#15803d" fontSize="10" fontFamily="monospace">
        D7 SIG
      </text>

      {/* 5V Relay + Fan */}
      <rect x="588" y="108" width="184" height="200" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
      <text x="606" y="132" fill="#0284c7" fontSize="11" fontWeight="700" fontFamily="monospace">
        5V RELAY &amp; BLOWER
      </text>
      <text x="606" y="172" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
        COIL: 5V DC SPDT
      </text>
      <text x="606" y="204" fill="#0f172a" fontSize="10.5" fontFamily="monospace">
        COM ──▶ +5V RAIL
      </text>
      <text x="606" y="236" fill="#dc2626" fontSize="10.5" fontFamily="monospace">
        NO ───▶ 5V FAN (+)
      </text>
      <text x="606" y="268" fill="#475569" fontSize="10" fontFamily="monospace">
        STATUS LED (TRIP)
      </text>

      {/* ISO Title Block */}
      <rect x="462" y="362" width="332" height="72" fill="#f1ede2" stroke="#1e3a8a" strokeWidth="1.6" />
      <line x1="462" y1="386" x2="794" y2="386" stroke="#1e3a8a" strokeWidth="1.2" />
      <line x1="650" y1="386" x2="650" y2="434" stroke="#1e3a8a" strokeWidth="1.2" />
      <text x="474" y="378" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="monospace">
        MINE DESIGN LAB · COOLING RIG
      </text>
      <text x="474" y="404" fill="#1e3a8a" fontSize="10" fontFamily="monospace">
        ENG: S. M. THABEDE
      </text>
      <text x="474" y="422" fill="#1e3a8a" fontSize="10" fontFamily="monospace">
        HARDWARE: ARDUINO / NTC
      </text>
      <text x="662" y="404" fill="#0f172a" fontSize="10" fontFamily="monospace">
        SCALE: NTS
      </text>
      <text x="662" y="422" fill="#0f172a" fontSize="10" fontFamily="monospace">
        DWG: MNE-304-03
      </text>
    </svg>
  );
}

export function ArchitectureModal({ onClose }: ArchitectureModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('cad');
  const [activeSheet, setActiveSheet] = useState<CadDrawingId>('pit-section');

  const currentMeta = CAD_SHEETS.find((s) => s.id === activeSheet) ?? CAD_SHEETS[0];

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center pt-16 pb-20 px-4 sm:px-6 bg-zinc-950/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="architecture-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Drafting Board & Pinned Vellum Blueprint Sheet */}
      <div className="relative w-full max-w-3xl max-h-[78vh] flex flex-col rounded-xl border-[6px] border-[#d6d0c4] ring-2 ring-zinc-500/60 bg-[#F8F6EF] text-zinc-900 shadow-[0_28px_80px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Corner Drafting Masking Tape Accents */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-2 -left-4 w-12 h-5 bg-amber-200/75 -rotate-45 z-20 border-y border-amber-300/60" />
        <div aria-hidden="true" className="pointer-events-none absolute -top-2 -right-4 w-12 h-5 bg-amber-200/75 rotate-45 z-20 border-y border-amber-300/60" />

        <div className="flex items-center justify-between gap-3 border-b border-blue-900/20 bg-[#EDF1F7] px-5 py-3.5">
          <div>
            <h2
              id="architecture-modal-title"
              className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-900"
            >
              CAD Drawings &amp; Architecture
            </h2>
            <p className="text-xs font-[family-name:var(--font-mono)] text-blue-900/80">
              Solid Edge / Surpac CAD Schematics · React Three Fiber · Gemini API · Cloud Firestore
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close architecture modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 bg-white text-zinc-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div
          role="tablist"
          aria-label="CAD and architecture views"
          className="flex items-center gap-2 border-b border-stone-200 bg-[#F3EFE8] px-5 py-2.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cad'}
            onClick={() => setActiveTab('cad')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              activeTab === 'cad'
                ? 'bg-zinc-900 text-white'
                : 'text-stone-700 hover:bg-stone-200/70'
            }`}
          >
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Engineering CAD Drawings</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'architecture'}
            onClick={() => setActiveTab('architecture')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-zinc-900 text-white'
                : 'text-stone-700 hover:bg-stone-200/70'
            }`}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            <span>How This 3D Desk Is Made</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === 'cad' ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {CAD_SHEETS.map((sheet) => {
                  const selected = sheet.id === activeSheet;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => setActiveSheet(sheet.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                        selected
                          ? 'border-blue-900 bg-blue-950 text-white'
                          : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {sheet.dwgNo} · {sheet.title.split(':')[0]}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-stone-600">
                  <span className="font-semibold text-zinc-900">{currentMeta.title}</span>
                  <span className="font-[family-name:var(--font-mono)] text-[11px]">
                    {currentMeta.software} · Scale {currentMeta.scale}
                  </span>
                </div>
                <CadDrawingCanvas activeSheet={activeSheet} />
              </div>
            </>
          ) : (
            <div className="space-y-3.5">
              {STACK_LAYERS.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div
                    key={layer.title}
                    className="rounded-xl border border-stone-200 bg-white p-4 space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <Icon className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
                      <h3>{layer.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-700">{layer.details}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
