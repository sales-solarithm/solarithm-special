import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const p = Number(process.argv[portArgIndex + 1]);
    if (!isNaN(p) && p > 0) return p;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const p = Number(process.env.PORT);
    if (!isNaN(p) && p > 0) return p;
  }
  return 3000;
}
const PORT = getPort();
const server = http.createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Routes
app.post('/api/gemini/convert-notes', async (req, res) => {
  try {
    const { rawNotes, projectContext } = req.body;
    if (!rawNotes || typeof rawNotes !== 'string') {
      return res.status(400).json({ error: 'rawNotes is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI client not initialized (GEMINI_API_KEY missing)',
      });
    }

    const prompt = `You are a Principal Solar PV Structural and Electrical Engineer creating official submission discussion notes for a Solar PV engineering report.
Convert the following informal engineer shorthand notes into formal, standardized engineering report bullet points in ALL CAPS:

Raw Notes:
"""
${rawNotes}
"""

Project Context:
- Client: ${projectContext?.clientName || 'N/A'}
- Plant Capacity: ${projectContext?.plantCapacity || 'N/A'}
- Panel Brand / Wp: ${projectContext?.panelBrand || 'N/A'} ${projectContext?.panelWp || ''}
- Inverter: ${projectContext?.inverter || 'N/A'} (${projectContext?.inverterBrand || 'N/A'})
- Tilt: ${projectContext?.tiltAngle || 'N/A'}
- Project Engineer / PO: ${projectContext?.poName || 'MR. ABHISHEK SINGH'}

Requirements:
1. Output ONLY the polished engineering notes separated by blank lines (two newlines).
2. All notes must be written in professional, concise, authoritative engineering terminology.
3. Every sentence MUST be capitalized (ALL UPPERCASE).
4. Do not include markdown bullet symbols (* or -), markdown headers, or introductory conversational text.
5. Emphasize compliance with standard civil/structural solar engineering practices (IEC 62548, IS:875 wind codes, waterproofing, drainage, shadow mitigation).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const outputText = response.text?.trim() || '';
    return res.json({ convertedNotes: outputText });
  } catch (err: unknown) {
    console.error('Error in /api/gemini/convert-notes:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

app.post('/api/gemini/suggest-notes', async (req, res) => {
  try {
    const { projectContext } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'Gemini client not initialized' });
    }

    const prompt = `Based on the following Solar PV Engineering submission parameters, suggest 4-5 high-priority technical engineering recommendations and site precautions for the final report.

Parameters:
- Plant Capacity: ${projectContext?.plantCapacity || '50 KW'}
- Tilt Angle: ${projectContext?.tiltAngle || '15°'}
- Panels: ${projectContext?.numPanels || '100'} panels of ${projectContext?.panelBrand || 'Tier-1'} (${projectContext?.panelWp || '540W'})
- Inverter: ${projectContext?.inverter || '50 KW'} (${projectContext?.inverterBrand || 'SolarEdge'})
- EPC Company: ${projectContext?.epcCompany || 'SOLARITHM Design & Engineering'}

Format rules:
1. Return ONLY the bullet points in UPPERCASE separated by double newlines.
2. No bullets (* or -), no greeting, no conversational text.
3. Focus on ballast/structure stability, wind uplift, cable routing, waterproofing, and inverter ventilation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    const suggestions = response.text?.trim() || '';
    return res.json({ suggestions });
  } catch (err: unknown) {
    console.error('Error in /api/gemini/suggest-notes:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// Heavy asset sync route (avoids browser CORS preflight blocks)
app.post('/api/storage/sync-asset', async (req, res) => {
  try {
    const { assetId, dataUrl } = req.body;
    if (!assetId || !dataUrl) {
      return res.status(400).json({ error: 'assetId and dataUrl are required' });
    }
    return res.json({
      success: true,
      assetId,
      syncedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error('Error in /api/storage/sync-asset:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// Vite Middleware for Dev or Static file serving for Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
          clientPort: 443,
          protocol: 'wss',
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Solarithm Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
