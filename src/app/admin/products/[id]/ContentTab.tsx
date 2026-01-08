"use client";

import { useState } from 'react';
import { ImageIcon, Users, Moon, Clock, Bed, Bath, Globe } from 'lucide-react';

export function ContentTab({ product }: { product: any }) {
    const [formData, setFormData] = useState(product);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                {/* General Info */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">General Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-tighter">Product Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-900"
                                placeholder="e.g. 1 Night Experience"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-tighter">Sub-title / Badge</label>
                            <input
                                name="sub_name"
                                value={formData.sub_name || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-900"
                                placeholder="e.g. Most Popular"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-tighter">Unique URL Slug</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-900"
                                    placeholder="e.g. 1-night-experience"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-tighter">Tagline / Short Description</label>
                            <textarea
                                name="description_short"
                                value={formData.description_short || ''}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-900 resize-none"
                                placeholder="A brief summary for cards and search results..."
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-tighter">Detailed description</label>
                            <textarea
                                name="details"
                                value={formData.details || ''}
                                onChange={handleChange}
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-900"
                                placeholder="Full details, amenities, and booking terms..."
                            />
                        </div>
                    </div>
                </section>

                {/* Media Section */}
                <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        <h2 className="text-xl font-bold text-gray-900">Product Media</h2>
                        <button className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter">Upload Gallery</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Cover Image Placeholder */}
                        <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 relative overflow-hidden group cursor-pointer">
                            {formData.cover_image ? (
                                <img src={formData.cover_image} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Cover</span>
                                </>
                            )}
                            <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold uppercase tracking-widest">Update</span>
                            </div>
                        </div>

                        {/* Gallery Placeholders */}
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="aspect-video bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-white hover:border-blue-200 transition-all group">
                                <PlusCircle className="w-5 h-5 text-gray-200 group-hover:text-blue-400 transition-colors" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-8">
                {/* Stats & Status */}
                <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-3 text-center">Stats & Status</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-xl">
                            <span className="text-xs font-bold text-gray-500 uppercase">Availability Status</span>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="bg-transparent text-sm font-black text-gray-900 outline-none cursor-pointer"
                            >
                                <option value="active">ACTIVE</option>
                                <option value="draft">DRAFT</option>
                                <option value="archived">ARCHIVED</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bookings</p>
                                <p className="text-xl font-black text-gray-900">{product.stats_bookings || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue (AED)</p>
                                <p className="text-xl font-black text-gray-900">{Math.round(product.stats_revenue || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Specifications */}
                <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-3 text-center">Specifications</h3>

                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Max Guests</label>
                                <input
                                    type="number"
                                    name="max_guests"
                                    value={formData.max_guests}
                                    onChange={handleChange}
                                    className="w-full bg-transparent font-black text-gray-900 outline-none text-lg"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                <Moon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Min Stay (Nights)</label>
                                <input
                                    type="number"
                                    name="min_stay_nights"
                                    value={formData.min_stay_nights}
                                    onChange={handleChange}
                                    className="w-full bg-transparent font-black text-gray-900 outline-none text-lg"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Duration (Hours)</label>
                                <input
                                    type="number"
                                    name="duration_hours"
                                    value={formData.duration_hours}
                                    onChange={handleChange}
                                    className="w-full bg-transparent font-black text-gray-900 outline-none text-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-3">
                                <Bed className="w-4 h-4 text-gray-300" />
                                <input
                                    type="number"
                                    name="beds"
                                    value={formData.beds}
                                    onChange={handleChange}
                                    className="w-full bg-transparent font-bold text-gray-900 outline-none text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Bath className="w-4 h-4 text-gray-300" />
                                <input
                                    type="number"
                                    name="baths"
                                    value={formData.baths}
                                    onChange={handleChange}
                                    className="w-full bg-transparent font-bold text-gray-900 outline-none text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function PlusCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
        </svg>
    )
}
