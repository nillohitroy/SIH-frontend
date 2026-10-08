'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Scan, 
  History, 
  Layers, 
  MessageSquareDashed, 
  Image as ImageIcon,
  HelpCircle
} from 'lucide-react';
import SatelliteEmblem from '@/components/SatelliteEmblem';

interface HeroAnimationProps {
  onSelectPrompt: (promptText: string, autoRun?: boolean) => void;
  onSelectTool: (toolId: string) => void;
}

const PROMPT_SUGGESTIONS = [
  "What is the primary land cover class in this sector?",
  "Locate the urban structures and provide the bounding box.",
  "What has changed over time between these two dates?",
  "Fuse the optical and SAR data to find hidden structures."
];

const QUICK_MODULES = [
  { id: 'visual-qa', icon: HelpCircle, label: 'Visual Q&A', desc: 'Ask freeform questions about imagery' },
  { id: 'region-highlighting', icon: Scan, label: 'Region Highlighting', desc: 'Extract exact object bounding boxes' },
  { id: 'change-detection', icon: History, label: 'Change Detection', desc: 'Map spatial terrain differences' },
  { id: 'optical-sar', icon: Layers, label: 'Optical + SAR', desc: 'Cross-modal data fusion' },
  { id: 'change-vqa', icon: MessageSquareDashed, label: 'Change VQA', desc: 'Multitemporal visual QA' },
  { id: 'scene-description', icon: ImageIcon, label: 'Scene Description', desc: 'Caption and identify land cover' },
];

export default function HeroAnimation({ onSelectPrompt, onSelectTool }: HeroAnimationProps) {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = PROMPT_SUGGESTIONS[index];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayedText.length < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 24);
    } else if (!isDeleting && displayedText.length === fullText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 3200);
    } else if (isDeleting && displayedText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length - 1));
      }, 12);
    } else if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % PROMPT_SUGGESTIONS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, index]);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 pt-6 pb-6 select-none my-auto">
      
      <div className="mb-5 relative group animate-in zoom-in duration-500">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-800 dark:text-blue-400 shadow-sm transition-transform duration-300 group-hover:scale-105">
          <SatelliteEmblem size={28} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 dark:bg-blue-600 text-zinc-50 dark:text-white border-2 border-white dark:border-[#090a0f] flex items-center justify-center shadow-sm">
          <Sparkles size={9} strokeWidth={2.4} />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl text-zinc-900 dark:text-slate-50 font-semibold tracking-tight mb-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        SatQuery AI
      </h1>

      <p className="text-zinc-600 dark:text-slate-400 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis.
      </p>

      <button
        // CHANGED: autoRun is now `false`, so it simply pastes the text into the ChatInput box
        onClick={() => onSelectPrompt(PROMPT_SUGGESTIONS[index], false)}
        className="group relative flex items-center gap-3 px-4 py-3.5 max-w-xl w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-left animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300"
      >
        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
          <SatelliteEmblem size={15} />
        </div>
        <div className="flex-1 min-w-0 pr-2">
          <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-500 dark:text-slate-500 block mb-0.5">
            Suggested Query
          </span>
          <div className="text-xs sm:text-sm font-mono text-zinc-800 dark:text-slate-100 truncate h-5 flex items-center">
            <span>{displayedText}</span>
            <span className="inline-block w-1.5 h-3.5 bg-blue-600 dark:bg-blue-400 ml-0.5 animate-pulse rounded-sm" />
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 flex items-center gap-1 text-xs font-medium shrink-0 font-mono">
          {/* CHANGED: Text updated to "Use" instead of "Run" */}
          <span>Use</span>
          <ArrowRight size={13} />
        </div>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full mt-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        {QUICK_MODULES.map((pill) => (
          <button
            key={pill.id}
            onClick={() => onSelectTool(pill.id)}
            className="flex items-start gap-3 p-3 text-left rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-150 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:border-blue-500/40 transition-colors shrink-0">
              <pill.icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                <span>{pill.label}</span>
                <ChevronRight size={13} className="text-zinc-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-slate-400 truncate mt-0.5">
                {pill.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}