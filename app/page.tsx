'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import HeroAnimation from '@/components/HeroAnimation';
import ChatThread from '@/components/ChatThread';
import { ChatInput } from '@/components/ChatInput';
import { useSatQuery } from '@/hooks/useSatQuery';

export default function Home() {
  const {
    backendUrl,
    setBackendUrl,
    sidebarOpen,
    setSidebarOpen,
    activeChatId,
    sessions,
    messages,
    activeTool,
    setActiveTool,
    inputValue,         // <-- ADDED
    setInputValue,      // <-- ADDED
    startNewSession,
    selectSession,
    selectPrompt,
    sendMessage,
    rerunMessage,
    sendRegionQuery
  } = useSatQuery();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">

      <aside
        className={`h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-zinc-200/70 dark:border-zinc-800/80 ${sidebarOpen ? "w-[280px]" : "w-0 border-transparent"
          }`}
      >
        <Sidebar
          sessions={sessions}
          activeChatId={activeChatId}
          onClose={() => setSidebarOpen(false)}
          onSelectChat={(id) => {
            if (id) selectSession(id);
            else startNewSession();
          }}
          backendUrl={backendUrl}
          setBackendUrl={setBackendUrl}
        />
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-zinc-50 dark:bg-[#090a0f]">

        <Header
          isSidebarOpen={sidebarOpen}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewSession={startNewSession}
        />

        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pt-14">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[420px]">
              <HeroAnimation
                onSelectPrompt={selectPrompt}
                onSelectTool={setActiveTool}
              />
            </div>
          ) : (
            <ChatThread
              messages={messages}
              onRegionQuery={(question, box, imageUrl) => {
                sendRegionQuery(imageUrl, question, box);
              }}
            />
          )}
        </div>

        <div className="w-full shrink-0 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent dark:from-[#090a0f] dark:via-[#090a0f] pt-6 z-10">
          <ChatInput
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            value={inputValue}            // <-- ADDED
            onChange={setInputValue}      // <-- ADDED
            onSend={(text, files, urls) => sendMessage(text, files, null)}
          />
        </div>
      </main>
    </div>
  );
}