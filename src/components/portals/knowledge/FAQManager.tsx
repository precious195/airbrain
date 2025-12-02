'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { useIndustry, useCompany } from '../PortalLayout';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    active: boolean;
}

export default function FAQManager() {
    const industry = useIndustry();
    const company = useCompany();
    const [faqs, setFaqs] = useState<FAQ[]>([
        { id: '1', question: 'How do I check my balance?', answer: 'Dial *123# to check your balance instantly.', category: 'General', active: true },
        { id: '2', question: 'What are your operating hours?', answer: 'We are open Mon-Fri 8AM-5PM.', category: 'Support', active: true },
    ]);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newFAQ, setNewFAQ] = useState<Partial<FAQ>>({});
    const [showAddForm, setShowAddForm] = useState(false);

    const handleSave = (id?: string) => {
        if (id) {
            // Update existing
            setIsEditing(null);
        } else {
            // Add new
            if (newFAQ.question && newFAQ.answer) {
                setFaqs([...faqs, {
                    id: Date.now().toString(),
                    question: newFAQ.question,
                    answer: newFAQ.answer,
                    category: newFAQ.category || 'General',
                    active: true
                }]);
                setNewFAQ({});
                setShowAddForm(false);
            }
        }
    };

    const handleDelete = (id: string) => {
        setFaqs(faqs.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                <button
                    onClick={() => setShowAddForm(true)}
                    className={`${industry.bgColor} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition`}
                >
                    <Plus className="w-4 h-4" />
                    Add FAQ
                </button>
            </div>

            {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Question"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={newFAQ.question || ''}
                            onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })}
                        />
                        <textarea
                            placeholder="Answer"
                            className="w-full px-4 py-2 border rounded-lg h-24"
                            value={newFAQ.answer || ''}
                            onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Category"
                                className="flex-1 px-4 py-2 border rounded-lg"
                                value={newFAQ.category || ''}
                                onChange={e => setNewFAQ({ ...newFAQ, category: e.target.value })}
                            />
                            <button
                                onClick={() => handleSave()}
                                className={`${industry.bgColor} text-white px-4 py-2 rounded-lg`}
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {faqs.map(faq => (
                    <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                        {isEditing === faq.id ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    defaultValue={faq.question}
                                    className="w-full px-4 py-2 border rounded-lg font-medium"
                                />
                                <textarea
                                    defaultValue={faq.answer}
                                    className="w-full px-4 py-2 border rounded-lg h-24"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleSave(faq.id)}
                                        className="text-green-600 hover:bg-green-50 px-3 py-1 rounded-lg flex items-center gap-1"
                                    >
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(null)}
                                        className="text-gray-600 hover:bg-gray-50 px-3 py-1 rounded-lg flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-900">{faq.question}</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditing(faq.id)}
                                            className="text-gray-400 hover:text-blue-600 p-1"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(faq.id)}
                                            className="text-gray-400 hover:text-red-600 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{faq.answer}</p>
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {faq.category}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
