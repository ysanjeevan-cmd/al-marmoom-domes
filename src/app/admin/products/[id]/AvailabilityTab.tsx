"use client";

import { useState } from 'react';
import { Calendar, AlertCircle, Plus, Trash2, ShieldAlert } from 'lucide-react';

export function AvailabilityTab({ productId, initialBlocked }: { productId: string, initialBlocked: any[] }) {
    const [blocked, setBlocked] = useState(initialBlocked);

    return (
        <div className="space-y-8">
            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Manage Inventory Blocks</h3>
                    <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
                        Manually blocking dates will prevent any new bookings regardless of pricing or logic.
                        Use this for maintenance, private events, or seasonal closures. Existing bookings are NOT automatically cancelled.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List of Blocked Dates */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
                        <h2 className="text-lg font-bold text-gray-900">Current Restrictions</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{blocked.length} Active Blocks</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Restricted</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason / Note</th>
                                    <th className="px-8 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {blocked.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center text-gray-400">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No dates blocked</p>
                                            <p className="text-xs mt-1">Product is currently open for all dates.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    blocked.map((item) => (
                                        <tr key={item.id} className="hover:bg-red-50/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-4 h-4 text-red-300" />
                                                    <span className="text-sm font-bold text-gray-900">{new Date(item.date).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs text-gray-600 font-medium italic">{item.reason || 'No reason specified'}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-gray-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Add Sidebar */}
                <div className="space-y-6">
                    <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-4 text-center">New Block</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Target Date</label>
                                <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-medium" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Restriction Reason</label>
                                <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-medium text-sm resize-none" placeholder="e.g. Dome Maintenance... " />
                            </div>

                            <button className="w-full py-4 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                Confirm Block
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
