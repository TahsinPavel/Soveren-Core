
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;         // What the user sees
    anonymizedContent?: string; // What the server received/sent (the template)
    encryptedBlobs?: Record<string, string>; // The encrypted values sent
    timestamp: number;
}

export interface ChatState {
    messages: Message[];
    isTyping: boolean;
}
