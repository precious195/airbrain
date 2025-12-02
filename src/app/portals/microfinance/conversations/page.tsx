'use client';

import { useIndustry } from '@/components/portals/PortalLayout';
import { useState } from 'react';
import { Search, Filter, MessageSquare, Clock, User } from 'lucide-react';

interface Conversation {
    id: string;
    customer: string;
    phone: string;
    subject: string;
    status: 'active' | 'resolved' | 'escalated';
    channel: 'whatsapp' | 'sms' | 'voice' | 'web';
    lastMessage: string;
    timestamp: string;
    messages: number;
}

export default function MobileConversations() {
    const industry = useIndustry();
    const [conversations] = useState<Conversation[]>([
        { id: 'CONV-001', customer: 'John Banda', phone: '+260 97 123 4567', subject: 'Bundle activation failed', status: 'active', channel: 'whatsapp', lastMessage: 'Still waiting for activation', timestamp: '5 min ago', messages: 8 },
        { id: 'CONV-002', customer: 'Mary Chanda', phone: '+260 96 234 5678', subject: 'Data balance inquiry', status: 'resolved', channel: 'sms', lastMessage: 'Thank you for help!', timestamp: '1 hour ago', messages: 3 },
        { id: 'CONV-003', customer: 'Peter Mwale', phone: '+260 95 345 6789', subject: 'Network coverage issue', status: 'escalated', channel: 'voice', lastMessage: 'Need urgent assistance', timestamp: '30 min ago', messages: 12 },
        { id: 'CONV-004', customer: 'Sarah Kabwe', phone: '+260 97 456 7890', subject: 'Promotion code not working', status: 'active', channel: 'web', lastMessage: 'How do I apply the code?', timestamp: '15 min ago', messages: 5 },
        { id: 'CONV-005', customer: 'David Phiri', phone: '+260 96 567 8901', subject: 'International roaming query', status: 'resolved', channel: 'whatsapp', lastMessage: 'All good now', timestamp: '3 hours ago', messages: 7 },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const channelColors = {
        whatsapp: 'bg-green-100 text-green-700',
        sms: 'bg-blue-100 text-blue-700',
        voice: 'bg-purple-100 text-purple-700',
        web: 'bg-orange-100 text-orange-700',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
                <p className="text-gray-600 mt-1">View and manage customer conversations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Conversations</div>
                    <div className="text-3xl font-bold text-gray-900">{conversations.length}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Active</div>
                    <div className="text-3xl font-bold text-blue-600">
                        {conversations.filter(c => c.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Escalated</div>
                    <div className="text-3xl font-bold text-red-600">
                        {conversations.filter(c => c.status === 'escalated').length}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="text-sm text-gray-600 mb-1">Resolved</div>
                    <div className="text-3xl font-bold text-green-600">
                        {conversations.filter(c => c.status === 'resolved').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                            <option value="escalated">Escalated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="space-y-4">
                {filteredConversations.map((conversation) => (
                    <div key={conversation.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-full ${industry.bgColor} flex items-center justify-center text-white font-bold`}>
                                    {conversation.customer.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{conversation.customer}</h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${channelColors[conversation.channel]}`}>
                                            {conversation.channel}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-2">{conversation.phone}</div>
                                    <div className="text-md font-medium text-gray-900 mb-2">{conversation.subject}</div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="w-4 h-4" />
                                            {conversation.messages} messages
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {conversation.timestamp}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${conversation.status === 'active'
                                        ? 'bg-blue-100 text-blue-700'
                                        : conversation.status === 'resolved'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {conversation.status}
                                </span>
                                <button className={`${industry.bgColor} text-white px-4 py-2 rounded-lg hover:opacity-90 transition`}>
                                    View
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                            <span className="font-medium">Last message:</span> {conversation.lastMessage}
                        </div>
                    </div>
                ))}
            </div>

            {filteredConversations.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                    No conversations found
                </div>
            )}
        </div>
    );
}
