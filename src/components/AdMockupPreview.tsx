import React, { useState } from 'react';
import { PlatformType, AdHook, BodyAngle, CallToAction } from '../types';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Heart, 
  Music, 
  MoreHorizontal, 
  Globe, 
  ExternalLink,
  Play,
  Volume2,
  SkipForward,
  Send,
  CheckCircle2,
  Tv
} from 'lucide-react';

interface AdMockupProps {
  platform: PlatformType;
  productName: string;
  selectedHook: AdHook | null;
  selectedAngle: BodyAngle | null;
  selectedCta: CallToAction | null;
  sourceUrl: string;
}

export const AdMockupPreview: React.FC<AdMockupProps> = ({
  platform,
  productName,
  selectedHook,
  selectedAngle,
  selectedCta,
  sourceUrl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayName = productName || 'Acme Offer';
  const displayHost = sourceUrl ? (() => {
    try {
      return new URL(sourceUrl).hostname.replace('www.', '').toUpperCase();
    } catch {
      return 'PRODUCTOFFER.COM';
    }
  })() : 'PRODUCTOFFER.COM';

  const hookText = selectedHook?.hookText || 'Stop struggling with conversions.';
  const bodyText = selectedAngle?.copy || 'Here is the step-by-step breakdown that solves your biggest bottleneck in days, not months.';
  const ctaLabel = selectedCta?.ctaText || 'Learn More';
  const handleName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. INSTAGRAM PREVIEW
  if (platform === 'Instagram') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-md mx-auto text-slate-900 font-sans">
        {/* Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                {handleName}
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              </div>
              <div className="text-[10px] text-slate-500">Sponsored</div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Media Frame (Square 1:1 Aspect Ratio) */}
        <div className="relative aspect-square bg-gradient-to-br from-indigo-950 via-slate-900 to-rose-950 flex flex-col justify-between p-6 text-white overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-rose-300">
              Sponsored Story
            </span>
            <span className="text-[11px] font-mono bg-black/40 px-2 py-0.5 rounded text-white/80">
              1/3
            </span>
          </div>

          <div className="z-10 text-center my-auto px-4">
            <span className="text-[11px] font-semibold text-rose-300 block mb-1">
              {displayName}
            </span>
            <h3 className="text-xl font-extrabold text-white leading-tight drop-shadow-md">
              "{hookText}"
            </h3>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-white text-slate-900 font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span>{ctaLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Dynamic CTA Strip */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{ctaLabel}</span>
            <span className="text-[11px] text-slate-400">· {displayHost}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Action Row */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-800">
            <button className="hover:text-red-500"><Heart className="w-5 h-5" /></button>
            <button className="hover:text-slate-600"><MessageSquare className="w-5 h-5" /></button>
            <button className="hover:text-slate-600"><Send className="w-5 h-5" /></button>
          </div>
          <button className="text-slate-800 hover:text-slate-600">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Likes Count */}
        <div className="px-4 text-xs font-bold text-slate-900 mb-1">
          3,481 likes
        </div>

        {/* Caption & Hashtags */}
        <div className="px-4 pb-3.5 text-xs text-slate-800 leading-relaxed">
          <span className="font-bold text-slate-950 mr-1.5">{handleName}</span>
          <span className="font-semibold text-slate-900">{hookText}</span>
          <div className={`mt-1 whitespace-pre-line text-slate-700 ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {bodyText}
          </div>
          {bodyText.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-500 hover:text-slate-800 font-semibold block mt-1"
            >
              {isExpanded ? 'less' : 'more'}
            </button>
          )}
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-2">
            View all 142 comments
          </div>
        </div>
      </div>
    );
  }

  // 2. YOUTUBE PREVIEW (In-Stream Skippable Video Ad Player)
  if (platform === 'YouTube') {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto text-slate-100 font-sans">
        {/* 16:9 Video Canvas */}
        <div className="relative aspect-video bg-black flex flex-col justify-between p-3 select-none overflow-hidden group">
          {/* Mock Video Backdrop with cinematic gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 opacity-95" />

          {/* Top Video Overlay Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded">
                Ad
              </span>
              <span className="text-[11px] text-slate-300 font-mono">0:04 / 0:45</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white/80" />
            </div>
          </div>

          {/* Video Script Hook Centerpiece */}
          <div className="relative z-10 text-center my-auto px-4">
            <div className="inline-block bg-black/70 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-lg max-w-[90%]">
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                ⚡ FIRST 5-SECOND HOOK SCRIPT
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                "{hookText}"
              </p>
            </div>
          </div>

          {/* Bottom Video Controls & YouTube Skip Ad Countdown Button */}
          <div className="relative z-10 flex items-end justify-between">
            <div className="text-[11px] bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded text-white font-medium flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-red-500" />
              <span className="truncate max-w-[130px]">{displayHost}</span>
            </div>

            {/* Authentic YouTube "Skip Ad" Button */}
            <div className="bg-black/80 hover:bg-black/95 border border-white/30 text-white font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer shadow-lg">
              <span className="text-[11px] text-slate-300">Skip Ad in 5</span>
              <SkipForward className="w-3.5 h-3.5 text-white fill-current" />
            </div>
          </div>

          {/* Progress Bar (Yellow for Ads) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="w-[18%] h-full bg-amber-400" />
          </div>
        </div>

        {/* Video Companion Banner & Script Details */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-3">
          {/* Companion Card */}
          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded bg-red-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                YT
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {selectedAngle?.headline || displayName}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {displayHost}
                </div>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-colors shrink-0">
              {ctaLabel}
            </button>
          </div>

          {/* Script breakdown accordion */}
          <div className="text-xs text-slate-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Full Video Angle Script
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-400 hover:underline"
              >
                {isExpanded ? 'Hide Script' : 'Read Full Script'}
              </button>
            </div>
            <div className={`p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] leading-relaxed whitespace-pre-line font-mono text-slate-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {bodyText}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. FACEBOOK PREVIEW
  if (platform === 'Facebook') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-md mx-auto text-slate-900 font-sans">
        {/* Header */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
                {displayName}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span>Sponsored</span>
                <span>·</span>
                <Globe className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Ad Copy */}
        <div className="px-3.5 pb-3 text-sm text-slate-800 leading-relaxed">
          <p className="font-semibold text-slate-950 mb-1.5">{hookText}</p>
          <div className={`${!isExpanded ? 'line-clamp-3' : ''} whitespace-pre-line text-slate-700`}>
            {bodyText}
          </div>
          {bodyText.length > 140 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 mt-1 inline-flex items-center gap-0.5"
            >
              {isExpanded ? 'See less' : '...See more'}
            </button>
          )}
        </div>

        {/* Media Placeholder Banner */}
        <div className="relative aspect-[1.91/1] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-end p-5 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <span className="text-[10px] tracking-wider uppercase bg-blue-500/80 text-white px-2 py-0.5 rounded font-bold">
              Special Feature
            </span>
            <h4 className="text-base font-bold mt-1 text-white leading-tight">
              {selectedAngle?.headline || displayName}
            </h4>
          </div>
        </div>

        {/* Bottom Destination & CTA Bar */}
        <div className="bg-slate-50 px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <div className="text-[11px] font-medium text-slate-500 truncate tracking-wide">
              {displayHost}
            </div>
            <div className="text-xs font-bold text-slate-900 truncate">
              {selectedAngle?.headline || hookText}
            </div>
          </div>
          <button className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 font-semibold text-xs text-slate-800 rounded transition-colors whitespace-nowrap shrink-0">
            {ctaLabel}
          </button>
        </div>

        {/* Social Metrics */}
        <div className="px-3.5 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">👍</span>
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">❤️</span>
            </span>
            <span>2.4k</span>
          </div>
          <div className="flex gap-3">
            <span>184 comments</span>
            <span>72 shares</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="px-3 py-1.5 border-t border-slate-100 flex items-center justify-around text-slate-600 text-xs font-semibold">
          <button className="flex items-center gap-1.5 py-1 px-3 hover:bg-slate-100 rounded">
            <ThumbsUp className="w-4 h-4" /> Like
          </button>
          <button className="flex items-center gap-1.5 py-1 px-3 hover:bg-slate-100 rounded">
            <MessageSquare className="w-4 h-4" /> Comment
          </button>
          <button className="flex items-center gap-1.5 py-1 px-3 hover:bg-slate-100 rounded">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    );
  }

  // 4. LINKEDIN PREVIEW
  if (platform === 'LinkedIn') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-md mx-auto text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">
                {displayName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                34,290 followers
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Promoted</span>
                <span>·</span>
                <Globe className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Copy */}
        <div className="px-4 pb-3 text-sm text-slate-800 leading-relaxed">
          <p className="font-semibold text-slate-900 mb-1.5">{hookText}</p>
          <div className={`${!isExpanded ? 'line-clamp-4' : ''} whitespace-pre-line text-slate-700`}>
            {bodyText}
          </div>
          {bodyText.length > 180 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-blue-700 hover:underline mt-1"
            >
              {isExpanded ? 'see less' : '...see more'}
            </button>
          )}
        </div>

        {/* Media Frame */}
        <div className="border-t border-b border-slate-100 bg-slate-900 text-white p-6 relative">
          <div className="max-w-xs">
            <span className="text-[11px] text-blue-400 uppercase tracking-widest font-mono">Executive Brief</span>
            <h3 className="text-base font-bold mt-1 text-slate-100">
              {selectedAngle?.headline || displayName}
            </h3>
            <p className="text-xs text-slate-300 mt-2 line-clamp-2">
              {selectedAngle?.bestFor || 'Designed for high-growth teams.'}
            </p>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="bg-slate-50 p-3 flex items-center justify-between border-b border-slate-100">
          <div className="truncate pr-2">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {selectedAngle?.headline || hookText}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {displayHost}
            </div>
          </div>
          <button className="px-3.5 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-xs rounded-full transition-colors shrink-0">
            {ctaLabel}
          </button>
        </div>

        {/* Metrics & Actions */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">👍</span>
            <span>682</span>
          </span>
          <span>48 comments</span>
        </div>
        <div className="px-2 py-1.5 flex items-center justify-around text-slate-600 text-xs font-semibold">
          <button className="py-1 px-3 hover:bg-slate-100 rounded">Like</button>
          <button className="py-1 px-3 hover:bg-slate-100 rounded">Comment</button>
          <button className="py-1 px-3 hover:bg-slate-100 rounded">Repost</button>
          <button className="py-1 px-3 hover:bg-slate-100 rounded">Send</button>
        </div>
      </div>
    );
  }

  // 5. TIKTOK PREVIEW (9:16 Mobile Viewport)
  return (
    <div className="relative w-[300px] h-[520px] mx-auto rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl border-4 border-slate-800 flex flex-col justify-between p-4 font-sans select-none">
      {/* Background Gradient simulating Video */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-slate-900/60 to-black pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-slate-300">
        <span className="opacity-80">Following</span>
        <span className="text-white border-b-2 border-white pb-0.5">For You</span>
        <span className="opacity-80">Live</span>
      </div>

      {/* Center Hook Overlay Sticker */}
      <div className="relative z-10 my-auto text-center px-2">
        <div className="inline-block bg-black/75 backdrop-blur-md border border-white/20 px-3.5 py-2.5 rounded-xl shadow-lg">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
            ⚡ STOP SCROLLING
          </span>
          <p className="text-sm font-extrabold text-white leading-snug">
            "{hookText}"
          </p>
        </div>
      </div>

      {/* Floating Right Action Rail */}
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <span className="text-[10px] font-semibold mt-1">42.8k</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-1">1.2k</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-1">8.4k</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-semibold mt-1">Share</span>
        </div>
      </div>

      {/* Bottom Content & Interactive CTA */}
      <div className="relative z-10 space-y-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">@{handleName}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90">Sponsored</span>
          </div>
          <p className="text-xs text-white/90 line-clamp-2 mt-1 leading-snug">
            {bodyText}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-white/80 mt-1">
            <Music className="w-3 h-3" />
            <span className="truncate">Original Sound · Trending Business Sound</span>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer">
          <span className="truncate">{ctaLabel}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </div>
      </div>
    </div>
  );
};
