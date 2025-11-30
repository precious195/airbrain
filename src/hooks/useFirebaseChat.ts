// src/hooks/useFirebaseChat.ts
'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import type { Conversation, Message } from '@/types/database';

export function useFirebaseChat(conversationId: string) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!conversationId) return;

        const conversationRef = ref(database, `conversations/${conversationId}`);

        // Listen for real-time updates
        const unsubscribe = onValue(
            conversationRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data: Conversation = snapshot.val();
                    setConversation(data);

                    // Extract and sort messages
                    const messagesObj = data.messages || {};
                    const messagesArray = Object.values(messagesObj).sort(
                        (a, b) => a.timestamp - b.timestamp
                    );
                    setMessages(messagesArray);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Firebase chat error:', error);
                setLoading(false);
            }
        );

        // Cleanup
        return () => {
            off(conversationRef);
        };
    }, [conversationId]);

    return { conversation, messages, loading };
}
