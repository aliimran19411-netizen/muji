import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Health & Status check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Serve raw Python application code and requirements for in-app viewing & download
app.get('/app.py', (_req: Request, res: Response) => {
  res.sendFile(path.resolve('app.py'));
});

app.get('/requirements.txt', (_req: Request, res: Response) => {
  res.sendFile(path.resolve('requirements.txt'));
});

// URL Scraper Endpoint
app.post('/api/scrape', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid URL is required.' });
  }

  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  try {
    const parsed = new URL(formattedUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
      return res.status(400).json({ success: false, error: 'Invalid URL hostname or protocol.' });
    }
  } catch {
    return res.status(400).json({ success: false, error: 'Malformed URL provided.' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: `Website responded with HTTP ${response.status} (${response.statusText}). It may be blocking automated web scrapers.`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, nav, footer, noscript, svg, iframe, form, button, link').remove();

    // Extract Title
    const title =
      $('title').text().trim() ||
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('h1').first().text().trim() ||
      new URL(formattedUrl).hostname;

    // Extract Meta Description
    const metaDescription =
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      '';

    // Extract Headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 5 && text.length < 200 && !headings.includes(text)) {
        headings.push(text);
      }
    });

    // Extract Paragraphs
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      const lower = text.toLowerCase();
      if (
        text.length > 30 &&
        !lower.includes('cookie') &&
        !lower.includes('all rights reserved') &&
        !lower.includes('privacy policy')
      ) {
        paragraphs.push(text);
      }
    });

    // Combine headings and paragraphs
    const combined = [
      headings.slice(0, 8).join('\n'),
      paragraphs.slice(0, 25).join('\n\n'),
    ]
      .filter(Boolean)
      .join('\n\n')
      .replace(/\s+/g, ' ')
      .trim();

    const cleanText = combined.slice(0, 10000);

    if (cleanText.length < 60) {
      return res.status(400).json({
        success: false,
        error:
          'Scraper loaded the webpage but detected very little readable text. The site might be a client-rendered single page app (SPA) or protected by a bot barrier.',
      });
    }

    return res.json({
      success: true,
      url: formattedUrl,
      title,
      metaDescription,
      headings: headings.slice(0, 6),
      extractedText: cleanText,
      characterCount: cleanText.length,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('aborted')) {
      return res.status(408).json({
        success: false,
        error: 'Scraping request timed out. The website took longer than 12 seconds to respond.',
      });
    }
    return res.status(500).json({
      success: false,
      error: `Failed to scrape website: ${errorMessage}`,
    });
  }
});

// Ad Copy Generation Endpoint
app.post('/api/generate-copy', async (req: Request, res: Response) => {
  const {
    url,
    title,
    metaDescription,
    extractedText,
    platform = 'Facebook',
    tone = 'Direct-Response & High Urgency',
    targetAudience = '',
    referenceVideoIdea = '',
    customApiKey = '',
    language = 'English',
  } = req.body;

  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Gemini API Key is missing. Please provide your key in the Engine Settings panel.',
    });
  }

  if (!extractedText || extractedText.length < 30) {
    return res.status(400).json({
      success: false,
      error: 'Extracted landing page text is required to generate ad copy.',
    });
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

    const platformGuidelines: Record<string, string> = {
      Facebook: `
- Primary Text format: Optimized for mobile news feed scrolling.
- Hook must land hard in the first 2-3 lines before the "...See more" fold.
- Use punchy 1-2 sentence paragraphs with clean line breaks for effortless scanning.
- Emphasize emotional storytelling, social proof, and problem-solution dynamic.`,
      Instagram: `
- Instagram Caption Format: Optimized for feed & Reels consumption.
- First 125 characters before the "more" fold must hook immediately.
- Aesthetic formatting with purposeful spacing, punchy bullet points, and clean line breaks.
- Include a strong engagement prompt (e.g., "Tap the link in bio", "Save this post", "Comment [KEYWORD]").
- MANDATORY: Every body copy angle MUST conclude with a curated group of 5-8 relevant, high-traffic hashtags (mix of niche & broad tags).`,
      LinkedIn: `
- Professional yet engaging direct response for B2B decision makers.
- High-signal insights, career/business ROI, operational efficiency, and tangible outcomes.
- Avoid low-rent hype; use authoritative, value-dense prose that appeals to leaders.`,
      TikTok: `
- Fast-paced UGC (User-Generated Content) or video script overlay style.
- First 2 seconds MUST feature an undeniable pattern interrupt or controversial hook.
- Casual, authentic, relatable cadence with conversational slang or natural speech rhythm.`,
      YouTube: `
- YouTube Video Hook Script format: Engineered to crush the 5-second "Skip Ad" barrier or stop the YouTube Shorts feed.
- First 5 seconds MUST deliver an immediate, unskippable hook (shocking claim, counter-intuitive visual, or acute callout).
- Every body copy angle MUST be written as a complete video script including clear director cues:
  * [VISUAL CUE: What appears on screen]
  * [ON-SCREEN TEXT: Bold graphic pop-ups]
  * [AUDIO/VOICEOVER: The exact spoken words]
- Include a verbal call-to-action with explicit instructions to click the on-screen companion banner or pinned video link.`,
    };

    const platformRule = platformGuidelines[platform] || platformGuidelines.Facebook;

    const systemInstruction = `You are a World-Class Direct-Response Copywriter and Creative Media Buyer (combining the timeless principles of David Ogilvy, Eugene Schwartz, and Gary Halbert with modern paid social creative strategy).
Your mission is to examine the scraped landing page content and generate high-converting ad copy for ${platform.toUpperCase()} ENTIRELY in ${language}.

CRITICAL LANGUAGE MANDATE:
The required output language is: ${language}.
Every text field in the JSON deliverable (productName, coreValueProp, targetPersona, primaryPainPoint, hooks[].hookText, hooks[].whyItWorks, bodyAngles[].headline, bodyAngles[].copy, callsToAction[].ctaText, callsToAction[].supportingMicroCopy, testingStrategy) MUST BE WRITTEN IN ${language}.
Do NOT output English unless ${language} is English. Even if the landing page content is in English, translate the core message and write all ad copy, headlines, scripts, and hooks natively in ${language}.

You must return valid JSON matching the exact schema requested. Do not include extra conversational preamble outside the JSON.`;

    const userPrompt = `
Analyze this landing page offer and generate an ad creative pack for ${platform}.

### 🛑 CRITICAL OUTPUT LANGUAGE DIRECTIVE:
The user has explicitly selected: **${language}**.
You MUST write all generated headlines, 5 hooks, explanation of why each hook stops the scroll, 3 body copy angles, visual cues, video scripts, calls-to-action, and testing strategy in: **${language}**.
Ensure native phrasing, local idioms, natural cadence, and persuasive direct-response rhythm suitable for native ${language} speakers. Do not produce English text if a non-English language is chosen.

PLATFORM RULES:
${platformRule}

TONE:
${tone}

${targetAudience ? `TARGET AUDIENCE OVERRIDE: ${targetAudience}` : ''}

${referenceVideoIdea ? `REFERENCE VIDEO INSPIRATION & CREATIVE VIBE (STYLE-MATCHING):
The user wants this ad copy and video script to match the exact style, format, and vibe of this reference video:
"${referenceVideoIdea}"
Crucial Instruction: Emulate this reference video's pacing, visual energy, camera directions, delivery cadence, and structural flow while pitching the current offer. Mirror its aesthetic and presentation style closely.` : ''}

LANDING PAGE METRICS:
- URL: ${url || 'N/A'}
- Title: ${title || 'N/A'}
- Meta Description: ${metaDescription || 'N/A'}
- Scraped Content:
"""${extractedText}"""

REQUIREMENTS (ALL OUTPUT IN ${language.toUpperCase()}):
1. offerSummary: Brief breakdown of core offer, target persona, and main pain point written in ${language}.
2. 5 scroll-stopping hooks specifically tailored for ${platform} written in ${language}. Provide the angle name, the hook text, why it stops the scroll, and an estimated thumb-stop score (0-100).
3. 3 distinct body copy angles written in ${language}:
   - Angle 1: Pain-Point & Agitation (PAS framework)
   - Angle 2: Aspirational & Identity Transformation
   - Angle 3: Benefit-Led & Mechanism (Logical Proof)
   Each angle must include headline, full copy, framework description, and audience fit.
4. 2 strong CTAs written in ${language}:
   - Urgent / Direct Action
   - Low-Friction / Risk-Reversal
5. testingStrategy: Concrete advice on how to split-test these hooks and angles written in ${language}.
`;

    const maxRetries = 3;
    const retryDelay = 5000;
    let response: any = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.85,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                offerSummary: {
                  type: Type.OBJECT,
                  properties: {
                    productName: { type: Type.STRING },
                    coreValueProp: { type: Type.STRING },
                    targetPersona: { type: Type.STRING },
                    primaryPainPoint: { type: Type.STRING },
                  },
                  required: ['productName', 'coreValueProp', 'targetPersona', 'primaryPainPoint'],
                },
                hooks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      angle: { type: Type.STRING },
                      hookText: { type: Type.STRING },
                      whyItWorks: { type: Type.STRING },
                      scrollStopRating: { type: Type.INTEGER },
                    },
                    required: ['id', 'angle', 'hookText', 'whyItWorks'],
                  },
                },
                bodyAngles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      framework: { type: Type.STRING },
                      headline: { type: Type.STRING },
                      copy: { type: Type.STRING },
                      bestFor: { type: Type.STRING },
                    },
                    required: ['id', 'name', 'framework', 'headline', 'copy', 'bestFor'],
                  },
                },
                callsToAction: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      type: { type: Type.STRING },
                      ctaText: { type: Type.STRING },
                      supportingMicroCopy: { type: Type.STRING },
                    },
                    required: ['id', 'type', 'ctaText'],
                  },
                },
                testingStrategy: { type: Type.STRING },
              },
              required: ['offerSummary', 'hooks', 'bodyAngles', 'callsToAction', 'testingStrategy'],
            },
          },
        });
        break; // Generation succeeded!
      } catch (err: unknown) {
        lastError = err;
        const errMsg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
        const isHighDemand =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('temporarily unavailable');

        if (isHighDemand && attempt < maxRetries) {
          console.warn(`[Gemini API] 503 High Demand detected. Retrying in 5 seconds (attempt ${attempt + 1} of ${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        } else {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError || new Error('Failed to generate ad copy after retries.');
    }

    const responseText = response.text || '';
    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsedData,
      platform,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({
      success: false,
      error: `Gemini generation error: ${errorMsg}`,
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
