'use client';

import { useState, useEffect, useCallback } from 'react';
import { SatelliteSession, ChatMessage, Attachment, ThemeMode } from '@/lib/types';

export function useSatQuery() {
  const [backendUrl, setBackendUrl] = useState('https://unpretty-keira-nonenigmatic.ngrok-free.dev');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Chat Input State
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Session State
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<SatelliteSession[]>([]);
  const [sessionMessages, setSessionMessages] = useState<Record<number, ChatMessage[]>>({});

  // UI State
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('satquery_theme') as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    try {
      localStorage.setItem('satquery_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const generateTitle = (text: string) => {
    const cleanText = text.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const words = cleanText.split(" ");
    return words.length <= 4 ? cleanText : words.slice(0, 4).join(" ") + "...";
  };

  const startNewSession = useCallback(() => {
    setActiveChatId(null);
    setInputValue('');
    setActiveAttachment(null);
    setImageFiles([]);
    setActiveTool(null);
    setIsThinking(false);
  }, []);

  const selectSession = useCallback((id: number) => {
    setActiveChatId(id);
    setIsThinking(false);
    setActiveAttachment(null);
    setImageFiles([]);
    setActiveTool(null);
    setInputValue('');
  }, []);

  const sendMessage = useCallback(async (overrideText?: string, filesToUpload?: File[], overrideAttachment?: Attachment | null) => {
    const textToSend = (overrideText !== undefined ? overrideText : inputValue).trim();
    const files = filesToUpload || imageFiles;
    const attachment = overrideAttachment !== undefined ? overrideAttachment : activeAttachment;

    if (!textToSend && files.length === 0 && !attachment) return;

    const finalQueryText = activeTool ? `[Use Tool: ${activeTool}] ${textToSend}` : textToSend;

    const allAttachments: Attachment[] = [];
    if (attachment) {
      allAttachments.push(attachment);
    }
    if (files.length > 0) {
      files.forEach(file => {
        const isImg = file.type.startsWith('image/');
        allAttachments.push({
          name: file.name,
          type: isImg ? 'image' : 'file',
          url: URL.createObjectURL(file),
          previewUrl: URL.createObjectURL(file)
        });
      });
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend || (allAttachments.length > 0 ? `Analyzed selected region or uploaded files` : ''),
      attachment: allAttachments[0],
      attachments: allAttachments,
      timestamp: new Date().toISOString()
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "Routing via Semantic Agent...",
      timestamp: new Date().toISOString()
    };

    let currentSessionId = activeChatId;

    if (!currentSessionId) {
      currentSessionId = Date.now();
      const newSession: SatelliteSession = {
        id: currentSessionId,
        title: generateTitle(textToSend || "Region Analysis"),
        tag: 'Opt',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        satellite: "SatQuery Agent"
      };
      setSessions(prev => [newSession, ...prev]);
      setSessionMessages(prev => ({ ...prev, [currentSessionId]: [userMessage, loadingMessage] }));
      setActiveChatId(currentSessionId);
    } else {
      setSessionMessages(prev => ({
        ...prev,
        [currentSessionId]: [...(prev[currentSessionId] || []), userMessage, loadingMessage]
      }));
    }

    setInputValue('');
    setActiveAttachment(null);
    setImageFiles([]);
    setActiveTool(null); 
    setIsThinking(true);

    try {
      const formData = new FormData();
      formData.append("question", finalQueryText);
      
      // CRITICAL FIX: Explicitly append `file.name` to force the browser to send the filename header
      // This prevents FastAPI from skipping dynamic Voice Memo blobs.
      files.forEach(file => formData.append("files", file, file.name));

      const cleanBaseUrl = backendUrl.replace(/\/$/, "");
      const res = await fetch(`${cleanBaseUrl}/api/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch analysis: ${res.statusText}`);
      const data = await res.json();

      if (data.coordinates) {
        setSessions(prev => prev.map(s =>
          s.id === currentSessionId
            ? { ...s, coordinates: `[${data.coordinates.ymin}, ${data.coordinates.xmin}, ${data.coordinates.ymax}, ${data.coordinates.xmax}]` }
            : s
        ));
      }

      setSessionMessages(prev => {
        const msgs = prev[currentSessionId] || [];
        const updatedMessages = [...msgs];
        updatedMessages[updatedMessages.length - 1] = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.text_response,
          timestamp: new Date().toISOString(),
          output_images: data.output_images || [], 
          metrics: {
            crs: data.agent_metadata?.tool_used, 
            gsd: files.length > 0 ? '10m (Sentinel-2 L2A)' : undefined,
          }
        };
        return { ...prev, [currentSessionId]: updatedMessages };
      });
    } catch (error) {
      console.error(error);
      setSessionMessages(prev => {
        const msgs = prev[currentSessionId] || [];
        const updatedMessages = [...msgs];
        updatedMessages[updatedMessages.length - 1] = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Sorry, there was an error processing this request. Ensure the backend endpoint is running and reachable.",
          timestamp: new Date().toISOString()
        };
        return { ...prev, [currentSessionId]: updatedMessages };
      });
    } finally {
      setIsThinking(false);
    }
  }, [inputValue, imageFiles, activeAttachment, activeChatId, backendUrl, activeTool]);

  const sendRegionQuery = useCallback(async (imageUrl: string, question: string, box: { ymin: number; xmin: number; ymax: number; xmax: number }) => {
    let file: File | undefined = undefined;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      file = new File([blob], "selected_region_patch.jpg", { type: blob.type || "image/jpeg" });
    } catch (err) {
      console.warn("Could not fetch image blob for region query", err);
    }

    const naturalPrompt = `[Selected Region Coordinates: ymin=${box.ymin}, xmin=${box.xmin}, ymax=${box.ymax}, xmax=${box.xmax}] ${question}`;
    
    await sendMessage(
      naturalPrompt, 
      file ? [file] : [], 
      { name: "selected_region_patch.jpg", type: 'image', url: imageUrl, previewUrl: imageUrl }
    );
  }, [sendMessage]);

  const selectPrompt = useCallback((promptText: string, autoRun = false) => {
    if (autoRun) {
      sendMessage(promptText);
    } else {
      setInputValue(promptText);
    }
  }, [sendMessage]);

  const toggleRecording = useCallback(() => {
    setIsRecording((prev) => !prev);
  }, []);

  const rerunMessage = useCallback((messageIndex: number) => {
    console.log("Rerun requested for index", messageIndex);
  }, []);

  const activeMessages = activeChatId ? (sessionMessages[activeChatId] || []) : [];

  return {
    backendUrl,         
    setBackendUrl,      
    theme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    inputValue,
    setInputValue,
    isRecording,
    toggleRecording,
    activeAttachment,
    setActiveAttachment,
    imageFiles, 
    setImageFiles, 
    activeTool,       
    setActiveTool,    
    activeChatId,
    sessions,
    messages: activeMessages, 
    isThinking,
    startNewSession,
    selectSession,
    selectPrompt,
    sendMessage,
    sendRegionQuery,
    rerunMessage,
  };
}