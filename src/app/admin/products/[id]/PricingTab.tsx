"use client";

import { useState } from 'react';
import { DollarSign, Plus, Trash2, Edit3, Calendar, Users, TrendingUp } from 'lucide-react';

export function PricingTab({ productId, initialRules }: { productId: string, initialRules: any[] }) {
    const [rules, setRules] = useState(initialRules);

    return (
        <div className="space-y-8">
            {/* Header / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Rules</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{rules.length}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">Managed date ranges</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Average Nightly</h3>
                    </div>
                    <p className="text-3xl font-black text-gray-900">
                        {rules.length > 0 ? Math.round(rules.reduce((a, b) => a + Number(b.price_adult), 0) / rules.length) : 0}
                        <span className="text-sm font-normal text-gray-400 ml-1">AED</span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">Base calculation</p>
                </div>

                <div className="bg-gray-900 p-6 rounded-2xl shadow-xl shadow-gray-200 flex flex-col justify-center items-center text-center group cursor-pointer active:scale-95 transition-all">
                    <Plus className="w-8 h-8 text-white mb-2 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Add Pricing Rule</span>
                </div>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Configured Time-based Pricing</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rules are evaluated by priority</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration / Range</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Adult Price</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Child/Infant</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Priority</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-300" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(rule.date_start).toLocaleDateString()} - {new Date(rule.date_end).toLocaleDateString()}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Standard Season</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-gray-900">{Number(rule.price_adult).toLocaleString()} AED</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex gap-4">
                                            <span className="text-xs text-gray-500 font-medium">Child: {Number(rule.price_child).toLocaleString()}</span>
                                            <span className="text-xs text-gray-500 font-medium">Infant: {Number(rule.price_infant).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-[10px] font-black text-gray-500">
                                            {rule.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-3">
                                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
