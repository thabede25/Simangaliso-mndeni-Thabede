import { FormEvent, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Feather, PenLine } from 'lucide-react';
import { createNotebookEntry, NotebookEntry } from '../../lib/firebase';
import { validateNotebookSubmission } from '../../utils/engineeringMath';

interface DiaryModalProps {
  entries: NotebookEntry[];
  loading: boolean;
  loadError: string | null;
  onClose: () => void;
}

const ENTRIES_PER_SPREAD = 2;

export function DiaryModal({
  entries,
  loading,
  loadError,
  onClose,
}: DiaryModalProps) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isWriting, setIsWriting] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const totalSpreads = Math.max(1, Math.ceil(entries.length / ENTRIES_PER_SPREAD));
  const safeSpread = Math.min(spreadIndex, totalSpreads - 1);
  const leftEntry = entries[safeSpread * ENTRIES_PER_SPREAD];
  const rightEntry = entries[safeSpread * ENTRIES_PER_SPREAD + 1];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitSuccess(false);

    const validation = validateNotebookSubmission(name, role, message);
    if (!validation.valid) {
      setFormError(validation.error || 'Please check your entry.');
      return;
    }

    setSubmitting(true);
    try {
      await createNotebookEntry(validation.sanitized);
      setName('');
      setRole('');
      setMessage('');
      setSpreadIndex(0);
      setIsWriting(false);
      setSubmitSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save your entry. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Just now';
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderHandwrittenPage = (entry: NotebookEntry | undefined, side: 'left' | 'right') => {
    if (!entry) {
      return (
        <div className="h-full flex flex-col justify-between">
          <div className="pt-8 space-y-3">
            <p className="font-[family-name:var(--font-hand)] text-2xl leading-[28px] text-[#3a4a63]/75">
              {side === 'left' && entries.length === 0
                ? 'This diary is open on a fresh blank page...'
                : 'Blank ruled page ready for your signature...'}
            </p>
            <div>
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(false);
                  setIsWriting(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-white cursor-pointer"
              >
                <PenLine className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                <span>Write on this page</span>
              </button>
            </div>
          </div>
          <div className="text-right font-[family-name:var(--font-hand)] text-base text-stone-400">
            page {safeSpread * 2 + (side === 'left' ? 1 : 2)}
          </div>
        </div>
      );
    }

    return (
      <article className="h-full flex flex-col justify-between">
        <div>
          <div className="text-right font-[family-name:var(--font-hand)] text-[17px] leading-[28px] text-[#5e6b7c]">
            {formatTimestamp(entry.createdAt)}
          </div>
          <p className="font-[family-name:var(--font-hand)] text-[22px] sm:text-[24px] leading-[28px] text-[#273447] whitespace-pre-wrap break-words">
            {entry.message}
          </p>
        </div>

        <div className="pt-4 text-right">
          <div className="font-[family-name:var(--font-hand)] text-[20px] leading-tight text-[#273447]">
            <span className="text-[15px] text-[#6d7a8c] mr-1">from</span>
            {entry.name}
          </div>
          {entry.role && (
            <div className="font-[family-name:var(--font-hand)] text-[15px] text-[#6d7a8c]">
              {entry.role}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col items-center justify-center pt-16 pb-20 px-3 sm:px-6 bg-zinc-950/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diary-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Action Strip Above Notebook */}
      <div className="w-full max-w-[780px] mb-2.5 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setIsWriting((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 shadow-md border border-stone-200 hover:bg-stone-50 cursor-pointer"
          >
            <PenLine className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            <span>{isWriting ? 'Read diary pages' : '+ Write in notebook'}</span>
          </button>
          {submitSuccess && (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
              Signed &amp; saved to Firestore
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            id="diary-modal-title"
            className="font-[family-name:var(--font-hand)] text-lg text-white drop-shadow-sm tabular-nums"
          >
            {entries.length} {entries.length === 1 ? 'page' : 'pages'} in my diary
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close diary"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-md border border-stone-200 hover:bg-stone-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Open Charcoal-Bound Notebook + Flanking Page-Turn Arrows */}
      <div className="relative w-full max-w-[850px] flex items-center justify-center gap-2 sm:gap-4">
        {/* Left Page-Turn Arrow */}
        <button
          type="button"
          onClick={() => {
            setIsWriting(false);
            setSpreadIndex((p) => Math.max(0, p - 1));
          }}
          disabled={safeSpread === 0 && !isWriting}
          aria-label="Previous diary pages"
          className="shrink-0 inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-lg border border-stone-200 hover:bg-white disabled:opacity-35 disabled:cursor-default cursor-pointer transition-opacity"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Charcoal Hardcover Frame */}
        <div className="relative flex-1 max-w-[730px] rounded-[18px] border-[8px] border-[#1f2024] bg-[#1f2024] shadow-[0_30px_85px_rgba(0,0,0,0.62)]">
          {/* Open Two-Page Cream Spread */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 rounded-[10px] bg-[#FAF8F4] overflow-hidden border-x-[4px] border-[#e6dfd1] min-h-[420px] sm:min-h-[455px] max-h-[68vh]">
            {/* Vertical Spine Gutter Shadow */}
            <div
              aria-hidden="true"
              className="hidden md:block pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 z-10 bg-gradient-to-r from-stone-900/12 via-stone-900/4 to-stone-900/12"
            />

            {/* LEFT PAGE: Either Ruled Signing Sheet OR Left Handwritten Entry */}
            <div className="lined-paper border-b md:border-b-0 md:border-r border-stone-300/70 pt-[22px] pb-5 pr-5 sm:pr-7 pl-12 sm:pl-14 flex flex-col justify-between overflow-y-auto">
              {isWriting ? (
                <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between space-y-3" noValidate>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-hand)] text-[22px] leading-[28px] text-[#273447] font-semibold">
                        Sign Simangaliso&apos;s diary
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-stone-500">
                        Firestore Live
                      </span>
                    </div>

                    <div>
                      <label htmlFor="diary-name" className="block text-[11px] font-semibold text-zinc-700 mb-0.5">
                        Your name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="diary-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={60}
                        placeholder="e.g. Lerato Ndlovu"
                        className="w-full rounded-md border border-stone-300 bg-white/85 px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-stone-400 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="diary-role" className="block text-[11px] font-semibold text-zinc-700 mb-0.5">
                        Role / Company <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="diary-role"
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        maxLength={80}
                        placeholder="e.g. Rock Engineer · Sibanye-Stillwater"
                        className="w-full rounded-md border border-stone-300 bg-white/85 px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-stone-400 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label htmlFor="diary-message" className="block text-[11px] font-semibold text-zinc-700">
                          Message <span className="text-rose-600">*</span>
                        </label>
                        <span
                          className={`font-[family-name:var(--font-mono)] text-[10px] tabular-nums ${
                            message.length > 270 ? 'text-amber-700 font-semibold' : 'text-stone-500'
                          }`}
                        >
                          {message.length}/300
                        </span>
                      </div>
                      <textarea
                        id="diary-message"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={300}
                        placeholder="Write your note on this page..."
                        className="w-full resize-none rounded-md border border-stone-300 bg-white/85 px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-stone-400 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    {formError && (
                      <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700">
                        {formError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    <Feather className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{submitting ? 'Saving page...' : 'Sign the Diary'}</span>
                  </button>
                </form>
              ) : loading ? (
                <p className="font-[family-name:var(--font-hand)] text-xl text-stone-500 pt-6">
                  Opening diary pages...
                </p>
              ) : loadError ? (
                <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {loadError}
                </div>
              ) : (
                renderHandwrittenPage(leftEntry, 'left')
              )}
            </div>

            {/* RIGHT PAGE: Second Handwritten Entry on Current Spread */}
            <div className="lined-paper pt-[22px] pb-5 pr-5 sm:pr-7 pl-12 sm:pl-14 flex flex-col justify-between overflow-y-auto">
              {loading ? (
                <div aria-hidden="true" />
              ) : isWriting ? (
                renderHandwrittenPage(entries[0], 'right')
              ) : (
                renderHandwrittenPage(rightEntry, 'right')
              )}
            </div>
          </div>
        </div>

        {/* Right Page-Turn Arrow */}
        <button
          type="button"
          onClick={() => {
            setIsWriting(false);
            setSpreadIndex((p) => Math.min(totalSpreads - 1, p + 1));
          }}
          disabled={safeSpread >= totalSpreads - 1}
          aria-label="Next diary pages"
          className="shrink-0 inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-zinc-900 shadow-lg border border-stone-200 hover:bg-white disabled:opacity-35 disabled:cursor-default cursor-pointer transition-opacity"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Handwritten Footer Hint */}
      <p className="mt-3 font-[family-name:var(--font-hand)] text-lg text-white/90 drop-shadow-sm text-center">
        Click arrows to turn pages · Write your note on a blank page
      </p>
    </div>
  );
}
