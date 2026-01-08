"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, ShoppingBag, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export function AddonsTab({ productId, initialAddons }: { productId: string, initialAddons: any[] }) {
    const [allAddons, setAllAddons] = useState<any[]>([]);
    const [linkedIds, setLinkedIds] = useState<string[]>(initialAddons.map(a => a.id));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAll() {
            const { data } = await supabase.from('addons').select('*');
            setAllAddons(data || []);
            setIsLoading(false);
        }
        fetchAll();
    }, []);

    const toggleLink = (addonId: string) => {
        if (linkedIds.includes(addonId)) {
            setLinkedIds(linkedIds.filter(id => id !== addonId));
        } else {
            setLinkedIds([...linkedIds, addonId]);
        }
    };

    if (isLoading) return <div className="p-20 text-center text-gray-400">Loading experiences...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Linked Experiences</h2>
                    <p className="text-sm text-gray-500 mt-1">Select which add-ons are available for guests booking this product.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-900 uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                    <PlusCircle className="w-4 h-4" />
                    Create New Experience
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allAddons.map((addon) => {
                    const isLinked = linkedIds.includes(addon.id);
                    return (
                        <div
                            key={addon.id}
                            onClick={() => toggleLink(addon.id)}
                            className={`relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 group overflow-hidden ${isLinked ? 'border-blue-600 shadow-lg shadow-blue-50' : 'border-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isLinked ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-300'
                                    }`}>
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                {isLinked ? (
                                    <CheckCircle2 className="w-6 h-6 text-blue-600 animate-in zoom-in duration-300" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-100" />
                                )}
                            </div>

                            <h3 className="font-bold text-gray-900 truncate">{addon.name}</h3>
                            <p className="text-sm font-black text-gray-400 mt-1">{addon.price > 0 ? `${addon.price} AED` : 'INCLUDED'}</p>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isLinked ? 'text-blue-600' : 'text-gray-300'}`}>
                                    {isLinked ? 'Linked to Product' : 'Not Available'}
                                </span>
                                <Link
                                    href={`/admin/addons/${addon.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-gray-300 hover:text-blue-600 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Decorative background icon */}
                            <ShoppingBag className={`absolute -bottom-4 -right-4 w-20 h-20 opacity-5 transition-transform duration-500 ${isLinked ? 'scale-110 text-blue-600' : 'scale-100 text-gray-900'}`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
