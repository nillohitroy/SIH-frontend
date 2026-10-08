'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Plus, 
  Settings, 
  X, 
  PanelLeftClose, 
  CheckCircle2,
  Database,
  Link // Added Link icon for the URL input
} from 'lucide-react';
import SatelliteEmblem from '@/components/SatelliteEmblem';
import { SatelliteSession } from '@/lib/types';

interface SidebarProps {
  sessions: SatelliteSession[];
  activeChatId: number | null;
  onClose: () => void;
  onSelectChat: (id: number | null) => void;
  backendUrl: string;                   // <-- Added backendUrl prop
  setBackendUrl: (url: string) => void; // <-- Added setBackendUrl prop
}

export default function Sidebar({
  sessions,
  activeChatId,
  onClose,
  onSelectChat,
  backendUrl,       // <-- Destructured
  setBackendUrl     // <-- Destructured
}: SidebarProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      <div className="flex flex-col w-full h-full bg-zinc-50 dark:bg-[#13141a] transition-all duration-300 ease-in-out shrink-0">
        
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-blue-600 text-zinc-50 dark:text-white flex items-center justify-center shadow-sm">
              <SatelliteEmblem size={17} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-tight text-base text-zinc-900 dark:text-slate-50">SatQuery</span>
              <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-700/60 font-mono">
                AI
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        </div>

        {/* Start New Session Button */}
        <div className="p-3">
          <button
            onClick={() => onSelectChat(null)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-sm font-medium text-zinc-800 dark:text-slate-100 shadow-sm transition-all group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-blue-400 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                <Plus size={13} strokeWidth={2.4} />
              </div>
              <span>Start New Session</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-slate-400 bg-zinc-50 dark:bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
              ⌘K
            </span>
          </button>
        </div>

        {/* Active Satellite Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="px-2 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-sans">
              <Globe size={12} className="text-blue-600 dark:text-blue-400" />
              ACTIVE SESSIONS
            </span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-slate-400 bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              {sessions.length}
            </span>
          </div>

          <div className="space-y-1">
            {sessions.map((chat) => {
              const isSelected = activeChatId === chat.id;
              
              return (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group relative cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-slate-50 font-medium shadow-sm border border-zinc-200 dark:border-blue-500/40'
                      : 'text-zinc-700 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-slate-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <SatelliteEmblem
                      size={15}
                      className={`shrink-0 transition-colors ${
                        isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-zinc-400 dark:text-slate-400 group-hover:text-zinc-600 dark:group-hover:text-blue-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs capitalize">{chat.title}</p>
                      {chat.coordinates && (
                        <p className="text-[10px] font-mono text-blue-600/80 dark:text-blue-400/80 truncate mt-0.5">
                          [Spatial Data Detected]
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-slate-500 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    {chat.time}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile / Status Footer */}
        <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-100/90 dark:bg-zinc-900/50">
          <div
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 border border-transparent transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-blue-600/30 dark:border dark:border-blue-500/40 text-zinc-50 dark:text-blue-300 flex items-center justify-center font-mono font-medium text-xs shadow-sm">
                NR
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-slate-100 leading-none">
                    Nillohit Roy
                  </span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.5 bg-zinc-200 dark:bg-blue-950 text-zinc-700 dark:text-blue-300 rounded">
                    ADMIN
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  Backend Connected
                </span>
              </div>
            </div>
            <Settings size={16} className="text-zinc-400 dark:text-slate-400 group-hover:text-zinc-700 dark:group-hover:text-slate-200 transition-colors" />
          </div>
        </div>
      </div>

      {/* NEW: Clean, Backend-focused Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1b1e] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-5 text-zinc-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold">Backend & Model Settings</h2>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-5 text-xs">
              
              {/* Ngrok URL Configuration */}
              <div>
                <label className="block font-medium mb-1.5 text-zinc-700 dark:text-slate-300">
                  FastAPI / Ngrok Endpoint URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link size={14} className="text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="https://your-ngrok-url.app"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  Paste your Kaggle Ngrok URL here. Do not include a trailing slash.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="font-mono text-[11px] font-medium text-emerald-800 dark:text-emerald-300">LLaVA 7B GPU Orchestrator</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={12} /> Active
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-zinc-900 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}