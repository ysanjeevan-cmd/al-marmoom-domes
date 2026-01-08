import { supabaseAdmin } from '@/lib/supabase';
import { Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function BookingsPage() {
    // Fetch bookings with related product and cart info
    const { data: bookings, error } = await supabaseAdmin!
        .from('bookings')
        .select(`
      *,
      product:products(name),
      cart:carts(status, charge_id, confirmation_code)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookings:', error);
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
                    <p className="text-gray-500 mt-1">Manage and track guest reservations</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by customer or confirmation code"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                        <option>All Statuses</option>
                        <option>Confirmed</option>
                        <option>Cancelled</option>
                        <option>Draft</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Code</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Product</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Dates</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Guests</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Price</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bookings?.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <Link href={`/admin/bookings/${booking.id}`} className="font-mono text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                        {booking.cart?.confirmation_code || '---'}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <Link href={`/admin/bookings/${booking.id}`} className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {booking.customer_first_name} {booking.customer_last_name}
                                        </span>
                                        <span className="text-xs text-gray-500">{booking.customer_email}</span>
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-700">{booking.product?.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-900">
                                            {new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {booking.guests_adult + booking.guests_children + booking.guests_infants} guests
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {booking.price_total?.toLocaleString()} AED
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        •••
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
