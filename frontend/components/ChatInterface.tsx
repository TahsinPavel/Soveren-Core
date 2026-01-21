'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types';
import { Send, User, Sparkles, Loader2, ShieldCheck, Lock, Sun, Moon } from 'lucide-react';
import { CryptoService } from '@/lib/crypto';
import { PrivacyFilter } from '@/lib/privacy';
import { saveMemory, searchMemories } from '@/lib/memory';
import MemoryVisualizer from './MemoryVisualizer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ChatInterfaceProps {
    onMessagesChange: (msgs: Message[]) => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
}

export default function ChatInterface({ onMessagesChange, theme, onThemeToggle }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userId, setUserId] = useState('');
    const [secretKey, setSecretKey] = useState('');

    useEffect(() => {
        // Initialize User Identity & Encryption Key locally
        let uid = localStorage.getItem('soveren_user_id');
        if (!uid) {
            uid = crypto.randomUUID();
            localStorage.setItem('soveren_user_id', uid);
        }
        setUserId(uid);

        let key = localStorage.getItem('soveren_session_key');
        if (!key) {
            key = crypto.randomUUID();
            localStorage.setItem('soveren_session_key', key);
        }
        setSecretKey(key);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const originalText = input;
        setInput('');
        setIsLoading(true);

        // 1. Process Input (Client Side)
        const { anonymizedText, piiMap } = PrivacyFilter.anonymize(originalText);

        const encryptedBlobs: Record<string, string> = {};
        for (const [token, value] of Object.entries(piiMap)) {
            encryptedBlobs[token] = await CryptoService.encrypt(value);
        }

        // 2. Semantic Retrieval (Encrypted)
        let contextText = "";
        if (userId && secretKey) {
            const memories = await searchMemories(originalText, userId, secretKey);
            if (memories.length > 0) {
                const uniqueSnippets = Array.from(new Set(memories.map(m => m.metadata_blob.text_snippet).filter(Boolean)));
                if (uniqueSnippets.length > 0) {
                    contextText = `\n\n[Relevant Memories]:\n${uniqueSnippets.join('\n')}`;
                    console.log("Injected memories:", uniqueSnippets);
                }
            }
        }

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: originalText,
            anonymizedContent: anonymizedText,
            encryptedBlobs: encryptedBlobs,
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, newUserMsg];
        setMessages(updatedMessages);
        onMessagesChange(updatedMessages);

        // 3. Save to Memory (Fire and Forget)
        if (userId && secretKey) {
            saveMemory(originalText, { source: 'chat' }, userId, secretKey);
        }

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    anonymized_text: anonymizedText + contextText, // Inject memory context
                    encrypted_blobs: encryptedBlobs
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const mockResponseTemplate = data.template;
            let finalContent = PrivacyFilter.restore(mockResponseTemplate, piiMap);

            const newBotMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: finalContent,
                anonymizedContent: mockResponseTemplate,
                timestamp: Date.now()
            };

            const finalMessages = [...updatedMessages, newBotMsg];
            setMessages(finalMessages);
            onMessagesChange(finalMessages);

        } catch (error) {
            console.error("Chat error", error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Error: Could not reach the Soveren Proxy. Is the backend running?",
                timestamp: Date.now()
            };
            setMessages([...updatedMessages, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={clsx(
            "flex flex-col h-screen max-w-5xl mx-auto font-sans transition-colors duration-300",
            theme === 'light' ? "bg-zinc-50" : "bg-zinc-950"
        )}>
            {/* Header */}
            <header className={clsx(
                "sticky top-0 z-10 p-6 flex items-center justify-between backdrop-blur-md border-b transition-colors duration-300",
                theme === 'light' ? "bg-white/80 border-zinc-200" : "bg-zinc-950/80 border-zinc-900"
            )}>
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "p-2 rounded-lg border",
                        theme === 'light' ? "bg-zinc-100 border-zinc-200" : "bg-white/5 border-white/10"
                    )}>
                        <Sparkles size={20} className={theme === 'light' ? "text-emerald-600" : "text-emerald-400"} />
                    </div>
                    <div>
                        <h1 className={clsx(
                            "text-lg font-semibold tracking-tight",
                            theme === 'light' ? "text-zinc-900" : "text-zinc-100"
                        )}>Soveren Chat</h1>
                        <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                            <ShieldCheck size={12} /> Zero-Knowledge Architecture
                        </p>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={onThemeToggle}
                    className={clsx(
                        "p-2 rounded-full transition-colors",
                        theme === 'light'
                            ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                    )}
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scroll-smooth">
                {userId && <MemoryVisualizer userId={userId} />}

                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 pb-20">
                        <div className={clsx(
                            "w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 shadow-xl",
                            theme === 'light'
                                ? "bg-white border-zinc-200 shadow-zinc-200/50"
                                : "bg-zinc-900 border-zinc-800 shadow-emerald-900/10"
                        )}>
                            <Lock size={32} className={theme === 'light' ? "text-zinc-400" : "text-zinc-600"} />
                        </div>
                        <h3 className={clsx(
                            "font-medium",
                            theme === 'light' ? "text-zinc-600" : "text-zinc-400"
                        )}>Your secrets stay yours.</h3>
                        <p className={clsx(
                            "text-sm max-w-xs",
                            theme === 'light' ? "text-zinc-500" : "text-zinc-600"
                        )}>Local PII redaction active. No sensitive data leaves this device.</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "group flex gap-6 md:gap-8 mx-auto w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300",
                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        {/* Avatar */}
                        <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm mt-1 transition-colors",
                            msg.role === 'user'
                                ? (theme === 'light' ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900") // Inverted for contrast logic
                                : (theme === 'light' ? "bg-white border-zinc-200 text-emerald-600" : "bg-zinc-900 border-zinc-800 text-emerald-500")
                        )}>
                            {msg.role === 'user' ? <User size={16} strokeWidth={2.5} /> : <Sparkles size={16} />}
                        </div>

                        {/* Content */}
                        <div className={clsx(
                            "flex-1 min-w-0"
                        )}>
                            {/* Name Label */}
                            <div className={clsx(
                                "flex items-center gap-2 mb-2 text-xs font-semibold tracking-wider uppercase",
                                msg.role === 'user'
                                    ? "justify-end text-zinc-500"
                                    : (theme === 'light' ? "justify-start text-emerald-600/80" : "justify-start text-emerald-500/80")
                            )}>
                                {msg.role === 'user' ? 'You' : 'Soveren AI'}
                            </div>

                            {/* Message Bubble - DYNAMIC */}
                            <div className={clsx(
                                "text-[15px] leading-7 whitespace-pre-wrap transition-colors",
                                msg.role === 'user'
                                    ? (theme === 'light'
                                        ? "bg-zinc-900 text-white py-3 px-5 rounded-2xl rounded-tr-sm shadow-md"
                                        : "bg-white text-zinc-900 py-3 px-5 rounded-2xl rounded-tr-sm shadow-sm border border-zinc-100")
                                    : (theme === 'light'
                                        ? "text-zinc-700 font-normal pl-4 border-l-2 border-emerald-500/30"
                                        : "text-zinc-300 font-normal pl-4 border-l-2 border-emerald-500/20")
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-6 md:gap-8 mx-auto w-full max-w-3xl">
                        <div className={clsx(
                            "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-1",
                            theme === 'light' ? "bg-white border-zinc-200 text-emerald-600" : "bg-zinc-900 border-zinc-800 text-emerald-500"
                        )}>
                            <Sparkles size={16} />
                        </div>
                        <div className="flex-1 py-2">
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="animate-pulse">Anonymizing & Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className={clsx(
                "p-6 backdrop-blur-lg border-t transition-colors duration-300",
                theme === 'light' ? "bg-white/80 border-zinc-200" : "bg-zinc-950/80 border-zinc-900"
            )}>
                <div className="max-w-3xl mx-auto relative">
                    <form onSubmit={handleSubmit} className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything securely..."
                            className={clsx(
                                "w-full text-[15px] rounded-xl pl-5 pr-14 py-4 border focus:outline-none focus:ring-2 transition-all shadow-lg",
                                theme === 'light'
                                    ? "bg-white text-zinc-900 placeholder:text-zinc-400 border-zinc-200 focus:ring-zinc-900/10 focus:border-zinc-300 shadow-zinc-200/50"
                                    : "bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-500 border-zinc-800 focus:ring-zinc-700/50 focus:border-zinc-700"
                            )}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={clsx(
                                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-0 disabled:scale-95 transition-all duration-200 shadow-sm",
                                theme === 'light'
                                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                    : "bg-zinc-100 text-zinc-950 hover:bg-white"
                            )}
                        >
                            <Send size={18} strokeWidth={2.5} />
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <p className={clsx(
                            "text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 opacity-60",
                            theme === 'light' ? "text-zinc-400" : "text-zinc-600"
                        )}>
                            <Lock size={10} /> Local Encryption Active
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
