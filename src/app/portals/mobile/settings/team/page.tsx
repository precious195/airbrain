'use client';

import { useState } from 'react';
import { useIndustry } from '@/components/portals/PortalLayout';
import TeamList from '@/components/team/TeamList';
import AddMemberModal from '@/components/team/AddMemberModal';
import { Users, Plus } from 'lucide-react';

export default function TeamSettingsPage() {
    const industry = useIndustry();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                    <p className="text-gray-600 mt-1">Manage access and roles for your team members</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className={`${industry.bgColor} text-white px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2 font-medium`}
                >
                    <Plus className="w-5 h-5" />
                    Add Member
                </button>
            </div>

            <div className="grid gap-6">
                {/* Team Overview Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-900">About Roles</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            <strong>Admins</strong> have full access to settings and billing.
                            <strong> Agents</strong> can manage conversations and tickets.
                            <strong> Viewers</strong> have read-only access to dashboards.
                        </p>
                    </div>
                </div>

                {/* Team List */}
                <TeamList refreshTrigger={refreshTrigger} />
            </div>

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddSuccess={() => setRefreshTrigger(prev => prev + 1)}
            />
        </div>
    );
}
