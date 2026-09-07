"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Copy, Download, Share2, RefreshCw, Check, PenLine, Loader2, Sparkles } from "lucide-react";
import { Message } from "@/app/page";

interface ChatThreadProps {
  messages: Message[];
}

export default function ChatThread({ messages }: ChatThreadProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto w-full px-4 md:px-12 lg:px-24 py-8 space-y-10 pb-40">
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        
        let imageContextForEvidence = undefined;
        if (!isUser && msg.coordinates) {
          for (let i = index - 1; i >= 0; i--) {
            if (messages[i].imagePreviews && messages[i].imagePreviews!.length > 0) {
              imageContextForEvidence = messages[i].imagePreviews![0]; // Draw on the first image
              break;
            }
          }
        }

        return isUser ? (
          <UserMessageRow key={index} msg={msg} />
        ) : (
          <AssistantMessageRow key={index} msg={msg} imageContext={imageContextForEvidence} />
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
}

function UserMessageRow({ msg }: { msg: Message }) {
  const [hasCopied, setHasCopied] = useState(false);

  return (
    <div className="flex flex-col items-end gap-1 w-full group">
      <div className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-5 py-4 rounded-3xl rounded-tr-sm max-w-[85%] md:max-w-[70%] lg:max-w-[60%] shadow-sm">
        
        {/* Render Multiple Images if present */}
        {msg.imagePreviews && msg.imagePreviews.length > 0 && (
          <div className="flex gap-3 mb-4 overflow-x-auto">
            {msg.imagePreviews.map((src, idx) => (
              <img 
                key={idx}
                src={src} 
                alt={`Uploaded ${idx + 1}`} 
                className="rounded-xl h-40 w-auto object-cover shadow-sm border border-black/10 dark:border-white/10 shrink-0"
              />
            ))}
          </div>
        )}
        <p className="text-[16px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
      </div>

      <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={() => { navigator.clipboard.writeText(msg.text); setHasCopied(true); setTimeout(() => setHasCopied(false), 2000); }} className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          {hasCopied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <PenLine className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AssistantMessageRow({ msg, imageContext }: { msg: Message, imageContext?: string }) {
  const [hasCopied, setHasCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 rounded-xl bg-black dark:bg-white flex items-center justify-center shrink-0 shadow-sm mt-1">
        <span className="text-white dark:text-black text-xs font-bold">SQ</span>
      </div>
      
      <div className="flex-1 space-y-4 pt-1 text-[16px] text-black/90 dark:text-white/90 leading-relaxed max-w-full">
        {msg.isLoading ? (
          <div className="flex items-center gap-3 text-black/50 dark:text-white/50 h-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium animate-pulse">Routing via Semantic Agent...</span>
          </div>
        ) : (
          <>
            {/* Hackathon Flex: Show the Agent Tool Used */}
            {msg.agentMetadata && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[12px] font-medium border border-blue-100 dark:border-blue-900/30 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Routed via: {msg.agentMetadata.tool_used}
              </div>
            )}

            <p className="whitespace-pre-wrap">{msg.text}</p>
            
            {msg.coordinates && imageContext && (
              <div className="mt-4 relative w-full max-w-2xl overflow-hidden rounded-xl border border-black/10 dark:border-white/10 shadow-sm">
                <div className="bg-black/5 dark:bg-white/5 p-2 text-xs font-semibold text-black/60 dark:text-white/60 uppercase tracking-wider border-b border-black/10 dark:border-white/10">
                  Visual Evidence Locator
                </div>
                <div className="relative">
                  <img src={imageContext} alt="Evidence Context" className="w-full h-auto block" />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <rect
                      y={`${msg.coordinates.ymin / 10}%`}
                      x={`${msg.coordinates.xmin / 10}%`}
                      height={`${(msg.coordinates.ymax - msg.coordinates.ymin) / 10}%`}
                      width={`${(msg.coordinates.xmax - msg.coordinates.xmin) / 10}%`}
                      fill="rgba(59, 130, 246, 0.2)" 
                      stroke="#3b82f6" strokeWidth="3" strokeDasharray="4" rx="4"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 relative" ref={menuRef}>
              <button onClick={() => { if(msg.text) { navigator.clipboard.writeText(msg.text); setHasCopied(true); setTimeout(() => setHasCopied(false), 2000); } }} title="Copy output" className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                {hasCopied ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button title="Regenerate" className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${isMenuOpen ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : ''}`}>
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute top-12 left-20 w-48 bg-white dark:bg-[#1a1b1e] border border-black/10 dark:border-white/10 shadow-xl rounded-xl py-1.5 z-50 text-[13px] animate-in fade-in zoom-in-95 duration-100">
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-left text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Download className="w-4 h-4" /> Export to PDF
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}