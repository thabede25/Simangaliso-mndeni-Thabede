import { useState } from 'react';
import {
  X,
  Layers,
  Terminal,
  Cpu,
  Factory,
  Bot,
  HardHat,
  Wifi,
  BatteryCharging,
  Compass,
} from 'lucide-react';
import { PROJECTS, ProjectItem } from '../../data/portfolioData';

interface ProjectsModalProps {
  onClose: () => void;
  onOpenCad?: () => void;
}

const PROJECT_ICONS: Record<string, typeof Layers> = {
  'lithium-block-model': Layers,
  'cooling-rig': Cpu,
  'sasolburg-coal-plant': Factory,
  'maqueen-robot': Bot,
  'python-geostats': Terminal,
  'underground-ops': HardHat,
};

const DOCK_COLORS: Record<string, string> = {
  'lithium-block-model': 'from-amber-500 to-orange-700',
  'cooling-rig': 'from-sky-500 to-blue-700',
  'sasolburg-coal-plant': 'from-emerald-500 to-teal-700',
  'maqueen-robot': 'from-violet-500 to-indigo-700',
  'python-geostats': 'from-zinc-700 to-zinc-900',
  'underground-ops': 'from-rose-500 to-red-700',
};

export function ProjectsModal({ onClose, onOpenCad }: ProjectsModalProps) {
  const [selectedId, setSelectedId] = useState<string>(PROJECTS[0].id);
  const active: ProjectItem = PROJECTS.find((p) => p.id === selectedId) ?? PROJECTS[0];
  const ActiveIcon = PROJECT_ICONS[active.id] ?? Layers;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center pt-16 pb-20 px-3 sm:px-6 bg-zinc-950/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="laptop-projects-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* MacBook Pro Aluminum Outer Lid & Hinge Assembly */}
      <div className="w-full max-w-5xl max-h-[82vh] flex flex-col items-center">
        <div className="w-full flex flex-col rounded-[22px] border-[8px] sm:border-[11px] border-[#0b0c0f] ring-2 ring-[#b8bcc4] bg-[#0f131a] text-slate-100 shadow-[0_28px_80px_rgba(0,0,0,0.65)] overflow-hidden relative max-h-[78vh]">
          {/* Realistic MacBook Camera Notch */}
          <div
            aria-hidden="true"
            className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 z-20 h-5 w-28 items-center justify-center gap-2 rounded-b-xl bg-[#0b0c0f]"
          >
            <span className="h-2 w-2 rounded-full bg-[#1e293b] ring-1 ring-slate-600/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* macOS Top Menu Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 bg-[#181e29] px-4 py-2 text-[11px] text-slate-300 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                <button
                  type="button"
                  onClick={onClose}
                  tabIndex={-1}
                  className="h-2.5 w-2.5 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer"
                />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <h2
                id="laptop-projects-title"
                className="font-[family-name:var(--font-mono)] font-semibold text-slate-100 truncate"
              >
                My Projects — Engineering OS
              </h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-slate-400 font-[family-name:var(--font-mono)]">
                <Wifi className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <BatteryCharging className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
                <span>94%</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close projects laptop view"
                className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Close Lid</span>
              </button>
            </div>
          </div>

          {/* Inside Laptop Screen: IDE / Explorer Workspace */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left Project Explorer Sidebar (Tabs) */}
            <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-[#141923] p-2.5 overflow-x-auto md:overflow-y-auto">
              <div className="hidden md:block px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Engineering Workspace
              </div>
              <div
                role="tablist"
                aria-label="Engineering projects"
                className="flex md:flex-col gap-1"
              >
                {PROJECTS.map((project) => {
                  const isSelected = project.id === active.id;
                  const Icon = PROJECT_ICONS[project.id] ?? Layers;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedId(project.id)}
                      className={`flex items-center gap-2 whitespace-nowrap md:whitespace-normal text-left shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? 'text-amber-400' : 'text-slate-500'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {project.index}. {project.shortTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Active Viewport */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 pb-20 space-y-5 bg-[#0f131a]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-[family-name:var(--font-mono)]">
                  <ActiveIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  <span className="font-semibold text-amber-400">{active.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{active.year}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-300">{active.tools.join(' / ')}</span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white">
                  {active.title}
                </h3>
                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-300">{active.summary}</p>
              </div>

              {/* Key Technical Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {active.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-slate-800 bg-[#161c26] px-3.5 py-3"
                  >
                    <div className="text-[11px] font-medium text-slate-400">{metric.label}</div>
                    <div className="mt-1 font-[family-name:var(--font-mono)] text-sm font-semibold text-amber-300 tabular-nums">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Engineering Execution Details */}
              <div className="rounded-xl border border-slate-800 bg-[#141923] p-4 space-y-2.5">
                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase font-[family-name:var(--font-mono)]">
                  Technical Scope & Deliverables
                </h4>
                <ul className="space-y-2">
                  {active.technicalHighlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-200"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Integrated Linux Terminal Output */}
              <div className="rounded-xl border border-slate-700/80 bg-[#090c11] overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 bg-[#111620] px-3.5 py-1.5 text-[10px] font-[family-name:var(--font-mono)] text-slate-400">
                  <span>TERMINAL // bash — wits-mining-env</span>
                  <span className="text-emerald-400">EXIT 0</span>
                </div>
                <div className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-emerald-300 overflow-x-auto">
                  {active.codeOrModelNote}
                </div>
              </div>
            </div>
          </div>

          {/* Authentic MacBook Dock Pinned at Screen Bottom */}
          <div className="pointer-events-none relative flex justify-center bg-[#0f131a] pb-2 pt-1 border-t border-slate-800/70">
            <div
              aria-label="MacBook applications dock"
              className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/95 px-3 py-1.5 shadow-xl"
            >
              {PROJECTS.map((project) => {
                const Icon = PROJECT_ICONS[project.id] ?? Layers;
                const isActive = project.id === active.id;
                const grad = DOCK_COLORS[project.id] ?? 'from-amber-500 to-orange-700';
                return (
                  <button
                    key={project.id}
                    type="button"
                    title={`${project.index}. ${project.shortTitle}`}
                    aria-label={`Dock: ${project.shortTitle}`}
                    onClick={() => setSelectedId(project.id)}
                    className="group relative flex flex-col items-center cursor-pointer"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-md transition-transform duration-150 group-hover:-translate-y-1.5 group-hover:scale-110 ring-1 ring-white/20`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span
                      className={`mt-1 h-1 w-1 rounded-full ${
                        isActive ? 'bg-amber-400' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}

              {onOpenCad && (
                <>
                  <div className="mx-0.5 h-7 w-px bg-white/15" aria-hidden="true" />
                  <button
                    type="button"
                    title="Open CAD Drawings"
                    aria-label="Dock: CAD Drawings"
                    onClick={onOpenCad}
                    className="group relative flex flex-col items-center cursor-pointer"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-md transition-transform duration-150 group-hover:-translate-y-1.5 group-hover:scale-110 ring-1 ring-white/20">
                      <Compass className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="mt-1 h-1 w-1 rounded-full bg-transparent" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Aluminum Laptop Lower Hinge Deck Lip */}
        <div
          aria-hidden="true"
          className="w-[102%] max-w-[1040px] h-3.5 rounded-b-xl bg-gradient-to-b from-[#d4d6dc] to-[#9ea2ab] border-x border-b border-zinc-500 shadow-lg flex items-start justify-center"
        >
          <div className="w-24 h-1.5 rounded-b-md bg-zinc-700/70" />
        </div>
      </div>
    </div>
  );
}
