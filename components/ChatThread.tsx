'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  RotateCcw,
  Image as ImageIcon,
  FileText,
  MapPin,
  Database,
  Eye,
  Crop
} from 'lucide-react';
import SatelliteEmblem from '@/components/SatelliteEmblem';
import { ChatMessage, Attachment } from '@/lib/types';
import { EvidenceModal } from '@/components/EvidenceModal';
import { ImageRegionSelector } from '@/components/ImageRegionSelector';

interface ChatThreadProps {
  messages: ChatMessage[];
  onRerun?: (messageIndex: number) => void;
  onRegionQuery?: (question: string, box: { ymin: number; xmin: number; ymax: number; xmax: number }, imageUrl: string) => void;
}

export default function ChatThread({
  messages,
  onRerun,
  onRegionQuery
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Modal States
  const [evidenceModalMsgId, setEvidenceModalMsgId] = useState<string | null>(null);
  const [regionSelectorUrl, setRegionSelectorUrl] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-[14px]">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 pt-1 pb-0.5">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('• ') || line.startsWith('- ')) {
            const rawText = line.replace(/^[•-]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-blue-600 dark:text-blue-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(rawText) }} />
              </div>
            );
          }
          if (/^\d+\.\s+/.test(line)) {
            const number = line.match(/^(\d+)\.\s+/)?.[1];
            const text = line.replace(/^\d+\.\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="font-mono text-blue-600 dark:text-blue-400 font-medium shrink-0 text-xs mt-0.5">
                  {number}.
                </span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1.5" />;
          }
          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-zinc-600 dark:text-zinc-400">$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 font-mono text-[11px] text-blue-600 dark:text-blue-400 border border-zinc-300/60 dark:border-zinc-700">$1</code>');
  };

  const activeEvidenceMsg = messages.find(m => m.id === evidenceModalMsgId);

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-6 space-y-6 flex-1">
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const isLiked = !!likedIds[msg.id];
        const isLoading = msg.content === "Routing via Semantic Agent...";

        if (isLoading) {
          return (
            <div key="loading-state" className="flex gap-3 sm:gap-4 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-blue-600 text-zinc-50 dark:text-white flex items-center justify-center shrink-0 shadow-sm mt-1 animate-pulse">
                <SatelliteEmblem size={15} />
              </div>
              <div className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  Analyzing spectral bands &amp; geo-coordinates...
                </span>
              </div>
            </div>
          );
        }

        // Collect all attachments from message
        const attachmentsList: Attachment[] = [];
        if ((msg as any).attachments && Array.isArray((msg as any).attachments)) {
          attachmentsList.push(...(msg as any).attachments);
        } else if (msg.attachment) {
          attachmentsList.push(msg.attachment);
        }

        let assistantInlineImage = null;
        if (msg.output_images && msg.output_images.length > 0) {
          if (msg.output_images.length === 2) {
             assistantInlineImage = msg.output_images[1];
          } else {
             assistantInlineImage = msg.output_images[0];
          }
        }

        return (
          <div
            key={msg.id || index}
            className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
          >
            {!isUser && (
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-blue-600 text-zinc-50 dark:text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <SatelliteEmblem size={15} />
              </div>
            )}

            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[80%]`}>

              <div className="text-[11px] text-zinc-500 dark:text-zinc-500 mb-1 px-1 flex items-center gap-2 font-mono">
                <span className="font-medium text-zinc-800 dark:text-zinc-300">
                  {isUser ? 'Earth Analyst' : 'SatQuery AI'}
                </span>
                <span>•</span>
                <span>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>

              <div
                className={`px-4 py-3.5 rounded-2xl text-xs sm:text-[14px] leading-relaxed border ${
                  isUser
                    ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700/60 rounded-tr-sm shadow-sm'
                    : 'bg-white dark:bg-[#1a1b1e] text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 rounded-tl-sm shadow-sm'
                }`}
              >
                {/* 1. Render All User Attachments inside User Prompt */}
                {isUser && attachmentsList.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {attachmentsList.map((att, aIdx) => {
                      
                      // Safely grab the URL without triggering the renderer bug
                      let attUrl = att.previewUrl;
                      if (!attUrl) attUrl = att.url;
                      if (!attUrl && typeof att === 'string') attUrl = att;
                      
                      // Avoid regex and standard pipes to bypass markdown/copy-paste bugs
                      const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff'];
                      const hasImageExt = (str?: string) => {
                        if (!str) return false;
                        const lower = str.toLowerCase();
                        return validExts.some(ext => lower.endsWith(ext));
                      };

                      let isImage = false;
                      if (att.type === 'image') {
                        isImage = true;
                      } else if (hasImageExt(attUrl)) {
                        isImage = true;
                      } else if (hasImageExt(att.name)) {
                        isImage = true;
                      }

                      if (isImage && attUrl) {
                        return (
                          <div key={aIdx} className="inline-block mr-2">
                            <img
                              src={attUrl}
                              alt={att.name || "Uploaded Satellite Patch"}
                              className="rounded-lg max-h-56 object-cover border border-zinc-200 dark:border-zinc-700 w-auto shadow-sm"
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div key={aIdx} className="p-2 rounded-xl border flex items-center gap-2.5 text-xs font-mono bg-zinc-200/50 border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
                            <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <FileText size={13} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium truncate flex-1">{att.name || "Document File"}</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-75 shrink-0 bg-black/10 dark:bg-black/40 px-1.5 py-0.5 rounded">
                              Indexed
                            </span>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}

                {/* 2. Assistant Output Evidence Image with Crop Button */}
                {!isUser && assistantInlineImage && (
                  <div className="mb-3 relative group inline-block">
                    <img
                      src={assistantInlineImage}
                      alt="Highlighted Analysis Output"
                      className="rounded-lg max-h-64 object-cover border border-zinc-200 dark:border-zinc-700 w-auto shadow-sm"
                    />
                    <button
                      onClick={() => setRegionSelectorUrl(assistantInlineImage as string)}
                      className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-900 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      title="Select a region on this evidence to inspect"
                    >
                      <Crop size={13} />
                      <span>Select Region</span>
                    </button>
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono rounded-md shadow">
                      {msg.output_images && msg.output_images.length === 2 ? 'Highlighted After Image' : 'Analysis Output'}
                    </div>
                  </div>
                )}

                {renderContent(msg.content)}

                {/* Metrics Bar & Evidence Trigger */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-200/70 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
                        <Database size={11} /> satquery-llava-7b
                      </span>

                      {msg.metrics?.crs && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                          <MapPin size={11} /> Routed via: {msg.metrics.crs}
                        </span>
                      )}
                    </div>

                    {msg.output_images && msg.output_images.length > 0 && (
                      <button
                        onClick={() => setEvidenceModalMsgId(msg.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                        title="View Visual Evidence, Comparison Slider & Download PDF Report"
                      >
                        <Eye size={13} />
                        <span>Evidence</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!isUser && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1 text-zinc-400 dark:text-zinc-500">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="p-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Copy analysis"
                  >
                    {copiedId === msg.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>

                  <button
                    onClick={() => toggleLike(msg.id)}
                    className={`p-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                      isLiked ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    title="Mark verified ground-truth"
                  >
                    <ThumbsUp size={13} className={isLiked ? 'fill-current' : ''} />
                  </button>

                  {onRerun && (
                    <button
                      onClick={() => onRerun(index)}
                      className="p-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Re-run classification"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {isUser && (
              <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-mono font-medium shrink-0 mt-1 shadow-sm border border-transparent dark:border-zinc-700">
                AR
              </div>
            )}
          </div>
        );
      })}

      {/* Evidence Modal Popup Component */}
      {activeEvidenceMsg && (
        <EvidenceModal
          isOpen={!!evidenceModalMsgId}
          onClose={() => setEvidenceModalMsgId(null)}
          taskType={activeEvidenceMsg.metrics?.crs || 'visual_qa'}
          prompt={activeEvidenceMsg.content}
          answer={activeEvidenceMsg.content}
          outputImages={activeEvidenceMsg.output_images || []}
        />
      )}

      {/* Image Region Selector Crop Modal */}
      {regionSelectorUrl && (
        <ImageRegionSelector
          isOpen={!!regionSelectorUrl}
          onClose={() => setRegionSelectorUrl(null)}
          imageUrl={regionSelectorUrl}
          onSubmitRegionQuery={(question, box) => {
            if (onRegionQuery) {
              onRegionQuery(question, box, regionSelectorUrl);
            }
          }}
        />
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}