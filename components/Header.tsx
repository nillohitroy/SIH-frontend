'use client';

import React, { useState, useEffect } from 'react';
import { 
  PanelLeftOpen, 
  Sun, 
  Moon, 
  Plus, 
  Share2, 
  Check 
} from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
  onNewSession: () => void;
}

export default function Header({
  isSidebarOpen,
  onOpenSidebar,
  onNewSession,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Check the initial theme on load
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const handleToggleTheme = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    if (nextIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-14 border-b border-zinc-200/70 dark:border-zinc-800/80 px-4 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#090a0f]/80 backdrop-blur-md z-20 transition-colors">
      
      {/* Left side */}
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
            title="Open sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        <div className="flex items-center gap-2">
          {/* Logo only shows up if Sidebar is hidden to avoid duplicate logos */}
          {!isSidebarOpen && (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-slate-50">
                SatQuery
              </span>
              <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-700/60 font-mono">
                AI
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={handleToggleTheme}
          className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-slate-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm group cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            {isDark ? (
              <Sun size={15} className="text-amber-300 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={15} className="text-zinc-700 group-hover:-rotate-12 transition-transform" />
            )}
          </div>
          <span className="text-xs font-mono font-medium hidden sm:inline">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* New Session Button */}
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 bg-zinc-50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span className="hidden sm:inline font-mono">New session</span>
        </button>

        {/* Share Session Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative"
          title="Share geospatial session"
        >
          {copied ? (
            <Check size={16} className="text-emerald-500" />
          ) : (
            <Share2 size={16} />
          )}

          {copied && (
            <span className="absolute -bottom-8 right-0 text-[10px] font-mono bg-zinc-900 text-white dark:bg-zinc-800 px-2 py-1 rounded shadow-md whitespace-nowrap animate-in fade-in">
              Link copied!
            </span>
          )}
        </button>
      </div>
    </header>
  );
}