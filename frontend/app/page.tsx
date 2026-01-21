
'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import PrivacyDashboard from '@/components/PrivacyDashboard';
import { Message } from '@/lib/types';
import { clsx } from 'clsx';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <main className={clsx(
      "flex h-screen overflow-hidden font-sans transition-colors duration-300",
      theme === 'light' ? "bg-zinc-50 text-zinc-900 selection:bg-emerald-500/30" : "bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30"
    )}>
      {/* Main Chat Area */}
      <section className="flex-1 h-full relative">
        <ChatInterface
          onMessagesChange={setMessages}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      </section>

      {/* Sidebar Dashboard */}
      <aside className={clsx(
        "w-[400px] h-full hidden lg:block shrink-0 shadow-2xl transition-colors duration-300",
        theme === 'light' ? "bg-white border-l border-zinc-200" : "bg-zinc-900 border-l border-zinc-800"
      )}>
        <PrivacyDashboard messages={messages} />
      </aside>
    </main>
  );
}
