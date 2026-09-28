import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  Globe, 
  SlidersHorizontal, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Key, 
  Zap, 
  Layers, 
  MousePointerClick, 
  Eye, 
  ArrowRight,
  ExternalLink,
  HelpCircle,
  TrendingUp,
  Share2,
  Video,
  Clapperboard,
  FileText,
  ClipboardPaste,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PlatformType, ScrapedData, AdCampaignResult, AdHook, BodyAngle, CallToAction } from './types';
import { AdMockupPreview } from './components/AdMockupPreview';
import { HookSimulator } from './components/HookSimulator';
import { PythonCodeModal } from './components/PythonCodeModal';

// Sample landing pages for instant one-click demonstration
const SAMPLE_URLS = [
  { label: 'Linear (Issue Tracking)', url: 'https://linear.app' },
  { label: 'Stripe (Financial Infrastructure)', url: 'https://stripe.com' },
  { label: 'Notion (Connected Workspace)', url: 'https://notion.so' },
  { label: 'Duolingo (Language Learning)', url: 'https://duolingo.com' },
];

const LANGUAGES = [
  'English',
  'Español (Spanish)',
  'Français (French)',
  'Urdu (اردو)',
  'Hindi (हिन्दी)',
  'Deutsch (German)',
  'Português (Portuguese)',
  'Arabic (العربية)',
  'Italiano (Italian)',
  'Bengali (বাংলা)',
];

export default function App() {
  // Input States
  const [targetUrl, setTargetUrl] = useState('');
  const [manualTextInput, setManualTextInput] = useState('');
  const [referenceVideoIdea, setReferenceVideoIdea] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('Facebook');
  const [tone, setTone] = useState('Direct-Response & High Urgency');
  const [targetAudience, setTargetAudience] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');

  // UI States
  const [navPage, setNavPage] = useState<'home' | 'pricing' | 'features' | 'faq' | 'contact' | 'legal'>('home');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [authToast, setAuthToast] = useState<string | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Technical Support');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPythonModal, setShowPythonModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'hooks' | 'body' | 'ctas' | 'mockup' | 'python'>('hooks');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Execution States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Data States
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [campaignResult, setCampaignResult] = useState<AdCampaignResult | null>(null);
  const [selectedHook, setSelectedHook] = useState<AdHook | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<BodyAngle | null>(null);
  const [selectedCta, setSelectedCta] = useState<CallToAction | null>(null);

  // System status
  const [hasServerKey, setHasServerKey] = useState(true);

  // Python code strings for viewer and export
  const [appPyCode, setAppPyCode] = useState('');
  const [requirementsCode, setRequirementsCode] = useState('');

  // Check health and load Python code on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasServerApiKey === 'boolean') {
          setHasServerKey(data.hasServerApiKey);
        }
      })
      .catch(() => {});

    // Default requirements
    setRequirementsCode(`streamlit>=1.35.0\nbeautifulsoup4>=4.12.3\nrequests>=2.31.0\ngoogle-genai>=0.1.1`);

    // Fetch the actual app.py from root
    fetch('/app.py')
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => {
        if (text) setAppPyCode(text);
      })
      .catch(() => {});
  }, []);

  // Set default selections when campaign results arrive
  useEffect(() => {
    if (campaignResult) {
      if (campaignResult.hooks && campaignResult.hooks.length > 0) {
        setSelectedHook(campaignResult.hooks[0]);
      }
      if (campaignResult.bodyAngles && campaignResult.bodyAngles.length > 0) {
        setSelectedAngle(campaignResult.bodyAngles[0]);
      }
      if (campaignResult.callsToAction && campaignResult.callsToAction.length > 0) {
        setSelectedCta(campaignResult.callsToAction[0]);
      }
    }
  }, [campaignResult]);

  // Main Generation Pipeline
  const handleGenerate = async (urlToUse?: string) => {
    const rawUrl = urlToUse || targetUrl;
    const hasManual = Boolean(manualTextInput && manualTextInput.trim());
    const hasUrl = Boolean(rawUrl && rawUrl.trim());

    if (!hasUrl && !hasManual) {
      setErrorMsg('Please enter a product URL or paste your product description in the "Manual Text Input" box.');
      return;
    }

    let cleanUrl = rawUrl.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
      setTargetUrl(cleanUrl);
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      let pageTitle = 'Product Offer';
      let pageMeta = 'Product details';
      let textToUse = '';

      if (hasManual) {
        // User provided manual text -> Skip scraping completely!
        setLoadingStep('Using manual product description (web scraping bypassed)...');
        textToUse = manualTextInput.trim();

        if (cleanUrl) {
          try {
            pageTitle = new URL(cleanUrl).hostname;
          } catch {
            pageTitle = 'Product Offer';
          }
        } else {
          pageTitle = 'Manual Product Entry';
        }

        setScrapedData({
          url: cleanUrl || 'Manual Input (Amazon/Daraz)',
          title: pageTitle,
          metaDescription: 'Manual text description provided by user',
          headings: [],
          extractedText: textToUse,
          characterCount: textToUse.length,
        });
      } else {
        // Step 1: Web Scraping
        setLoadingStep('Scraping landing page and headers with BeautifulSoup parser...');
        const scrapeRes = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });

        const scrapeJson = await scrapeRes.json();
        if (!scrapeRes.ok || !scrapeJson.success) {
          throw new Error(
            `${scrapeJson.error || 'Failed to extract text from the website.'} If this site blocks scrapers (like Amazon or Daraz), paste the description directly into the "Manual Text Input" box below!`
          );
        }

        setScrapedData(scrapeJson);
        pageTitle = scrapeJson.title;
        pageMeta = scrapeJson.metaDescription;
        textToUse = scrapeJson.extractedText;
      }

      // Step 2: AI Ad Copy & Hook Generation
      setLoadingStep(`Instructing Gemini direct-response copywriter for ${platform}...`);
      const generateRes = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl || 'Manual Input',
          title: pageTitle,
          metaDescription: pageMeta,
          extractedText: textToUse,
          platform,
          tone,
          targetAudience,
          referenceVideoIdea: referenceVideoIdea.trim() || undefined,
          customApiKey: customApiKey.trim() || undefined,
          language: selectedLanguage,
        }),
      });

      const generateJson = await generateRes.json();
      if (!generateRes.ok || !generateJson.success) {
        throw new Error(generateJson.error || 'Failed to generate ad copy package.');
      }

      setCampaignResult(generateJson.data);
      setActiveTab('hooks');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleCopySection = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAll = () => {
    if (!campaignResult) return;
    const formatted = `
# 🎯 CAMPAIGN STRATEGY & OFFER SUMMARY
Product: ${campaignResult.offerSummary.productName}
Value Prop: ${campaignResult.offerSummary.coreValueProp}
Target Persona: ${campaignResult.offerSummary.targetPersona}
Primary Pain Point: ${campaignResult.offerSummary.primaryPainPoint}

---
# 🪝 5 SCROLL-STOPPING HOOKS (${platform.toUpperCase()})
${campaignResult.hooks.map((h, i) => `${i + 1}. [${h.angle}] "${h.hookText}"\n   Why: ${h.whyItWorks}`).join('\n\n')}

---
# 📝 3 DISTINCT BODY COPY ANGLES
${campaignResult.bodyAngles.map((a, i) => `### Angle ${i + 1}: ${a.name} (${a.framework})\nHeadline: ${a.headline}\nBest For: ${a.bestFor}\n\n${a.copy}`).join('\n\n---\n')}

---
# 🚀 2 HIGH-CONVERTING CALLS-TO-ACTION (CTAs)
${campaignResult.callsToAction.map((c, i) => `${i + 1}. [${c.type}] "${c.ctaText}" ${c.supportingMicroCopy ? `(${c.supportingMicroCopy})` : ''}`).join('\n')}

---
# 💡 TESTING STRATEGY
${campaignResult.testingStrategy}
`.trim();

    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadCopyPack = () => {
    if (!campaignResult) return;
    const formatted = `
AI Ad-Copy & Hook Tester Export
Platform: ${platform}
URL: ${scrapedData?.url || targetUrl}
Date: ${new Date().toLocaleDateString()}

${campaignResult.offerSummary.productName}
Value Proposition: ${campaignResult.offerSummary.coreValueProp}

=== 5 SCROLL-STOPPING HOOKS ===
${campaignResult.hooks.map((h, i) => `${i + 1}. ${h.angle}: "${h.hookText}" (Stop Rate: ${h.scrollStopRating || 95}%)`).join('\n')}

=== 3 BODY COPY ANGLES ===
${campaignResult.bodyAngles.map((a) => `[${a.name} - ${a.framework}]\nHeadline: ${a.headline}\n\n${a.copy}\n`).join('\n--------------------\n')}

=== CALLS TO ACTION ===
${campaignResult.callsToAction.map((c) => `[${c.type}]: ${c.ctaText}`).join('\n')}

=== A/B TESTING RECOMMENDATION ===
${campaignResult.testingStrategy}
`.trim();

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad_copy_${platform.toLowerCase()}_campaign.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Toast Notification */}
      {authToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-blue-500/60 shadow-xl shadow-blue-900/30 text-white px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{authToast}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. TOP BAR CONTRACT (Zone 1: Brand, Zone 2: Tabs, Zone 3: Actions) */}
      {/* ==================================================================== */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setNavPage('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap leading-tight">
              AdCopy AI Studio
            </div>
            <div className="text-[10px] text-slate-400 font-normal hidden sm:block">
              Viral Copy &amp; Script Generator
            </div>
          </div>
        </button>

        {/* Zone 2: SaaS Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          {[
            { id: 'home', label: 'Home' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'features', label: 'Features' },
            { id: 'faq', label: 'FAQ & Help' },
            { id: 'contact', label: 'Contact' },
            { id: 'legal', label: 'Legal & Privacy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setNavPage(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                navPage === tab.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions & Auth */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="hidden sm:block">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-white">
                  🌐 {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowPythonModal(true)}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">Python</span> Code
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-xs font-semibold border px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              showSettings
                ? 'bg-blue-950/60 border-blue-600 text-blue-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Settings</span>
          </button>

          {/* Horizontal Login / Sign up Placeholder Buttons */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <button
              onClick={() => {
                setAuthToast('👋 Demo session active: Logged in as demo_user@adcopy.ai');
                setTimeout(() => setAuthToast(null), 3500);
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors whitespace-nowrap"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthToast('🎉 Welcome! 14-day Pro Trial is activated with full access.');
                setTimeout(() => setAuthToast(null), 3500);
              }}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg shadow-sm shadow-blue-600/30 transition-colors whitespace-nowrap"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Mobile SaaS Nav Row */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs">
        {[
          { id: 'home', label: 'Home' },
          { id: 'pricing', label: 'Pricing' },
          { id: 'features', label: 'Features' },
          { id: 'faq', label: 'FAQ' },
          { id: 'contact', label: 'Contact' },
          { id: 'legal', label: 'Legal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setNavPage(tab.id as any)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap text-xs ${
              navPage === tab.id ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings & Guide Panel Drawer */}
      {showSettings && (
        <div className="border-b border-slate-800 bg-slate-900/95 px-6 py-5 transition-all">
          <div className="max-w-5xl mx-auto space-y-5">
            {/* 📖 How to Use Quickstart Banner */}
            <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <span>📖</span>
                <span>How to Use This Tool</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                👋 <strong>Welcome!</strong> This tool instantly turns any product link into battle-tested, high-converting ad copy, viral video scripts, and scroll-stopping hooks tailored to your target platform.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-300">
                <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <span><strong>Paste your product URL</strong> or use the Manual Text Fallback (for Amazon, Daraz, etc.).</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <span><strong>Select your platform</strong> (Facebook, Instagram, YouTube, TikTok, or LinkedIn).</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <span><strong>Click Generate</strong> to get 5 psychological hooks, 3 copy angles, and high-CTR CTAs!</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Gemini API Key
                  </span>
                  {hasServerKey && !customApiKey && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      ✓ Connected
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  placeholder={hasServerKey ? "Using connected key (or override here)" : "Paste AIzaSy... API key"}
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Keys remain private. Get one at{' '}
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Google AI Studio
                  </a>.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Output Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  AI will write hooks and scripts in this language.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Copywriting Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Direct-Response & High Urgency">Direct-Response &amp; High Urgency</option>
                  <option value="Bold, Punchy & Contrarian">Bold, Punchy &amp; Contrarian</option>
                  <option value="Conversational & Storytelling">Conversational &amp; Storytelling</option>
                  <option value="Authoritative & B2B Professional">Authoritative &amp; B2B Professional</option>
                  <option value="Relatable & Playful (TikTok UGC)">Relatable &amp; Playful (TikTok UGC)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Calibrates vocabulary and emotional intensity.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Target Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Facebook">Facebook (Long-form &amp; Feed Angles)</option>
                  <option value="Instagram">Instagram (Aesthetic Captions &amp; Hashtags)</option>
                  <option value="LinkedIn">LinkedIn (High-Signal B2B Direct Response)</option>
                  <option value="TikTok">TikTok (2-Sec Pattern Interrupts &amp; UGC)</option>
                  <option value="YouTube">YouTube (5-Sec Skip-Proof Video Hook Scripts)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Modifies layout constraints and hook psychology.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MAIN APPLICATION WORKSPACE                                       */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {navPage === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hero Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Automated Direct-Response Creative Lab · {selectedLanguage}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
                Turn Any Landing Page Into High-Converting Ad Copy &amp; Hooks
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed text-balance">
                Paste a product or landing page URL. Our scraper extracts your offer's core messaging, 
                and Google Gemini crafts 5 scroll-stopping hooks, 3 multi-angle body scripts, and 2 strong CTAs in <strong>{selectedLanguage}</strong>.
              </p>
            </div>

        {/* Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* Target Platform Selection System */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2 tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Select Target Social Platform:
              </label>

              {/* Language Switcher pill on Home */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Output Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-950 border border-slate-700 hover:border-slate-600 text-blue-300 font-semibold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-900 text-white">
                      🌐 {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Platform Tabs (Visible on ALL devices) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {[
                { id: 'Facebook', icon: '📘', name: 'Facebook', sub: 'Feed & Stories' },
                { id: 'Instagram', icon: '📸', name: 'Instagram', sub: 'Captions & Reels' },
                { id: 'LinkedIn', icon: '💼', name: 'LinkedIn', sub: 'B2B Authority' },
                { id: 'TikTok', icon: '🎵', name: 'TikTok', sub: 'Viral UGC & Hooks' },
                { id: 'YouTube', icon: '▶️', name: 'YouTube', sub: '5-Sec Video Scripts' },
              ].map((p) => {
                const isActive = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as PlatformType)}
                    className={`py-2.5 px-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isActive
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/20'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base">{p.icon}</span>
                      {isActive ? (
                        <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <div className="mt-1.5">
                      <div className="font-bold text-xs">{p.name}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-blue-100 font-medium' : 'text-slate-500'}`}>
                        {p.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* URL Input & Generate Button Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://yourproduct.com/landing-page"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) handleGenerate();
                }}
              />
            </div>

            {/* Platform Quick Dropdown (Additional input option) */}
            <div className="sm:w-44 shrink-0">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full h-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white text-xs font-semibold rounded-xl px-3 py-3 focus:outline-none cursor-pointer"
              >
                <option value="Facebook">📘 Facebook</option>
                <option value="Instagram">📸 Instagram</option>
                <option value="LinkedIn">💼 LinkedIn</option>
                <option value="TikTok">🎵 TikTok</option>
                <option value="YouTube">▶️ YouTube</option>
              </select>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {platform} Ad Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Instant Demo Quick-Pick Links */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-slate-400 border-t border-slate-800/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Try instant demo:</span>
              {SAMPLE_URLS.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => {
                    setTargetUrl(sample.url);
                    handleGenerate(sample.url);
                  }}
                  className="text-slate-300 hover:text-blue-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Target:</span>
              <span className="bg-blue-950 border border-blue-800 text-blue-300 px-2 py-0.5 rounded-md font-semibold">
                {platform}
              </span>
              <span className="bg-slate-950 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-medium">
                🌐 {selectedLanguage}
              </span>
            </div>
          </div>

          {/* ⚙️ Advanced Options Accordion (Closed by default) */}
          <div className="pt-1 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-sm">⚙️</span>
                <span className="truncate">Advanced Options (Amazon/Daraz Fallback &amp; Custom Video Vibe)</span>
                {(manualTextInput || referenceVideoIdea || targetAudience) && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono shrink-0">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
                <span className="hidden sm:inline text-[11px] text-slate-500">
                  {showAdvanced ? 'Hide' : 'Show'}
                </span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                {/* Fallback: Manual Text Input Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Fallback: Manual Text Input
                      <span className="text-[10px] text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded font-mono">
                        For Amazon, Daraz, etc.
                      </span>
                    </label>
                    {manualTextInput && (
                      <button
                        type="button"
                        onClick={() => setManualTextInput('')}
                        className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                      >
                        Clear text
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={manualTextInput}
                    onChange={(e) => setManualTextInput(e.target.value)}
                    placeholder="Paste product title, features, bullet points, or specifications directly here. Perfect for Amazon, Daraz, or AliExpress links that block web scrapers. If filled, web scraping is automatically bypassed..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-y leading-relaxed font-sans"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {manualTextInput.trim() ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          ✓ Manual text active ({manualTextInput.trim().length} chars) — web scraper will be bypassed.
                        </span>
                      ) : (
                        <span>Directly paste product info when links are protected by anti-bot verification.</span>
                      )}
                    </span>
                    <span className="text-slate-500 hidden sm:inline">Scraper Bypass</span>
                  </div>
                </div>

                {/* Reference Video Idea Input Box */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      Reference Video Idea
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Style &amp; Vibe Matching
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Clapperboard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={referenceVideoIdea}
                      onChange={(e) => setReferenceVideoIdea(e.target.value)}
                      placeholder="e.g. Fast-paced walking monologue holding coffee, tech unboxing with ASMR sounds, or split-screen 'Before vs After' reaction..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[11px] text-slate-400">
                    <span className="text-slate-500">Try quick vibe ideas:</span>
                    {[
                      'Fast-talking founder walking office',
                      'Split-screen before & after reaction',
                      'Chill lo-fi desk unboxing with text overlays',
                      'Point-and-explain screen teardown',
                    ].map((vibe) => (
                      <button
                        key={vibe}
                        type="button"
                        onClick={() => setReferenceVideoIdea(vibe)}
                        className="text-slate-400 hover:text-blue-300 bg-slate-950/80 border border-slate-800/80 px-2 py-0.5 rounded text-[10px] transition-colors"
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience / Persona Override */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Target Audience / Persona (Optional Override)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Busy moms looking for quick dinner ideas, or B2B SaaS founders scaling past $50k/mo"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/40 border border-red-800/80 p-4 rounded-xl flex items-start gap-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block text-red-300">Processing Interrupted:</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Loading Spinner with Stage Indicator */}
        {isLoading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-blue-600/20" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Direct-Response Engine at Work</h3>
              <p className="text-xs text-blue-400 font-mono mt-1 animate-pulse">
                {loadingStep || 'Analyzing offer structure and scraping content...'}
              </p>
            </div>
          </div>
        )}

        {/* Scraped Landing Page Info Bar */}
        {scrapedData && !isLoading && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/60">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-white truncate">
                  {scrapedData.title}
                </div>
                <div className="text-slate-400 truncate flex items-center gap-1.5 flex-wrap">
                  <span>{scrapedData.url}</span>
                  <span>·</span>
                  <span>{scrapedData.characterCount.toLocaleString()} characters</span>
                  {scrapedData.metaDescription.toLowerCase().includes('manual') && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.5 rounded font-medium">
                      ⚡ Manual Input (Scraper Bypassed)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500">
                Platform target: <strong className="text-blue-400">{platform}</strong>
              </span>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. CAMPAIGN RESULTS WORKSPACE                                        */}
        {/* ==================================================================== */}
        {campaignResult && !isLoading && (
          <div className="space-y-6">
            {/* Offer Strategy Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Product / Offer
                </span>
                <p className="font-bold text-white text-sm">
                  {campaignResult.offerSummary.productName}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Core Value Prop
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {campaignResult.offerSummary.coreValueProp}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Primary Pain Point
                </span>
                <p className="text-amber-300/90 leading-relaxed">
                  {campaignResult.offerSummary.primaryPainPoint}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Target Persona
                </span>
                <p className="text-blue-300 leading-relaxed">
                  {campaignResult.offerSummary.targetPersona}
                </p>
              </div>
            </div>

            {referenceVideoIdea && (
              <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-blue-200">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Video className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-semibold text-blue-300 shrink-0">Matching Video Vibe:</span>
                  <span className="truncate italic text-slate-300">"{referenceVideoIdea}"</span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono shrink-0">
                  Style Active
                </span>
              </div>
            )}

            {/* Results Navigation Tabs & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab('hooks')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === 'hooks'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  5 Scroll Hooks &amp; Tester
                </button>

                <button
                  onClick={() => setActiveTab('body')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === 'body'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  3 Body Copy Angles
                </button>

                <button
                  onClick={() => setActiveTab('ctas')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === 'ctas'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  2 High-CTR CTAs
                </button>

                <button
                  onClick={() => setActiveTab('mockup')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === 'mockup'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live {platform} Mockup
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyAll}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? 'Copied Full Campaign!' : 'Copy All'}
                </button>

                <button
                  onClick={handleDownloadCopyPack}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export .txt
                </button>
              </div>
            </div>

            {/* TAB 1: 5 SCROLL-STOPPING HOOKS */}
            {activeTab === 'hooks' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <HookSimulator
                    hooks={campaignResult.hooks}
                    selectedHookId={selectedHook?.id || 1}
                    onSelectHook={(hook) => setSelectedHook(hook)}
                  />
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                      Live Feed Preview
                    </h4>
                    <AdMockupPreview
                      platform={platform}
                      productName={campaignResult.offerSummary.productName}
                      selectedHook={selectedHook}
                      selectedAngle={selectedAngle}
                      selectedCta={selectedCta}
                      sourceUrl={scrapedData?.url || targetUrl}
                    />
                  </div>

                  <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-4 text-xs text-blue-300 leading-relaxed">
                    <strong className="text-white block mb-1">
                      💡 Split-Testing Rule:
                    </strong>
                    {campaignResult.testingStrategy ||
                      'Always test 3 hooks against 1 static creative for 72 hours before swapping copy angles.'}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 3 BODY COPY ANGLES */}
            {activeTab === 'body' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {campaignResult.bodyAngles.map((angle, idx) => {
                    const isSelected = selectedAngle?.id === angle.id;
                    return (
                      <div
                        key={angle.id || idx}
                        onClick={() => setSelectedAngle(angle)}
                        className={`cursor-pointer p-5 rounded-xl border flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-mono text-slate-500 uppercase">
                              Angle 0{idx + 1}
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                              {angle.framework}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white mb-1.5">
                            {angle.name}
                          </h3>

                          <div className="text-xs font-semibold text-blue-400 mb-3">
                            "{angle.headline}"
                          </div>

                          <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 font-sans max-h-64 overflow-y-auto">
                            {angle.copy}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px] truncate max-w-[170px]">
                            Best for: {angle.bestFor}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopySection(angle.copy, angle.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Copy angle copy"
                          >
                            {copiedSection === angle.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Selected angle for preview:{' '}
                    <strong className="text-white">{selectedAngle?.name || 'Angle 1'}</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('mockup')}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    View in {platform} Ad Mockup
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: 2 HIGH-CONVERTING CTAs */}
            {activeTab === 'ctas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaignResult.callsToAction.map((cta, idx) => {
                  const isSelected = selectedCta?.id === cta.id;
                  return (
                    <div
                      key={cta.id || idx}
                      onClick={() => setSelectedCta(cta)}
                      className={`cursor-pointer p-5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-300">
                          CTA 0{idx + 1}: {cta.type}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySection(cta.ctaText, cta.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          {copiedSection === cta.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/80 mb-3 text-center">
                        <span className="text-base font-extrabold text-white">
                          "{cta.ctaText}"
                        </span>
                      </div>

                      {cta.supportingMicroCopy && (
                        <p className="text-xs text-slate-400">
                          <strong className="text-slate-300">Supporting Micro-Copy:</strong>{' '}
                          {cta.supportingMicroCopy}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 4: LIVE AD FEED MOCKUP */}
            {activeTab === 'mockup' && (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl max-w-md mx-auto overflow-x-auto">
                  {(['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube'] as PlatformType[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        platform === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <AdMockupPreview
                  platform={platform}
                  productName={campaignResult.offerSummary.productName}
                  selectedHook={selectedHook}
                  selectedAngle={selectedAngle}
                  selectedCta={selectedCta}
                  sourceUrl={scrapedData?.url || targetUrl}
                />

                <div className="text-center text-xs text-slate-400">
                  Preview rendered using active hook: <span className="text-white font-medium">"{selectedHook?.angle}"</span> and angle: <span className="text-white font-medium">"{selectedAngle?.name}"</span>.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )}

    {/* ==================================================================== */}
    {/* PAGE 2: PRICING                                                     */}
    {/* ==================================================================== */}
    {navPage === 'pricing' && (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
            💳 Simple, Transparent SaaS Pricing
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Supercharge Your ROAS With AI Direct Response
          </h2>
          <p className="text-sm text-slate-400">
            Generate unlimited scroll-stopping hooks, multi-angle scripts, and calls-to-action in 10+ languages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Free Starter</div>
              <div>
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-slate-500"> / forever</span>
              </div>
              <p className="text-xs text-slate-400">Ideal for testing the water with your first product.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2 text-emerald-400">✓ 5 Ad Campaigns / mo</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ 5 Hooks &amp; 3 Angles</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ Standard Web Scraper</li>
                <li className="flex items-center gap-2 text-slate-500">✕ Video Style-Matching</li>
              </ul>
            </div>
            <button
              disabled
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Plan 2 */}
          <div className="bg-slate-900 border-2 border-blue-500/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-blue-900/20">
            <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="space-y-4">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Pro Marketer</div>
              <div>
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-400">For DTC founders, creators &amp; media buyers.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2 text-emerald-400">✓ <strong>Unlimited</strong> Campaigns</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ Reference Video Style-Matching</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ Amazon/Daraz Scraper Bypass</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ All 10+ Global Languages</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ Gemini 2.5 Pro Priority Quota</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setAuthToast('🎉 Upgrade requested! Redirecting to secure checkout...');
                setTimeout(() => setAuthToast(null), 3500);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Plan 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agency Scale</div>
              <div>
                <span className="text-3xl font-black text-white">$79</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-400">For high-volume performance marketing agencies.</p>
              <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <li className="flex items-center gap-2 text-emerald-400">✓ Everything in Pro</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ 5 Team Member Seats</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ Custom Archetype Tuning</li>
                <li className="flex items-center gap-2 text-emerald-400">✓ White-Label Client Deliverables</li>
              </ul>
            </div>
            <button
              onClick={() => setNavPage('contact')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ==================================================================== */}
    {/* PAGE 3: FEATURES                                                    */}
    {/* ==================================================================== */}
    {navPage === 'features' && (
      <div className="space-y-8 animate-in fade-in duration-200">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
            ⚡ High-Converting Engine Features
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Everything You Need To Scale Paid Social Ads
          </h2>
          <p className="text-sm text-slate-400">
            Engineered for media buyers who need to stop the scroll and lower customer acquisition costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: '🔍 Deep Landing Page Extraction', desc: 'BeautifulSoup parser extracts your offer title, H1-H3 headings, meta tags, and value propositions automatically.' },
            { title: '🪝 5 Proven Scroll-Stopping Hooks', desc: 'Generates Curiosity Gaps, Pattern Interrupts, Problem-Agitate angles, Contrarian Claims, and Social Proof triggers.' },
            { title: '🎬 Video Script Director', desc: 'YouTube & TikTok outputs include visual cues [VISUAL CUE:], on-screen text [ON-SCREEN TEXT:], and spoken audio [AUDIO:].' },
            { title: '🛡️ Amazon & Daraz Bypass', desc: 'Direct manual text input fallback allows you to bypass anti-bot verification without 403 HTTP errors.' },
            { title: '🌐 10+ Native Global Languages', desc: 'Craft ads in English, Spanish, French, Urdu, Hindi, German, Arabic, Portuguese, and Italian with native idioms.' },
            { title: '🎥 Video Vibe Style-Matching', desc: 'Describe any reference video concept (vlog walking, unboxing ASMR) and the AI mirrors its cadence and camera cues.' },
          ].map((f) => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="font-bold text-sm text-white">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ==================================================================== */}
    {/* PAGE 4: FAQ & HELP                                                  */}
    {/* ==================================================================== */}
    {navPage === 'faq' && (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-3">
          <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
            ❓ FAQ &amp; Knowledge Base
          </span>
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400">
            Answers to common questions regarding scraping, Gemini AI models, and commercial rights.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { q: 'How does the web scraper extract product info?', a: 'The scraper visits the URL, parses the HTML, filters out navigation menus, scripts, and cookies, and preserves core offer headlines, feature lists, and pricing.' },
            { q: 'What should I do if a site blocks scraping (e.g. Amazon or Daraz)?', a: 'Open the "Advanced Options" expander on the home page and paste your product details into "Manual Text Input". The AI will use this text directly without scraping.' },
            { q: 'How do I obtain a free Gemini API Key?', a: 'Visit Google AI Studio at aistudio.google.com, sign in with your Google account, click "Create API key", and paste it into the Engine Settings panel.' },
            { q: 'Do I own commercial rights to the generated ad copy?', a: 'Yes! All ad hooks, video scripts, and copy angles belong 100% to you. You can run them on Meta, TikTok, YouTube, or sell them to clients.' },
          ].map((faq) => (
            <div key={faq.q} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <h4 className="font-bold text-sm text-white">{faq.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ==================================================================== */}
    {/* PAGE 5: CONTACT                                                     */}
    {/* ==================================================================== */}
    {navPage === 'contact' && (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-3">
          <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
            📬 Contact &amp; Support
          </span>
          <h2 className="text-3xl font-extrabold text-white">We'd Love To Hear From You</h2>
          <p className="text-sm text-slate-400">
            Questions, partnership requests, or custom agency requirements? Send us a note.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          {contactSent ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-800">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-400">
                Thank you, {contactName || 'there'}. Our team will respond to {contactEmail} within 2-4 hours.
              </p>
              <button
                onClick={() => setContactSent(false)}
                className="text-xs text-blue-400 hover:underline pt-2 inline-block cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!contactEmail.trim() || !contactMsg.trim()) {
                  alert('Please provide your email and message.');
                  return;
                }
                setContactSent(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex@brand.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Subject Category</label>
                <select
                  value={contactCategory}
                  onChange={(e) => setContactCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Billing Question">Billing Question</option>
                  <option value="Agency / Enterprise">Agency / Enterprise</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="Tell us what you need help with or what features you'd like to see..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    )}

    {/* ==================================================================== */}
    {/* PAGE 6: LEGAL & PRIVACY                                             */}
    {/* ==================================================================== */}
    {navPage === 'legal' && (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-3">
          <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
            ⚖️ Legal, Privacy &amp; Terms
          </span>
          <h2 className="text-3xl font-extrabold text-white">Policies &amp; Disclaimers</h2>
          <p className="text-sm text-slate-400">
            Transparent data practices and terms governing the use of the platform.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">1. Data Privacy &amp; Key Security</h3>
            <p>
              We never sell, rent, or distribute user data. All API keys supplied by users are stored strictly in client-side memory or temporary server proxy requests and are never stored in public databases.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">2. Scraped Information Policy</h3>
            <p>
              Information extracted from product URLs is parsed exclusively for the transient purpose of structuring advertising copy and hooks. We do not store or mirror destination websites.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">3. Advertising Compliance Disclaimer</h3>
            <p>
              Users maintain sole legal responsibility for verifying that advertising claims generated by the AI comply with applicable consumer protection laws (including FTC truth-in-advertising guidelines and Meta/ByteDance advertising policies).
            </p>
          </div>
        </div>
      </div>
    )}
      </main>

      {/* ==================================================================== */}
      {/* 4. FOOTER                                                            */}
      {/* ==================================================================== */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AI Ad-Copy &amp; Hook Tester · Built with Gemini 3.8 Flash &amp; BeautifulSoup</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPythonModal(true)}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <FileCode className="w-3 h-3 text-blue-400" />
              Python Streamlit Source
            </button>
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Python Code Modal */}
      <PythonCodeModal
        isOpen={showPythonModal}
        onClose={() => setShowPythonModal(false)}
        appPyCode={appPyCode}
        requirementsCode={requirementsCode}
      />
    </div>
  );
}
