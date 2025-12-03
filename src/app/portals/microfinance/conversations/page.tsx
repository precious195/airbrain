'use client';

import { useIndustry, useCompany } from '@/components/portals/PortalLayout';
import { useState, useEffect } from 'react';
import { Search, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { dataService } from '@/lib/data/data-service';

interface Conversation {
    id: string;
    customerId: string;
    customerName?: string;
    customerPhone: string;
    channel: 'whatsapp' | 'sms' | 'web' | 'voice' | 'email';
    status: 'active' | 'resolved' | 'escalated';
    lastMessageAt: number;
    messageCount?: number;
}

export default function ConversationsPage() {
    const industry = useIndustry();
    const company = useCompany();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'escalated'>('all');

    useEffect(() => {
        loadConversations();
    }, [company.id]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await dataService.getAll<Conversation>(company.id, 'conversations');
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations
        .filter(conv => filter === 'all' || conv.status === filter)
        .filter(conv =>
            conv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.customerPhone?.includes(searchTerm)
        );

    const getTimeAgo = (timestamp: number) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
                <p className="text-gray-600 mt-1">Monitor and manage customer conversations</p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by customer name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilter('resolved')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'resolved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Resolved
                        </button>
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            {filteredConversations.length > 0 ? (
                <div className="space-y-4">
                    {filteredConversations.map((conversation) => (
                        <div key={conversation.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {conversation.customerName?.charAt(0) || conversation.customerPhone.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {conversation.customerName || 'Unknown Customer'}
                                            </h3>
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase">
                                                {conversation.channel}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{conversation.customerPhone}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4" />
                                                {conversation.messageCount || 0} messages
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {getTimeAgo(conversation.lastMessageAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {conversation.status === 'active' && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                            Active
                                        </span>
                                    )}
                                    {conversation.status === 'resolved' && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Resolved
                                        </span>
                                    )}
                                    {conversation.status === 'escalated' && (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                            Escalated
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No conversations found' : 'No conversations yet'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search' : 'Customer conversations will appear here'}
                    </p>
                </div>
            )}
        </div>
    );
}
