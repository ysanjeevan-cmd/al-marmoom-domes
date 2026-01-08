"use client";

import { useState } from 'react';
import { Package, DollarSign, Calendar, PlusCircle, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { ContentTab } from './ContentTab';
import { PricingTab } from './PricingTab';
import { AvailabilityTab } from './AvailabilityTab';
import { AddonsTab } from './AddonsTab';

import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

interface ProductEditorTabsProps {
    product: any;
    pricingRules: any[];
    blockedDates: any[];
    addons: any[];
}

export function ProductEditorTabs({ product, pricingRules, blockedDates, addons }: ProductEditorTabsProps) {
    const [activeTab, setActiveTab] = useState('content');
    const [isSaving, setIsSaving] = useState(false);

    const tabs = [
        { id: 'content', label: 'Content', icon: Package },
        { id: 'pricing', label: 'Pricing', icon: DollarSign },
        { id: 'availability', label: 'Availability', icon: Calendar },
        { id: 'addons', label: 'Add-ons', icon: PlusCircle },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save for now - in real implementation we'd grab state from child components
        await new Promise(r => setTimeout(r, 1000));
        setIsSaving(false);
        alert('Changes published successfully!');
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Action Bar (Sticky) */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.status === 'active' ? 'bg-green-100 text-green-700' :
                                    product.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {product.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 font-mono leading-none mt-1">UUID: {product.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/${product.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                            <Eye className="w-4 h-4" />
                            Preview
                        </Link>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 uppercase tracking-tight active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isSaving ? 'Publishing...' : 'Publish Changes'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                ? 'text-gray-900 border-b-2 border-gray-900'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in duration-300">
                    {activeTab === 'content' && <ContentTab product={product} />}
                    {activeTab === 'pricing' && <PricingTab productId={product.id} initialRules={pricingRules} />}
                    {activeTab === 'availability' && <AvailabilityTab productId={product.id} initialBlocked={blockedDates} />}
                    {activeTab === 'addons' && <AddonsTab productId={product.id} initialAddons={addons} />}
                </div>
            </div>
        </div>
    );
}
