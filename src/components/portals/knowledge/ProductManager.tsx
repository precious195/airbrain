'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import { useIndustry } from '../PortalLayout';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    specs: { key: string; value: string }[];
    active: boolean;
}

export default function ProductManager() {
    const industry = useIndustry();
    const [products, setProducts] = useState<Product[]>([
        {
            id: '1',
            name: 'Standard Plan',
            description: 'Basic monthly subscription',
            price: 100,
            specs: [{ key: 'Duration', value: '30 Days' }, { key: 'Data', value: '10GB' }],
            active: true
        }
    ]);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState<Partial<Product>>({ specs: [] });

    const handleAddSpec = (product: Partial<Product>, setProduct: Function) => {
        const specs = product.specs || [];
        setProduct({ ...product, specs: [...specs, { key: '', value: '' }] });
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string, product: Partial<Product>, setProduct: Function) => {
        const specs = [...(product.specs || [])];
        specs[index] = { ...specs[index], [field]: value };
        setProduct({ ...product, specs });
    };

    const handleSave = () => {
        if (newProduct.name && newProduct.price) {
            setProducts([...products, {
                id: Date.now().toString(),
                name: newProduct.name,
                description: newProduct.description || '',
                price: Number(newProduct.price),
                specs: newProduct.specs || [],
                active: true
            } as Product]);
            setNewProduct({ specs: [] });
            setShowAddForm(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Products & Services</h3>
                <button
                    onClick={() => setShowAddForm(true)}
                    className={`${industry.bgColor} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition`}
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {showAddForm && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={newProduct.name || ''}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={newProduct.price || ''}
                            onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        />
                    </div>
                    <textarea
                        placeholder="Description"
                        className="w-full px-4 py-2 border rounded-lg mb-4 h-20"
                        value={newProduct.description || ''}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    />

                    <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Specifications</div>
                        {newProduct.specs?.map((spec, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    placeholder="Feature (e.g. Speed)"
                                    className="flex-1 px-3 py-1 border rounded"
                                    value={spec.key}
                                    onChange={e => handleSpecChange(idx, 'key', e.target.value, newProduct, setNewProduct)}
                                />
                                <input
                                    placeholder="Value (e.g. 100Mbps)"
                                    className="flex-1 px-3 py-1 border rounded"
                                    value={spec.value}
                                    onChange={e => handleSpecChange(idx, 'value', e.target.value, newProduct, setNewProduct)}
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => handleAddSpec(newProduct, setNewProduct)}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Specification
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
                            Save Product
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${industry.bgColor} bg-opacity-10`}>
                                    <Package className={`w-5 h-5 ${industry.color}`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                                    <div className={`text-sm font-semibold ${industry.color}`}>
                                        {product.price > 0 ? `K${product.price}` : 'Free'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button className="text-gray-400 hover:text-blue-600 p-1"><Edit2 className="w-4 h-4" /></button>
                                <button className="text-gray-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                        <div className="space-y-1">
                            {product.specs.map((spec, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                    <span className="text-gray-500">{spec.key}</span>
                                    <span className="font-medium text-gray-900">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
