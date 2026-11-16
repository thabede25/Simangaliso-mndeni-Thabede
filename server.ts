import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `You are the conversational AI portfolio assistant on Simangaliso Mndeni Thabede's 3D interactive engineering desk.
Speak clearly, concisely, and warmly in the first person on behalf of Simangaliso's portfolio or as his desk assistant.

Facts about Simangaliso Mndeni Thabede:
- Education: 3rd-year Mining Engineering student at the University of the Witwatersrand (Wits University), Johannesburg, South Africa.
- Practical Underground Experience: Vacation work at Murray & Roberts Cementation and Sibanye-Stillwater; holds MQA Competence B certification.
- Mining & CAD Software: GEOVIA Surpac, Whittle, Datamine Studio RM, Solid Edge, Data Blast Ignite.
- Programming & Hardware: Python (geostatistics, drillhole QA/QC, grade-tonnage automation, Linux terminal tools), Arduino Uno C++ (NTC thermistor evaporative cooling rig with 5V relay & fan), BBC micro:bit & Maqueen Plus V2 autonomous robot (6-channel IR line tracking & ultrasonic obstacle avoidance).
- Key Projects:
  1. Lithium Orebody 3D Block Model (GEOVIA Surpac resource estimation, Ordinary Kriging, Whittle ultimate pit shells).
  2. Mine Design Lab Evaporative Cooling Rig (Arduino Uno, 10k NTC thermistor, 5V relay, cooling fan).
  3. Sasolburg Coal Preparation Plant (Process flowsheet design, Dense Medium Cyclones, spirals, full mass & water balance).
  4. Autonomous Maqueen Plus V2 Robot (Line tracking & ultrasonic navigation on BBC micro:bit).
  5. Python Geostatistics & Automation Scripts (Terminal-based Linux engineering tools & Data Blast Ignite prep).
  6. Underground Operations (Murray & Roberts Cementation & Sibanye-Stillwater, MQA Competence B).
- Contact:
  - Student email: 2883076@students.wits.ac.za
  - Personal email: mndenithabede2@gmail.com
  - Phone / WhatsApp: 078 439 2669
  - Location: Johannesburg, South Africa

Keep answers focused (2-4 short sentences unless asked for technical depth), accurate to the facts above, and never invent employers, grades, or projects that are not listed.`;

interface ChatMessageInput {
  role: 'user' | 'assistant';
  text: string;
}

export interface OnlineTrackSearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  streamUrl: string;
  durationSec: number;
  source: 'audius';
}

interface AudiusTrackItem {
  id?: string;
  title?: string;
  duration?: number;
  is_streamable?: boolean;
  user?: { name?: string };
  artwork?: { '480x480'?: string; '150x150'?: string };
  genre?: string;
}

function mapAudiusItems(items: AudiusTrackItem[], maxCount: number): OnlineTrackSearchResult[] {
  return items
    .filter(
      (item) =>
        item &&
        item.id &&
        item.title &&
        item.is_streamable !== false &&
        typeof item.duration === 'number' &&
        item.duration >= 45
    )
    .slice(0, maxCount)
    .map((item) => {
      const id = String(item.id);
      const streamUrl = `https://api.audius.co/v1/tracks/${encodeURIComponent(
        id
      )}/stream?app_name=simangaliso-desk`;
      const rawArt = item.artwork?.['480x480'] || item.artwork?.['150x150'] || '';
      const artworkUrl = rawArt.startsWith('https://') && rawArt.length <= 500 ? rawArt : '';
      return {
        id: `audius-${id}`,
        title: String(item.title).slice(0, 100),
        artist: String(item.user?.name || 'Independent Artist').slice(0, 80),
        album: String(item.genre || 'Full Track').slice(0, 80),
        artworkUrl,
        streamUrl,
        durationSec: Math.round(item.duration ?? 180),
        source: 'audius' as const,
      };
    });
}

async function searchAudiusTracks(query: string): Promise<OnlineTrackSearchResult[]> {
  const url = `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(
    query
  )}&app_name=simangaliso-desk`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6500) });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: AudiusTrackItem[] };
  const items = Array.isArray(data?.data) ? data.data : [];
  return mapAudiusItems(items, 14);
}

async function fetchTrendingAudiusTracks(): Promise<OnlineTrackSearchResult[]> {
  const url = 'https://api.audius.co/v1/tracks/trending?app_name=simangaliso-desk&limit=15';
  const res = await fetch(url, { signal: AbortSignal.timeout(6500) });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: AudiusTrackItem[] };
  const items = Array.isArray(data?.data) ? data.data : [];
  return mapAudiusItems(items, 10);
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/music/trending', async (_req, res) => {
    try {
      const tracks = await fetchTrendingAudiusTracks();
      res.json({ tracks });
    } catch {
      res.json({ tracks: [] });
    }
  });

  app.get('/api/music/search', async (req, res) => {
    const rawQ = typeof req.query.q === 'string' ? req.query.q : '';
    const query = rawQ.trim().slice(0, 120);
    if (!query) {
      res.status(400).json({ error: 'Please enter a song or artist to search.' });
      return;
    }

    try {
      const tracks = await searchAudiusTracks(query);
      res.json({ tracks });
    } catch {
      res.status(502).json({ error: 'Unable to reach online music catalog right now.' });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: 'Gemini API key is not configured on the server.',
      });
      return;
    }

    const body = req.body as { messages?: ChatMessageInput[] };
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const trimmedMessages = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.text === 'string' &&
          m.text.trim().length > 0
      )
      .slice(-12);

    const lastMsg = trimmedMessages[trimmedMessages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user') {
      res.status(400).json({ error: 'Please provide a user message.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = trimmedMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text.trim().slice(0, 1000) }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Empty response returned from Gemini.' });
        return;
      }

      res.json({ reply });
    } catch (err) {
      console.error('Gemini API error:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to generate AI response.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
