'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types/database';
import { teamService } from '@/lib/team/team-service';
import { useCompany } from '@/components/portals/PortalLayout';
import { MoreVertical, Trash2, Shield, User as UserIcon, Eye, Mail } from 'lucide-react';

export default function TeamList({ refreshTrigger }: { refreshTrigger: number }) {
    const company = useCompany();
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMembers();
    }, [company.id, refreshTrigger]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await teamService.getTeamMembers(company.id);
            setMembers(data);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            await teamService.removeMember(userId);
            loadMembers();
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading team members...</div>;
    }

    if (members.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No team members yet</h3>
                <p className="text-gray-500">Invite your colleagues to collaborate.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {members.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                        {member.displayName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{member.displayName}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    {member.role === 'admin' && <Shield className="w-4 h-4 text-purple-500" />}
                                    {member.role === 'agent' && <UserIcon className="w-4 h-4 text-blue-500" />}
                                    {member.role === 'viewer' && <Eye className="w-4 h-4 text-gray-500" />}
                                    <span className="capitalize text-sm text-gray-700">{member.role}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {member.status === 'active' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                ) : member.status === 'invited' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Invited
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Disabled
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(member.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleRemove(member.id)}
                                    className="text-gray-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50"
                                    title="Remove member"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
