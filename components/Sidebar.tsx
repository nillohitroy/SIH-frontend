"use client";

import { useState, useRef, useEffect } from "react";
import { PanelLeftClose, Plus, Settings, LogOut, CreditCard, ChevronUp } from "lucide-react";

// Import the ChatSession type from page.tsx (adjust the import path if needed)
import { ChatSession } from "@/app/page";

interface SidebarProps {
  sessions: ChatSession[];
  activeChatId: string | null;
  onClose: () => void;
  onSelectChat: (id: string | null) => void;
}

export default function Sidebar({ sessions, activeChatId, onClose, onSelectChat }: SidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-[260px] min-w-[260px] h-full bg-[#f9f9f9] dark:bg-[#13141a] flex flex-col px-3 py-4 font-sans transition-colors relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <span className="text-sm font-semibold text-black/80 dark:text-white/80 tracking-wide">
          SatQuery
        </span>
        <button onClick={onClose} className="p-1.5 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-all cursor-pointer">
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <button 
        onClick={() => onSelectChat(null)} 
        className="flex items-center gap-2 w-full px-2 py-2 mb-6 text-[13px] font-medium text-black/80 dark:text-white/80 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg shadow-sm hover:shadow hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
        Start new chat
      </button>

      {/* Chat History Grouped */}
      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
        <div>
          <p className="text-[11px] font-semibold text-black/40 dark:text-white/40 px-2 pb-2 uppercase tracking-wider">
            Recent Analysis
          </p>
          <div className="space-y-0.5">
            {sessions.length === 0 ? (
              <p className="text-[12px] text-black/40 dark:text-white/40 px-2 py-2 italic">No recent chats</p>
            ) : (
              sessions.map((chat) => (
                <button 
                  key={chat.id} 
                  onClick={() => onSelectChat(chat.id)} 
                  className={`flex items-center w-full px-2 py-2 text-[13px] text-left rounded-lg transition-colors group cursor-pointer ${
                    activeChatId === chat.id 
                      ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white font-medium' 
                      : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="truncate flex-1 relative z-10 leading-relaxed capitalize">
                    {chat.title}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="mt-auto pt-2 shrink-0 relative" ref={userMenuRef}>
        {isUserMenuOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-[#1a1b1e] border border-black/10 dark:border-white/10 shadow-xl rounded-xl py-1.5 z-50 text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="h-px bg-black/10 dark:bg-white/10 my-1.5"></div>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}

        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`flex items-center gap-2 w-full p-2 rounded-xl transition-colors cursor-pointer ${isUserMenuOpen ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">NR</span>
          </div>
          <div className="flex-1 text-left truncate">
            <p className="text-[13px] font-medium text-black/90 dark:text-white/90 truncate leading-tight">Nillohit Roy</p>
            <p className="text-[11px] text-black/50 dark:text-white/50 truncate">SatQuery Pro</p>
          </div>
          <ChevronUp className={`w-4 h-4 text-black/40 dark:text-white/40 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}