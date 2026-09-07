"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { ChatInput } from "@/components/ChatInput";
import ChatThread from "@/components/ChatThread";
import { PanelLeftOpen, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  role: "user" | "assistant";
  text: string;
  imagePreviews?: string[]; 
  coordinates?: any;
  agentMetadata?: { tool_used: string; images_processed: number }; 
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const generateTitle = (text: string) => {
    const cleanText = text.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const words = cleanText.split(" ");
    if (words.length <= 4) return cleanText;
    return words.slice(0, 4).join(" ") + "...";
  };

  const handleSendMessage = async (text: string, imageFiles: File[], imagePreviewUrls: string[]) => {
    
    // NEW: Intercept requests with no images instantly
    if (imageFiles.length === 0) {
      alert("Please upload at least one satellite image for the AI to analyze.");
      return;
    }

    const userMsg: Message = { role: "user", text, imagePreviews: imagePreviewUrls.length > 0 ? imagePreviewUrls : undefined };
    const loadingMsg: Message = { role: "assistant", text: "", isLoading: true };

    let currentChatId = activeChatId;

    if (!currentChatId) {
      currentChatId = Date.now().toString();
      const newTitle = generateTitle(text) || "New Analysis";
      
      const newSession: ChatSession = {
        id: currentChatId,
        title: newTitle,
        messages: [userMsg, loadingMsg],
        createdAt: Date.now(),
      };
      
      setChatSessions((prev) => [newSession, ...prev]);
      setActiveChatId(currentChatId);
    } else {
      setChatSessions((prev) => 
        prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [...chat.messages, userMsg, loadingMsg] }
            : chat
        )
      );
    }

    try {
      const formData = new FormData();
      formData.append("question", text);
      
      imageFiles.forEach(file => {
        formData.append("files", file);
      });

      const res = await fetch("https://unpretty-keira-nonenigmatic.ngrok-free.dev/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();

      setChatSessions((prev) => 
        prev.map(chat => {
          if (chat.id === currentChatId) {
            const updatedMessages = [...chat.messages];
            updatedMessages[updatedMessages.length - 1] = {
              role: "assistant",
              text: data.text_response,
              coordinates: data.coordinates,
              agentMetadata: data.agent_metadata 
            };
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        })
      );

    } catch (error) {
      console.error(error);
      setChatSessions((prev) => 
        prev.map(chat => {
          if (chat.id === currentChatId) {
            const updatedMessages = [...chat.messages];
            updatedMessages[updatedMessages.length - 1] = {
              role: "assistant",
              text: "Sorry, there was an error processing this request. Ensure the backend is running and you uploaded at least 1 image.",
              isLoading: false
            };
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        })
      );
    }
  };

  const activeSession = chatSessions.find(chat => chat.id === activeChatId);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#090a0f] text-black dark:text-white overflow-hidden">
      <aside className={cn("h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-black/5 dark:border-white/5", isSidebarOpen ? "w-[260px]" : "w-0 border-transparent")}>
        <Sidebar sessions={chatSessions} activeChatId={activeChatId} onClose={() => setIsSidebarOpen(false)} onSelectChat={(id) => setActiveChatId(id)} />
      </aside>

      <main className="flex-1 flex flex-col h-full relative min-w-0 transition-all duration-300">
        <header className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="pointer-events-auto">
            {!isSidebarOpen && (
              <button onClick={() => setActiveChatId(null)} className="p-2 text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                <PenLine className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative w-full h-full">
          {activeSession ? (
            <ChatThread messages={activeSession.messages} /> 
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4">
              <div className="text-center max-w-lg space-y-3 transform -translate-y-8">
                <h1 className="text-[28px] font-semibold text-black/90 dark:text-white/90 tracking-tight">Good morning.</h1>
                <p className="text-black/50 dark:text-white/50 text-base font-medium">Upload up to 2 images for multitemporal or cross-modal analysis.</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-[#090a0f] dark:via-[#090a0f] pt-10">
          <ChatInput onSend={handleSendMessage} />
        </div>
      </main>
    </div>
  );
}