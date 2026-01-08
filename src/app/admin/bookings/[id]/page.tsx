import { supabaseAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Package, Calendar, CreditCard, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function BookingDetailsPage(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;

    if (!id) {
        notFound();
    }

    // Fetch detailed booking info
    const { data: booking, error } = await supabaseAdmin!
        .from('bookings')
        .select(`
      *,
      product:products(*),
      cart:carts(*),
      venue:venues(name)
    `)
        .eq('id', id)
        .single();

    if (error || !booking) {
        console.error('Booking fetch error:', error);
        notFound();
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Back button */}
            <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Booking {booking.cart?.confirmation_code || '---'}
                        </h1>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {booking.status}
                        </span>
                    </div>
                    <p className="text-gray-500 font-mono text-sm leading-none">ID: {booking.id}</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                        Cancel Booking
                    </button>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
                        Resend Confirmation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Customer & Pricing */}
                <div className="md:col-span-2 space-y-8">
                    {/* Customer Info */}
                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Customer Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Full Name</label>
                                <p className="text-gray-900 font-medium">
                                    {booking.customer_first_name} {booking.customer_last_name}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Email Address</label>
                                <p className="text-gray-900 font-medium">{booking.customer_email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Phone Number</label>
                                <p className="text-gray-900 font-medium">{booking.customer_phone || '---'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Creation Date</label>
                                <p className="text-gray-900 font-medium">
                                    {new Date(booking.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Pricing Breakdown */}
                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <h2 className="font-semibold text-gray-900">Payment Summary</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{booking.product?.name} ({booking.nights} nights)</span>
                                <span className="text-gray-900 font-medium">{booking.price_subtotal?.toLocaleString()} AED</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Add-ons Total</span>
                                <span className="text-gray-900 font-medium">{booking.price_addons_total?.toLocaleString()} AED</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">VAT (5%)</span>
                                <span className="text-gray-900 font-medium">{booking.price_vat_amount?.toLocaleString()} AED</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                                <span className="text-2xl font-black text-gray-900">{booking.price_total?.toLocaleString()} AED</span>
                            </div>
                            {booking.cart?.charge_id && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400 uppercase font-semibold">Stripe Transaction</span>
                                    <p className="text-xs font-mono text-gray-500 truncate">{booking.cart.charge_id}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Guest Instructions */}
                    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="font-semibold text-gray-900">Special Instructions</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold block mb-2">From Guest</label>
                                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 min-h-[60px]">
                                    {booking.instructions_by_guest || "No specific instructions provided by guest."}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold block mb-2">Team Notes</label>
                                <div className="p-4 bg-blue-50/50 rounded-lg text-sm text-gray-700 min-h-[60px] border border-blue-100">
                                    {booking.instructions_by_team || "No internal notes for this booking."}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Col: Booking Detail Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Booking Info</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Product</p>
                                    <p className="text-sm font-bold text-gray-900">{booking.product?.name}</p>
                                    <p className="text-xs text-gray-400">{booking.product?.product_type || 'Stay'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Dates</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400">{booking.nights} nights</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Party Size</p>
                                    <p className="text-sm font-bold text-gray-900">{booking.guests_adult} Adults</p>
                                    {booking.guests_children > 0 && <p className="text-sm text-gray-700">{booking.guests_children} Children</p>}
                                    {booking.guests_infants > 0 && <p className="text-sm text-gray-700">{booking.guests_infants} Infants</p>}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Venue</p>
                                    <p className="text-sm font-bold text-gray-900">{booking.venue?.name || 'Al Marmoom Domes'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600 font-medium">Auto-confirms at 3 PM</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
