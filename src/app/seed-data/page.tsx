'use client';

import { useEffect, useState } from 'react';
import { seedFirebaseData } from '@/scripts/seed-firebase';

export default function SeedDataPage() {
    const [seeding, setSeeding] = useState(false);
    const [status, setStatus] = useState<string>('');

    const handleSeed = async () => {
        setSeeding(true);
        setStatus('🌱 Seeding Firebase with sample data...');

        try {
            await seedFirebaseData();
            setStatus('✅ Firebase seeded successfully! Refresh your dashboard to see the data.');
        } catch (error) {
            console.error('Seeding error:', error);
            setStatus(`❌ Error seeding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Seed Firebase Data</h1>
                    <p className="text-gray-600 mb-6">
                        This will populate your Firebase database with sample data for all industries
                        (Mobile, Banking, Insurance, Microfinance, Television).
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h2 className="font-semibold text-blue-900 mb-2">What will be created:</h2>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Dashboard statistics for each industry</li>
                            <li>• Sample products/bundles/packages</li>
                            <li>• Sample customers</li>
                            <li>• Sample support tickets</li>
                            <li>• Sample conversations</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {seeding ? '🌱 Seeding...' : '🚀 Seed Sample Data'}
                    </button>

                    {status && (
                        <div className={`mt-4 p-4 rounded-lg ${status.includes('✅') ? 'bg-green-50 text-green-800' :
                                status.includes('❌') ? 'bg-red-50 text-red-800' :
                                    'bg-blue-50 text-blue-800'
                            }`}>
                            {status}
                        </div>
                    )}

                    <div className="mt-8 text-sm text-gray-500">
                        <p className="font-semibold mb-2">After seeding:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Navigate to any portal dashboard</li>
                            <li>Refresh the page</li>
                            <li>You should see the sample data displayed</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
