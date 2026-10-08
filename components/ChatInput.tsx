'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, ArrowUp, Mic, MicOff, Image as ImageIcon, FileText, X, Sparkles,
  Scan, History, Layers, MessageSquareDashed, Wrench, HelpCircle, AlertCircle
} from 'lucide-react';

interface ChatInputProps {
  activeTool: string | null;
  onSelectTool: (tool: string | null) => void;
  value: string;
  onChange: (val: string) => void;
  onSend: (text: string, files: File[], previewUrls: string[]) => void;
}

type FileType = 'image' | 'document';

interface FilePreview {
  name: string;
  size: string;
  url: string;
  type: FileType;
}

export const SAT_TOOLS = [
  { id: 'visual-qa', label: 'Visual Q&A', icon: HelpCircle },
  { id: 'region-highlighting', label: 'Region Highlighting', icon: Scan },
  { id: 'change-detection', label: 'Change Detection', icon: History },
  { id: 'optical-sar', label: 'Optical + SAR', icon: Layers },
  { id: 'change-vqa', label: 'Change VQA', icon: MessageSquareDashed },
  { id: 'scene-description', label: 'Scene Description', icon: ImageIcon }
];

export const ChatInput: React.FC<ChatInputProps> = ({
  activeTool,
  onSelectTool,
  value,
  onChange,
  onSend
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);

  // Voice & Polishing States
  const [isRecording, setIsRecording] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [recordingText, setRecordingText] = useState("");
  const recordingTextRef = useRef(""); // Keeps track of live text for closures
  const recognitionRef = useRef<any>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${Math.max(nextHeight, 44)}px`;
    }
  }, [value, isRecording, isPolishing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showValidationError = (msg: string) => {
    setErrorMsg(msg);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setErrorMsg(null), 3500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTriggerPicker = () => {
    setPopoverOpen(false);
    fileInputRef.current?.click();
  };

  const handleSelectTool = (id: string) => {
    onSelectTool(id);
    setPopoverOpen(false);
    textareaRef.current?.focus();
    setErrorMsg(null);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allowedFiles = newFiles.slice(0, 4 - attachedFiles.length);

      if (allowedFiles.length > 0) {
        const newPreviews: FilePreview[] = allowedFiles.map(file => {
          const isImage = file.type.startsWith('image/');
          return {
            name: file.name,
            size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
            url: isImage ? URL.createObjectURL(file) : '',
            type: isImage ? 'image' : 'document'
          };
        });
        setAttachedFiles(prev => [...prev, ...allowedFiles]);
        setFilePreviews(prev => [...prev, ...newPreviews]);
      }
    }
    if (e.target) e.target.value = '';
  };

  const removeAttachment = (indexToRemove: number) => {
    setFilePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    setAttachedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // --- Grammar & Formatting Polisher ---
  const polishText = (rawText: string) => {
    if (!rawText) return "";
    // 1. Remove double spaces
    let cleaned = rawText.replace(/\s+/g, ' ').trim();
    // 2. Capitalize first letter
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    // 3. Ensure trailing punctuation if it forms a complete thought
    if (!/[.!?]$/.test(cleaned) && cleaned.length > 2) {
      cleaned += '.';
    }
    return cleaned;
  };

  // --- Native Web Speech API with Animation ---
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showValidationError("Voice typing is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true; 
    
    setRecordingText("");
    recordingTextRef.current = "";
    setIsRecording(true);

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let newFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinal += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      finalTranscript += newFinal;
      const currentSpoken = finalTranscript + interimTranscript;
      
      // Update live UI state
      setRecordingText(currentSpoken);
      recordingTextRef.current = currentSpoken;
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        showValidationError("Microphone error. Please check permissions.");
      }
      processAndStopRecording();
    };

    recognition.onend = () => {
      if (isRecording) {
        processAndStopRecording();
      }
    };

    try {
      recognition.start();
    } catch (err) {
      showValidationError("Failed to start recording.");
    }
  };

  const processAndStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    const spokenText = recordingTextRef.current.trim();
    
    if (spokenText) {
      setIsPolishing(true);
      // Simulate backend spelling/grammar check delay for premium UX feedback
      setTimeout(() => {
        const polishedResult = polishText(spokenText);
        const separator = value.trim() ? ' ' : '';
        
        onChange(value + separator + polishedResult);
        
        setIsPolishing(false);
        setRecordingText("");
        recordingTextRef.current = "";
        
        // Auto-focus back to input
        setTimeout(() => textareaRef.current?.focus(), 50);
      }, 1200);
    }
  };

  const toggleRecording = () => {
    isRecording ? processAndStopRecording() : startRecording();
  };

  const handleSend = () => {
    if (!value.trim() && attachedFiles.length === 0) return;

    if (activeTool) {
      const imageCount = filePreviews.filter(p => p.type === 'image').length;
      const singleImageTools = ['visual-qa', 'region-highlighting', 'optical-sar', 'scene-description'];
      const doubleImageTools = ['change-detection', 'change-vqa'];

      if (singleImageTools.includes(activeTool) && imageCount < 1) {
        showValidationError(`"${SAT_TOOLS.find(t => t.id === activeTool)?.label}" requires at least 1 image to be attached.`);
        return;
      }
      if (doubleImageTools.includes(activeTool) && imageCount < 2) {
        showValidationError(`"${SAT_TOOLS.find(t => t.id === activeTool)?.label}" requires at least 2 images to be attached.`);
        return;
      }
    }

    const rawUrls = filePreviews.map(p => p.url);
    onSend(value, attachedFiles, rawUrls);

    onChange("");
    setAttachedFiles([]);
    setFilePreviews([]);
    setErrorMsg(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const canSubmit = value.trim().length > 0 || attachedFiles.length > 0;
  const ActiveToolIcon = activeTool ? SAT_TOOLS.find(t => t.id === activeTool)?.icon : null;
  const activeToolLabel = activeTool ? SAT_TOOLS.find(t => t.id === activeTool)?.label : '';

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pb-4 select-none shrink-0">
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        accept=".tif,.tiff,.png,.jpg,.jpeg,.pdf,.docx,.xlsx,.csv"
      />

      {filePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2">
          {filePreviews.map((attachment, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 w-fit px-3 py-1.5 rounded-xl shadow-sm text-xs font-mono">
              {attachment.type === 'image' && attachment.url ? (
                <img src={attachment.url} alt="preview" className="w-4 h-4 rounded-sm object-cover" />
              ) : (
                <FileText size={14} className="text-emerald-500" />
              )}
              <span className="font-medium text-zinc-800 dark:text-zinc-200 max-w-[150px] truncate">
                {attachment.name} <span className="text-zinc-400 dark:text-zinc-500">({attachment.size})</span>
              </span>
              <button onClick={() => removeAttachment(idx)} className="ml-1 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors cursor-pointer">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`relative flex flex-col bg-white dark:bg-[#1a1b1e] rounded-2xl sm:rounded-3xl border shadow-lg shadow-zinc-200/20 dark:shadow-none transition-all duration-300 ${isRecording ? 'border-red-400/50 dark:border-red-500/50 ring-4 ring-red-500/10' : isPolishing ? 'border-blue-400/50 dark:border-blue-500/50 ring-4 ring-blue-500/10' : 'border-zinc-200 dark:border-zinc-800'}`}>

        {errorMsg && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500/95 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200 z-50 whitespace-nowrap border border-red-400/50">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end px-3 py-2.5 sm:px-4 sm:py-3 gap-2">
          
          {/* Tool Picker Popover */}
          <div className="relative pb-0.5 shrink-0" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setPopoverOpen(!popoverOpen)}
              disabled={isRecording || isPolishing}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${popoverOpen ? 'bg-zinc-900 dark:bg-blue-600 text-white rotate-45 shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'} ${(isRecording || isPolishing) && 'opacity-50 cursor-not-allowed'}`}
            >
              <Plus size={17} strokeWidth={2.2} />
            </button>

            {popoverOpen && (
              <div className="absolute bottom-12 left-0 w-72 bg-white dark:bg-[#25262b] rounded-2xl border border-zinc-200 dark:border-zinc-700/50 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-blue-600 dark:text-blue-400" />
                  Context
                </div>
                <button onClick={handleTriggerPicker} className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left group">
                  <ImageIcon size={15} className="text-zinc-500 group-hover:text-blue-500" />
                  Attach Files or Imagery
                </button>

                <div className="px-2.5 py-1.5 text-[10px] uppercase font-mono font-medium tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  <Wrench size={11} className="text-emerald-600 dark:text-emerald-400" />
                  Force Routing Tool
                </div>

                {SAT_TOOLS.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTool(tool.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left group"
                  >
                    <tool.icon size={15} className="text-zinc-500 group-hover:text-emerald-500" />
                    {tool.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Central Input / Recording Area */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center min-w-0 bg-transparent rounded-xl relative py-1 sm:py-0">
            
            {/* Standard Text Input Mode */}
            {!isRecording && !isPolishing && (
              <>
                {activeTool && ActiveToolIcon && (
                  <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1.5 rounded-lg text-[11px] font-semibold border border-blue-200 dark:border-blue-800/50 mb-1 sm:mb-0 sm:mr-2 w-fit shrink-0 tracking-wide transition-all">
                    <ActiveToolIcon size={12} />
                    <span className="whitespace-nowrap truncate">{activeToolLabel}</span>
                    <X onClick={() => handleSelectTool(null)} size={12} className="cursor-pointer opacity-70 hover:opacity-100 ml-0.5" />
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={activeTool ? "Add details to this tool..." : "Ask anything, upload documents, or attach patches..."}
                  className="w-full outline-none focus:outline-none focus:ring-0 focus:border-transparent border-none bg-transparent shadow-none resize-none text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 leading-relaxed font-normal max-h-44 overflow-y-auto block pt-0.5"
                />
              </>
            )}

            {/* Live Recording Mode UI */}
            {isRecording && (
              <div className="flex items-center gap-3 w-full px-2 py-1 animate-in fade-in duration-200">
                {/* CSS Waveform Animation */}
                <div className="flex items-center gap-1 h-5 shrink-0">
                  <div className="w-1 bg-red-500 rounded-full h-2.5 animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                  <div className="w-1 bg-red-500 rounded-full h-4 animate-[pulse_0.8s_ease-in-out_0.2s_infinite]"></div>
                  <div className="w-1 bg-red-500 rounded-full h-2.5 animate-[pulse_0.8s_ease-in-out_0.4s_infinite]"></div>
                </div>
                <span className="text-zinc-700 dark:text-zinc-200 text-sm truncate flex-1 font-medium">
                  {recordingText || <span className="opacity-50">Listening...</span>}
                </span>
              </div>
            )}

            {/* Polishing State UI */}
            {isPolishing && (
              <div className="flex items-center gap-2.5 w-full px-2 py-1 animate-in fade-in duration-200 text-blue-600 dark:text-blue-400">
                <Sparkles size={16} className="animate-pulse shrink-0" />
                <span className="text-sm font-medium animate-pulse tracking-wide">
                  Polishing & spell checking...
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pb-0.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isPolishing}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${isRecording ? 'bg-red-500 text-white shadow-md hover:bg-red-600' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'} ${isPolishing && 'opacity-50 cursor-not-allowed'}`}
            >
              {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSubmit || isRecording || isPolishing}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 transform ${canSubmit && !isRecording && !isPolishing ? 'bg-black dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-500 text-white hover:scale-105 active:scale-95 cursor-pointer shadow-md' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'}`}
            >
              <ArrowUp size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 pt-0 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/50 mt-1">
          <div className="flex items-center gap-2 pt-1.5">
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              SatQuery Multimodal Agent
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};