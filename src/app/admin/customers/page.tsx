import { supabaseAdmin } from '@/lib/supabase';
import { Search, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default async function CustomersPage() {
    // Fetch all bookings to extract customer identity
    // In a real app, we might have a dedicated customers table,
    // but for now, we derive from bookings (historical data).
    const { data: bookings } = await supabaseAdmin!
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    // Deduplicate by email
    const customersMap = new Map();
    bookings?.forEach(b => {
        if (!customersMap.has(b.customer_email)) {
            customersMap.set(b.customer_email, {
                email: b.customer_email,
                name: `${b.customer_first_name} ${b.customer_last_name}`,
                phone: b.customer_phone,
                totalBookings: 1,
                totalSpent: Number(b.price_total) || 0,
                lastBookingDate: b.created_at,
                recentBookingId: b.id
            });
        } else {
            const existing = customersMap.get(b.customer_email);
            existing.totalBookings += 1;
            existing.totalSpent += (Number(b.price_total) || 0);
        }
    });

    const customers = Array.from(customersMap.values());

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Customer Intelligence</h1>
                    <p className="text-gray-500 text-lg">Detailed history and analytics for every guest</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search guest database by name, email or phone..."
                        className="w-full pl-12 pr-6 py-3 border border-gray-50 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Guest Identity</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Bookings</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Total Revenue</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Last Interaction</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {customers.map((customer) => (
                                <tr key={customer.email} className="group hover:bg-blue-50/30 transition-all duration-150 cursor-pointer">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                {customer.name?.[0] || 'G'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.name}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{customer.email}</span>
                                                    {customer.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{customer.phone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                                            {customer.totalBookings}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="text-sm font-black text-gray-900">{customer.totalSpent.toLocaleString()} AED</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 text-gray-300" />
                                            <span>{new Date(customer.lastBookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Link
                                            href={`/admin/bookings/${customer.recentBookingId}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-blue-600"
                                        >
                                            Inspect <ShoppingBag className="w-3 h-3" />
                                        </Link>
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
