import { X, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { DeskFocusId, PROJECTS, SIMANGALISO_PROFILE } from '../../data/portfolioData';

interface WorkContactDrawerProps {
  open: boolean;
  onClose: () => void;
  onFocusObject: (focus: DeskFocusId) => void;
}

export function WorkContactDrawer({ open, onClose, onFocusObject }: WorkContactDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-zinc-950/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-contact-drawer-title"
    >
      <div className="w-full max-w-lg h-full bg-[#FAF8F4] text-zinc-900 border-l border-stone-300 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-[#F3EFE8] px-6 py-4">
          <div>
            <h2
              id="work-contact-drawer-title"
              className="font-[family-name:var(--font-display)] text-lg font-semibold text-zinc-900"
            >
              My Work & Contact
            </h2>
            <p className="text-xs text-stone-600">
              {SIMANGALISO_PROFILE.contact.university} · {SIMANGALISO_PROFILE.contact.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close work and contact drawer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-white text-zinc-700 hover:bg-stone-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* Bio */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              About Simangaliso
            </h3>
            <p className="text-sm leading-relaxed text-stone-800">{SIMANGALISO_PROFILE.bio}</p>
          </section>

          {/* 6 Engineering Projects */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Selected Work (6 Projects)
              </h3>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFocusObject('laptop');
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline cursor-pointer"
              >
                <span>Open on 3D Laptop</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <ul className="divide-y divide-stone-200 border-y border-stone-200">
              {PROJECTS.map((project) => (
                <li key={project.id} className="py-3.5 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onFocusObject('laptop');
                      }}
                      className="text-left text-sm font-semibold text-zinc-900 hover:text-amber-800 cursor-pointer"
                    >
                      {project.index}. {project.title}
                    </button>
                    <span className="shrink-0 text-[11px] text-stone-500">{project.category}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-stone-700">{project.summary}</p>
                  <p className="text-[11px] text-stone-500">{project.tools.join(' · ')}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact Information */}
          <section className="space-y-3 pb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Contact
            </h3>
            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2.5 text-sm">
              {SIMANGALISO_PROFILE.contact.emails.map((email) => (
                <div key={email} className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${email}`}
                    className="text-zinc-800 hover:text-amber-800 hover:underline break-all"
                  >
                    {email}
                  </a>
                </div>
              ))}
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
                <a
                  href={SIMANGALISO_PROFILE.contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-800 hover:text-amber-800 hover:underline"
                >
                  {SIMANGALISO_PROFILE.contact.phoneDisplay} (Phone / WhatsApp)
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-stone-700">
                <MapPin className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
                <span>{SIMANGALISO_PROFILE.contact.location}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
