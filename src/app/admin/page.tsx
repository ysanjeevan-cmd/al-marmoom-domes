import { supabaseAdmin } from '@/lib/supabase';
import { ShoppingBag, TrendingUp, Users, Package, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function SummaryPage() {
    // Aggregate Stats
    const { data: bookings } = await supabaseAdmin!.from('bookings').select('*, product:products(name)');
    const { count: productCount } = await supabaseAdmin!.from('products').select('*', { count: 'exact', head: true });
    const { data: customers } = await supabaseAdmin!.from('bookings').select('customer_email');

    // Unique customers count
    const uniqueCustomers = Array.from(new Set(customers?.map(c => c.customer_email))).length;

    // Confirmed bookings and revenue
    const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.price_total) || 0), 0);

    // Mock growth data (since we only have historical import right now)
    const stats = [
        { name: 'Total Revenue', value: `${totalRevenue.toLocaleString()} AED`, icon: TrendingUp, change: '+12.5%', color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Active Bookings', value: confirmedBookings.length.toString(), icon: ShoppingBag, change: '+3', color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Total Customers', value: uniqueCustomers.toString(), icon: Users, change: '+2', color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Live Products', value: productCount?.toString() || '0', icon: Package, change: 'Stable', color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Executive Summary</h1>
                <p className="text-gray-500 text-lg">Performance overview and recent platform activity</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl shadow-inner`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                                {stat.change.includes('+') ? <ArrowUpRight className="w-3 h-3" /> : null}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.name}</p>
                        <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <section className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                        <Link href="/admin/bookings" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">View All Bookings</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-8 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-8 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {confirmedBookings.slice(0, 6).map((booking, i) => (
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                                                    {booking.customer_first_name?.[0] || 'C'}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                                                    {booking.customer_first_name} {booking.customer_last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm text-gray-600 whitespace-nowrap">{booking.product?.name || 'Stay'}</span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-sm font-black text-gray-900">{Number(booking.price_total).toLocaleString()} AED</span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-xs font-medium text-gray-400 tracking-tight">{new Date(booking.created_at).toLocaleDateString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Popular Products Sidebar */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Popularity</h2>
                        <Package className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="space-y-8 flex-1">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-gray-800">1 Night Stay</span>
                                <span className="text-xs font-bold text-green-600">85% Share</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-gray-800">2 Night Stay</span>
                                <span className="text-xs font-bold text-blue-600">10% Share</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-300 h-3 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-gray-800">3 Night Stay</span>
                                <span className="text-xs font-bold text-gray-400">5% Share</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
                                <div className="bg-gradient-to-r from-blue-400 to-blue-200 h-3 rounded-full" style={{ width: '5%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-3 text-xs text-gray-400 italic">
                        <Clock className="w-4 h-4" />
                        Last updated 2 mins ago
                    </div>
                </section>
            </div>
        </div>
    );
}
