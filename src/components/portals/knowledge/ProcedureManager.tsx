'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, List, GripVertical } from 'lucide-react';
import { useIndustry, useCompany } from '../PortalLayout';

interface Procedure {
    id: string;
    title: string;
    steps: string[];
    active: boolean;
}

export default function ProcedureManager() {
    const industry = useIndustry();
    const company = useCompany();
    const [procedures, setProcedures] = useState<Procedure[]>([
        {
            id: '1',
            title: 'How to Register',
            steps: ['Visit nearest branch', 'Bring valid ID', 'Fill application form', 'Receive confirmation SMS'],
            active: true
        }
    ]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProcedure, setNewProcedure] = useState<Partial<Procedure>>({ steps: [''] });

    const handleAddStep = () => {
        setNewProcedure({ ...newProcedure, steps: [...(newProcedure.steps || []), ''] });
    };

    const handleStepChange = (index: number, value: string) => {
        const steps = [...(newProcedure.steps || [])];
        steps[index] = value;
        setNewProcedure({ ...newProcedure, steps });
    };

    const handleSave = () => {
        if (newProcedure.title && newProcedure.steps?.length) {
            setProcedures([...procedures, {
                id: Date.now().toString(),
                title: newProcedure.title,
                steps: newProcedure.steps.filter(s => s.trim()),
                active: true
            } as Procedure]);
            setNewProcedure({ steps: [''] });
            setShowAddForm(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Procedures & Guides</h3>
                <button
                    onClick={() => setShowAddForm(true)}
                    className={`${industry.bgColor} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition`}
                >
                    <Plus className="w-4 h-4" />
                    Add Procedure
                </button>
            </div>

            {showAddForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="text"
                        placeholder="Procedure Title (e.g. How to Reset PIN)"
                        className="w-full px-4 py-2 border rounded-lg mb-4 font-medium"
                        value={newProcedure.title || ''}
                        onChange={e => setNewProcedure({ ...newProcedure, title: e.target.value })}
                    />

                    <div className="space-y-2 mb-4">
                        <div className="text-sm font-medium text-gray-700">Steps</div>
                        {newProcedure.steps?.map((step, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <span className="text-gray-400 text-sm w-4">{idx + 1}.</span>
                                <input
                                    placeholder={`Step ${idx + 1}`}
                                    className="flex-1 px-3 py-2 border rounded bg-white"
                                    value={step}
                                    onChange={e => handleStepChange(idx, e.target.value)}
                                />
                            </div>
                        ))}
                        <button
                            onClick={handleAddStep}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 ml-6"
                        >
                            <Plus className="w-3 h-3" /> Add Step
                        </button>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className={`${industry.bgColor} text-white px-4 py-2 rounded-lg`}
                        >
                            Save Procedure
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {procedures.map(proc => (
                    <div key={proc.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${industry.bgColor} bg-opacity-10`}>
                                    <List className={`w-5 h-5 ${industry.color}`} />
                                </div>
                                <h4 className="font-bold text-gray-900">{proc.title}</h4>
                            </div>
                            <div className="flex gap-1">
                                <button className="text-gray-400 hover:text-blue-600 p-1"><Edit2 className="w-4 h-4" /></button>
                                <button className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                {proc.steps.map((step, idx) => (
                                    <li key={idx} className="pl-2">{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
