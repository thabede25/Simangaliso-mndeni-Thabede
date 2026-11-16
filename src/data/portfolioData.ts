export type DeskFocusId =
  | 'overview'
  | 'laptop'
  | 'tablet'
  | 'phone'
  | 'truck'
  | 'diary'
  | 'vinyl'
  | 'blueprint';

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  category: string;
  year: string;
  tools: string[];
  summary: string;
  technicalHighlights: string[];
  metrics: { label: string; value: string }[];
  codeOrModelNote: string;
}

export const SIMANGALISO_PROFILE = {
  headline: "Hi, I'm Simangaliso.",
  subhead:
    'I build the engineering models, Python automations, and hardware prototypes operations run on. Everything on this desk is real and running.',
  bio: "I'm Simangaliso Mndeni Thabede, a 3rd-year Mining Engineering student at Wits University in Johannesburg with practical underground experience at Murray & Roberts Cementation and Sibanye-Stillwater. Proficient in GEOVIA Surpac, Whittle, Datamine Studio RM, Solid Edge, Data Blast Ignite, and Python.",
  contact: {
    emails: ['2883076@students.wits.ac.za', 'mndenithabede2@gmail.com'],
    phoneDisplay: '078 439 2669',
    whatsappUrl: 'https://wa.me/27784392669',
    location: 'Johannesburg, South Africa',
    university: 'University of the Witwatersrand (Wits)',
  },
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'lithium-block-model',
    index: '01',
    title: 'Lithium Orebody 3D Block Model',
    shortTitle: 'Lithium Block Model',
    category: 'Resource Estimation',
    year: 'Wits Mine Design',
    tools: ['GEOVIA Surpac', 'Whittle', 'Datamine Studio RM', 'Ordinary Kriging'],
    summary:
      'Full 3D pegmatite lithium deposit resource estimation framework built in GEOVIA Surpac, bridging drillhole compositing, variography, block grade interpolation, and Whittle pit shell optimization.',
    technicalHighlights: [
      'Validated collar, survey, and Li2O assay drillhole databases with 2.0m downhole compositing.',
      'Constructed solid wireframe orebody envelopes and sub-blocked parent cells (10m × 10m × 5m) to preserve hanging-wall contact resolution.',
      'Generated experimental omni-directional and directional variograms to parameterize Ordinary Kriging estimation.',
      'Exported block model CSVs into Whittle for Lerchs-Grossmann ultimate pit shell sensitivity across lithium price scenarios.',
    ],
    metrics: [
      { label: 'Parent Block Size', value: '10 × 10 × 5 m' },
      { label: 'Composite Length', value: '2.0 m' },
      { label: 'Estimation Method', value: 'Ordinary Kriging' },
      { label: 'Optimization', value: 'Whittle LG Pit' },
    ],
    codeOrModelNote:
      'SURPAC MACRO // composite_li2o.tcl -> krige_pegmatite.blk -> whittle_export.csv (Li2O cutoff >= 0.65%)',
  },
  {
    id: 'cooling-rig',
    index: '02',
    title: 'Mine Design Lab Evaporative Cooling Rig',
    shortTitle: 'Evaporative Cooling Rig',
    category: 'Embedded Hardware',
    year: 'Lab Prototype',
    tools: ['Arduino Uno', 'NTC Thermistor', '5V Relay Module', '5V DC Fan', 'C++'],
    summary:
      'Closed-loop mine ventilation & localized evaporative cooling test rig using an Arduino Uno, 10kΩ NTC thermistor voltage divider, relay driver, and active 5V blower fan.',
    technicalHighlights: [
      'Calibrated Beta-parameter Steinhart-Hart curve for real-time dry-bulb temperature sensing via 10-bit ADC.',
      'Implemented relay hysteresis switching to eliminate contact chatter around thermal setpoints.',
      'Built compact desk-top test ducting to measure wet-bulb/dry-bulb delta across saturated cooling media.',
    ],
    metrics: [
      { label: 'Controller', value: 'Arduino Uno R3' },
      { label: 'Sensor', value: '10 kΩ NTC (β=3950)' },
      { label: 'Trip Setpoint', value: '30.0 °C' },
      { label: 'Actuation', value: '5V Relay + Fan' },
    ],
    codeOrModelNote:
      'double tempK = 1.0 / ((1.0 / T0) + (1.0 / BETA) * log(rNtc / R0)); if (tempC >= THRESHOLD) digitalWrite(RELAY_PIN, HIGH);',
  },
  {
    id: 'sasolburg-coal-plant',
    index: '03',
    title: 'Sasolburg Coal Preparation Plant',
    shortTitle: 'Sasolburg Coal Plant',
    category: 'Mineral Processing',
    year: 'Process Design',
    tools: ['Process Flowsheeting', 'Mass Balance', 'Solid Edge', 'Dense Medium Separation'],
    summary:
      'Process flowsheet engineering and multi-stage mass/water balance evaluation for a high-throughput coal beneficiation circuit serving Sasolburg feedstock specifications.',
    technicalHighlights: [
      'Sized primary crushing, desliming screens, Dense Medium Cyclones (DMC), and spiral concentrator circuits.',
      'Balanced solids, ash percentage, moisture, and magnetite medium recovery across coarse (+12mm), medium (1–12mm), and fine (-1mm) streams.',
      'Evaluated yield-vs-ash washability curves to hit target calorific value and ash ceiling constraints.',
    ],
    metrics: [
      { label: 'Primary Circuit', value: 'DMC + Spirals' },
      { label: 'Feed Top Size', value: '50 mm ROM' },
      { label: 'Magnetite Loss', value: '< 0.5 kg/t' },
      { label: 'Deliverable', value: 'Full Mass Balance' },
    ],
    codeOrModelNote:
      'STREAM BALANCE // ROM Feed (100%) -> Coarse DMC (RD 1.55) + Fines Spirals -> Product Coal + Discard + Thickener Underflow',
  },
  {
    id: 'maqueen-robot',
    index: '04',
    title: 'Autonomous Maqueen Plus V2 Robot',
    shortTitle: 'Maqueen V2 Robot',
    category: 'Mechatronics & Robotics',
    year: 'Autonomous Systems',
    tools: ['BBC micro:bit', 'Maqueen Plus V2', 'Ultrasonic HC-SR04', 'IR Line Array'],
    summary:
      'Autonomous underground haulage-inspired rover built on the DFRobot Maqueen Plus V2 platform and BBC micro:bit, combining multi-sensor line tracking with real-time ultrasonic obstacle avoidance.',
    technicalHighlights: [
      'Fused 6-channel infrared line-tracking array for high-speed differential PID steering along simulated haulage corridors.',
      'Integrated forward ultrasonic distance polling to execute autonomous stop, reroute, or clearance checks around obstructions.',
      'Designed deterministic state-machine transitions for intersection handling and payload-bay docking.',
    ],
    metrics: [
      { label: 'MCU', value: 'BBC micro:bit V2' },
      { label: 'Line Sensors', value: '6× IR Photodiode' },
      { label: 'Ranging', value: 'Ultrasonic (2–400 cm)' },
      { label: 'Control Loop', value: 'Differential PID' },
    ],
    codeOrModelNote:
      'if (sonar_cm < 18) { motor_stop(); servo_sweep(); } else { pid_follow(ir_read_all()); }',
  },
  {
    id: 'python-geostats',
    index: '05',
    title: 'Python Geostatistics & Automation Scripts',
    shortTitle: 'Python Geostats CLI',
    category: 'Software & Data',
    year: 'Open Tooling',
    tools: ['Python', 'NumPy / Pandas', 'Linux CLI', 'Data Blast Ignite'],
    summary:
      'Terminal-first Linux engineering utilities automating drillhole QA/QC checks, block model grade-tonnage curves, blast powder-factor checks, and Surpac/Datamine CSV batch transformations.',
    technicalHighlights: [
      'Automated drillhole collar/assay integrity checks flagging missing intervals, negative grades, and overlapping sample lengths.',
      'Computed grade-tonnage tables across cut-off increments with tabular CLI output and CSV export.',
      'Built lightweight blast geometry calculators verifying burden, spacing, stemming length, and powder factor prior to Data Blast Ignite import.',
    ],
    metrics: [
      { label: 'Environment', value: 'Linux Terminal' },
      { label: 'Runtime', value: 'Python 3.11+' },
      { label: 'Core Libs', value: 'NumPy · Pandas' },
      { label: 'Focus', value: 'QA/QC & Grade Curves' },
    ],
    codeOrModelNote:
      '$ python3 grade_tonnage.py --blocks li_kriged.csv --density 2.72 --cutoffs 0.4:1.6:0.2',
  },
  {
    id: 'underground-ops',
    index: '06',
    title: 'Underground Operations & Vac Work',
    shortTitle: 'Underground Ops',
    category: 'Field Experience',
    year: 'M&R · Sibanye-Stillwater',
    tools: ['Murray & Roberts Cementation', 'Sibanye-Stillwater', 'MQA Competence B', 'Shaft & Stoping'],
    summary:
      'Hands-on underground mining engineering vacation work across deep-level South African hard-rock shafts, holding MQA Competence B certification.',
    technicalHighlights: [
      'Shadowed shift bosses, rock engineers, and mine overseers across active stoping, development ends, and shaft sinking/equipping crews.',
      'Conducted underground ventilation checks, support spacing audits, and drill-and-blast cycle observations.',
      'Earned MQA Competence B certification alongside rigorous underground safety and hazard-identification compliance.',
    ],
    metrics: [
      { label: 'Companies', value: 'M&R · Sibanye' },
      { label: 'Certification', value: 'MQA Competence B' },
      { label: 'Environment', value: 'Deep Hard-Rock' },
      { label: 'Location', value: 'South Africa' },
    ],
    codeOrModelNote:
      'FIELD LOG // Shaft inspection, support standards audit, stope face advance measurement & ventilation velocity logging.',
  },
];

export interface CameraPreset {
  id: DeskFocusId;
  label: string;
  shortLabel: string;
  description: string;
  cameraPos: [number, number, number];
  lookTarget: [number, number, number];
}

export const CAMERA_PRESETS: Record<DeskFocusId, CameraPreset> = {
  overview: {
    id: 'overview',
    label: 'Desk Overview',
    shortLabel: 'Overview',
    description: 'Full virtual engineering desk',
    cameraPos: [-0.25, 3.85, 6.08],
    lookTarget: [-0.46, 0.58, -0.05],
  },
  laptop: {
    id: 'laptop',
    label: 'Laptop — My projects',
    shortLabel: 'Laptop',
    description: 'My projects',
    cameraPos: [-1.15, 1.55, 1.45],
    lookTarget: [-1.15, 0.55, -0.35],
  },
  tablet: {
    id: 'tablet',
    label: 'Tablet — Hardware & sensors',
    shortLabel: 'Tablet',
    description: 'Hardware & sensors',
    cameraPos: [0.35, 1.6, 1.25],
    lookTarget: [0.35, 0.35, -0.55],
  },
  phone: {
    id: 'phone',
    label: 'Phone — AI chat',
    shortLabel: 'Phone',
    description: 'AI chat',
    cameraPos: [1.45, 1.25, 1.85],
    lookTarget: [1.4, 0.15, 0.65],
  },
  truck: {
    id: 'truck',
    label: 'Haul Truck — Pit calc',
    shortLabel: 'Haul Truck',
    description: 'Pit calc',
    cameraPos: [2.55, 1.35, 1.75],
    lookTarget: [2.1, 0.3, 0.25],
  },
  diary: {
    id: 'diary',
    label: 'Write in my diary',
    shortLabel: 'Write in my diary',
    description: 'Firestore guestbook',
    cameraPos: [-1.52, 1.62, 1.85],
    lookTarget: [-1.54, 0.1, 0.66],
  },
  vinyl: {
    id: 'vinyl',
    label: 'Vinyl Player — Desk music',
    shortLabel: 'Vinyl Player',
    description: 'Desk turntable & music',
    cameraPos: [2.05, 1.35, 0.55],
    lookTarget: [2.14, 0.14, -0.96],
  },
  blueprint: {
    id: 'blueprint',
    label: "See how it's made",
    shortLabel: "See how it's made",
    description: 'CAD & tech architecture',
    cameraPos: [-2.26, 1.48, 0.68],
    lookTarget: [-2.28, 0.08, -0.44],
  },
};

export interface VinylTrack {
  id: string;
  title: string;
  artist: string;
  pickedBy: string;
  dateLabel: string;
  plays: number;
  accentFrom: string;
  accentTo: string;
  streamUrl: string;
  artworkUrl?: string;
  durationSec?: number;
  source: 'audius' | 'direct';
  isPersisted?: boolean;
}

