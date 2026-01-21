
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

// Visualizer for "Memory Dots"
// This component connects to Supabase and visualizes the stored vectors 
// as glowing dots. Since they are 384-dim, we project them to 2D or just use random positions 
// influenced by their hash/ID to create a "cloud" of memories.

interface MemoryDot {
    id: string;
    x: number;
    y: number;
    color: string;
}

export default function MemoryVisualizer({ userId }: { userId: string }) {
    const [memories, setMemories] = useState<MemoryDot[]>([]);

    useEffect(() => {
        if (!userId) return;

        const fetchMemories = async () => {
            // Just fetch the latest 50 memories to visualize
            const { data } = await supabase
                .from('encrypted_memories')
                .select('id')
                .eq('user_id', userId)
                .limit(50);

            if (data) {
                // Project to random spot for visualization aesthetic
                // In a real sophisticated app, we might use PCA/t-SNE to project real vector coordinates
                const dots = data.map((m) => ({
                    id: m.id,
                    x: Math.random() * 100, // percentage
                    y: Math.random() * 100,
                    color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)` // Blue-ish cyan range
                }));
                setMemories(dots);
            }
        };

        fetchMemories();

        // Subscribe to changes to update in real-time
        const channel = supabase
            .channel('public:encrypted_memories')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'encrypted_memories', filter: `user_id=eq.${userId}` }, (payload) => {
                const newDot = {
                    id: payload.new.id,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    color: `hsl(${Math.random() * 60 + 200}, 80%, 70%)`
                };
                setMemories((prev) => [...prev, newDot]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <div className="relative w-full h-32 bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-800 backdrop-blur-sm mt-4">
            <div className="absolute top-2 left-3 text-xs text-zinc-500 uppercase tracking-widest font-mono">
                Encrypted Memory Vault
            </div>
            {memories.map((dot) => (
                <motion.div
                    key={dot.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    className="absolute w-2 h-2 rounded-full blur-[1px]"
                    style={{
                        left: `${dot.x}%`,
                        top: `${dot.y}%`,
                        backgroundColor: dot.color,
                        boxShadow: `0 0 8px ${dot.color}`
                    }}
                    transition={{ duration: 0.5 }}
                />
            ))}
        </div>
    );
}
