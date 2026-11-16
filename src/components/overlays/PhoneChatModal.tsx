import { FormEvent, useRef, useState } from 'react';
import { X, Send, Sparkles, Wifi, Signal } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface PhoneChatModalProps {
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  'Tell me about your Wits Mining Engineering studies',
  'What did you do at Murray & Roberts and Sibanye?',
  'How do you use Python and Surpac together?',
];

export function PhoneChatModal({ onClose }: PhoneChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm Simangaliso's Gemini-powered desk assistant. Ask me about his 3rd-year Mining Engineering work at Wits, underground vac experience, Python geostats scripts, or hardware builds.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: clean,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Unable to reach Gemini assistant.');
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: data.reply! },
      ]);
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center sm:justify-end p-4 sm:p-8 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-chat-title"
    >
      {/* Brushed Titanium Smartphone Chassis */}
      <div className="pointer-events-auto relative w-full max-w-[388px] h-[620px] max-h-[86vh] flex flex-col rounded-[42px] border-[9px] border-[#111215] ring-2 ring-[#9ca3af] bg-[#FAF8F4] text-zinc-900 shadow-[0_28px_80px_rgba(0,0,0,0.6)] overflow-visible">
        {/* Side Hardware Buttons */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -left-[12px] top-28 h-10 w-[3px] rounded-l bg-zinc-500"
        />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -left-[12px] top-42 h-10 w-[3px] rounded-l bg-zinc-500"
        />
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -right-[12px] top-32 h-14 w-[3px] rounded-r bg-zinc-500"
        />

        <div className="flex-1 flex flex-col rounded-[33px] overflow-hidden bg-[#FAF8F4]">
          {/* iOS Top Status Bar + Dynamic Island */}
          <div className="relative flex items-center justify-between bg-zinc-950 px-5 pt-2.5 pb-1.5 text-[11px] font-semibold text-white select-none">
            <span>22:29</span>
            {/* Dynamic Island */}
            <div
              aria-hidden="true"
              className="flex h-5 w-24 items-center justify-end px-2 rounded-full bg-black ring-1 ring-zinc-800"
            >
              <span className="h-2 w-2 rounded-full bg-[#1e293b]" />
            </div>
            <div className="flex items-center gap-1.5 text-zinc-200">
              <Signal className="h-3 w-3" aria-hidden="true" />
              <Wifi className="h-3 w-3" aria-hidden="true" />
              <span className="rounded-sm border border-zinc-400 px-1 text-[9px] leading-tight">96</span>
            </div>
          </div>

          {/* App Bar */}
          <div className="flex items-center justify-between gap-2 bg-zinc-950 px-4 pb-3 pt-1 text-white border-b border-zinc-800">
            <div className="min-w-0">
              <h2 id="phone-chat-title" className="text-sm font-semibold truncate">
                Simangaliso Desk AI
              </h2>
              <p className="text-[11px] text-amber-400">Powered by Gemini · Direct Assistant</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI phone chat"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F4F0E8]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                data-message-role={msg.role}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-amber-700 text-white rounded-br-sm'
                      : 'bg-white border border-stone-200 text-zinc-800 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-500">
                  Typing...
                </div>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {error}
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-1.5 overflow-x-auto border-t border-stone-200 bg-[#FAF8F4] px-3 py-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                disabled={loading}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:border-amber-600 hover:text-amber-800 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-amber-600" aria-hidden="true" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* iMessage Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-stone-200 bg-white px-3 pt-2.5 pb-1.5"
          >
            <label htmlFor="phone-chat-input" className="sr-only">
              Ask a question about Simangaliso
            </label>
            <input
              id="phone-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="iMessage · Ask about Wits, Surpac..."
              maxLength={500}
              className="flex-1 rounded-full border border-stone-300 bg-[#FAF8F4] px-3.5 py-2 text-sm text-zinc-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              aria-label="Send message"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-amber-700 disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Bottom iOS Home Indicator */}
          <div className="bg-white pb-2 pt-1 flex justify-center" aria-hidden="true">
            <div className="h-1 w-28 rounded-full bg-zinc-900/75" />
          </div>
        </div>
      </div>
    </div>
  );
}
