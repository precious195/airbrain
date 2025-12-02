'use client';

import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CompanyContextType } from '@/components/portals/PortalLayout';
import { useCompany } from '@/components/portals/PortalLayout';

export default function OnboardingChecklist() {
    const company = useCompany();

    // In a real app, we would check the actual configuration status from the company object
    // For now, we'll simulate it or check if properties exist if available in the context
    // Since CompanyContextType is limited, we might need to fetch full company details or assume for now.

    // Let's assume we can check some basic things or just show the checklist for the user to manually verify
    // Ideally, we'd pass a `progress` object prop.

    const steps = [
        {
            id: 'account',
            label: 'Create Account',
            description: 'Sign up and verify email',
            completed: true, // Always true if they are seeing this
            href: null
        },
        {
            id: 'whatsapp',
            label: 'Connect WhatsApp',
            description: 'Configure your WhatsApp Business API',
            completed: false, // TODO: Check actual config
            href: `/portals/${company.industry}/settings`
        },
        {
            id: 'knowledge',
            label: 'Add Knowledge Base',
            description: 'Upload FAQs and product details',
            completed: false, // TODO: Check knowledge count
            href: `/portals/${company.industry}/knowledge`
        },
        {
            id: 'integration',
            label: 'System Integration',
            description: 'Connect your backend APIs',
            completed: false, // TODO: Check integration config
            href: `/portals/${company.industry}/integration`
        }
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    if (progress === 100) return null; // Hide if fully onboarded

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
                    <p className="text-sm text-gray-500">Complete these steps to activate your AI agent</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                    <div className="text-xs text-gray-500">Completed</div>
                </div>
            </div>

            <div className="relative mb-8">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${step.completed
                                ? 'bg-green-50 border-green-100'
                                : 'bg-white border-gray-100 hover:border-blue-100'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {step.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                                <Circle className="w-6 h-6 text-gray-300" />
                            )}
                            <div>
                                <h3 className={`font-medium ${step.completed ? 'text-green-900' : 'text-gray-900'}`}>
                                    {step.label}
                                </h3>
                                <p className={`text-sm ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>

                        {!step.completed && step.href && (
                            <Link
                                href={step.href}
                                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Start
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
