
'use client';

import { Message } from '@/lib/types';
import { Shield, Eye, EyeOff, Lock, Server } from 'lucide-react';

interface PrivacyDashboardProps {
    messages: Message[];
}

export default function PrivacyDashboard({ messages }: PrivacyDashboardProps) {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const lastServerMessage = [...messages].reverse().find(m => m.role === 'assistant');

    return (
        <div className="w-full h-full bg-slate-900 border-l border-slate-700 p-4 text-slate-200 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h2 className="text-lg font-semibold tracking-wide">Privacy Audit</h2>
            </div>

            <div className="space-y-8">
                {/* Connection Status */}
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Lock className="w-4 h-4" />
                        <span>Encryption Layer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-emerald-400 font-medium text-sm">Active (Web Crypto AES-GCM)</span>
                    </div>
                </div>

                {/* What User See vs What Server Sees (Last Request) */}
                {lastUserMessage && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Outbound</h3>

                        {/* User View */}
                        <div className="relative group">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-blue-500 rounded-r"></div>
                            <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-blue-400 flex items-center gap-1"><Eye className="w-3 h-3" /> You Sent</span>
                                </div>
                                <p className="text-sm">{lastUserMessage.content}</p>
                            </div>
                        </div>

                        {/* Server View */}
                        <div className="relative group">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-amber-500 rounded-r"></div>
                            <div className="bg-slate-800 p-3 rounded border border-amber-500/20 shadow-inner">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-amber-500 flex items-center gap-1"><Server className="w-3 h-3" /> Server Received</span>
                                </div>
                                <p className="text-sm font-mono text-slate-300">{lastUserMessage.anonymizedContent || "Processing..."}</p>

                                {lastUserMessage.encryptedBlobs && Object.keys(lastUserMessage.encryptedBlobs).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-700">
                                        <span className="text-xs text-slate-500 block mb-1">Encrypted Blobs (Zero-Knowledge):</span>
                                        <div className="space-y-1">
                                            {Object.entries(lastUserMessage.encryptedBlobs).map(([k, v]) => (
                                                <div key={k} className="flex justify-between text-xs font-mono">
                                                    <span className="text-amber-400">{k}:</span>
                                                    <span className="text-slate-500 truncate max-w-[100px]">{v.substring(0, 10)}...</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Last Response */}
                {lastServerMessage && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latest Inbound</h3>

                        {/* Server View */}
                        <div className="relative">
                            <div className="bg-slate-800 p-3 rounded border border-slate-700/50 opacity-70">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-400 flex items-center gap-1"><Server className="w-3 h-3" /> Server Sent Template</span>
                                </div>
                                <p className="text-sm font-mono text-slate-400">{lastServerMessage.anonymizedContent}</p>
                            </div>
                        </div>

                        {/* User View */}
                        <div className="relative">
                            <div className="bg-slate-800/50 p-3 rounded border border-emerald-500/30">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-emerald-400 flex items-center gap-1"><Eye className="w-3 h-3" /> Re-assembled Locally</span>
                                </div>
                                <p className="text-sm">{lastServerMessage.content}</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
