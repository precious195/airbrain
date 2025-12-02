'use client';

import { useState } from 'react';
import { Book, HelpCircle, Package, List } from 'lucide-react';
import { useIndustry } from '../PortalLayout';
import FAQManager from './FAQManager';
import ProductManager from './ProductManager';
import ProcedureManager from './ProcedureManager';

export default function KnowledgeLayout() {
    const industry = useIndustry();
    const [activeTab, setActiveTab] = useState<'faqs' | 'products' | 'procedures'>('faqs');

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
                <p className="text-gray-600 mt-1">Manage industry knowledge for AI training and customer support</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('faqs')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'faqs'
                                ? `border-${industry.color.split('-')[1]}-500 text-${industry.color.split('-')[1]}-600`
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <HelpCircle className="w-4 h-4" />
                            FAQs
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'products'
                                ? `border-${industry.color.split('-')[1]}-500 text-${industry.color.split('-')[1]}-600`
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            Products & Services
                        </button>
                        <button
                            onClick={() => setActiveTab('procedures')}
                            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'procedures'
                                ? `border-${industry.color.split('-')[1]}-500 text-${industry.color.split('-')[1]}-600`
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            Procedures
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'faqs' && <FAQManager />}
                    {activeTab === 'products' && <ProductManager />}
                    {activeTab === 'procedures' && <ProcedureManager />}
                </div>
            </div>
        </div>
    );
}
