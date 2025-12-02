// src/app/(dashboard)/conversations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase/client';
import type { Conversation } from '@/types/database';

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'escalated' | 'resolved'>('all');

    useEffect(() => {
        // Subscribe to conversations in Firebase
        const conversationsRef = ref(database, 'conversations');

        const unsubscribe = onValue(conversationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const conversationsArray: Conversation[] = Object.values(data);
                setConversations(conversationsArray);
            }
        });

        return () => unsubscribe();
    }, []);

    const filteredConversations = conversations.filter((conv) => {
        if (filter === 'all') return true;
        return conv.status === filter;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {['all', 'active', 'escalated', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conversations List */}
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Channel
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Industry
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Started
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Messages
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredConversations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No conversations found
                                    </td>
                                </tr>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <tr key={conv.id} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {conv.customerId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {conv.channel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {conv.context?.industry || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${conv.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : conv.status === 'escalated'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {conv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(conv.startedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {Object.keys(conv.messages || {}).length}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
